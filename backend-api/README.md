# Backend API (monorepo PlanTica)

Backend FastAPI de solo lectura para Firestore. Vive en /backend-api dentro de un monorepo con /mobile.

No se exponen endpoints de escritura (create, update, delete).

## Estructura

- main.py: punto de entrada de FastAPI.
- app/config.py: carga de variables de entorno.
- app/firebase.py: inicializacion de Firebase Admin.
- app/services.py: lectura y composicion de datos de Firestore.
- app/models.py: modelos de respuesta.
- app/routes.py: endpoints REST.

## Firestore modelado soportado

Colecciones reales usadas por este backend:

- users
- userStats
- userInfoTiles
- categories
- plantsCatalog
- userPlants
- plantTags
- careSchedule
- careHistory

Se eliminaron dependencias del modelo viejo:

- No se usa la coleccion plants.
- No se usan referencias plantId.
- categories se trata como coleccion global (sin filtro por userId).
- careSchedule no depende de plantName, iconType ni iconEmoji.

## Configuracion de Firebase Admin

1. Coloca el archivo de credenciales en la raiz del monorepo con este nombre:

   serviceAccountKey.json

2. Desde /backend-api, crea .env copiando .env.example.

3. Verifica la ruta relativa al service account:

	API_HOST=0.0.0.0
	API_PORT=8000
	API_ENV=development
	FIREBASE_SERVICE_ACCOUNT_PATH=../serviceAccountKey.json
	CORS_ORIGINS=*

## Ejecucion

Desde /backend-api:

	pip install -r requirements.txt
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

Si vas a probar desde celular real (Expo Go), usa la IP LAN de tu PC en el frontend:

	EXPO_PUBLIC_API_BASE_URL=http://<TU_IP_LOCAL>:8000

Ejemplo:

	EXPO_PUBLIC_API_BASE_URL=http://192.168.1.25:8000

## Endpoints disponibles

- GET /health
- GET /api/users/{userId}
- GET /api/users/{userId}/profile
- GET /api/users/{userId}/plants
- GET /api/user-plants/{userPlantId}
- GET /api/catalog/plants
- GET /api/catalog/plants/{plantCatalogId}
- GET /api/categories
- GET /api/users/{userId}/plant-tags
- GET /api/users/{userId}/care-schedule
- GET /api/users/{userId}/care-history
- GET /api/users/{userId}/stats
- GET /api/users/{userId}/info-tiles

## Respuestas compuestas clave

GET /api/users/{userId}/profile devuelve:

- user
- stats
- infoTiles
- favoritePlant
- favoritePlantCatalog
- categories (global)

GET /api/users/{userId}/plants devuelve para cada planta del usuario:

- userPlant
- catalogPlant (opcional)
- tags
- upcomingCare

GET /api/user-plants/{userPlantId} devuelve:

- userPlant
- catalogPlant
- tags
- careSchedule
- careHistory
