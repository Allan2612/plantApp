import type { CareTaskType } from "../types";

export interface CareTypeMeta {
  label: string;
  icon: "water-outline" | "nutrition-outline" | "cut-outline" | "refresh-outline";
  color: string;
}

export const CARE_TYPE_META: Record<CareTaskType, CareTypeMeta> = {
  watering: { label: "Regar", icon: "water-outline", color: "#3b82f6" },
  fertilizing: { label: "Abonar", icon: "nutrition-outline", color: "#10b981" },
  pruning: { label: "Podar", icon: "cut-outline", color: "#f59e0b" },
  rotation: { label: "Rotar", icon: "refresh-outline", color: "#8b5cf6" },
};

export const CARE_TYPES: CareTaskType[] = ["watering", "fertilizing", "pruning", "rotation"];
