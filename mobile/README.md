# PlanTica 🌿

App móvil para el cuidado y gestión de plantas, construida con **React Native** y **Expo Router**.

---

## Tecnologías

- [Expo](https://expo.dev) + [Expo Router](https://expo.github.io/router) (navegación basada en archivos)
- React Native (Animated API)
- TypeScript
- `react-native-safe-area-context`
- `@expo-google-fonts/caveat`
- `@expo/vector-icons` (Ionicons)

---

## Iniciar el proyecto

```bash
npm install
npx expo start
```

Opciones disponibles al iniciar:

- Android emulator
- iOS simulator
- Expo Go

---

## Login con Google (Android)

La app ya incluye integración de Google Sign-In con Firebase para Android.

Requisitos:

- Habilitar `Google` como proveedor en Firebase Authentication.
- Crear credencial OAuth 2.0 de Android en Google Cloud.
- Usar el package Android actual del proyecto: `com.alan2612.plantApp`.
- Registrar el SHA-1 del keystore que uses para la build.

Variable de entorno necesaria en `.env`:

```bash
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

Flujo recomendado para obtener SHA-1 con EAS:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas credentials
```

Con el SHA-1 configurado en Google Cloud + Firebase, prueba en Android (dispositivo real o emulador):

```bash
npx expo prebuild --clean
npm run android
```

---

## Estructura del proyecto

```
plantApp/
├── app/                        # Rutas de Expo Router (solo navegación)
│   ├── _layout.tsx             # Layout raíz: Stack Navigator + providers globales
│   ├── index.tsx               # Redirección a /(tabs)/home
│   ├── profile.tsx             # Pantalla de perfil (stack modal)
│   ├── settings.tsx            # Pantalla de configuración (stack modal)
│   └── (tabs)/                 # Grupo de tabs principales
│       ├── _layout.tsx         # Tab Navigator con AnimatedTabBar y AppHeader
│       ├── home.tsx
│       ├── catalogo.tsx
│       ├── calendario.tsx
│       ├── identificar.tsx
│       └── misplantas.tsx
│
├── src/                        # Lógica principal de la app
│   ├── components/             # Componentes reutilizables
│   │   ├── AnimatedTabBar/     # Tab bar animado (se oculta al scrollear)
│   │   ├── AppButton/          # Botón con variantes primary/secondary
│   │   ├── AppHeader/          # Header flotante animado con menú de usuario
│   │   ├── AppText/            # Texto con tipografía del Design System
│   │   ├── PlaceholderScreen/  # Pantalla placeholder genérica
│   │   ├── PlantCard/          # Tarjeta de planta con imagen
│   │   ├── PressableCard/      # Tarjeta interactiva con hover animado
│   │   ├── ProfileMenu/        # Menú desplegable de perfil (modal)
│   │   └── ScreenWrapper/      # Contenedor base con padding del header
│   │
│   ├── screens/                # Pantallas completas
│   │   ├── HomeScreen/         # Home con búsqueda, acciones, tendencias, catálogo y plantas
│   │   ├── CatalogoScreen/     # Catálogo de especies (placeholder)
│   │   ├── CalendarioScreen/   # Calendario de cuidado (placeholder)
│   │   ├── IdentificarScreen/  # Identificación por cámara (placeholder)
│   │   ├── MisPlantasScreen/   # Plantas del usuario (placeholder)
│   │   ├── Settings/           # Configuración de tema e idioma
│   │   └── UserProfile/        # Perfil de usuario con stats
│   │
│   ├── context/
│   │   └── ScrollAnimContext.tsx  # Animación sincronizada de header y tab bar
│   │
│   ├── theme/
│   │   ├── ThemeContext.tsx    # Provider + hooks useAppTheme / useThemeContext
│   │   ├── designSystem.ts    # Composición del tema (colors + spacing + typography + radius)
│   │   ├── light.ts           # Tokens del tema claro
│   │   └── dark.ts            # Tokens del tema oscuro
│   │
│   ├── constants/
│   │   ├── colors.ts          # Paleta de colores (Palette)
│   │   ├── spacing.ts         # Tokens de espaciado (xs/sm/md/lg/xl/xxl)
│   │   └── typography.ts      # Estilos de texto (display/heading/subheading/body/caption/label)
│   │
│   └── types-dtos/
│       ├── plant.types.ts     # Interface Plant
│       └── user.types.ts      # Interface UserInterface
│
└── assets/                    # Fuentes, íconos e imágenes
```

---

## Navegación

La app combina **Stack Navigator** (raíz) con **Tab Navigator** (pantallas principales):

```
RootStack (_layout.tsx)
 ├── (tabs)          → Tab Navigator con 5 tabs
 │    ├── home
 │    ├── catalogo
 │    ├── calendario
 │    ├── identificar
 │    └── misplantas
 ├── profile         → modal con header nativo
 └── settings        → modal con header nativo
```

---

## Design System

Todos los estilos se obtienen a través de `useAppTheme()`. Nunca se usan valores hardcodeados.

| Token      | Acceso                                                |
| ---------- | ----------------------------------------------------- |
| Colores    | `theme.colors.primary`, `theme.colors.surface`, etc.  |
| Espaciado  | `theme.spacing.xs/sm/md/lg/xl/xxl`                    |
| Tipografía | `theme.typography.display/heading/body/caption/label` |
| Bordes     | `theme.radius.sm/md/lg/full`                          |

Soporta **modo claro y oscuro** automáticamente. El usuario puede forzar un tema desde Configuración.

---

## Convenciones

- `app/` → solo navegación. Cero lógica de UI.
- `src/` → todo lo demás.
- Cada componente tiene su carpeta: `Nombre.tsx` + `Nombre.styles.ts` + (opcional) `Nombre.data.ts`
- Sin `StyleSheet.create` dentro de `.tsx`
- Datos estáticos siempre en `.data.ts`
- Animaciones: propiedades `transform/opacity` → `useNativeDriver: true`. Propiedades `backgroundColor/borderColor` → `useNativeDriver: false`

---

## Estándares completos

Ver [Docs/STANDARDS.md](Docs/STANDARDS.md)
