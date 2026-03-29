import { getApiBaseUrlResolution } from "@/src/services/api/apiBaseUrl";
import { httpGet } from "@/src/services/api/httpClient";
import { PlantCatalogItem } from "@/src/types/plant.types";

const apiResolution = getApiBaseUrlResolution();
const API_BASE_URL = apiResolution.baseUrl;

type CatalogApiItem = PlantCatalogItem & Record<string, unknown>;

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function isRelativeImagePath(url: string): boolean {
  return url.startsWith("/") || url.startsWith("./") || url.startsWith("../");
}

function resolveImageUrl(rawUrl: string): string {
  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  if (isRelativeImagePath(rawUrl)) {
    const normalizedPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl.replace(/^\.\/?/, "")}`;
    return `${API_BASE_URL}${normalizedPath}`;
  }

  return rawUrl;
}

function normalizeWikimediaUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const isCommonsHost = /(^|\.)commons\.wikimedia\.org$/i.test(parsed.hostname);

    if (!isCommonsHost) {
      return rawUrl;
    }

    const fileWikiPrefix = "/wiki/File:";
    if (parsed.pathname.startsWith(fileWikiPrefix)) {
      const fileName = parsed.pathname.slice(fileWikiPrefix.length);
      parsed.pathname = `/wiki/Special:FilePath/${fileName}`;
      parsed.search = "";
      parsed.hash = "";
      return parsed.toString();
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

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const resolved = isAbsoluteUrl(trimmed) ? trimmed : resolveImageUrl(trimmed);
  const wikimediaResolved = normalizeWikimediaUrl(resolved);
  return safeEncodeUri(wikimediaResolved);
}

function resolveCatalogImageUrl(item: CatalogApiItem): string | null {
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
    const normalized = normalizeImageUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export async function fetchCatalogPlants(): Promise<PlantCatalogItem[]> {
  const endpoint = `${API_BASE_URL}/api/catalog/plants`;
  try {
    const data = await httpGet<CatalogApiItem[]>(endpoint);
    return data.map((item) => ({
      ...item,
      imageUrl: resolveCatalogImageUrl(item),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    throw new Error(
      `Catalog fetch failed. endpoint=${endpoint} source=${apiResolution.source} expoHost=${apiResolution.expoHost ?? "null"} error=${message}`,
    );
  }
}
