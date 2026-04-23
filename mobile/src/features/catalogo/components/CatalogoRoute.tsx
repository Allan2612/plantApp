import { useCatalogo } from "@/src/features/catalogo/hooks/useCatalogo";
import CatalogoScreen from "@/src/features/catalogo/screens/CatalogoScreen";

export default function CatalogoRoute() {
  const { items, loading, refreshing, slowServer, error, retry, refresh } = useCatalogo();

  return (
    <CatalogoScreen
      items={items}
      loading={loading}
      refreshing={refreshing}
      slowServer={slowServer}
      error={error}
      onRetry={retry}
      onRefresh={refresh}
    />
  );
}
