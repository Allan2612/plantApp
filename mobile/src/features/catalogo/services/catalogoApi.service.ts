import { getApiBaseUrlResolution } from "@/src/services/api/apiBaseUrl";
import { httpGet, httpPost } from "@/src/services/api/httpClient";
import {
  CreateCatalogPlantPayload,
  PlantCatalogItem,
} from "@/src/types/plant.types";
import { Platform } from "react-native";

const apiResolution = getApiBaseUrlResolution();
const API_BASE_URL = apiResolution.baseUrl;
const DEFAULT_API_PORT = "8000";

type CatalogApiItem = PlantCatalogItem & Record<string, unknown>;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLoopbackHost(host: string): boolean {
  return /^(localhost|127\.0\.0\.1)$/i.test(host);
}

function isConnectivityError(errorMessage: string): boolean {
  return /(Network request failed|Failed to fetch|network|No hay conexi[oó]n)/i.test(
    errorMessage,
  );
}

function buildApiBaseUrlCandidates(): string[] {
  const candidates: string[] = [stripTrailingSlash(API_BASE_URL)];

  if (apiResolution.expoHost && !isLoopbackHost(apiResolution.expoHost)) {
    candidates.push(`http://${apiResolution.expoHost}:${DEFAULT_API_PORT}`);
  }

  if (Platform.OS === "android") {
    candidates.push(`http://10.0.2.2:${DEFAULT_API_PORT}`);
  }

  candidates.push(`http://127.0.0.1:${DEFAULT_API_PORT}`);

  return Array.from(new Set(candidates));
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function normalizeImageUrl(value: unknown, apiBaseUrl: string): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (isAbsoluteUrl(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed.replace(/^\.\/?/, "")}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

function resolveCatalogImageUrl(
  item: CatalogApiItem,
  apiBaseUrl: string,
): string | null {
  return normalizeImageUrl(item.imageUrl, apiBaseUrl);
}

function normalizeCatalogItem(
  item: CatalogApiItem,
  apiBaseUrl: string,
): PlantCatalogItem {
  return {
    ...item,
    nicknames: Array.isArray(item.nicknames) ? item.nicknames : [],
    imageUrl: resolveCatalogImageUrl(item, apiBaseUrl),
    likeCount: typeof item.likeCount === "number" ? item.likeCount : 0,
    commentCount: typeof item.commentCount === "number" ? item.commentCount : 0,
    isLikedByCurrentUser: Boolean(item.isLikedByCurrentUser),
  };
}

export async function fetchCatalogPlants(viewerId?: string): Promise<PlantCatalogItem[]> {
  const attempts: string[] = [];

  for (const baseUrl of buildApiBaseUrlCandidates()) {
    const qs = viewerId ? `?viewer_id=${encodeURIComponent(viewerId)}` : "";
    const endpoint = `${baseUrl}/api/catalog/plants${qs}`;

    try {
      const data = await httpGet<CatalogApiItem[]>(endpoint);
      return data.map((item) => normalizeCatalogItem(item, baseUrl));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      attempts.push(`${endpoint} -> ${message}`);

      if (!isConnectivityError(message)) {
        throw new Error(
          `Catalog fetch failed. endpoint=${endpoint} source=${apiResolution.source} expoHost=${apiResolution.expoHost ?? "null"} error=${message}`,
        );
      }
    }
  }

  throw new Error(
    `Catalog fetch failed after fallbacks. source=${apiResolution.source} expoHost=${apiResolution.expoHost ?? "null"} attempts=${attempts.join(" | ")}`,
  );
}

export async function createCatalogPlant(
  payload: CreateCatalogPlantPayload,
): Promise<PlantCatalogItem> {
  if (!payload.name.trim()) {
    throw new Error("name es requerido para crear una especie.");
  }
  if (!payload.scientificName.trim()) {
    throw new Error("scientificName es requerido para crear una especie.");
  }
  if (!payload.description.trim()) {
    throw new Error("description es requerido para crear una especie.");
  }

  const attempts: string[] = [];

  for (const baseUrl of buildApiBaseUrlCandidates()) {
    const endpoint = `${baseUrl}/api/catalog/plants`;

    try {
      const created = await httpPost<CatalogApiItem, CreateCatalogPlantPayload>(
        endpoint,
        payload,
      );
      return normalizeCatalogItem(created, baseUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      attempts.push(`${endpoint} -> ${message}`);

      if (!isConnectivityError(message)) {
        throw error;
      }
    }
  }

  throw new Error(
    `No se pudo crear la especie. Intentos: ${attempts.join(" | ")}`,
  );
}
