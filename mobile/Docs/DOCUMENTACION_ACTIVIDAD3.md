# Actividad 3: API + Sincronización — PlanTica

**Estudiante:** Allan Vargas Torres  
**Correo:** allan.vargas.torres@est.una.ac.cr  
**Repositorio:** https://github.com/Allan2612/plantApp  
**API (Render):** https://plantapp-jjh7.onrender.com  
**Video:** *(agregar link)*

---

## Parte 1: Investigación y análisis

### Módulos de la app

La app tiene 8 módulos principales:

- **Autenticación** — login, registro, verificación de correo y recuperación de contraseña con Firebase Auth
- **Home** — pantalla principal con resumen del jardín, catálogo y accesos rápidos
- **Catálogo** — lista de especies de plantas registradas en el backend
- **Identificar** — toma foto con la cámara y la identifica usando IA (Groq, modelo Llama 4 Scout)
- **Mis Plantas** — jardín personal del usuario, permite crear, ver y editar plantas
- **Calendario** — pendiente de implementar, por ahora es un placeholder
- **Perfil** — ver y editar datos del perfil del usuario
- **Configuración** — cambio de tema (claro/oscuro) e idioma, funciona 100% local

---

### Módulos que funcionan sin internet

**Catálogo** — funciona en modo lectura. Cada vez que carga con éxito, guarda los datos en AsyncStorage. La próxima vez que el usuario abra la app sin internet, ve el catálogo igual. La opción de añadir al catálogo se deshabilita porque necesita escribir en el backend.

**Mis Plantas** — igual que el catálogo, las plantas del usuario se guardan localmente después de cada carga. Sin internet el usuario puede ver su jardín pero no agregar ni editar plantas.

**Perfil** — los datos del perfil ya quedan guardados en el auth store (AsyncStorage) desde que el usuario inicia sesión. No hay que hacer nada extra para que funcione offline.

**Configuración** — funciona completamente sin internet. El tema y el idioma se guardan localmente con Zustand + AsyncStorage.

**Autenticación** — si el usuario ya inició sesión, la sesión se mantiene aunque no haya internet. Si intenta iniciar sesión desde cero sin conexión, Firebase retorna un error que se muestra como mensaje.

**Identificar** — la cámara funciona offline (el usuario puede tomar la foto), pero el análisis con IA requiere internet obligatoriamente porque la imagen se envía a un servicio externo. Los botones de analizar y guardar se bloquean sin conexión.

**Calendario** — por ahora es placeholder, no aplica.

---

### Por qué se priorizaron esos módulos

Se eligieron **Catálogo** y **Mis Plantas** porque son los que el usuario consulta con más frecuencia y donde tener datos sin internet tiene sentido real. Alguien puede estar en un jardín sin señal y querer ver sus plantas o buscar una especie. Los datos del catálogo cambian poco, y las plantas del usuario también, así que no hay problema con mostrar datos de la última vez que hubo conexión.

El módulo de **Identificar** no se puede hacer offline porque su función principal depende de una API de IA externa. No hay forma de cachear eso de forma útil.

---

### Cómo se le muestra al usuario que está sin conexión

Se usan tres formas:

1. **Banner superior** — aparece un banner animado desde arriba de la pantalla con el texto "Sin conexión — los cambios se sincronizarán al reconectarse". Es global, aparece en todas las pantallas sin necesidad de configurarlo en cada una. Usa `@react-native-community/netinfo` para detectar el estado de red.

2. **Botones bloqueados** — cualquier acción que requiera internet (analizar planta, guardar, editar perfil, añadir al catálogo) muestra el texto "Sin conexión" y queda deshabilitada. Así el usuario sabe de inmediato que esa acción no está disponible.

3. **Texto de ayuda dinámico** — en la pantalla de Identificar, el texto bajo el botón cambia: con internet dice "El análisis puede tardar unos segundos", sin internet dice "Conéctate a internet para identificar la planta".

---

### Almacenamiento local elegido: AsyncStorage

Se usó **AsyncStorage** con el middleware `persist` de Zustand para el estado global, y AsyncStorage directo para el cache de catálogo y plantas.

Se eligió porque:
- Los datos que se guardan son listas en formato JSON, sin necesidad de queries complejas
- El volumen de datos es pequeño (decenas o cientos de registros)
- Ya estaba en el proyecto para el auth store, no había que agregar nueva dependencia
- Funciona en Expo Go sin necesidad de un dev build, lo que facilita el desarrollo

No se usó SQLite porque añadiría complejidad innecesaria (esquemas, ORM, migraciones) para datos que solo se leen y escriben como listas completas. No se usó SecureStore porque no se está guardando información sensible, solo datos de plantas.

**Datos guardados:**

- `plantica-auth` — perfil del usuario (nombre, correo, ID en el backend). Se guarda automáticamente con el auth store de Zustand.
- `plantica:catalog` — lista de especies del catálogo. Se actualiza cada vez que la carga desde el API es exitosa.
- `plantica:plants:{userId}` — lista de plantas del jardín del usuario. Se actualiza igual.

---

## Parte 2: Desarrollo

### Deploy del API en Render

El backend está hecho con FastAPI y desplegado en Render:

**https://plantapp-jjh7.onrender.com**

Los endpoints principales son:

- `POST /api/identify-plant` — recibe la imagen en base64 y retorna la identificación de la planta
- `GET /api/catalog` — lista las especies del catálogo
- `POST /api/catalog` — crea una especie nueva
- `GET /api/user-plants/{userId}` — lista las plantas del usuario
- `POST /api/user-plants` — agrega una planta al jardín
- `PATCH /api/user-plants/{plantId}` — edita una planta
- `GET/PATCH /api/users/{userId}` — obtiene o actualiza el perfil

### Identificación de planta con IA

El flujo es:

1. El usuario abre la cámara y toma la foto
2. La imagen se convierte a base64 con `expo-file-system`
3. Se envía al endpoint `/api/identify-plant` del backend
4. El backend se la manda a la API de Groq (modelo `meta-llama/llama-4-scout-17b-16e-instruct`)
5. El modelo responde con nombre común, nombre científico, cuidados, dificultad y si es tóxica
6. La app busca una foto de referencia en Wikipedia y como fallback en iNaturalist
7. Se muestra el resultado con la foto, una barra de confianza y los datos de cuidado
8. El usuario puede guardar la planta en su jardín

### Permisos de cámara

Cuando el usuario entra a la pantalla de Identificar, se piden los permisos automáticamente. Si los rechaza, se muestra una pantalla con dos opciones: volver a solicitarlos (si aún se puede) o abrir la configuración del sistema (si ya dijo que no definitivamente). La app nunca se bloquea ni crashea por permisos rechazados.

### Modo offline

- Banner global que aparece cuando se pierde la conexión
- Botones de escritura deshabilitados con texto "Sin conexión"
- Catálogo y Mis Plantas muestran datos del cache inmediatamente y los actualizan si hay red
- El perfil se ve siempre porque viene del auth store local

---
