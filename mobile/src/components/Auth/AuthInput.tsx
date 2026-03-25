import AppText from "@/src/components/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { TextInput, TextInputProps, View } from "react-native";

import { createStyles } from "./AuthInput.styles";

interface AuthInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  errorText?: string | null;
}

export default function AuthInput({
  label,
  value,
  onChangeText,
  errorText,
  ...rest
}: AuthInputProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
      <TextInput
        style={[styles.input, !!errorText && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        {...rest}
      />
      {errorText ? (
        <AppText variant="caption" color={colors.danger}>
          {errorText}
        </AppText>
      ) : null}
    </View>
  );
}
