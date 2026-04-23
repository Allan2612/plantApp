import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { mapFirebaseAuthCode } from "@/src/services/errors/errorMessages";
import { getFirebaseAuthOrThrow } from "./firebaseClient";

function logHandledAuthError(
  scope: string,
  code?: string,
  message?: string,
): void {
  if (!__DEV__) return;
  console.warn(`[Auth][${scope}]`, { code, message });
}

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

function mapAndThrow(scope: string, error: unknown): never {
  const firebaseError = error as { code?: string; message?: string };
  logHandledAuthError(scope, firebaseError.code, firebaseError.message);
  throw new Error(mapFirebaseAuthCode(firebaseError.code));
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

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  try {
    const normalizedEmail = normalizeEmailOrThrow(email);
    assertPasswordOrThrow(password);

    const auth = getFirebaseAuthOrThrow();
    const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    return credential.user;
  } catch (error) {
    mapAndThrow("loginWithEmail", error);
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
    mapAndThrow("loginWithGoogleIdToken", error);
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  try {
    const normalizedEmail = normalizeEmailOrThrow(email);
    assertPasswordOrThrow(password);

    const auth = getFirebaseAuthOrThrow();
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    const normalizedDisplayName = displayName?.trim();
    if (normalizedDisplayName) {
      await updateProfile(credential.user, {
        displayName: normalizedDisplayName,
      });
    }

    await sendEmailVerification(credential.user);
    return credential.user;
  } catch (error) {
    mapAndThrow("registerWithEmail", error);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const normalizedEmail = normalizeEmailOrThrow(email);

    const auth = getFirebaseAuthOrThrow();
    await sendPasswordResetEmail(auth, normalizedEmail);
  } catch (error) {
    mapAndThrow("requestPasswordReset", error);
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
    mapAndThrow("resendAccountVerification", error);
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
    mapAndThrow("refreshCurrentUser", error);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const auth = getFirebaseAuthOrThrow();
    await signOut(auth);
  } catch (error) {
    mapAndThrow("logoutUser", error);
  }
}

export async function deleteCurrentUser(): Promise<void> {
  const auth = getFirebaseAuthOrThrow();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario autenticado para eliminar.");
  }

  await deleteUser(user);
}
