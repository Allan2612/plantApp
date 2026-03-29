import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import { httpGet, httpPatch, httpPost } from "@/src/services/api/httpClient";
import {
  CreateUserPlantPayload,
  UpdateUserPlantPayload,
} from "@/src/types/plant.types";

const API_BASE_URL = getApiBaseUrl();

export interface UserPlantListItem {
  userPlant: Record<string, unknown>;
  catalogPlant: Record<string, unknown> | null;
  tags: Record<string, unknown>[];
  upcomingCare: Record<string, unknown>[];
}

export interface UserPlantsResponse {
  userId: string;
  count: number;
  items: UserPlantListItem[];
}

export async function fetchUserPlants(
  userId: string,
): Promise<UserPlantsResponse> {
  const normalizedUserId = userId.trim();
  if (!normalizedUserId) {
    throw new Error("userId es requerido para consultar plantas.");
  }

  return httpGet<UserPlantsResponse>(
    `${API_BASE_URL}/api/users/${normalizedUserId}/plants`,
  );
}

export async function updateUserPlant(
  userPlantId: string,
  payload: UpdateUserPlantPayload,
): Promise<Record<string, unknown>> {
  const normalizedUserPlantId = userPlantId.trim();
  if (!normalizedUserPlantId) {
    throw new Error("userPlantId es requerido para actualizar la planta.");
  }

  return httpPatch<Record<string, unknown>, UpdateUserPlantPayload>(
    `${API_BASE_URL}/api/user-plants/${normalizedUserPlantId}`,
    payload,
  );
}

export async function createUserPlant(
  payload: CreateUserPlantPayload,
): Promise<Record<string, unknown>> {
  if (!payload.userId.trim()) {
    throw new Error("userId es requerido para crear la planta.");
  }
  if (!payload.plantCatalogId.trim()) {
    throw new Error("plantCatalogId es requerido para crear la planta.");
  }
  if (!payload.nickname.trim()) {
    throw new Error("nickname es requerido para crear la planta.");
  }

  return httpPost<Record<string, unknown>, CreateUserPlantPayload>(
    `${API_BASE_URL}/api/user-plants`,
    payload,
  );
}
