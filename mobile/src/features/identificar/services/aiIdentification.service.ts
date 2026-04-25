import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import { readAsStringAsync } from "expo-file-system/legacy";

const AI_TIMEOUT_MS = 30_000;

export interface PlantIdentificationResult {
  isPlant: boolean;
  confidence: number;
  commonName: string | null;
  scientificName: string | null;
  description: string | null;
  careSummary: string | null;
  wateringNotes: string | null;
  lightNotes: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  isToxic: boolean | null;
}

interface RawIdentificationResponse {
  is_plant: boolean;
  confidence: number;
  common_name: string | null;
  scientific_name: string | null;
  description: string | null;
  care_summary: string | null;
  watering_notes: string | null;
  light_notes: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  is_toxic: boolean | null;
}

function mapResponse(raw: RawIdentificationResponse): PlantIdentificationResult {
  return {
    isPlant: raw.is_plant,
    confidence: raw.confidence,
    commonName: raw.common_name,
    scientificName: raw.scientific_name,
    description: raw.description,
    careSummary: raw.care_summary,
    wateringNotes: raw.watering_notes,
    lightNotes: raw.light_notes,
    difficulty: raw.difficulty,
    isToxic: raw.is_toxic,
  };
}

async function _wikiImageFor(name: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(name.trim().replace(/ /g, "_"));
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) return null;
    const data = await response.json() as {
      type?: string;
      originalimage?: { source?: string };
      thumbnail?: { source?: string };
    };
    if (data.type === "disambiguation") return null;
    return data?.originalimage?.source ?? data?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function _iNaturalistImageFor(name: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&rank=species&is_active=true&per_page=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) return null;
    const data = await response.json() as {
      results?: Array<{
        default_photo?: { medium_url?: string; square_url?: string };
      }>;
    };
    const photo = data?.results?.[0]?.default_photo;
    return photo?.medium_url ?? photo?.square_url ?? null;
  } catch {
    return null;
  }
}

export async function fetchPlantImageUrl(
  scientificName: string | null,
  commonName: string | null
): Promise<string | null> {
  // 1. Wikipedia por nombre científico
  if (scientificName) {
    const url = await _wikiImageFor(scientificName);
    if (url) return url;
  }
  // 2. Wikipedia por nombre común
  if (commonName) {
    const url = await _wikiImageFor(commonName);
    if (url) return url;
  }
  // 3. iNaturalist por nombre científico
  if (scientificName) {
    const url = await _iNaturalistImageFor(scientificName);
    if (url) return url;
  }
  // 4. iNaturalist por nombre común
  if (commonName) {
    return _iNaturalistImageFor(commonName);
  }
  return null;
}

export async function identifyPlantFromUri(
  imageUri: string,
  userContext?: string
): Promise<PlantIdentificationResult> {
  const base64 = await readAsStringAsync(imageUri, { encoding: "base64" });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/identify-plant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ image_base64: base64, user_context: userContext ?? "" }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
      const detail =
        typeof payload?.detail === "string"
          ? payload.detail
          : typeof payload?.message === "string"
            ? payload.message
            : `Error ${response.status} al identificar la planta`;
      throw new Error(detail);
    }

    const raw = (await response.json()) as RawIdentificationResponse;
    return mapResponse(raw);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("La identificación tardó demasiado. Intenta con una foto más pequeña.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
