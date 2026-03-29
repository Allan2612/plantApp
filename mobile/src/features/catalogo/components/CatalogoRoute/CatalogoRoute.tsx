import { useCatalogoRoute } from "@/src/features/catalogo/hooks/useCatalogoRoute";
import CatalogoScreen from "@/src/features/catalogo/screens/CatalogoScreen";

export default function CatalogoRoute() {
  const {
    items,
    loading,
    refreshing,
    creating,
    error,
    onRetry,
    onRefresh,
    onCreatePlant,
  } = useCatalogoRoute();

  return (
    <CatalogoScreen
      items={items}
      loading={loading}
      refreshing={refreshing}
      creating={creating}
      error={error}
      onRetry={onRetry}
      onRefresh={onRefresh}
      onCreatePlant={onCreatePlant}
    />
  );
}
