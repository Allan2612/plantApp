import { fetchCatalogPlants } from "@/src/features/catalogo/services/catalogoApi.service";
import { cacheGet, cacheSet } from "@/src/services/offlineCache";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { useCallback, useEffect, useState } from "react";

const CATALOG_CACHE_KEY = "plantica:catalog";

export function useCatalogo() {
  const [items, setItems] = useState<PlantCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCatalogPlants();
      setItems(data);
      void cacheSet(CATALOG_CACHE_KEY, data);
    } catch (err) {
      const details = err instanceof Error ? err.message : "Error desconocido";
      if (__DEV__) {
        console.error("[Catalogo][loadCatalog]", details);
      }
      setError("Sin conexión — mostrando datos guardados.");
    }
  }, []);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    const cached = await cacheGet<PlantCatalogItem[]>(CATALOG_CACHE_KEY);
    if (cached?.length) {
      setItems(cached);
      setLoading(false);
      void loadCatalog();
    } else {
      await loadCatalog();
      setLoading(false);
    }
  }, [loadCatalog]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadCatalog();
    setRefreshing(false);
  }, [loadCatalog]);

  useEffect(() => {
    void initialLoad();
  }, [initialLoad]);

  return {
    items,
    loading,
    refreshing,
    error,
    retry: initialLoad,
    refresh,
  };
}
