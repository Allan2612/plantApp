import AppText from "@/src/components/AppText/AppText";
import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/designSystem";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function CatalogoScreen() {
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
        <Ionicons name="leaf" size={48} color={colors.primary} />
        <AppText variant="heading" accessibilityRole="header">
          Catálogo
        </AppText>
        <AppText
          variant="body"
          color={colors.textSecondary}
          style={{ textAlign: "center" }}
        >
          Explora todas las especies de plantas disponibles
        </AppText>
      </View>
    </ScreenWrapper>
  );
}
