# Implementar Tarea desde PDF

Lee el PDF indicado, entiende exactamente qué pide, limita los cambios a lo solicitado e implementa con calidad profesional siguiendo los estándares del proyecto.

## Argumento

$ARGUMENTS — Ruta al archivo PDF con la tarea/enunciado. Ejemplo: `/implementar-tarea ./tarea1.pdf`

---

## Paso 1 — Leer el PDF y extraer requisitos

Lee el PDF en `$ARGUMENTS`. Extrae:

- **¿Qué funcionalidad o cambio pide exactamente?** Listar cada requisito numerado.
- **¿Qué archivos / pantallas / componentes menciona o implica?**
- **¿Qué criterios de aceptación hay (explícitos o implícitos)?**

> REGLA: No inferir trabajo extra. Si el PDF no lo pide, no lo implementes.

---

## Paso 2 — Leer el proyecto y entender el contexto

Antes de tocar código, leer y entender:

1. **Estructura de carpetas** — `mobile/src/features/`, componentes compartidos, stores, servicios.
2. **Sistema de diseño** — `mobile/src/theme/designSystem.ts`, `colors.ts`, `typography.ts`, `spacing.ts`, `effects.ts`.
3. **Patrones de código** — Cómo están hechos features existentes:
   - Separación en `screen / component / hook / store / service`
   - Naming: PascalCase para componentes, camelCase para hooks (`useXxx`), kebab-case para carpetas
   - Estilos con `StyleSheet.create` en archivo `styles.ts` separado
   - Lógica en hooks, NO en componentes
   - Stores con Zustand (`*.feature.store.ts`)
   - TypeScript estricto, sin `any`
4. **Feature más parecida a la tarea** — Leerla completa como referencia de estilo.

---

## Paso 3 — Plan de implementación (presentar al usuario antes de ejecutar)

Generar un plan claro:

```
REQUISITOS IDENTIFICADOS:
1. ...
2. ...

ARCHIVOS A CREAR / MODIFICAR:
- crear: mobile/src/features/<feature>/...
- modificar: mobile/src/...

ARCHIVOS QUE NO SE TOCARÁN:
- Todo lo demás

PREGUNTAS / AMBIGÜEDADES (si las hay):
- ...
```

Esperar confirmación antes de implementar.

---

## Paso 4 — Implementar

Aplicar los cambios siguiendo estas reglas:

### Calidad obligatoria

- **Sin errores de TypeScript** — tipos correctos, sin `any`, sin `@ts-ignore`
- **Sin errores de compilación** — imports válidos, exports correctos, rutas correctas
- **Sin errores lógicos** — flujos completos, estados manejados, casos borde cubiertos
- **Sin console.log** de debug al finalizar

### Estándares del proyecto

- Seguir la estructura `feature/screens|components|hooks|store|services`
- Estilos en `styles.ts` separado, usando tokens del design system (`COLORS`, `SPACING`, `TYPOGRAPHY`)
- Lógica de negocio en hooks (`useXxxScreen`, `useXxxLogic`)
- Estado global en Zustand store (`xxx.feature.store.ts`)
- Pantallas registradas en el navegador si aplica

### Alcance controlado

- Modificar **únicamente** los archivos identificados en el plan
- No refactorizar código existente que no sea parte de la tarea
- No agregar dependencias nuevas sin justificación explícita en el PDF

---

## Paso 5 — Verificar

Después de implementar:

1. Verificar que todos los imports resuelven correctamente
2. Verificar que los tipos TypeScript son válidos
3. Verificar que la navegación / flujo es funcional de punta a punta
4. Revisar que no se introdujeron regresiones en otras features
5. Reportar un resumen de qué se implementó y qué archivos se crearon/modificaron
