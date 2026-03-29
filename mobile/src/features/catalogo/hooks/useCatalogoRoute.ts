import { useCatalogo } from "@/src/features/catalogo/hooks/useCatalogo";
import { useToast } from "@/src/providers/ToastProvider";
import { CreateCatalogPlantPayload } from "@/src/types/plant.types";
import { useCallback } from "react";

export function useCatalogoRoute() {
  const { showToast } = useToast();
  const {
    items,
    loading,
    refreshing,
    creating,
    error,
    retry,
    refresh,
    addCatalogPlant,
  } = useCatalogo();

  const onCreatePlant = useCallback(
    async (payload: CreateCatalogPlantPayload) => {
      try {
        await addCatalogPlant(payload);
        showToast("Especie agregada al catálogo.", "success");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo crear la especie.";
        showToast(message, "error");
        throw error;
      }
    },
    [addCatalogPlant, showToast],
  );

  return {
    items,
    loading,
    refreshing,
    creating,
    error,
    onRetry: retry,
    onRefresh: refresh,
    onCreatePlant,
  };
}
