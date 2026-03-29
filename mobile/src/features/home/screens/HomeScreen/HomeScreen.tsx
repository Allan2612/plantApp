import EmptyState from "@/src/components/shared/EmptyState";
import LoadingState from "@/src/components/shared/LoadingState";
import AppText from "@/src/components/shared/AppText/AppText";
import PressableCard from "@/src/components/shared/PressableCard/PressableCard";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useCatalogo } from "@/src/features/catalogo/hooks/useCatalogo";
import { fetchUserPlants, UserPlantListItem } from "@/src/features/mis-plantas/services/misPlantasApi.service";
import { fetchProfileForSession } from "@/src/features/profile/services/profileApi.service";
import { useScrollAnim } from "@/src/features/shell/hooks/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { ACTIONS } from "@/src/features/home/services/home.localData";
import { createStyles } from "./styles";

function mapDifficultyLabel(value: PlantCatalogItem["difficulty"]): string {
  if (value === "easy") return "Facil";
  if (value === "medium") return "Intermedia";
  return "Dificil";
}

function getUserPlantPayload(item: UserPlantListItem): Record<string, unknown> {
  if (item.userPlant && typeof item.userPlant === "object") {
    return item.userPlant;
  }
  return {};
}

function getCatalogPayload(item: UserPlantListItem): Record<string, unknown> {
  if (item.catalogPlant && typeof item.catalogPlant === "object") {
    return item.catalogPlant;
  }
  return {};
}

function getStringField(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function resolveGardenImage(item: UserPlantListItem): string {
  const userPlant = getUserPlantPayload(item);
  const catalog = getCatalogPayload(item);
  const customImage = getStringField(userPlant, "customImageUrl").trim();
  if (customImage) return customImage;
  return getStringField(catalog, "imageUrl");
}

function mapHealthLabel(value: string): string {
  if (value === "good") return "Buena";
  if (value === "regular") return "Regular";
  if (value === "bad") return "Critica";
  return "Sin estado";
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const scrollAnim = useScrollAnim();
  const router = useRouter();
  const { user } = useAuthSession();
  const { items } = useCatalogo();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [gardenItems, setGardenItems] = useState<UserPlantListItem[]>([]);
  const [isGardenLoading, setIsGardenLoading] = useState(true);

  const providerId = user?.providerData?.[0]?.providerId ?? null;

  const catalogItems = items.filter((item) => Boolean(item.imageUrl));
  const trendingItems = catalogItems.slice(0, 3);
  const catalogItemsInverted = [...catalogItems].reverse();

  useEffect(() => {
    let isMounted = true;

    const loadUserGarden = async () => {
      if (!user?.uid) {
        if (!isMounted) return;
        setGardenItems([]);
        setIsGardenLoading(false);
        return;
      }

      setIsGardenLoading(true);
      try {
        const resolution = await fetchProfileForSession({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          providerId,
        });

        const backendUserId = resolution?.backendUserId ?? "";
        if (!backendUserId.trim()) {
          if (!isMounted) return;
          setGardenItems([]);
          return;
        }

        const response = await fetchUserPlants(backendUserId);
        if (!isMounted) return;

        setGardenItems(response.items ?? []);
      } catch {
        if (!isMounted) return;
        setGardenItems([]);
      } finally {
        if (!isMounted) return;
        setIsGardenLoading(false);
      }
    };

    void loadUserGarden();

    return () => {
      isMounted = false;
    };
  }, [providerId, user?.displayName, user?.email, user?.uid]);

  const markImageAsFailed = (imageId: string, imageUrl: string | null) => {
    if (__DEV__) {
      console.warn("[Home][ImageError]", { imageId, imageUrl });
    }

    setFailedImages((current) => {
      if (current[imageId]) {
        return current;
      }

      return {
        ...current,
        [imageId]: true,
      };
    });
  };

  return (
    <ScreenWrapper>
      <FlatList
        data={gardenItems}
        keyExtractor={(item, index) => getStringField(getUserPlantPayload(item), "id") || `garden-${index}`}
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
              {ACTIONS.map((action) => (
                <PressableCard
                  key={action.label}
                  containerStyle={{ flex: 1 }}
                  style={styles.actionCard}
                  onPress={() => router.push(action.href as never)}
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
                        source={{ uri: item.imageUrl }}
                        style={styles.trendingImage}
                        contentFit="cover"
                        transition={120}
                        onError={() => markImageAsFailed(`trending-${item.id}`, item.imageUrl)}
                      />
                    ) : (
                      <View style={styles.imageFallback}>
                        <Ionicons name="leaf" size={theme.spacing.xl} color={colors.primary} />
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
                      source={{ uri: item.imageUrl }}
                      style={styles.catalogImage}
                      contentFit="cover"
                      transition={120}
                      accessibilityLabel={`Foto de ${item.name}`}
                      onError={() => markImageAsFailed(`catalog-${item.id}`, item.imageUrl)}
                    />
                  ) : (
                    <View style={styles.catalogImageFallback}>
                      <Ionicons name="leaf" size={theme.spacing.xl} color={colors.primary} />
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
                      source={{ uri: imageUri }}
                      style={styles.plantRowImage}
                      contentFit="cover"
                      transition={120}
                      onError={() => markImageAsFailed(`garden-${plantId}`, imageUri)}
                    />
                  ) : (
                    <View style={styles.plantRowImageFallback}>
                      <Ionicons name="leaf" size={theme.spacing.xl} color={colors.primary} />
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
