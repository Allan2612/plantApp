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

  const adjustCommentCount = useCallback((plantId: string, delta: number) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        catalogPosts: prev.catalogPosts.map((p) =>
          p.id === plantId
            ? { ...p, commentCount: Math.max(0, p.commentCount + delta) }
            : p,
        ),
      };
    });
  }, []);

  return { data, loading, error, retry: load, adjustCommentCount };
}
