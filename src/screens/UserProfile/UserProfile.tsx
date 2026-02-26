import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { UserInterface } from "@/src/types-dtos/user.types";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { styles } from "./UserProfile.styles";

const mockUser: UserInterface = {
  nombre: "Allan Vargas",
  apodo: "allan2612",
  cantidadPlantas: 12,
  categoriasPlantas: ["Suculentas", "Cactus", "Orquídeas"],
  racha: 7,
  cumpleanos: new Date(1998, 5, 12),
  image: "https://i.imgur.com/vLgY64w.jpeg",
  cantidadAmigos: 5,
  privacidad: "publico",
  descripcion: "Amante de las plantas y la naturaleza. Siempre aprendiendo.",
  plantaFavorita: "Monstera deliciosa",
};

export default function UserProfile() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Avatar */}
        <Image source={{ uri: mockUser.image }} style={styles.avatar} />

        {/* Nombre y apodo */}
        <Text style={styles.nombre}>{mockUser.nombre}</Text>
        <Text style={styles.apodo}>@{mockUser.apodo}</Text>

        {/* Privacidad */}
        <View style={styles.badge}>
          <Ionicons
            name={mockUser.privacidad === "publico" ? "earth" : "lock-closed"}
            size={13}
            color="#b0e57c"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.badgeText}>
            {mockUser.privacidad === "publico" ? "Público" : "Privado"}
          </Text>
        </View>

        {/* Descripción */}
        <Text style={styles.descripcion}>{mockUser.descripcion}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{mockUser.cantidadPlantas}</Text>
            <Text style={styles.statLabel}>Plantas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{mockUser.racha}</Text>
            <Text style={styles.statLabel}>Racha (días)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{mockUser.cantidadAmigos}</Text>
            <Text style={styles.statLabel}>Amigos</Text>
          </View>
        </View>

        {/* Info extra */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="leaf"
                size={14}
                color="#9ab89a"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.infoLabel}>Planta favorita</Text>
            </View>
            <Text style={styles.infoValue}>{mockUser.plantaFavorita}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="gift"
                size={14}
                color="#9ab89a"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.infoLabel}>Cumpleaños</Text>
            </View>
            <Text style={styles.infoValue}>
              {mockUser.cumpleanos.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="pricetag"
                size={14}
                color="#9ab89a"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.infoLabel}>Categorías</Text>
            </View>
            <Text style={styles.infoValue}>
              {mockUser.categoriasPlantas.join(", ")}
            </Text>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
