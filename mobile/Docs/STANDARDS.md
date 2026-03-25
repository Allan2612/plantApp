# PlantApp — Estándares y Arquitectura

## Índice

1. Estructura del proyecto  
2. Convenciones de archivos y nomenclatura  
3. Sistema de tema (Design System)  
4. Navegación y flujo de pantallas  
5. Componentes  
6. Pantallas (Screens)  
7. Contextos  
8. Animaciones  
9. Accesibilidad  

---

# 1. Estructura del proyecto

El proyecto utiliza **Expo Router** para manejar la navegación basada en archivos.

La carpeta `app/` define únicamente las rutas de navegación, mientras que toda la lógica, UI y estructura del proyecto vive dentro de `src/`.

plantApp/
├── app/                        # Rutas de Expo Router (solo navegación)
│   ├── _layout.tsx             # Layout raíz (providers globales)
│   ├── index.tsx               # Redirección inicial
│   ├── profile.tsx             # Ruta stack/modal
│   ├── settings.tsx            # Ruta stack/modal
│   └── (tabs)/                 # Grupo de tabs principales
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── catalogo.tsx
│       ├── calendario.tsx
│       └── identificar.tsx
│
├── src/                        # Lógica principal de la app
│   ├── components/             # Componentes reutilizables
│   ├── screens/                # Pantallas completas
│   ├── context/                # Contextos globales
│   ├── theme/                  # Sistema de tema
│   ├── constants/              # Tokens de diseño
│   └── types-dtos/             # Tipos TypeScript
│
└── assets/                     # Imágenes, íconos, fuentes

Regla principal:

- `app/` → navegación
- `src/` → UI, lógica y estado

Esto mantiene una separación clara entre **routing y lógica de aplicación**.

---

# 2. Convenciones de archivos y nomenclatura

## Nomenclatura

| Elemento | Convención |
|--------|--------|
Componentes | PascalCase |
Pantallas | PascalCase |
Contextos | PascalCase |
Hooks | camelCase |
Archivos de estilos | `.styles.ts` |
Archivos de datos | `.data.ts` |

Ejemplos:

AppHeader  
PressableCard  
HomeScreen  
UserProfile  

---

## Estructura de un componente

Cada componente vive dentro de su propia carpeta.

ComponentName/
 ├ ComponentName.tsx
 ├ ComponentName.styles.ts
 └ ComponentName.data.ts

Archivo | Contenido
------ | ------
.tsx | JSX y lógica
.styles.ts | StyleSheet
.data.ts | datos estáticos opcionales

---

## Reglas importantes

- no escribir `StyleSheet.create` dentro del `.tsx`
- separar datos estáticos en `.data.ts`
- mantener componentes pequeños y reutilizables
- evitar lógica compleja dentro de componentes UI

---

# 3. Sistema de tema (Design System)

El proyecto utiliza un **Design System centralizado** para garantizar consistencia visual.

El sistema de tema define:

- colores
- tipografía
- espaciado
- bordes

---

## Estructura del tema

src/theme/
 ├ colors.ts
 ├ light.ts
 ├ dark.ts
 └ designSystem.ts

---

## Tokens disponibles

### Colores

theme.colors.primary  
theme.colors.surface  
theme.colors.textPrimary  
theme.colors.textSecondary  

### Espaciado

theme.spacing.xs  
theme.spacing.sm  
theme.spacing.md  
theme.spacing.lg  
theme.spacing.xl  

### Bordes

theme.radius.sm  
theme.radius.md  
theme.radius.lg  
theme.radius.full  

### Tipografía

theme.typography.display  
theme.typography.heading  
theme.typography.body  

---

## Reglas del Design System

Nunca usar valores hardcodeados como:

"#fff"  
"#000"  
16  
24  

Siempre usar tokens del tema:

theme.colors.primary  
theme.spacing.md  

Esto mantiene **consistencia visual y facilita mantenimiento del código**.

---

## Soporte para tema claro y oscuro

El proyecto soporta **modo claro y modo oscuro**.

React Native permite detectar el modo del sistema mediante:

useColorScheme()

Valores posibles:

light  
dark  
null  

El tema activo se obtiene mediante:

useAppTheme()

---

# 4. Navegación y flujo de pantallas

La navegación se implementa utilizando **Expo Router**, basado en estructura de archivos.

---

## Flujo de entrada

app/index.tsx  
↓  
(tabs)/home  

---

## Árbol de navegación

RootLayout  
 └ Stack Navigator  
     ├ Tabs  
     │   ├ Home  
     │   ├ Catalogo  
     │   ├ Calendario  
     │   └ Identificar  
     │
     ├ Profile  
     └ Settings  

---

## Reglas de navegación

- máximo **4–5 tabs principales**
- nombres de rutas claros
- evitar demasiados niveles de navegación
- permitir regresar fácilmente a la pantalla anterior

Esto mejora la experiencia de usuario y evita confusión en la navegación.

---

# 5. Componentes

Los componentes reutilizables viven en:

src/components/

---

## Componentes principales del proyecto

Componente | Uso
---|---
AppText | Texto con estilos del Design System
AppButton | Botón reutilizable
AppHeader | Encabezado principal
ScreenWrapper | Contenedor base de pantallas
PressableCard | Tarjeta interactiva
AnimatedTabBar | Tab bar animado
ProfileMenu | Menú de perfil

---

## Reglas de componentes

Los componentes deben:

- ser reutilizables
- usar `useAppTheme()` para estilos
- no depender de pantallas específicas
- manejar accesibilidad básica

Los componentes UI deben enfocarse únicamente en **presentación**.

---

# 6. Pantallas (Screens)

Las pantallas viven en:

src/screens/

Ejemplo:

HomeScreen/
 ├ HomeScreen.tsx
 ├ HomeScreen.styles.ts
 └ HomeScreen.data.ts

---

## Responsabilidades de una pantalla

Las pantallas son responsables de:

- organizar componentes
- manejar estado local
- consumir contextos
- definir layout general

Las pantallas **no deben duplicar lógica de componentes reutilizables**.

---

# 7. Contextos

Los contextos manejan **estado global compartido**.

Ubicación:

src/context/

---

## ThemeContext

Responsable de:

- proveer el tema global
- manejar modo claro / oscuro
- exponer `useAppTheme()`

---

## ScrollAnimContext

Responsable de:

- animación del header
- animación del tab bar
- sincronización del scroll

Este contexto se utiliza únicamente dentro del grupo de tabs.

---

# 8. Animaciones

Las animaciones utilizan la API **Animated de React Native**.

---

## Native Driver

Se usa para propiedades como:

transform  
scale  
opacity  
translate  

Ventaja: mayor rendimiento porque se ejecuta en el hilo nativo.

---

## JS Driver

Se usa para propiedades como:

padding  
borderColor  
height  
backgroundColor  

---

## Regla importante

Un `Animated.Value` **no debe mezclarse entre drivers**.

Si se necesitan animar propiedades distintas, se utilizan **dos Animated.View anidados**.

---

# 9. Accesibilidad

La aplicación debe seguir principios básicos de accesibilidad.

---

## Reglas generales

- contraste adecuado entre texto y fondo
- tamaños de texto legibles
- roles accesibles en componentes interactivos

Ejemplos:

accessibilityRole="header"  
accessibilityRole="button"  
accessibilityRole="tab"  

Estados accesibles:

accessibilityState={{ selected: true }}

Esto mejora la experiencia para usuarios con tecnologías asistivas.

---

# Objetivo del documento

Este documento define los estándares de desarrollo del proyecto **PlanTica**.

Su objetivo es:

- mantener consistencia en el código
- facilitar mantenimiento
- mejorar escalabilidad del proyecto
- garantizar una experiencia de usuario clara y coherente.