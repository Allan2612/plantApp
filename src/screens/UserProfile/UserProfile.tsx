import AppText from "@/src/components/AppText/AppText";
import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, View } from "react-native";
import { mockUser } from "./UserProfile.data";
import { createStyles } from "./UserProfile.styles";

export default function UserProfile() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <Image
          source={{ uri: mockUser.image }}
          style={styles.avatar}
          accessibilityLabel={`Foto de perfil de ${mockUser.nombre}`}
        />

        {/* Nombre y apodo */}
        <AppText variant="heading" accessibilityRole="header">
          {mockUser.nombre}
        </AppText>
        <AppText variant="label" color={colors.primary} style={styles.apodo}>
          @{mockUser.apodo}
        </AppText>

        {/* Privacidad */}
        <View
          style={styles.badge}
          accessibilityLabel={`Perfil ${mockUser.privacidad}`}
        >
          <Ionicons
            name={mockUser.privacidad === "publico" ? "earth" : "lock-closed"}
            size={13}
            color={colors.primaryLight}
            style={styles.badgeIcon}
          />
          <AppText variant="caption" color={colors.primaryLight}>
            {mockUser.privacidad === "publico" ? "Público" : "Privado"}
          </AppText>
        </View>

        {/* Descripción */}
        <AppText
          variant="body"
          color={colors.textSecondary}
          style={styles.descripcion}
        >
          {mockUser.descripcion}
        </AppText>

        {/* Stats */}
        <View style={styles.statsRow} accessibilityRole="summary">
          <View style={styles.stat}>
            <AppText variant="subheading" color={colors.primaryLight}>
              {mockUser.cantidadPlantas}
            </AppText>
            <AppText variant="caption" color={colors.primaryMuted}>
              Plantas
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <AppText variant="subheading" color={colors.primaryLight}>
              {mockUser.racha}
            </AppText>
            <AppText variant="caption" color={colors.primaryMuted}>
              Racha (días)
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <AppText variant="subheading" color={colors.primaryLight}>
              {mockUser.cantidadAmigos}
            </AppText>
            <AppText variant="caption" color={colors.primaryMuted}>
              Amigos
            </AppText>
          </View>
        </View>

        {/* Info extra */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="leaf"
                size={14}
                color={colors.primaryMuted}
                style={styles.infoIcon}
              />
              <AppText variant="label" color={colors.textMuted}>
                Planta favorita
              </AppText>
            </View>
            <AppText variant="label" style={styles.infoValue}>
              {mockUser.plantaFavorita}
            </AppText>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="gift"
                size={14}
                color={colors.primaryMuted}
                style={styles.infoIcon}
              />
              <AppText variant="label" color={colors.textMuted}>
                Cumpleaños
              </AppText>
            </View>
            <AppText variant="label" style={styles.infoValue}>
              {mockUser.cumpleanos.toLocaleDateString()}
            </AppText>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons
                name="pricetag"
                size={14}
                color={colors.primaryMuted}
                style={styles.infoIcon}
              />
              <AppText variant="label" color={colors.textMuted}>
                Categorías
              </AppText>
            </View>
            <AppText variant="label" style={styles.infoValue}>
              {mockUser.categoriasPlantas.join(", ")}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
