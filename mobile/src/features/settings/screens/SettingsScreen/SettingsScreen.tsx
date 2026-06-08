import AppText from "@/src/components/shared/AppText/AppText";
import ScreenWrapper from "@/src/components/shared/ScreenWrapper/ScreenWrapper";
import { useSettingsScreen } from "@/src/features/settings/hooks/useSettingsScreen";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, View } from "react-native";
import { createStyles } from "./styles";

export default function Settings() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { themeMode, setThemeMode, themeOptions, languageOptions } =
    useSettingsScreen();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Tema */}
        <View style={styles.section}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Tema
          </AppText>
          {themeOptions.map((opt) => {
            const isActive = themeMode === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.option, isActive && styles.optionActive]}
                onPress={() => setThemeMode(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Tema ${opt.label}`}
              >
                <View style={styles.optionLeft}>
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                  <AppText
                    variant="body"
                    color={isActive ? colors.primary : colors.textPrimary}
                  >
                    {opt.label}
                  </AppText>
                </View>
                <View style={styles.checkIcon}>
                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Idioma */}
        <View style={styles.section}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Idioma
          </AppText>
          {languageOptions.map((opt) => {
            const isActive = opt.value === "es";
            return (
              <View
                key={opt.value}
                style={[styles.option, isActive && styles.optionActive]}
              >
                <View style={styles.optionLeft}>
                  <Ionicons
                    name="language-outline"
                    size={20}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                  <AppText
                    variant="body"
                    color={isActive ? colors.primary : colors.textMuted}
                  >
                    {opt.label}
                  </AppText>
                </View>
                <View style={styles.checkIcon}>
                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
              </View>
            );
          })}
          <AppText variant="caption" color={colors.textMuted}>
            Más idiomas próximamente
          </AppText>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
