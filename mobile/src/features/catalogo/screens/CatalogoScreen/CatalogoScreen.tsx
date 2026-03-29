import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import EmptyState from "@/src/components/shared/EmptyState";
import LoadingState from "@/src/components/shared/LoadingState";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import CatalogPlantCreateModal from "@/src/features/catalogo/components/CatalogPlantCreateModal";
import CatalogPlantCard from "@/src/features/catalogo/components/CatalogPlantCard";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { CreateCatalogPlantPayload, PlantCatalogItem } from "@/src/types/plant.types";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { createStyles } from "./styles";

interface CatalogoScreenProps {
  items: PlantCatalogItem[];
  loading: boolean;
  refreshing: boolean;
  creating: boolean;
  error: string | null;
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
  onRetry,
  onRefresh,
  onCreatePlant,
}: CatalogoScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);

  const handleCreatePlant = async (payload: CreateCatalogPlantPayload) => {
    await onCreatePlant(payload);
    closeCreateModal();
  };

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
            <AppText variant="heading">Catálogo</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Explora especies y conoce sus cuidados principales.
            </AppText>
            <AppButton
              title="Añadir al catálogo"
              onPress={openCreateModal}
              disabled={creating}
              style={styles.addButton}
            />
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
