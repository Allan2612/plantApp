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

      try {
        const resolution = await fetchProfileForSession({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          providerId: user.providerData?.[0]?.providerId ?? null,
        });

        if (!resolution?.profile) {
          await logoutUser();
          resetAuthState();
          return;
        }

        setFirebaseUser(user);
        setProfile(resolution.profile);
        setSessionStatus("authenticated");
      } catch (error) {
        console.warn("[Auth][bootstrap] profile resolution failed", error);
        await logoutUser();
        resetAuthState();
      }
    });

    return unsubscribe;
  }, [resetAuthState, setFirebaseUser, setProfile, setSessionStatus]);
}
