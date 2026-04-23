import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseAuthOrThrow } from "./firebaseClient";

type FirebaseAuthError = {
  code?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmailOrThrow(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Debes ingresar un correo.");
  }
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new Error("Correo inválido.");
  }
  return normalizedEmail;
}

function assertPasswordOrThrow(password: string): void {
  if (!password.trim()) {
    throw new Error("Debes ingresar una contraseña.");
  }
}

function assertIdTokenOrThrow(idToken: string): void {
  if (!idToken.trim()) {
    throw new Error("No se recibió un token de Google válido.");
  }
}

function logAuthIssue(scope: string, code?: string, message?: string): void {
  const payload = { code, message };
  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  ) {
    console.warn(scope, payload);
    return;
  }

  console.error(scope, payload);
}

function mapFirebaseError(code?: string): string {
  switch (code) {
    case "auth/configuration-not-found":
      return "La configuración de autenticación de Firebase no está completa.";
    case "auth/invalid-api-key":
      return "La configuración de Firebase es inválida (API key). Revisa tu .env.";
    case "auth/app-not-authorized":
      return "La app no está autorizada para usar este proyecto Firebase.";
    case "auth/invalid-app-credential":
      return "La credencial de la app es inválida para este proyecto Firebase.";
    case "auth/operation-not-allowed":
      return "El proveedor Email/Password no está habilitado en Firebase.";
    case "auth/network-request-failed":
      return "No hay conexión con Firebase. Revisa internet o configuración.";
    case "auth/internal-error":
      return "Firebase devolvió un error interno. Inténtalo de nuevo.";
    case "auth/missing-email":
      return "Debes ingresar un correo.";
    case "auth/invalid-email":
      return "Correo inválido.";
    case "auth/missing-password":
      return "Debes ingresar una contraseña.";
    case "auth/invalid-login-credentials":
      return "Correo o contraseña incorrectos.";
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos, o la cuenta pertenece a otro proyecto Firebase.";
    case "auth/wrong-password":
      return "Correo o contraseña incorrectos.";
    case "auth/user-disabled":
      return "Esta cuenta fue deshabilitada.";
    case "auth/requires-recent-login":
      return "Por seguridad, vuelve a iniciar sesión e inténtalo otra vez.";
    case "auth/user-token-expired":
      return "Tu sesión expiró. Inicia sesión nuevamente.";
    case "auth/invalid-user-token":
      return "La sesión no es válida. Inicia sesión nuevamente.";
    case "auth/no-current-user":
      return "No hay sesión activa.";
    case "auth/invalid-idp-response":
      return "La respuesta de Google no fue válida. Inténtalo otra vez.";
    case "auth/account-exists-with-different-credential":
      return "Ese correo ya existe con otro método de inicio de sesión.";
    case "auth/popup-closed-by-user":
      return "Cerraste el inicio de sesión antes de completarlo.";
    case "auth/cancelled-popup-request":
      return "Se canceló la solicitud de inicio de sesión.";
    case "auth/popup-blocked":
      return "El inicio de sesión fue bloqueado. Inténtalo nuevamente.";
    case "auth/unauthorized-domain":
      return "El dominio no está autorizado en Firebase Authentication.";
    case "auth/email-already-in-use":
      return "Este correo ya está en uso.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    case "auth/user-not-found":
      return "No existe una cuenta con ese correo.";
    case "auth/expired-action-code":
      return "El enlace expiró. Solicita uno nuevo.";
    case "auth/invalid-action-code":
      return "El enlace no es válido o ya fue usado.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Inténtalo más tarde.";
    default:
      return code
        ? `Ocurrió un error de autenticación (${code}).`
        : "Ocurrió un error de autenticación.";
  }
}

function mapUnknownError(error: unknown, scope: string): Error {
  const firebaseError = error as FirebaseAuthError;
  logAuthIssue(scope, firebaseError.code, firebaseError.message);

  if (!firebaseError.code) {
    if (error instanceof Error) {
      return error;
    }
    return new Error("Ocurrió un error inesperado durante la autenticación.");
  }

  return new Error(mapFirebaseError(firebaseError.code));
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
    const normalizedEmail = normalizeEmailOrThrow(email);
    assertPasswordOrThrow(password);

    const auth = getFirebaseAuthOrThrow();
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    return credential.user;
  } catch (error) {
    throw mapUnknownError(error, "[Auth][loginWithEmail]");
  }
}

export async function loginWithGoogleIdToken(idToken: string): Promise<User> {
  try {
    assertIdTokenOrThrow(idToken);

    const auth = getFirebaseAuthOrThrow();
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    throw mapUnknownError(error, "[Auth][loginWithGoogleIdToken]");
  }
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  try {
    const normalizedEmail = normalizeEmailOrThrow(email);
    assertPasswordOrThrow(password);

    const auth = getFirebaseAuthOrThrow();
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    await sendEmailVerification(credential.user);
    return credential.user;
  } catch (error) {
    throw mapUnknownError(error, "[Auth][registerWithEmail]");
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const normalizedEmail = normalizeEmailOrThrow(email);

    const auth = getFirebaseAuthOrThrow();
    await sendPasswordResetEmail(auth, normalizedEmail);
  } catch (error) {
    throw mapUnknownError(error, "[Auth][requestPasswordReset]");
  }
}

export async function resendAccountVerification(): Promise<void> {
  try {
    const auth = getFirebaseAuthOrThrow();
    const user = auth.currentUser;
    if (!user) {
      throw { code: "auth/no-current-user" };
    }
    await sendEmailVerification(user);
  } catch (error) {
    throw mapUnknownError(error, "[Auth][resendAccountVerification]");
  }
}

export async function refreshCurrentUser(): Promise<User | null> {
  try {
    const auth = getFirebaseAuthOrThrow();
    const user = auth.currentUser;
    if (!user) return null;
    await user.reload();
    return auth.currentUser;
  } catch (error) {
    throw mapUnknownError(error, "[Auth][refreshCurrentUser]");
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const auth = getFirebaseAuthOrThrow();
    await signOut(auth);
  } catch (error) {
    throw mapUnknownError(error, "[Auth][logoutUser]");
  }
}
