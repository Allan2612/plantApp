import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuthOrThrow } from "./firebaseClient";

function mapFirebaseError(code?: string): string {
  switch (code) {
    case "auth/invalid-api-key":
      return "La configuración de Firebase es inválida (API key). Revisa tu .env.";
    case "auth/operation-not-allowed":
      return "El proveedor Email/Password no está habilitado en Firebase.";
    case "auth/network-request-failed":
      return "No hay conexión con Firebase. Revisa internet o configuración.";
    case "auth/missing-email":
      return "Debes ingresar un correo.";
    case "auth/invalid-email":
      return "Correo inválido.";
    case "auth/missing-password":
      return "Debes ingresar una contraseña.";
    case "auth/invalid-credential":
      return "Credenciales inválidas.";
    case "auth/email-already-in-use":
      return "Este correo ya está en uso.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    case "auth/user-not-found":
      return "No existe una cuenta con ese correo.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Inténtalo más tarde.";
    default:
      return code
        ? `Ocurrió un error de autenticación (${code}).`
        : "Ocurrió un error de autenticación.";
  }
}

export function subscribeAuthState(listener: (user: User | null) => void) {
  try {
    const auth = getFirebaseAuthOrThrow();
    return onAuthStateChanged(auth, listener);
  } catch {
    listener(null);
    return () => undefined;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const auth = getFirebaseAuthOrThrow();
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    return credential.user;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[Auth][loginWithEmail]", {
      code: firebaseError.code,
      message: firebaseError.message,
    });
    const message = mapFirebaseError(firebaseError.code);
    throw new Error(message);
  }
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  try {
    const auth = getFirebaseAuthOrThrow();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    await sendEmailVerification(credential.user);
    return credential.user;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[Auth][registerWithEmail]", {
      code: firebaseError.code,
      message: firebaseError.message,
    });
    const message = mapFirebaseError(firebaseError.code);
    throw new Error(message);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const auth = getFirebaseAuthOrThrow();
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[Auth][requestPasswordReset]", {
      code: firebaseError.code,
      message: firebaseError.message,
    });
    const message = mapFirebaseError(firebaseError.code);
    throw new Error(message);
  }
}

export async function resendAccountVerification(): Promise<void> {
  const auth = getFirebaseAuthOrThrow();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay sesión activa.");
  }
  await sendEmailVerification(user);
}

export async function refreshCurrentUser(): Promise<User | null> {
  const auth = getFirebaseAuthOrThrow();
  const user = auth.currentUser;
  if (!user) return null;
  await user.reload();
  return auth.currentUser;
}

export async function logoutUser(): Promise<void> {
  const auth = getFirebaseAuthOrThrow();
  await signOut(auth);
}
