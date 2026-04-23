import { getApiBaseUrlResolution } from "@/src/services/api/apiBaseUrl";
import { httpGet } from "@/src/services/api/httpClient";
import { PlantCatalogItem } from "@/src/types/plant.types";

const apiResolution = getApiBaseUrlResolution();
const API_BASE_URL = apiResolution.baseUrl;

export async function fetchCatalogPlants(): Promise<PlantCatalogItem[]> {
  const endpoint = `${API_BASE_URL}/api/catalog/plants`;
  try {
    return await httpGet<PlantCatalogItem[]>(endpoint, undefined, {
      timeoutMs: 15000,
      maxRetries: 4,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    throw new Error(
      `Catalog fetch failed. endpoint=${endpoint} source=${apiResolution.source} expoHost=${apiResolution.expoHost ?? "null"} error=${message}`,
    );
  }
}
