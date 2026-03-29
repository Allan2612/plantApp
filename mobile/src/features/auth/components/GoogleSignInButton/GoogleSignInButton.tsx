import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { AntDesign } from "@expo/vector-icons";
import { Pressable, PressableProps, View } from "react-native";

import { createStyles } from "./styles";

interface GoogleSignInButtonProps extends Omit<PressableProps, "children"> {
  label?: string;
}

export default function GoogleSignInButton({
  label = "Continuar con Google",
  disabled = false,
  style,
  ...rest
}: GoogleSignInButtonProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  const isDisabled = !!disabled;

  return (
    <Pressable
      style={[styles.container, isDisabled && styles.disabled, style as object]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      {...rest}
    >
      <View style={styles.content}>
        <AntDesign
          name="google"
          size={theme.spacing.md + theme.spacing.xs}
          color={colors.googleIcon}
        />
        <AppText
          variant="label"
          color={colors.googleButtonText}
          style={styles.label}
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}
