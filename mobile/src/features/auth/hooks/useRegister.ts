import { useState } from "react";

import {
  fetchProfileForSession,
  updateUserProfile,
} from "@/src/features/profile/services/profileApi.service";
import {
  deleteCurrentUser,
  logoutUser,
  registerWithEmail,
} from "@/src/features/auth/services/authFirebase.service";
import { useAuthStore } from "@/src/store/auth.store";

export function useRegister() {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);
  const resetAuthState = useAuthStore((state) => state.resetAuthState);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = async (
    email: string,
    password: string,
    displayName: string,
    username: string,
    phone: string,
    acceptedTerms: boolean,
  ) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    let createdAuthUser = false;

    try {
      const user = await registerWithEmail(email, password, displayName);
      createdAuthUser = true;

      const resolution = await fetchProfileForSession(
        {
          uid: user.uid,
          email: user.email ?? email,
          displayName,
          providerId: user.providerData?.[0]?.providerId ?? null,
        },
        {
          acceptedTerms,
        },
      );

      if (!resolution?.profile || !resolution.backendUserId) {
        throw new Error(
          "No pudimos completar la creación de tu perfil. Inténtalo de nuevo en unos segundos.",
        );
      }

      await updateUserProfile(resolution.backendUserId, {
        displayName,
        username,
        phone: phone || undefined,
      });

      const refreshedResolution = await fetchProfileForSession({
        uid: user.uid,
        email: user.email ?? email,
        displayName,
        providerId: user.providerData?.[0]?.providerId ?? null,
      });

      if (!refreshedResolution?.profile) {
        throw new Error(
          "No pudimos validar tu perfil recién creado. Inténtalo nuevamente.",
        );
      }

      setFirebaseUser(user);
      setProfile(refreshedResolution.profile);
      setSessionStatus("authenticated");

      const message =
        "Te enviamos un correo de confirmación. Revisa también la carpeta de spam o promociones.";
      setSuccessMessage(message);
      return { ok: true as const, message };
    } catch (err) {
      if (createdAuthUser) {
        try {
          await deleteCurrentUser();
        } catch (rollbackError) {
          console.warn(
            "[Auth][register] rollback delete user failed",
            rollbackError,
          );
          try {
            await logoutUser();
          } catch (logoutError) {
            console.warn(
              "[Auth][register] rollback logout failed",
              logoutError,
            );
          }
        }
      }

      resetAuthState();

      const message =
        err instanceof Error ? err.message : "No se pudo crear la cuenta.";
      setError(message);
      return { ok: false as const, message };
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, successMessage };
}
