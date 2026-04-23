import EmptyState from "@/src/components/shared/EmptyState";
import LoadingState from "@/src/components/shared/LoadingState";
import AppText from "@/src/components/shared/AppText/AppText";
import PressableCard from "@/src/components/shared/PressableCard/PressableCard";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { buildImageSource } from "@/src/features/catalogo/hooks/useCatalogPlantCard";
import { useHomeScreen } from "@/src/features/home/hooks/useHomeScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { FlatList, ScrollView, View } from "react-native";
import { createScreenWrapperContentStyle, createStyles } from "./styles";

export default function HomeScreen() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const {
    scrollAnim,
    failedImages,
    gardenItems,
    isGardenLoading,
    trendingItems,
    catalogItemsInverted,
    markImageAsFailed,
    mapDifficultyLabel,
    mapHealthLabel,
    getUserPlantPayload,
    getCatalogPayload,
    getStringField,
    resolveGardenImage,
    actions,
    onActionPress,
  } = useHomeScreen();

  return (
    <ScreenWrapper
      contentContainerStyle={createScreenWrapperContentStyle(
        scrollAnim?.headerPaddingAnim ?? scrollAnim?.headerHeight ?? 0,
      )}
    >
      <FlatList
        data={gardenItems}
        keyExtractor={(item, index) =>
          getStringField(getUserPlantPayload(item), "id") || `garden-${index}`
        }
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={scrollAnim?.onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {/* Search bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search"
                  size={18}
                  color={colors.searchPlaceholder}
                />
                <AppText
                  variant="body"
                  color={colors.searchPlaceholder}
                  style={styles.searchPlaceholder}
                >
                  Buscar plantas
                </AppText>
              </View>
            </View>

            {/* Action cards */}
            <View style={styles.actionsRow}>
              {actions.map((action) => (
                <PressableCard
                  key={action.label}
                  containerStyle={styles.fullFlex}
                  style={styles.actionCard}
                  onPress={() => onActionPress(action.href)}
                >
                  <View style={styles.actionCardInner}>
                    <Ionicons
                      name={action.icon}
                      size={28}
                      color={colors.primary}
                    />
                    <AppText variant="caption" color={colors.textSecondary}>
                      {action.label}
                    </AppText>
                  </View>
                </PressableCard>
              ))}
            </View>

            {/* Trending section */}
            <View style={styles.sectionHeader}>
              <AppText variant="subheading">Tendencias</AppText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingRow}
            >
              {trendingItems.map((item) => (
                <PressableCard
                  key={item.id}
                  style={styles.trendingCardWrapper}
                  border={false}
                >
                  <View style={styles.trendingCard}>
                    {item.imageUrl && !failedImages[`trending-${item.id}`] ? (
                      <Image
                        source={buildImageSource(item.imageUrl)}
                        style={styles.trendingImage}
                        contentFit="cover"
                        transition={120}
                        onError={() =>
                          markImageAsFailed(
                            `trending-${item.id}`,
                            item.imageUrl,
                          )
                        }
                      />
                    ) : (
                      <View style={styles.imageFallback}>
                        <Ionicons
                          name="leaf"
                          size={theme.spacing.xl}
                          color={colors.primary}
                        />
                      </View>
                    )}
                    <View style={styles.trendingOverlay}>
                      <AppText variant="label" color={colors.textOnOverlay}>
                        {item.name}
                      </AppText>
                    </View>
                  </View>
                </PressableCard>
              ))}
            </ScrollView>

            {/* Catalog section */}
            <View style={[styles.sectionHeader, styles.plantsSectionHeader]}>
              <AppText variant="subheading">Catálogo</AppText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catalogRow}
            >
              {catalogItemsInverted.map((item) => (
                <PressableCard
                  key={item.id}
                  style={styles.catalogCard}
                  border={false}
                >
                  {item.imageUrl && !failedImages[`catalog-${item.id}`] ? (
                    <Image
                      source={buildImageSource(item.imageUrl)}
                      style={styles.catalogImage}
                      contentFit="cover"
                      transition={120}
                      accessibilityLabel={`Foto de ${item.name}`}
                      onError={() =>
                        markImageAsFailed(`catalog-${item.id}`, item.imageUrl)
                      }
                    />
                  ) : (
                    <View style={styles.catalogImageFallback}>
                      <Ionicons
                        name="leaf"
                        size={theme.spacing.xl}
                        color={colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.catalogContent}>
                    <AppText variant="label">{item.name}</AppText>
                    <AppText
                      variant="caption"
                      color={colors.textSecondary}
                      numberOfLines={1}
                    >
                      {item.scientificName}
                    </AppText>
                    <View style={styles.catalogDifficulty}>
                      <Ionicons
                        name="speedometer-outline"
                        size={12}
                        color={colors.primary}
                      />
                      <AppText variant="caption" color={colors.primary}>
                        {mapDifficultyLabel(item.difficulty)}
                      </AppText>
                    </View>
                  </View>
                </PressableCard>
              ))}
            </ScrollView>

            {/* Plants list header */}
            <View style={[styles.sectionHeader, styles.plantsSectionHeader]}>
              <AppText variant="subheading">Mis Plantas</AppText>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.plantsList}>
            {isGardenLoading ? (
              <LoadingState message="Cargando jardin..." />
            ) : (
              <EmptyState message="Aun no tienes plantas en tu jardin." />
            )}
          </View>
        }
        renderItem={({ item }) => {
          const userPlant = getUserPlantPayload(item);
          const catalog = getCatalogPayload(item);
          const plantId = getStringField(userPlant, "id");
          const imageUri = resolveGardenImage(item);
          const displayName =
            getStringField(userPlant, "nickname") ||
            getStringField(catalog, "name") ||
            "Sin nombre";
          const subtitle =
            getStringField(catalog, "scientificName") ||
            getStringField(userPlant, "notes") ||
            "Sin descripcion";
          const healthStatus = getStringField(userPlant, "healthStatus");

          return (
            <View style={styles.plantsList}>
              <PressableCard style={styles.plantCardOuter} border={false}>
                <View style={styles.plantRow}>
                  {imageUri && !failedImages[`garden-${plantId}`] ? (
                    <Image
                      source={buildImageSource(imageUri)}
                      style={styles.plantRowImage}
                      contentFit="cover"
                      transition={120}
                      onError={() =>
                        markImageAsFailed(`garden-${plantId}`, imageUri)
                      }
                    />
                  ) : (
                    <View style={styles.plantRowImageFallback}>
                      <Ionicons
                        name="leaf"
                        size={theme.spacing.xl}
                        color={colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.plantRowContent}>
                    <AppText variant="label">{displayName}</AppText>
                    <AppText
                      variant="caption"
                      color={colors.textSecondary}
                      numberOfLines={1}
                    >
                      {subtitle}
                    </AppText>
                    <AppText
                      variant="caption"
                      color={colors.primary}
                      style={styles.plantCategory}
                    >
                      {`Salud: ${mapHealthLabel(healthStatus)}`}
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                    style={styles.chevronIcon}
                  />
                </View>
              </PressableCard>
            </View>
          );
        }}
      />
    </ScreenWrapper>
  );
}
