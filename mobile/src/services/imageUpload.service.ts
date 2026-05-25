import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import { httpPostMultipart } from "@/src/services/api/httpClient";

interface UploadResponse {
  url: string;
}

function isLocalUri(uri: string): boolean {
  return /^(file:\/\/|content:\/\/)/.test(uri);
}

async function uploadImage(endpoint: string, localUri: string): Promise<string> {
  const formData = new FormData();
  const filename = localUri.split("/").pop() ?? "image.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  const type = mimeMap[ext] ?? "image/jpeg";

  console.log("[Upload] uploadImage endpoint=", endpoint, "filename=", filename, "type=", type);
  formData.append("file", { uri: localUri, name: filename, type } as unknown as Blob);

  const result = await httpPostMultipart<UploadResponse>(
    `${getApiBaseUrl()}${endpoint}`,
    formData,
  );
  console.log("[Upload] uploadImage result url=", result.url);
  return result.url;
}

export async function uploadUserAvatar(userId: string, localUri: string): Promise<string> {
  console.log("[Upload] uploadUserAvatar userId=", userId, "localUri=", localUri, "isLocal=", isLocalUri(localUri));
  if (!isLocalUri(localUri)) return localUri;
  return uploadImage(`/api/users/${userId}/avatar`, localUri);
}

export async function uploadUserPlantImage(userPlantId: string, localUri: string): Promise<string> {
  if (!isLocalUri(localUri)) return localUri;
  return uploadImage(`/api/user-plants/${userPlantId}/image`, localUri);
}

export async function uploadCatalogPlantImage(plantCatalogId: string, localUri: string): Promise<string> {
  if (!isLocalUri(localUri)) return localUri;
  return uploadImage(`/api/catalog/plants/${plantCatalogId}/image`, localUri);
}
