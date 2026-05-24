import { create } from "zustand";
import { UserPlantListItem } from "@/src/features/mis-plantas/services/misPlantasApi.service";

interface PlantsStore {
  plants: UserPlantListItem[];
  setPlants: (plants: UserPlantListItem[]) => void;
}

export const usePlantsStore = create<PlantsStore>((set) => ({
  plants: [],
  setPlants: (plants) => set({ plants }),
}));
