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
    const url = `${API_BASE_URL}/api/users/${userId}/profile`;
    console.log("[API] fetchUserProfile GET", url);
    const response = await fetch(url);
    console.log("[API] fetchUserProfile status=", response.status);
    if (!response.ok) return null;
    const data = (await response.json()) as BackendUserProfile;
    console.log("[API] fetchUserProfile ok, user.id=", data?.user?.id, "avatarId=", data?.user?.avatarId);
    return data;
  } catch (err) {
    console.log("[API] fetchUserProfile error:", err);
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
    console.log("[API] fetchUserByEmail GET", endpoint);
    const response = await fetch(endpoint);
    console.log("[API] fetchUserByEmail status=", response.status);
    if (!response.ok) return null;
    const data = (await response.json()) as BackendUser;
    console.log("[API] fetchUserByEmail ok, id=", data?.id);
    return data;
  } catch (err) {
    console.log("[API] fetchUserByEmail error:", err);
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
  console.log("[API] fetchProfileForSession uid=", firebaseUserId, "email=", firebaseEmail);

  const profileByUid = await fetchUserProfile(firebaseUserId);
  if (profileByUid?.user?.id) {
    console.log("[API] fetchProfileForSession found by uid: backendId=", profileByUid.user.id);
    return {
      profile: profileByUid,
      backendUserId: profileByUid.user.id,
    };
  }

  if (!firebaseEmail?.trim()) {
    console.log("[API] fetchProfileForSession no email, returning null");
    return null;
  }

  let backendUser = await fetchUserByEmail(firebaseEmail);
  console.log("[API] fetchProfileForSession by email result:", backendUser?.id ?? "null");

  if (!backendUser?.id) {
    console.log("[API] fetchProfileForSession calling syncUserFromAuth...");
    backendUser = await syncUserFromAuth({
      email: firebaseEmail,
      displayName: sessionUser.displayName ?? undefined,
      provider: sessionUser.providerId ?? undefined,
      acceptedTerms: syncOptions?.acceptedTerms,
      avatarId: syncOptions?.avatarId,
    });
    console.log("[API] fetchProfileForSession syncUserFromAuth result:", backendUser?.id ?? "null");
  }

  if (!backendUser?.id) {
    console.log("[API] fetchProfileForSession no backendUser, returning null");
    return null;
  }

  const profileByBackendId = await fetchUserProfile(backendUser.id);
  if (!profileByBackendId) {
    console.log("[API] fetchProfileForSession fetchUserProfile by backendId failed");
    return null;
  }

  console.log("[API] fetchProfileForSession resolved backendUserId=", backendUser.id);
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
