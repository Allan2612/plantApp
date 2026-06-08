import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import { httpDelete, httpGet, httpPost } from "@/src/services/api/httpClient";
import { PlantComment, PublicProfileData } from "@/src/types/plant.types";

const API_BASE_URL = getApiBaseUrl();

export async function togglePlantLike(
  plantId: string,
  userId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  return httpPost(`${API_BASE_URL}/api/catalog/plants/${plantId}/like`, { userId });
}

export async function fetchPlantComments(plantId: string): Promise<PlantComment[]> {
  return httpGet(`${API_BASE_URL}/api/catalog/plants/${plantId}/comments`);
}

export async function addPlantComment(
  plantId: string,
  userId: string,
  text: string,
): Promise<PlantComment> {
  return httpPost(`${API_BASE_URL}/api/catalog/plants/${plantId}/comments`, { userId, text });
}

export async function deletePlantComment(
  plantId: string,
  commentId: string,
  requestingUserId: string,
): Promise<void> {
  await httpDelete(
    `${API_BASE_URL}/api/catalog/plants/${plantId}/comments/${commentId}?requestingUserId=${encodeURIComponent(requestingUserId)}`,
  );
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfileData> {
  return httpGet(`${API_BASE_URL}/api/users/${userId}/public`);
}
