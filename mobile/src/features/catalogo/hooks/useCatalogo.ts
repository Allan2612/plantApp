import { fetchCatalogPlants } from "@/src/features/catalogo/services/catalogoApi.service";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { useCallback, useEffect, useState } from "react";

export function useCatalogo() {
  const [items, setItems] = useState<PlantCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slowServer, setSlowServer] = useState(false);

  const loadCatalog = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCatalogPlants();
      setItems(data);
    } catch (error) {
      const details = error instanceof Error ? error.message : "Error desconocido";
      if (__DEV__) {
        console.error("[Catalogo][loadCatalog]", details);
      }
      setError(
        "No se pudo cargar el catalogo. El servidor puede tardar en despertar, intenta nuevamente.",
      );
      setItems([]);
    }
  }, []);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    await loadCatalog();
    setLoading(false);
  }, [loadCatalog]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadCatalog();
    setRefreshing(false);
  }, [loadCatalog]);

  useEffect(() => {
    void initialLoad();
  }, [initialLoad]);

  useEffect(() => {
    if (!loading && !refreshing) {
      setSlowServer(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setSlowServer(true);
    }, 8000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loading, refreshing]);

  return {
    items,
    loading,
    refreshing,
    slowServer,
    error,
    retry: initialLoad,
    refresh,
  };
}
