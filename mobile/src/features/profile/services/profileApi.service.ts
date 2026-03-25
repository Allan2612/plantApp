import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import { BackendUserProfile } from "@/src/types/auth.types";

const API_BASE_URL = getApiBaseUrl();

export async function fetchUserProfile(userId: string): Promise<BackendUserProfile | null> {
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
