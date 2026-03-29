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

const REQUIRED_FIREBASE_KEYS = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
] as const;

function getMissingFirebaseEnvKeys(): string[] {
  return REQUIRED_FIREBASE_KEYS.filter((key) => !process.env[key]?.trim());
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

  try {
    if (!getReactNativePersistence) {
      throw new Error(
        "No se pudo inicializar persistencia de auth en React Native.",
      );
    }

    firebaseAuthInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) as Persistence,
    });
    return firebaseAuthInstance;
  } catch (error) {
    const authErrorCode = (error as { code?: string }).code;
    if (authErrorCode === "auth/already-initialized") {
      firebaseAuthInstance = getAuth(app);
      return firebaseAuthInstance;
    }
    throw error;
  }
}
