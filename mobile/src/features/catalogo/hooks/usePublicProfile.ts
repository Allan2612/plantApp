import { fetchPublicProfile } from "@/src/features/catalogo/services/socialApi.service";
import { PublicProfileData } from "@/src/types/plant.types";
import { useCallback, useEffect, useState } from "react";

export function usePublicProfile(userId: string) {
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPublicProfile(userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el perfil.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error, retry: load };
}
