import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import EmptyState from "@/src/components/shared/EmptyState";
import LoadingState from "@/src/components/shared/LoadingState";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import CatalogPlantCard from "@/src/features/catalogo/components/CatalogPlantCard";
import PlantCommentsSheet from "@/src/features/catalogo/components/PlantCommentsSheet";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { createStyles } from "./styles";

interface CatalogoScreenProps {
  items: PlantCatalogItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isOffline: boolean;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function CatalogoScreen({
  items,
  loading,
  refreshing,
  error,
  isOffline,
  onRetry,
  onRefresh,
}: CatalogoScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const [commentPlant, setCommentPlant] = useState<PlantCatalogItem | null>(null);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContent}>
          <LoadingState message="Cargando catálogo..." />
        </View>
      </ScreenWrapper>
    );
  }

  if (error && items.length === 0) {
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
            <AppText variant="caption" color={colors.textSecondary}>
              {items.length} {items.length === 1 ? "publicación" : "publicaciones"} de la comunidad
              {isOffline ? " (sin conexión)" : ""}
            </AppText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <EmptyState message="Sé el primero en publicar una planta. Identifica una para compartirla." />
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <CatalogPlantCard
            plant={item}
            onCommentPress={setCommentPlant}
          />
        )}
      />

      {commentPlant ? (
        <PlantCommentsSheet
          plant={commentPlant}
          onClose={() => setCommentPlant(null)}
        />
      ) : null}
    </ScreenWrapper>
  );
}
