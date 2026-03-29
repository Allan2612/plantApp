import AppText from "@/src/components/shared/AppText/AppText";
import { useInputTextLogic } from "@/src/components/shared/InputText/useInputTextLogic";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { forwardRef } from "react";
import { TextInput, TextInputProps, View } from "react-native";

import { createStyles } from "./styles";

interface InputTextProps extends Omit<TextInputProps, "onChangeText" | "value"> {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  errorText?: string | null;
  helperText?: string;
}

const InputText = forwardRef<TextInput, InputTextProps>(function InputText(
  {
    label,
    value,
    onChangeText,
    error,
    errorText,
    helperText,
    ...rest
  },
  ref,
) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const { isFocused, onFocus, onBlur } = useInputTextLogic();
  const message = error ?? errorText;

  return (
    <View style={styles.container}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          message ? styles.inputError : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      />

      {message ? (
        <AppText style={styles.errorText}>{message}</AppText>
      ) : helperText ? (
        <AppText style={styles.helperText}>{helperText}</AppText>
      ) : null}
    </View>
  );
});

export default InputText;
