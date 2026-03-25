import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createStyles } from "./styles";

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthScreenLayout({
  title,
  subtitle,
  children,
}: AuthScreenLayoutProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <AppText variant="display" color={colors.primary}>
              PlanTica
            </AppText>
            <AppText variant="heading">{title}</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {subtitle}
            </AppText>
          </View>

          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
