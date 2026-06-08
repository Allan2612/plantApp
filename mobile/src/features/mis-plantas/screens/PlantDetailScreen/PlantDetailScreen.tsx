import AppText from "@/src/components/shared/AppText/AppText";
import {
  formatDateDisplay,
  getCatalogPlantName,
  getHealthStatus,
  getStringField,
  getUserPlantPayload,
  healthLabels,
  resolvePlantImage,
} from "@/src/features/mis-plantas/hooks/useMisPlantasScreen";
import { fetchUserPlants } from "@/src/features/mis-plantas/services/misPlantasApi.service";
import { useAuthStore } from "@/src/store/auth.store";
import { usePlantsStore } from "@/src/store/plants.store";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import EditPlantModal from "@/src/features/mis-plantas/components/EditPlantModal";
import EditRulesSheet from "@/src/features/calendario/components/EditRulesSheet";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./styles";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

const HEALTH_COLOR: Record<string, string> = {
  good: "#22c55e",
  regular: "#f59e0b",
  bad: "#ef4444",
};

export default function PlantDetailScreen() {
  const theme = useAppTheme();
  const { colors, spacing } = theme;
  const styles = createStyles(theme);
  const router = useRouter();
  const { top: safeTop } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const plants = usePlantsStore((s) => s.plants);
  const setPlants = usePlantsStore((s) => s.setPlants);
  const profile = useAuthStore((s) => s.profile);
  const { isConnected } = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const item = plants.find((p) => {
    const payload = getUserPlantPayload(p);
    return getStringField(payload, "id") === id;
  });

  useEffect(() => {
    if (item || isLoading) return;
    const userId = profile?.user?.id;
    if (!userId) return;
    setIsLoading(true);
    fetchUserPlants(userId)
      .then((res) => setPlants(res.items))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [item, isLoading, profile, setPlants]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="leaf-outline" size={48} color={colors.textSecondary} />
          <AppText variant="body" color={colors.textSecondary}>
            Planta no encontrada.
          </AppText>
          <TouchableOpacity onPress={() => router.back()}>
            <AppText variant="caption" color={colors.primary}>
              Volver al jardín
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const payload = getUserPlantPayload(item);
  const health = getHealthStatus(payload);
  const plantImage = resolvePlantImage(item);
  const catalogName = getCatalogPlantName(item);
  const nickname = getStringField(payload, "nickname") || "Sin nombre";
  const locationHome = getStringField(payload, "locationHome");
  const acquiredDate = getStringField(payload, "acquiredDate");
  const notes = getStringField(payload, "notes");

  const catalog = item.catalogPlant;
  const scientificName = typeof catalog?.scientificName === "string" ? catalog.scientificName : undefined;
  const lightNotes = typeof catalog?.lightNotes === "string" ? catalog.lightNotes : undefined;
  const generalCareNotes = typeof catalog?.generalCareNotes === "string" ? catalog.generalCareNotes : undefined;
  const difficulty = typeof catalog?.difficulty === "string" ? catalog.difficulty : undefined;
  const isToxic = typeof catalog?.isToxic === "boolean" ? catalog.isToxic : null;

  const healthColor: string = HEALTH_COLOR[health] ?? colors.primary ?? "#22c55e";
  const hasCareInfo = lightNotes || generalCareNotes || difficulty || isToxic !== null;
  const hasMyPlantInfo = locationHome || acquiredDate || notes;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero — fixed 320px, adapts any image ratio */}
        <View style={styles.heroWrap}>
          {plantImage ? (
            <Image
              source={{ uri: plantImage }}
              style={styles.hero}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons name="leaf-outline" size={72} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Sheet sliding up over the hero */}
        <View style={styles.sheet}>

          {/* Title + health badge */}
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <AppText variant="heading" style={styles.titleName}>{nickname}</AppText>
              <View
                style={[
                  styles.healthBadge,
                  { borderColor: healthColor, backgroundColor: healthColor + "22" },
                ]}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: healthColor }} />
                <AppText variant="caption" style={{ color: healthColor, fontWeight: "700" }}>
                  {healthLabels[health]}
                </AppText>
              </View>
            </View>
            <AppText variant="body" color={colors.textSecondary}>{catalogName}</AppText>
            {scientificName ? (
              <AppText variant="caption" color={colors.textMuted} style={styles.scientificName}>
                {scientificName}
              </AppText>
            ) : null}
          </View>

          {/* Quick-stats chips */}
          {(locationHome || acquiredDate || difficulty) ? (
            <View style={styles.quickStatsRow}>
              {locationHome ? (
                <View style={styles.statChip}>
                  <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                  <AppText variant="caption" style={styles.statChipText}>{locationHome}</AppText>
                </View>
              ) : null}
              {acquiredDate ? (
                <View style={styles.statChip}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                  <AppText variant="caption" style={styles.statChipText}>
                    {formatDateDisplay(acquiredDate)}
                  </AppText>
                </View>
              ) : null}
              {difficulty ? (
                <View style={styles.statChip}>
                  <Ionicons name="bar-chart-outline" size={13} color={colors.textSecondary} />
                  <AppText variant="caption" style={styles.statChipText}>
                    {DIFFICULTY_LABEL[difficulty] ?? difficulty}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Cuidados */}
          {hasCareInfo ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Ionicons name="leaf-outline" size={15} color={colors.primary} />
                <AppText variant="label" color={colors.textPrimary}>Cuidados</AppText>
              </View>
              {lightNotes ? (
                <View style={styles.infoRow}>
                  <Ionicons name="sunny-outline" size={15} color={colors.textSecondary} />
                  <AppText variant="body" color={colors.textSecondary} style={styles.infoText}>
                    {lightNotes}
                  </AppText>
                </View>
              ) : null}
              {generalCareNotes ? (
                <View style={styles.infoRow}>
                  <Ionicons name="water-outline" size={15} color={colors.textSecondary} />
                  <AppText variant="body" color={colors.textSecondary} style={styles.infoText}>
                    {generalCareNotes}
                  </AppText>
                </View>
              ) : null}
              {isToxic !== null ? (
                <View style={styles.infoRow}>
                  <Ionicons
                    name={isToxic ? "warning-outline" : "checkmark-circle-outline"}
                    size={15}
                    color={isToxic ? colors.danger : colors.primary}
                  />
                  <AppText
                    variant="body"
                    color={isToxic ? colors.danger : colors.primary}
                    style={styles.infoText}
                  >
                    {isToxic ? "Tóxica para mascotas/personas" : "No tóxica"}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Mi planta — notas propias */}
          {hasMyPlantInfo ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Ionicons name="document-text-outline" size={15} color={colors.primary} />
                <AppText variant="label" color={colors.textPrimary}>Mi planta</AppText>
              </View>
              {notes ? (
                <View style={styles.infoRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={15} color={colors.textSecondary} />
                  <AppText variant="body" color={colors.textSecondary} style={styles.infoText}>
                    {notes}
                  </AppText>
                </View>
              ) : null}
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.rulesButton}
            onPress={() => setShowRules(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <AppText variant="label" color={colors.primary}>Cuidados programados</AppText>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Floating overlay buttons — outside ScrollView so sheet never covers them */}
      <TouchableOpacity
        style={[styles.backButton, { top: safeTop + spacing.sm }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowEditModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {item ? (
        <EditPlantModal
          visible={showEditModal}
          item={item}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            const userId = profile?.user?.id;
            if (userId) {
              fetchUserPlants(userId)
                .then((res) => setPlants(res.items))
                .catch(() => {});
            }
          }}
          isOffline={isConnected === false}
        />
      ) : null}
      {item ? (
        <EditRulesSheet
          visible={showRules}
          userPlantId={getStringField(getUserPlantPayload(item), "id")}
          onClose={() => setShowRules(false)}
        />
      ) : null}
    </View>
  );
}
