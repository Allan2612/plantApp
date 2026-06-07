import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "@firebase/auth";
import { Auth, Persistence, getAuth, initializeAuth } from "@firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;

const getReactNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

// Se valida el objeto `firebaseConfig` (que usa referencias LITERALES a
// process.env, las únicas que Metro inyecta en el bundle de producción) y NO
// `process.env[key]` dinámico, que queda undefined en el APK y reportaba
// falsamente que faltaban las variables.
function getMissingFirebaseEnvKeys(): string[] {
  const entries: [string, string][] = [
    ["EXPO_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
    ["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
    ["EXPO_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
    ["EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
    ["EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
    ["EXPO_PUBLIC_FIREBASE_APP_ID", firebaseConfig.appId],
  ];
  return entries.filter(([, value]) => !value?.trim()).map(([key]) => key);
}

function assertFirebaseConfig(): void {
  const missingKeys = getMissingFirebaseEnvKeys();
  if (!missingKeys.length) return;

  throw new Error(
    `Faltan variables de Firebase en .env: ${missingKeys.join(", ")}. ` +
      "Reinicia Expo luego de configurar el archivo.",
  );
}

export function getFirebaseAppOrThrow(): FirebaseApp {
  if (firebaseAppInstance) return firebaseAppInstance;

  assertFirebaseConfig();

  if (!getApps().length) {
    firebaseAppInstance = initializeApp(firebaseConfig);
    return firebaseAppInstance;
  }

  firebaseAppInstance = getApp();
  return firebaseAppInstance;
}

export function getFirebaseAuthOrThrow(): Auth {
  if (firebaseAuthInstance) return firebaseAuthInstance;

  const app = getFirebaseAppOrThrow();

  // Intenta inicializar con persistencia en AsyncStorage. Si el helper
  // `getReactNativePersistence` no está disponible (puede pasar en builds de
  // producción por minificación/Hermes) o initializeAuth falla, cae a
  // getAuth(app) para que el login NUNCA quede roto por la persistencia.
  try {
    if (getReactNativePersistence) {
      firebaseAuthInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage) as Persistence,
      });
      return firebaseAuthInstance;
    }
  } catch (error) {
    const authErrorCode = (error as { code?: string }).code;
    if (authErrorCode !== "auth/already-initialized") {
      // Cualquier otro fallo de persistencia: continúa al fallback getAuth.
    }
  }

  firebaseAuthInstance = getAuth(app);
  return firebaseAuthInstance;
}
