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

function isRelativeImagePath(url: string): boolean {
  return url.startsWith("/") || url.startsWith("./") || url.startsWith("../");
}

function resolveImageUrl(rawUrl: string, apiBaseUrl: string): string {
  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  if (isRelativeImagePath(rawUrl)) {
    const normalizedPath = rawUrl.startsWith("/")
      ? rawUrl
      : `/${rawUrl.replace(/^\.\/?/, "")}`;
    return `${apiBaseUrl}${normalizedPath}`;
  }

  return rawUrl;
}

function normalizeWikimediaUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const isCommonsHost = /(^|\.)commons\.wikimedia\.org$/i.test(
      parsed.hostname,
    );

    if (!isCommonsHost) {
      return rawUrl;
    }

    // Transform Special:FilePath/<filename> → thumb.php?f=<filename>&width=800
    // Special:FilePath returns a 302 redirect that expo-image/Glide can't follow reliably on Android.
    // thumb.php serves the image directly (or a thumbnail) without a redirect.
    const filePathPrefix = "/wiki/Special:FilePath/";
    if (parsed.pathname.startsWith(filePathPrefix)) {
      const fileName = parsed.pathname.slice(filePathPrefix.length);
      return `https://commons.wikimedia.org/w/thumb.php?f=${fileName}&width=800`;
    }

    const fileWikiPrefix = "/wiki/File:";
    if (parsed.pathname.startsWith(fileWikiPrefix)) {
      const fileName = parsed.pathname.slice(fileWikiPrefix.length);
      return `https://commons.wikimedia.org/w/thumb.php?f=${fileName}&width=800`;
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

function safeEncodeUri(url: string): string {
  // Collapse double-escaped octets like %2520 -> %20 without touching valid escapes.
  let normalized = url;
  for (let index = 0; index < 3; index += 1) {
    const collapsed = normalized.replace(/%25([0-9a-f]{2})/gi, "%$1");
    if (collapsed === normalized) {
      break;
    }
    normalized = collapsed;
  }

  return normalized.replace(/ /g, "%20");
}

function normalizeImageUrl(value: unknown, apiBaseUrl: string): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const resolved = isAbsoluteUrl(trimmed)
    ? trimmed
    : resolveImageUrl(trimmed, apiBaseUrl);
  const wikimediaResolved = normalizeWikimediaUrl(resolved);
  return safeEncodeUri(wikimediaResolved);
}

function resolveCatalogImageUrl(
  item: CatalogApiItem,
  apiBaseUrl: string,
): string | null {
  const candidates: unknown[] = [
    item.imageUrl,
    item.imageURL,
    item.imageUri,
    item.imageURI,
    item.image_url,
    item.image_uri,
    item.image,
    item.photoUrl,
    item.photo_url,
    item.thumbnail,
    item.thumbnailUrl,
    item.thumbnail_url,
    item.customImageUrl,
  ];

  for (const [key, value] of Object.entries(item)) {
    if (/image|photo|thumbnail|cover/i.test(key)) {
      candidates.push(value);
    }
  }

  for (const candidate of candidates) {
    const normalized = normalizeImageUrl(candidate, apiBaseUrl);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export async function fetchCatalogPlants(): Promise<PlantCatalogItem[]> {
  const attempts: string[] = [];

  for (const baseUrl of buildApiBaseUrlCandidates()) {
    const endpoint = `${baseUrl}/api/catalog/plants`;

    try {
      const data = await httpGet<CatalogApiItem[]>(endpoint);
      return data.map((item) => ({
        ...item,
        imageUrl: resolveCatalogImageUrl(item, baseUrl),
      }));
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
      return {
        ...created,
        imageUrl: resolveCatalogImageUrl(created, baseUrl),
      };
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
