import { useAuthSession } from "@/src/features/auth/hooks/useAuthSession";
import { useCatalogo } from "@/src/features/catalogo/hooks/useCatalogo";
import { ACTIONS } from "@/src/features/home/services/home.localData";
import {
  fetchUserPlants,
  UserPlantListItem,
} from "@/src/features/mis-plantas/services/misPlantasApi.service";
import { fetchProfileForSession } from "@/src/features/profile/services/profileApi.service";
import { useAuthStore } from "@/src/store/auth.store";
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

function normalizeImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (/^(file|content|data):/i.test(trimmed)) {
    return trimmed;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return "";
  }

  // No re-encodear: Firebase Storage requiere %2F literal en path.
  // decodeURI + encodeURI rompía URLs con segmentos pre-encodeados.
  return trimmed;
}

function resolveGardenImage(item: UserPlantListItem): string {
  const userPlant = getUserPlantPayload(item);
  const catalog = getCatalogPayload(item);
  const customImage = getStringField(userPlant, "customImageUrl").trim();
  if (customImage) {
    const normalized = normalizeImageUrl(customImage);
    if (normalized) return normalized;
    return customImage;
  }
  const catalogImage = getStringField(catalog, "imageUrl").trim();
  if (catalogImage) {
    const normalized = normalizeImageUrl(catalogImage);
    if (normalized) return normalized;
    return catalogImage;
  }
  return "";
}

function mapHealthLabel(value: string): string {
  if (value === "good") return "Buena";
  if (value === "regular") return "Regular";
  if (value === "bad") return "Critica";
  return "Sin estado";
}

export function useHomeScreen() {
  const router = useRouter();
  const { user } = useAuthSession();
  const cachedProfile = useAuthStore((state) => state.profile);
  const { items } = useCatalogo();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [gardenItems, setGardenItems] = useState<UserPlantListItem[]>([]);
  const [isGardenLoading, setIsGardenLoading] = useState(true);

  const providerId = user?.providerData?.[0]?.providerId ?? null;

  const catalogItems = items.filter((item) => Boolean(item.imageUrl));
  const trendingItems = [...catalogItems]
    .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    .slice(0, 3);
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
        let backendUserId = cachedProfile?.user?.id ?? "";

        if (!backendUserId) {
          const resolution = await fetchProfileForSession({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            providerId,
          });
          backendUserId = resolution?.backendUserId ?? "";
        }
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
  }, [cachedProfile?.user?.id, providerId, user?.displayName, user?.email, user?.uid]);

  const markImageAsFailed = (imageId: string, imageUrl: string | null) => {
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
