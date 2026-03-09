import AppText from "@/src/components/AppText/AppText";
import PlantCard from "@/src/components/PlantCard/PlantCard";
import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/designSystem";
import { Plant } from "@/src/types-dtos/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, View } from "react-native";
import { createStyles } from "./HomeScreen.styles";

const PLANTS: Plant[] = [
  {
    id: "1",
    name: "Monstera Deliciosa",
    description:
      "Planta tropical con hojas grandes y perforadas. Ideal para interiores con luz indirecta.",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400",
    category: "Tropical",
  },
  {
    id: "2",
    name: "Suculenta Echevería",
    description:
      "Planta compacta en forma de roseta. Requiere poca agua y mucha luz solar.",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400",
    category: "Suculenta",
  },
  {
    id: "3",
    name: "Cactus San Pedro",
    description:
      "Cactus columnar de crecimiento rápido. Muy resistente a la sequía.",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
    category: "Cactus",
  },
  {
    id: "4",
    name: "Pothos Dorado",
    description:
      "Planta colgante fácil de cuidar. Perfecta para principiantes.",
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400",
    category: "Tropical",
  },
];

export default function HomeScreen() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <ScreenWrapper>
      <FlatList
        data={PLANTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <Ionicons name="leaf" size={24} color={colors.primary} />
              <AppText variant="heading" accessibilityRole="header">
                Mis Plantas
              </AppText>
            </View>
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={styles.headerSubtitle}
            >
              Tu colección personal de plantas
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <PlantCard
            name={item.name}
            description={item.description}
            image={item.image}
          />
        )}
      />
    </ScreenWrapper>
  );
}
