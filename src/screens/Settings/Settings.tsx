import AppText from "@/src/components/AppText/AppText";
import ScreenWrapper from "@/src/components/ScreenWrapper/ScreenWrapper";
import { useAppTheme } from "@/src/theme/designSystem";
import { useThemeContext } from "@/src/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, View } from "react-native";
import { createStyles } from "./Settings.styles";

type ThemeOption = { label: string; value: "system" | "light" | "dark"; icon: keyof typeof Ionicons.glyphMap };

const THEME_OPTIONS: ThemeOption[] = [
  { label: "Sistema", value: "system", icon: "phone-portrait-outline" },
  { label: "Claro", value: "light", icon: "sunny-outline" },
  { label: "Oscuro", value: "dark", icon: "moon-outline" },
];

const LANGUAGE_OPTIONS = [
  { label: "Español", value: "es" },
  { label: "English", value: "en" },
];

export default function Settings() {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { themeMode, setThemeMode } = useThemeContext();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Tema */}
        <View style={styles.section}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Tema
          </AppText>
          {THEME_OPTIONS.map((opt) => {
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
          {LANGUAGE_OPTIONS.map((opt) => {
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
