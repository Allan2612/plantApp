import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createStyles } from "./styles";

const LOGO_IMAGE = require("@/assets/images/Logo.png");

interface AuthScreenLayoutProps {
  title?: string;
  subtitle: string;
  helperNote?: string;
  children: React.ReactNode;
}

export default function AuthScreenLayout({
  title,
  subtitle,
  helperNote,
  children,
}: AuthScreenLayoutProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={LOGO_IMAGE}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Logo de PlanTica"
            />
            <AppText color={colors.primary} style={styles.brandText}>
              PlanTica
            </AppText>

            {title ? (
              <AppText variant="heading" style={styles.titleText}>
                {title}
              </AppText>
            ) : null}
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={styles.subtitleText}
            >
              {subtitle}
            </AppText>
          </View>

          <View style={styles.card}>
            {children}
            {helperNote ? (
              <View style={styles.helperBox}>
                <AppText variant="caption" color={colors.textSecondary}>
                  {helperNote}
                </AppText>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
