import AppText from "@/src/components/shared/AppText/AppText";
import CatalogPlantCard from "@/src/features/catalogo/components/CatalogPlantCard";
import PlantCommentsSheet from "@/src/features/catalogo/components/PlantCommentsSheet";
import { usePublicProfile } from "@/src/features/catalogo/hooks/usePublicProfile";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./styles";

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatMemberSince(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
}

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const { data, loading, error, retry, adjustCommentCount } = usePublicProfile(userId ?? "");
  const [commentPlant, setCommentPlant] = useState<PlantCatalogItem | null>(null);

  const NavBar = (title: string) => (
    <View style={[styles.navBar, { paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={styles.navBackBtn} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </Pressable>
      <AppText variant="label" numberOfLines={1} style={styles.navTitle}>
        {title}
      </AppText>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {NavBar("")}
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        {NavBar("Perfil")}
        <View style={styles.centerBox}>
          <Ionicons name="person-outline" size={40} color={colors.textMuted} />
          <AppText variant="body" color={colors.textSecondary} style={{ textAlign: "center" }}>
            {error ?? "Perfil no disponible"}
          </AppText>
          <Pressable onPress={retry} hitSlop={8}>
            <AppText variant="label" color={colors.primary}>Reintentar</AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  const { user, catalogPosts, totalLikes } = data;

  const ProfileHeader = (
    <>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <AppText style={styles.avatarText}>{getInitial(user.displayName)}</AppText>
        </View>

        <AppText variant="subheading" style={styles.displayName}>{user.displayName}</AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.username}>
          @{user.username}
        </AppText>

        {user.headline ? (
          <AppText variant="caption" color={colors.textSecondary} style={styles.headline}>
            {user.headline}
          </AppText>
        ) : null}

        {user.city ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted}>{user.city}</AppText>
          </View>
        ) : null}

        {user.phone ? (
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={12} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted}>{user.phone}</AppText>
          </View>
        ) : null}

        {user.createdAt ? (
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted}>
              Miembro desde {formatMemberSince(user.createdAt)}
            </AppText>
          </View>
        ) : null}

        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <AppText variant="label" style={styles.statValue}>{user.plantCount}</AppText>
            <AppText variant="caption" color={colors.textMuted}>Plantas</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AppText variant="label" style={styles.statValue}>{totalLikes}</AppText>
            <AppText variant="caption" color={colors.textMuted}>Likes</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AppText variant="label" style={styles.statValue}>{catalogPosts.length}</AppText>
            <AppText variant="caption" color={colors.textMuted}>Posts</AppText>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="label" color={colors.textSecondary}>Publicaciones</AppText>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {NavBar(user.displayName)}

      <FlatList
        data={catalogPosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ProfileHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="leaf-outline" size={36} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted} style={{ textAlign: "center" }}>
              Aún no ha publicado plantas.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <CatalogPlantCard plant={item} onCommentPress={setCommentPlant} />
        )}
      />

      {commentPlant ? (
        <PlantCommentsSheet
          plant={commentPlant}
          onClose={() => setCommentPlant(null)}
          onCountChange={(delta) => adjustCommentCount(commentPlant.id, delta)}
        />
      ) : null}
    </View>
  );
}
