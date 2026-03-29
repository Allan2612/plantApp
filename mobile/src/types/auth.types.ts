import { User } from "firebase/auth";

export type AuthSessionStatus = "checking" | "authenticated" | "unauthenticated";

export type UserVisibility = "public" | "private" | "friends";
export type ThemePreference = "system" | "light" | "dark";

export interface BackendUser {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarId: string;
  provider: string;
  acceptedTerms: boolean;
  headline?: string | null;
  visibility: UserVisibility;
  birthDate?: string | null;
  streakDays: number;
  streakText: string;
  favoritePlantId?: string | null;
  themePreference: ThemePreference;
  status: string;
  plantCount: number;
  city?: string | null;
}

export interface BackendUserProfile {
  user: BackendUser;
  stats: Record<string, unknown>[];
  infoTiles: Record<string, unknown>[];
  favoritePlant: Record<string, unknown> | null;
  favoritePlantCatalog: Record<string, unknown> | null;
  categories: Record<string, unknown>[];
}

export interface UpdateUserPayload {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarId?: string;
  headline?: string;
  visibility?: UserVisibility;
  birthDate?: string;
  themePreference?: ThemePreference;
  city?: string;
}

export interface SyncAuthUserPayload {
  email: string;
  displayName?: string;
  provider?: string;
  avatarId?: string;
  acceptedTerms?: boolean;
}

export interface SessionProfileResolution {
  profile: BackendUserProfile;
  backendUserId: string;
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
