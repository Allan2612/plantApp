import { useCatalogoRoute } from "@/src/features/catalogo/hooks/useCatalogoRoute";
import CatalogoScreen from "@/src/features/catalogo/screens/CatalogoScreen";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

export default function CatalogoRoute() {
  const { isConnected } = useNetworkStatus();
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
      isOffline={isConnected === false}
      onRetry={onRetry}
      onRefresh={onRefresh}
      onCreatePlant={onCreatePlant}
    />
  );
}
