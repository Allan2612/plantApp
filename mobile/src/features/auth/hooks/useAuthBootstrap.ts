import { useEffect } from "react";

import { fetchProfileForSession } from "@/src/features/profile/services/profileApi.service";
import {
  logoutUser,
  subscribeAuthState,
} from "@/src/features/auth/services/authFirebase.service";
import { useAuthStore } from "@/src/store/auth.store";

export function useAuthBootstrap() {
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const resetAuthState = useAuthStore((state) => state.resetAuthState);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setSessionStatus("unauthenticated");
        return;
      }

      // Offline-first: si ya hay un perfil cacheado (persistido), autentica de
      // inmediato para no quedar en "checking" (pantalla negra) ni desloguear
      // cuando el backend está dormido o sin red.
      const cachedProfile = useAuthStore.getState().profile;
      if (cachedProfile) {
        setFirebaseUser(user);
        setSessionStatus("authenticated");
      }

      try {
        const resolution = await fetchProfileForSession({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          providerId: user.providerData?.[0]?.providerId ?? null,
        });

        if (resolution?.profile) {
          setFirebaseUser(user);
          setProfile(resolution.profile);
          setSessionStatus("authenticated");
        } else if (!cachedProfile) {
          // Sin perfil en backend y sin cache → sesión inválida.
          await logoutUser();
          resetAuthState();
        }
      } catch (error) {
        console.warn("[Auth][bootstrap] profile resolution failed", error);
        // Fallo transitorio (backend dormido / sin red): si hay cache, se
        // mantiene la sesión; si no, se marca no autenticado (sin hard logout
        // para permitir reintento al recuperar conexión).
        if (!cachedProfile) {
          setFirebaseUser(null);
          setProfile(null);
          setSessionStatus("unauthenticated");
        }
      }
    });

    return unsubscribe;
  }, [resetAuthState, setFirebaseUser, setProfile, setSessionStatus]);
}
