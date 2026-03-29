import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthStoreState } from "@/src/types/auth.types";

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "plantica-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
);
