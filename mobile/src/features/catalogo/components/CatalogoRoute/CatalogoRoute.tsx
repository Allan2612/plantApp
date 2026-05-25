import { useCatalogoRoute } from "@/src/features/catalogo/hooks/useCatalogoRoute";
import CatalogoScreen from "@/src/features/catalogo/screens/CatalogoScreen";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

export default function CatalogoRoute() {
  const { isConnected } = useNetworkStatus();
  const { items, loading, refreshing, error, onRetry, onRefresh } =
    useCatalogoRoute();

  return (
    <CatalogoScreen
      items={items}
      loading={loading}
      refreshing={refreshing}
      error={error}
      isOffline={isConnected === false}
      onRetry={onRetry}
      onRefresh={onRefresh}
    />
  );
}
