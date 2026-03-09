import { useAppTheme } from "@/src/theme/designSystem";
import { Image, StyleSheet, View } from "react-native";
import AppText from "./AppText";

interface PlantCardProps {
  name: string;
  description: string;
  image: string;
}

export default function PlantCard({
  name,
  description,
  image,
}: PlantCardProps) {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceDivider,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Planta: ${name}. ${description}`}
    >
      <Image
        source={{ uri: image }}
        style={[styles.image, { borderRadius: radius.md }]}
        accessibilityLabel={`Foto de ${name}`}
      />
      <View style={{ marginTop: spacing.sm }}>
        <AppText variant="subheading">{name}</AppText>
        <AppText
          variant="body"
          color={colors.textSecondary}
          style={{ marginTop: spacing.xs }}
          numberOfLines={2}
        >
          {description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 140,
  },
});
