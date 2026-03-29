import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import AppText from "@/src/components/shared/AppText/AppText";

import { createStyles } from "./styles";

type RegisterFieldErrors = {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
};

interface RegisterScreenProps {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  loading: boolean;
  error: string | null;
  fieldErrors?: RegisterFieldErrors;
  onDisplayNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleAcceptedTerms: () => void;
  onSubmit: () => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({
  displayName,
  username,
  email,
  password,
  confirmPassword,
  acceptedTerms,
  loading,
  error,
  fieldErrors,
  onDisplayNameChange,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleAcceptedTerms,
  onSubmit,
  onGoToLogin,
}: RegisterScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  return (
    <AuthScreenLayout
      title="Crear cuenta"
      subtitle="Completa tus datos para empezar a organizar tu rutina verde."
      helperNote="Te enviaremos un correo para validar tu cuenta al finalizar."
    >
      <View style={styles.form}>
        <AuthInput
          label="Nombre visible"
          value={displayName}
          onChangeText={onDisplayNameChange}
          errorText={fieldErrors?.displayName}
          placeholder="Como quieres que te llamemos"
          autoCapitalize="words"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => usernameRef.current?.focus()}
          blurOnSubmit={false}
        />

        <AuthInput
          ref={usernameRef}
          label="Usuario"
          value={username}
          onChangeText={onUsernameChange}
          errorText={fieldErrors?.username}
          placeholder="Ejemplo: plantasdeana"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
          helperText="Solo letras, numeros, guion o guion bajo."
        />

        <AuthInput
          ref={emailRef}
          label="Correo"
          value={email}
          onChangeText={onEmailChange}
          errorText={fieldErrors?.email}
          placeholder="tu-correo@ejemplo.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />

        <AuthInput
          ref={passwordRef}
          label="Contraseña"
          value={password}
          onChangeText={onPasswordChange}
          errorText={fieldErrors?.password}
          placeholder="Minimo 8 caracteres"
          secureTextEntry
          textContentType="newPassword"
          helperText="Combina letras, numeros y un simbolo para mayor seguridad."
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          blurOnSubmit={false}
        />

        <AuthInput
          ref={confirmPasswordRef}
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          errorText={fieldErrors?.confirmPassword}
          placeholder="Repite tu contraseña"
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <Pressable style={styles.termsRow} onPress={onToggleAcceptedTerms}>
          <View
            style={[
              styles.checkbox,
              acceptedTerms && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            {acceptedTerms ? <AppText style={styles.checkIcon}>✓</AppText> : null}
          </View>
          <AppText variant="body" color={colors.textSecondary} style={styles.termsText}>
            Acepto los terminos de uso y la politica de privacidad.
          </AppText>
        </Pressable>

        {fieldErrors?.acceptedTerms ? (
          <AppText variant="caption" color={colors.danger} style={styles.termsError}>
            {fieldErrors.acceptedTerms}
          </AppText>
        ) : null}
      </View>

      <AuthActions
        submitLabel="Crear mi cuenta"
        loading={loading}
        errorText={error}
        onSubmit={onSubmit}
        footerText="¿Ya tienes una cuenta?"
        footerActionLabel="Iniciar sesion"
        onFooterAction={onGoToLogin}
      />
    </AuthScreenLayout>
  );
}
