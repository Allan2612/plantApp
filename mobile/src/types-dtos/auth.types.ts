import { User } from "firebase/auth";

export type AuthSessionStatus = "checking" | "authenticated" | "unauthenticated";

export interface BackendUserProfile {
  user: Record<string, unknown>;
  stats: Record<string, unknown>[];
  infoTiles: Record<string, unknown>[];
  favoritePlant: Record<string, unknown> | null;
  favoritePlantCatalog: Record<string, unknown> | null;
  categories: Record<string, unknown>[];
}

export interface AuthStoreState {
  sessionStatus: AuthSessionStatus;
  firebaseUser: User | null;
  profile: BackendUserProfile | null;
  setSessionStatus: (status: AuthSessionStatus) => void;
  setFirebaseUser: (user: User | null) => void;
  setProfile: (profile: BackendUserProfile | null) => void;
  resetAuthState: () => void;
}

export interface AuthActionResult {
  ok: boolean;
  message?: string;
}
