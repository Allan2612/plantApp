import { CreateCatalogPlantPayload } from "@/src/types/plant.types";
import { useState } from "react";

export function useCatalogoScreen(
  onCreatePlant: (payload: CreateCatalogPlantPayload) => Promise<void>,
) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);

  const handleCreatePlant = async (payload: CreateCatalogPlantPayload) => {
    await onCreatePlant(payload);
    closeCreateModal();
  };

  return {
    showCreateModal,
    openCreateModal,
    closeCreateModal,
    handleCreatePlant,
  };
}
