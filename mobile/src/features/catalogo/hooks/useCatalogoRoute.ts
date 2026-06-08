import { useCatalogo } from "@/src/features/catalogo/hooks/useCatalogo";

export function useCatalogoRoute() {
  const { items, loading, refreshing, error, retry, refresh, adjustCommentCount } = useCatalogo();

  return {
    items,
    loading,
    refreshing,
    error,
    onRetry: retry,
    onRefresh: refresh,
    adjustCommentCount,
  };
}
