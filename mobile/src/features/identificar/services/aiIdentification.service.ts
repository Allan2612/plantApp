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

export async function fetchPlantImageUrl(scientificName: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(scientificName.replace(/ /g, "_"));
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) return null;
    const data = await response.json() as {
      originalimage?: { source?: string };
      thumbnail?: { source?: string };
    };
    return data?.originalimage?.source ?? data?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
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
