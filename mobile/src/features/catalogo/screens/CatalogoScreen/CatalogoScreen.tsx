import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import CatalogPlantCard from "@/src/features/catalogo/components/CatalogPlantCard";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { ActivityIndicator, FlatList, View } from "react-native";
import { createStyles } from "./styles";

interface CatalogoScreenProps {
  items: PlantCatalogItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function CatalogoScreen({
  items,
  loading,
  refreshing,
  error,
  onRetry,
  onRefresh,
}: CatalogoScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="body" color={colors.textSecondary}>
            Cargando catalogo...
          </AppText>
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
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
              No hay especies disponibles por ahora.
            </AppText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <CatalogPlantCard plant={item} />}
      />
    </ScreenWrapper>
  );
}
