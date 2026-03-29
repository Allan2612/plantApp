import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import { httpPatch, httpPost } from "@/src/services/api/httpClient";
import {
  BackendUser,
  BackendUserProfile,
  SessionProfileResolution,
  SyncAuthUserPayload,
  UpdateUserPayload,
} from "@/src/types/auth.types";

const API_BASE_URL = getApiBaseUrl();

export async function fetchUserProfile(
  userId: string,
): Promise<BackendUserProfile | null> {
  if (!userId.trim()) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`);
    if (!response.ok) return null;
    const data = (await response.json()) as BackendUserProfile;
    return data;
  } catch {
    return null;
  }
}

export async function fetchUserByEmail(
  email: string,
): Promise<BackendUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  try {
    const endpoint = `${API_BASE_URL}/api/users/by-email?email=${encodeURIComponent(normalizedEmail)}`;
    const response = await fetch(endpoint);
    if (!response.ok) return null;
    return (await response.json()) as BackendUser;
  } catch {
    return null;
  }
}

export async function fetchProfileForSession(
  sessionUser: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    providerId?: string | null;
  },
  syncOptions?: {
    acceptedTerms?: boolean;
    avatarId?: string;
  },
): Promise<SessionProfileResolution | null> {
  const firebaseUserId = sessionUser.uid;
  const firebaseEmail = sessionUser.email;

  const profileByUid = await fetchUserProfile(firebaseUserId);
  if (profileByUid?.user?.id) {
    return {
      profile: profileByUid,
      backendUserId: profileByUid.user.id,
    };
  }

  if (!firebaseEmail?.trim()) return null;

  let backendUser = await fetchUserByEmail(firebaseEmail);

  if (!backendUser?.id) {
    backendUser = await syncUserFromAuth({
      email: firebaseEmail,
      displayName: sessionUser.displayName ?? undefined,
      provider: sessionUser.providerId ?? undefined,
      acceptedTerms: syncOptions?.acceptedTerms,
      avatarId: syncOptions?.avatarId,
    });
  }

  if (!backendUser?.id) return null;

  const profileByBackendId = await fetchUserProfile(backendUser.id);
  if (!profileByBackendId) return null;

  return {
    profile: profileByBackendId,
    backendUserId: backendUser.id,
  };
}

export async function syncUserFromAuth(
  payload: SyncAuthUserPayload,
): Promise<BackendUser | null> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  try {
    return await httpPost<BackendUser, SyncAuthUserPayload>(
      `${API_BASE_URL}/api/users/sync-auth`,
      {
        ...payload,
        email: normalizedEmail,
      },
    );
  } catch {
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  payload: UpdateUserPayload,
): Promise<Record<string, unknown>> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new Error("userId es requerido para actualizar perfil.");
  }

  return httpPatch<Record<string, unknown>, UpdateUserPayload>(
    `${API_BASE_URL}/api/users/${normalizedUserId}`,
    payload,
  );
}
