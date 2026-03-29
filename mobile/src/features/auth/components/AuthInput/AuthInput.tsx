import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { forwardRef, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

import { createStyles } from "./styles";

interface AuthInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  errorText?: string | null;
  helperText?: string;
}

const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  {
    label,
    value,
    onChangeText,
    errorText,
    helperText,
    ...rest
  },
  ref,
) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="label" color={colors.textSecondary} style={styles.label}>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!errorText && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      {!errorText && helperText ? (
        <AppText variant="caption" color={colors.textMuted}>
          {helperText}
        </AppText>
      ) : null}
      {errorText ? (
        <AppText variant="caption" color={colors.danger}>
          {errorText}
        </AppText>
      ) : null}
    </View>
  );
});

export default AuthInput;
