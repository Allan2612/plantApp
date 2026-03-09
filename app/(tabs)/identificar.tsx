import AppText from "@/src/components/AppText/AppText";
import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/designSystem";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function IdentificarScreen() {
  const { colors, spacing } = useAppTheme();

  return (
    <ScreenWrapper>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.xl,
          gap: spacing.md,
        }}
      >
        <Ionicons name="scan" size={48} color={colors.primary} />
        <AppText variant="heading" accessibilityRole="header">
          Identificar
        </AppText>
        <AppText
          variant="body"
          color={colors.textSecondary}
          style={{ textAlign: "center" }}
        >
          Escanea una planta para identificar su especie
        </AppText>
      </View>
    </ScreenWrapper>
  );
}
