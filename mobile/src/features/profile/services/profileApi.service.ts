import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import { httpGet } from "@/src/services/api/httpClient";
import { BackendUserProfile } from "@/src/types/auth.types";

const API_BASE_URL = getApiBaseUrl();

export async function fetchUserProfile(userId: string): Promise<BackendUserProfile | null> {
  if (!userId.trim()) return null;

  try {
    const endpoint = `${API_BASE_URL}/api/users/${userId}/profile`;
    return await httpGet<BackendUserProfile>(endpoint, undefined, {
      timeoutMs: 15000,
      maxRetries: 4,
    });
  } catch {
    return null;
  }
}
