import { useEffect } from "react";

import { fetchUserProfile } from "@/src/features/profile/services/profileApi.service";
import { subscribeAuthState } from "@/src/features/auth/services/authFirebase.service";
import { useAuthStore } from "@/src/store/auth.store";

export function useAuthBootstrap() {
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setProfile(null);
        setSessionStatus("unauthenticated");
        return;
      }

      setFirebaseUser(user);
      setSessionStatus("authenticated");

      const profile = await fetchUserProfile(user.uid);
      setProfile(profile);
    });

    return unsubscribe;
  }, [setFirebaseUser, setProfile, setSessionStatus]);
}
