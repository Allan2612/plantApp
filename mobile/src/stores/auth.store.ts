import { create } from "zustand";

import { AuthStoreState } from "@/src/types-dtos/auth.types";

export const useAuthStore = create<AuthStoreState>((set) => ({
  sessionStatus: "checking",
  firebaseUser: null,
  profile: null,
  setSessionStatus: (sessionStatus) => set({ sessionStatus }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setProfile: (profile) => set({ profile }),
  resetAuthState: () =>
    set({
      sessionStatus: "unauthenticated",
      firebaseUser: null,
      profile: null,
    }),
}));
