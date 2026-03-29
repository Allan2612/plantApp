import {
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
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
    const auth = getFirebaseAuthOrThrow();
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    return credential.user;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    logHandledAuthError(
      "loginWithEmail",
      firebaseError.code,
      firebaseError.message,
    );
    const message = mapFirebaseAuthCode(firebaseError.code);
    throw new Error(message);
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  try {
    const auth = getFirebaseAuthOrThrow();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
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
    const firebaseError = error as { code?: string; message?: string };
    logHandledAuthError(
      "registerWithEmail",
      firebaseError.code,
      firebaseError.message,
    );
    const message = mapFirebaseAuthCode(firebaseError.code);
    throw new Error(message);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const auth = getFirebaseAuthOrThrow();
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    logHandledAuthError(
      "requestPasswordReset",
      firebaseError.code,
      firebaseError.message,
    );
    const message = mapFirebaseAuthCode(firebaseError.code);
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

export async function deleteCurrentUser(): Promise<void> {
  const auth = getFirebaseAuthOrThrow();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario autenticado para eliminar.");
  }

  await deleteUser(user);
}
