import { useAppTheme } from "@/src/theme/ThemeContext";
import { Image, View } from "react-native";
import AppText from "../AppText/AppText";
import { createStyles } from "./PlantCard.styles";

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
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <View
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel={`Planta: ${name}. ${description}`}
    >
      <Image
        source={{ uri: image }}
        style={styles.image}
        accessibilityLabel={`Foto de ${name}`}
      />
      <View style={styles.content}>
        <AppText variant="subheading">{name}</AppText>
        <AppText
          variant="body"
          color={colors.textSecondary}
          style={styles.description}
          numberOfLines={2}
        >
          {description}
        </AppText>
      </View>
    </View>
  );
}
