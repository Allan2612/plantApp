import AppText from "@/src/components/AppText/AppText";
import PressableCard from "@/src/components/PressableCard/PressableCard";
import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { useScrollAnim } from "@/src/context/ScrollAnimContext";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, ScrollView, View } from "react-native";
import { ACTIONS, PLANTS, TRENDING } from "./HomeScreen.data";
import { createStyles } from "./HomeScreen.styles";

export default function HomeScreen() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const scrollAnim = useScrollAnim();

  return (
    <ScreenWrapper>
      <FlatList
        data={PLANTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={scrollAnim?.onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {/* Search bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search"
                  size={18}
                  color={colors.searchPlaceholder}
                />
                <AppText
                  variant="body"
                  color={colors.searchPlaceholder}
                  style={styles.searchPlaceholder}
                >
                  Buscar plantas
                </AppText>
              </View>
            </View>

            {/* Action cards */}
            <View style={styles.actionsRow}>
              {ACTIONS.map((action) => (
                <PressableCard
                  key={action.label}
                  containerStyle={{ flex: 1 }}
                  style={styles.actionCard}
                >
                  <View style={styles.actionCardInner}>
                    <Ionicons
                      name={action.icon}
                      size={28}
                      color={colors.primary}
                    />
                    <AppText variant="caption" color={colors.textSecondary}>
                      {action.label}
                    </AppText>
                  </View>
                </PressableCard>
              ))}
            </View>

            {/* Trending section */}
            <View style={styles.sectionHeader}>
              <AppText variant="subheading">Tendencias</AppText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingRow}
            >
              {TRENDING.map((item) => (
                <PressableCard
                  key={item.id}
                  style={styles.trendingCardWrapper}
                  border={false}
                >
                  <View style={styles.trendingCard}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.trendingImage}
                    />
                    <View style={styles.trendingOverlay}>
                      <AppText variant="label" color={colors.textOnOverlay}>
                        {item.name}
                      </AppText>
                    </View>
                  </View>
                </PressableCard>
              ))}
            </ScrollView>

            {/* Plants list header */}
            <View style={[styles.sectionHeader, styles.plantsSectionHeader]}>
              <AppText variant="subheading">Mis Plantas</AppText>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.plantsList}>
            <PressableCard style={styles.plantCardOuter} border={false}>
              <View style={styles.plantRow}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.plantRowImage}
                />
                <View style={styles.plantRowContent}>
                  <AppText variant="label">{item.name}</AppText>
                  <AppText
                    variant="caption"
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    {item.description}
                  </AppText>
                  <AppText
                    variant="caption"
                    color={colors.primary}
                    style={styles.plantCategory}
                  >
                    {item.category}
                  </AppText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                  style={styles.chevronIcon}
                />
              </View>
            </PressableCard>
          </View>
        )}
      />
    </ScreenWrapper>
  );
}
