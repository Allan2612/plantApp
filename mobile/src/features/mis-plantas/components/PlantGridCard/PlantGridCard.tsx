import AppText from "@/src/components/shared/AppText/AppText";
import { Spacing } from "@/src/constants/spacing";
import { healthLabels } from "@/src/features/mis-plantas/hooks/useMisPlantasScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Dimensions, Pressable, View } from "react-native";
import { createStyles } from "./styles";

const CARD_WIDTH =
  (Dimensions.get("window").width - Spacing.md * 2 - Spacing.sm) / 2;

const HEALTH_DOT_COLOR: Record<string, string> = {
  good: "#22c55e",
  regular: "#f59e0b",
  bad: "#ef4444",
};

interface PlantGridCardProps {
  nickname: string;
  imageUri: string | null;
  health: "good" | "regular" | "bad";
  locationHome?: string | null;
  isHighlighted?: boolean;
  onPress: () => void;
}

export default function PlantGridCard({
  nickname,
  imageUri,
  health,
  locationHome,
  isHighlighted = false,
  onPress,
}: PlantGridCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, CARD_WIDTH);
  const dotColor = HEALTH_DOT_COLOR[health] ?? "#22c55e";
  const healthLabel = healthLabels[health] ?? health;

  return (
    <Pressable
      style={[styles.pressable, isHighlighted && styles.highlighted]}
      onPress={onPress}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <View style={styles.fallback}>
          <Ionicons name="leaf-outline" size={36} color={theme.colors.primary} />
        </View>
      )}

      {/* Pseudo-gradient overlay */}
      <View style={styles.gradientWrap} pointerEvents="none">
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom}>
          <AppText variant="label" style={styles.nickname} numberOfLines={2}>
            {nickname}
          </AppText>
          <View style={styles.metaRow}>
            <View style={[styles.healthDot, { backgroundColor: dotColor }]} />
            <AppText style={styles.healthLabel} numberOfLines={1}>
              {healthLabel}
            </AppText>
            {locationHome ? (
              <>
                <Ionicons name="location-outline" size={10} color="rgba(255,255,255,0.75)" />
                <AppText style={styles.locationLabel} numberOfLines={1}>
                  {locationHome}
                </AppText>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
