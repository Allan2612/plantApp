import AppText from "@/src/components/AppText";
import PlantCard from "@/src/components/PlantCard";
import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/designSystem";
import { Plant } from "@/src/types-dtos/plant.types";
import { FlatList, StyleSheet, View } from "react-native";

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
    image: "https://images.unsplash.com/photo-1572688484438-313a56e6dc34?w=400",
    category: "Tropical",
  },
];

export default function HomeScreen() {
  const { spacing } = useAppTheme();

  return (
    <ScreenWrapper>
      <FlatList
        data={PLANTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { padding: spacing.md, gap: spacing.md },
        ]}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.sm }}>
            <AppText variant="heading" accessibilityRole="header">
              🌿 Mis Plantas
            </AppText>
            <AppText variant="body" style={{ marginTop: spacing.xs }}>
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

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
  },
});
