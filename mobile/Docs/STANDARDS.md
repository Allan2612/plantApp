# PlanTica - Estandares y Arquitectura Frontend

## 1. Principios base

- `app/` es solo routing con Expo Router.
- `src/` contiene UI, estado, hooks, servicios y tipos.
- No mezclar codigo global con codigo especifico de feature.
- Mantener imports internos sin extension (`.ts` o `.tsx`).

## 2. Estructura oficial

```text
mobile/
|- app/                              # Solo rutas
|  |- _layout.tsx                    # Providers globales
|  |- index.tsx
|  |- (auth)/
|  |- (tabs)/
|
|- src/
|  |- components/
|  |  |- shared/                     # Solo componentes globales reutilizables
|  |
|  |- features/                      # Arquitectura por feature
|  |  |- auth/
|  |  |  |- components/
|  |  |  |- hooks/
|  |  |  |- screens/
|  |  |  |- services/
|  |  |  |- store/
|  |  |- home/
|  |  |- profile/
|  |  |- settings/
|  |  |- catalogo/
|  |  |- calendario/
|  |  |- identificar/
|  |  |- mis-plantas/
|  |  |- shell/
|  |
|  |- providers/                     # Providers transversales de app
|  |  |- ToastProvider.tsx
|  |  |- index.ts
|  |
|  |- services/                      # Servicios globales cross-feature
|  |  |- api/
|  |
|  |- store/                         # Stores globales cross-feature
|  |  |- auth.store.ts
|  |
|  |- theme/
|  |- constants/
|  |- types/
```

## 3. Convencion estricta de carpetas

### 3.1 Componentes

Cada componente debe vivir en su carpeta y respetar:

```text
ComponentName/
|- index.ts
|- ComponentName.tsx
|- styles.ts
```

### 3.2 Screens

Cada screen debe vivir en su carpeta y respetar:

```text
ScreenName/
|- ScreenName.tsx
|- styles.ts
|- index.ts
```

## 4. Reglas de ubicacion

- `src/components/shared`:
  - solo componentes verdaderamente globales y reutilizables.
  - ejemplo: `AppText`, `AppButton`, `AppToast`, `ScreenWrapper`, `PressableCard`.
- `src/features/auth/components`:
  - componentes propios de auth (ejemplo: `AuthInput`, `AuthActions`, `AuthScreenLayout`, route components de auth).
- `src/features/shell/components`:
  - componentes de shell/navegacion (ejemplo: `AppHeader`, `AnimatedTabBar`, `ProfileMenu`).
- contexts/providers transversales:
  - no van dentro de `components`.
  - deben vivir en `src/providers` (ejemplo: `ToastProvider`).

## 5. Firebase: global vs feature

### Decision actual del proyecto

`firebaseClient` vive en `src/features/auth/services/firebaseClient.ts` y es correcto en el estado actual porque su uso real es de autenticacion (feature auth).

### Regla

- Si Firebase se usa solo para auth: mantener cliente en `features/auth/services`.
- Si otra feature empieza a depender de Firebase (por ejemplo Firestore/Storage compartido):
  - crear cliente base global en `src/services/firebase/`.
  - cada feature consume ese cliente desde su propio `features/<feature>/services`.

Esto evita sobre-generalizar antes de tiempo y mantiene ownership claro por feature.

## 6. Estado global y stores

- `src/store/` (singular) es el unico lugar para estado global cross-feature.
- `src/features/*/store/` es para estado local de cada feature.
- no usar `src/stores/` (plural).

## 7. Providers transversales

- Providers globales deben registrarse en `app/_layout.tsx`.
- `ToastProvider` es transversal y debe importarse desde `src/providers/ToastProvider`.

## 8. Importaciones

- Nunca usar imports internos con extension:
  - incorrecto: `from "@/src/.../Foo.tsx"`
  - correcto: `from "@/src/.../Foo"`
- Preferir alias `@/src/...` para imports internos.
- Exponer modulos con `index.ts` donde corresponda.

## 9. Checklist de PR

Antes de mergear:

- `npx tsc --noEmit` sin errores.
- `npm run lint` sin errores relevantes.
- No hay codigo feature-specific en `shared`.
- Cada componente/screen cumple carpeta + `index.ts` + `styles.ts` + archivo principal.
- `app/` contiene solo routing y wrappers de ruta.

## 10. Limpieza aplicada en esta correccion

- Eliminada carpeta legacy vacia `src/stores`.
- Eliminada carpeta legacy vacia `src/context/ToastContext`.
- Eliminada carpeta vacia `src/context` tras mover provider transversal a `src/providers`.

## 11. Estandar de estilos (obligatorio)

Regla general:

- En archivos `styles.ts` no se permite hardcodear valores de estilo visual (espaciados, tamanos, colores, radios, sombras, tipografia).

Se debe usar:

- `theme.spacing.*` para paddings, margins, gaps, alturas y anchos.
- `theme.colors.*` para cualquier color (incluyendo sombras cuando aplique).
- `theme.radius.*` para borderRadius.
- `theme.typography.*` para fontSize y lineHeight.
- `StyleSheet.hairlineWidth` para bordes finos.
- `src/constants/*` para valores visuales compartidos que no existan aun en theme (ejemplo: opacidades de sombra en `src/constants/effects.ts`).

Excepciones permitidas:

- Valores estructurales de layout: `flex: 1`, `width: "100%"`, `position`, `zIndex`.
- Proporciones calculadas y formulas derivadas de tokens (por ejemplo relaciones de aspecto).

Checklist rapido de PR para estilos:

- No hay literales tipo `fontSize: 14`, `gap: 12`, `minHeight: 46`, `"#000"` dentro de `styles.ts`.
- Si aparece un valor que no existe en theme, se agrega primero a `src/constants/*` o theme y luego se consume.
