import AppText from "@/src/components/shared/AppText/AppText";
import CatalogPlantCard from "@/src/features/catalogo/components/CatalogPlantCard";
import PlantCommentsSheet from "@/src/features/catalogo/components/PlantCommentsSheet";
import { usePublicProfile } from "@/src/features/catalogo/hooks/usePublicProfile";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { PlantCatalogItem } from "@/src/types/plant.types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from "react-native";
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
  const { data, loading, error, retry } = usePublicProfile(userId ?? "");
  const [commentPlant, setCommentPlant] = useState<PlantCatalogItem | null>(null);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 16, paddingVertical: 12 }} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.centerBox}>
          <Ionicons name="person-outline" size={40} color={colors.textMuted} />
          <AppText variant="body" color={colors.textSecondary}>
            {error ?? "Perfil no disponible"}
          </AppText>
          <Pressable onPress={retry}>
            <AppText variant="label" color={colors.primary}>Reintentar</AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  const { user, catalogPosts, totalLikes } = data;

  const ListHeader = (
    <>
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <AppText style={styles.avatarText}>{getInitial(user.displayName)}</AppText>
        </View>

        <AppText variant="subheading" style={styles.displayName}>{user.displayName}</AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.username}>
          @{user.username}
        </AppText>

        {user.headline ? (
          <AppText variant="body" color={colors.textSecondary} style={styles.headline}>
            {user.headline}
          </AppText>
        ) : null}

        {user.city ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted}>{user.city}</AppText>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText variant="subheading" style={styles.statValue}>{user.plantCount}</AppText>
            <AppText variant="caption" color={colors.textMuted}>Plantas</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="subheading" style={styles.statValue}>{totalLikes}</AppText>
            <AppText variant="caption" color={colors.textMuted}>Likes</AppText>
          </View>
        </View>

        {user.createdAt ? (
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted}>
              Miembro desde {formatMemberSince(user.createdAt)}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.postsHeader}>
        <AppText variant="label" color={colors.textSecondary}>
          {catalogPosts.length} {catalogPosts.length === 1 ? "publicación" : "publicaciones"}
        </AppText>
      </View>
    </>
  );

  if (catalogPosts.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 16, paddingVertical: 12 }} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <ScrollView>
          {ListHeader}
          <View style={styles.emptyBox}>
            <Ionicons name="leaf-outline" size={36} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted}>
              Sin publicaciones aún.
            </AppText>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 16, paddingVertical: 12 }} hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>

      <FlatList
        data={catalogPosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CatalogPlantCard plant={item} onCommentPress={setCommentPlant} />
        )}
      />

      {commentPlant ? (
        <PlantCommentsSheet
          plant={commentPlant}
          onClose={() => setCommentPlant(null)}
        />
      ) : null}
    </View>
  );
}
