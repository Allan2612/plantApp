import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useCatalogo } from "@/src/features/catalogo/hooks/useCatalogo";
import { ACTIONS } from "@/src/features/home/services/home.localData";
import { fetchUserPlants, UserPlantListItem } from "@/src/features/mis-plantas/services/misPlantasApi.service";
import { fetchProfileForSession } from "@/src/features/profile/services/profileApi.service";
import { useScrollAnim } from "@/src/features/shell/hooks/ScrollAnimContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

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

export function useHomeScreen() {
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

  const onActionPress = (href: string) => {
    router.push(href as never);
  };

  return {
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
    actions: ACTIONS,
    onActionPress,
  };
}
