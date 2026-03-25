# Backend API

API utilizando  FastAPI .

## Estructura

- `main.py`: punto de entrada de FastAPI
- `app/config.py`: variables de entorno
- `app/firebase.py`: inicializacion de Firebase Admin
- `app/services.py`: acceso generico a Firestore
- `app/models.py`: modelos Pydantic de respuesta
- `app/routes.py`: endpoints REST

## Variables de entorno

Copia `.env.example` a `.env` dentro de `backend_apiEntidad principal: Usuario
Colección: users
Campos:
id, email, displayName, firstName, lastName, username, avatarId, provider, acceptedTerms, headline, visibility, birthDate, streakDays, streakText, favoritePlantId, themePreference, createdAt, updatedAt

Estadísticas del usuario
Colección: userStats
Campos:
id, userId, label, value, helper, order, createdAt, updatedAt

Tarjetas de información de perfil
Colección: userInfoTiles
Campos:
id, userId, kind, iconType, iconEmoji, order, createdAt, updatedAt

Categorías de plantas
Colección: categories
Campos:
id, userId, name, iconType, iconEmoji, count, order, createdAt, updatedAt

Plantas
Colección: plants
Campos:
id, userId, name, nickname, scientificName, iconType, iconEmoji, categories (arreglo de objetos con id, name, iconType, iconEmoji), status, progress, favorite, careFrequencyPerWeek, description, order, createdAt, updatedAt

Tags de cada planta
Colección: plantTags
Campos:
id, userId, plantId, value, order, createdAt, updatedAt

Agenda de cuidados programados
Colección: careSchedule
Campos:
id, userId, plantId, plantName, iconType, iconEmoji, type, status, scheduledFor, createdAt, updatedAt

Historial de cuidados
Colección: careHistory
Estado actual en seed: colección vacía

Relaciones que se ven en el modelo:

Un usuario tiene muchas categorías, plantas, stats, tiles, tags y tareas.
Una planta pertenece a un usuario y puede tener múltiples tags.
Una tarea en careSchedule referencia a una planta por plantId.
Hay desnormalización parcial: en plants se guarda categories embebido, y en careSchedule se guarda plantName/icon además de plantId.` y ajusta:

```env
API_HOST=127.0.0.1
API_PORT=8000
API_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=../serviceAccountKey.json
CORS_ORIGINS=http://localhost:8081,http://localhost:19006
```

## Instalacion
Dentro de nuestro ambiente de python
```powershell
pip install -r .\requirements.txt
```

Si ya tienes otro entorno virtual para backend, puedes usarlo sin problema.

## Ejecutar

Desde la raiz del proyecto:

```powershell
 uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Endpoints principales

- `GET /health`
- `GET /api/users/{userId}`
- `GET /api/users/{userId}/profile`
- `GET /api/users/{userId}/plants`
- `GET /api/plants/{plantId}`
- `GET /api/users/{userId}/categories`
- `GET /api/users/{userId}/plant-tags`
- `GET /api/users/{userId}/care-schedule`
- `GET /api/users/{userId}/care-history`
- `GET /api/users/{userId}/stats`
- `GET /api/users/{userId}/info-tiles`
- `GET /api/collections/{collectionName}`

## Notas

- Usa Firebase Admin, asi que consulta Firestore del lado servidor.
- Si la service account no tiene permisos, la API devolvera errores al consultar Firestore.
- El endpoint `GET /api/collections/{collectionName}` es util para desarrollo interno; cuando saques esta API del proyecto conviene restringirlo o eliminarlo.
