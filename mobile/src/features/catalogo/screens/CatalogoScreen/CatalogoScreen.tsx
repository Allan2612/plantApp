import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import EmptyState from "@/src/components/shared/EmptyState";
import LoadingState from "@/src/components/shared/LoadingState";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import CatalogPlantCreateModal from "@/src/features/catalogo/components/CatalogPlantCreateModal";
import CatalogPlantCard from "@/src/features/catalogo/components/CatalogPlantCard";
import { useCatalogoScreen } from "@/src/features/catalogo/hooks/useCatalogoScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  CreateCatalogPlantPayload,
  PlantCatalogItem,
} from "@/src/types/plant.types";
import { FlatList, TouchableOpacity, View } from "react-native";
import { createStyles } from "./styles";

interface CatalogoScreenProps {
  items: PlantCatalogItem[];
  loading: boolean;
  refreshing: boolean;
  creating: boolean;
  error: string | null;
  isOffline: boolean;
  onRetry: () => void;
  onRefresh: () => void;
  onCreatePlant: (payload: CreateCatalogPlantPayload) => Promise<void>;
}

export default function CatalogoScreen({
  items,
  loading,
  refreshing,
  creating,
  error,
  isOffline,
  onRetry,
  onRefresh,
  onCreatePlant,
}: CatalogoScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const {
    showCreateModal,
    openCreateModal,
    closeCreateModal,
    handleCreatePlant,
  } = useCatalogoScreen(onCreatePlant);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContent}>
          <LoadingState message="Cargando catálogo..." />
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContent}>
          <AppText variant="heading">Catálogo</AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
            {error}
          </AppText>
          <AppButton title="Reintentar" onPress={onRetry} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <CatalogPlantCreateModal
        visible={showCreateModal}
        isSubmitting={creating}
        onClose={closeCreateModal}
        onSubmit={handleCreatePlant}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View>
                <AppText variant="heading">Catálogo</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {items.length} {items.length === 1 ? "especie" : "especies"}
                </AppText>
              </View>
              {!isOffline ? (
                <TouchableOpacity
                  style={styles.addIconButton}
                  onPress={openCreateModal}
                  disabled={creating}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <EmptyState message="No hay especies disponibles por ahora." />
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <CatalogPlantCard plant={item} />}
      />
    </ScreenWrapper>
  );
}
