import AppButton from "@/src/components/shared/AppButton/AppButton";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { Pressable, View } from "react-native";

import { createStyles } from "./styles";

interface AuthActionsProps {
  submitLabel: string;
  loading?: boolean;
  errorText?: string | null;
  successText?: string | null;
  onSubmit: () => void;
  footerText?: string;
  footerActionLabel?: string;
  onFooterAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export default function AuthActions({
  submitLabel,
  loading = false,
  errorText,
  successText,
  onSubmit,
  footerText,
  footerActionLabel,
  onFooterAction,
  secondaryActionLabel,
  onSecondaryAction,
}: AuthActionsProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const actionHitSlop = theme.spacing.sm;

  return (
    <View style={styles.container}>
      {errorText ? (
        <AppText
          variant="caption"
          color={colors.danger}
          style={styles.feedbackText}
        >
          {errorText}
        </AppText>
      ) : null}

      {successText ? (
        <AppText
          variant="caption"
          color={colors.primary}
          style={styles.feedbackText}
        >
          {successText}
        </AppText>
      ) : null}

      <AppButton
        title={loading ? "Procesando..." : submitLabel}
        onPress={onSubmit}
        disabled={loading}
        style={styles.actionButton}
      />

      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          onPress={onSecondaryAction}
          hitSlop={actionHitSlop}
          disabled={loading}
          style={styles.secondaryLinkContainer}
        >
          <AppText
            variant="caption"
            color={colors.primary}
            style={styles.secondaryLinkText}
          >
            {secondaryActionLabel}
          </AppText>
        </Pressable>
      ) : null}

      {footerText && footerActionLabel && onFooterAction ? (
        <View style={styles.footerRow}>
          <AppText variant="caption" color={colors.textSecondary}>
            {footerText}
          </AppText>
          <Pressable onPress={onFooterAction} hitSlop={actionHitSlop}>
            <AppText variant="caption" color={colors.primary}>
              {footerActionLabel}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
