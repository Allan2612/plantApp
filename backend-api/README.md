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

### Windows PowerShell (venv + uvicorn)

Si trabajas en Windows y PowerShell, usa esta secuencia exacta dentro de /backend-api:

	py -m venv .venv
	.\.venv\Scripts\Activate.ps1
	python -m pip install -r requirements.txt
	python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

Errores comunes:

- No uses `..venv`, la ruta correcta es `.\\.venv`.
- Si ya estas dentro de /backend-api, no ejecutes `cd .\\backend-api` otra vez.
- Si PowerShell bloquea scripts:

	Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Alternativa sin activar venv:

	.\.venv\Scripts\python.exe -m pip install -r requirements.txt
	.\.venv\Scripts\python.exe -m uvicorn --app-dir . main:app --reload --host 0.0.0.0 --port 8000

Si vas a probar desde celular real (Expo Go), usa la IP LAN de tu PC en el frontend:

	EXPO_PUBLIC_API_BASE_URL=http://<TU_IP_LOCAL>:8000

Ejemplo:

	EXPO_PUBLIC_API_BASE_URL=http://192.168.1.25:8000

### Solucion de conexion desde celular (misma red)

Si en la misma PC funciona `/health` pero en el celular no, verifica esto:

1. Backend escuchando en todas las interfaces:

	python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

2. En `/mobile/.env`, configurar la IP LAN real de la PC (no localhost, no 127.0.0.1):

	EXPO_PUBLIC_API_BASE_URL=http://192.168.1.3:8000

3. Reiniciar Expo limpiando cache:

	npx expo start -c --lan

4. Probar desde el navegador del celular:

	http://192.168.1.3:8000/health

Debe devolver:

	{"status":"ok"}

Si no abre en el celular, revisar aislamiento de clientes/AP isolation en el router o que ambos dispositivos esten en la misma red WiFi.

### Error 500 en endpoints distintos de /health

Si `/health` responde pero endpoints como `/api/categories` o `/api/catalog/plants` devuelven `500 Error interno del servidor`, normalmente falta el JSON de credenciales de Firebase.

Verifica en `.env`:

	FIREBASE_SERVICE_ACCOUNT_PATH=../serviceAccountKey.json

Y confirma que el archivo realmente exista en la ruta indicada.

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
