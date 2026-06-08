import { useMemo } from "react";

import { useAuthStore } from "@/src/store/auth.store";

export function useAuthSession() {
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const firebaseUser = useAuthStore((state) => state.firebaseUser);

  return useMemo(
    () => ({
      isChecking: sessionStatus === "checking",
      isAuthenticated: sessionStatus === "authenticated" && !!firebaseUser,
      isEmailVerified: !!firebaseUser?.emailVerified,
      user: firebaseUser,
    }),
    [firebaseUser, sessionStatus],
  );
}
