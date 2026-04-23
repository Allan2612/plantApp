import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { AntDesign } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { createStyles } from "./styles";

interface RegisterScreenProps {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  loadingHint?: string | null;
  error: string | null;
  googleError?: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onGoogleSubmit?: () => void;
  googleLoading?: boolean;
  onGoToLogin: () => void;
}

export default function RegisterScreen({
  email,
  password,
  confirmPassword,
  loading,
  loadingHint = null,
  error,
  googleError = null,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onGoogleSubmit,
  googleLoading = false,
  onGoToLogin,
}: RegisterScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <AuthScreenLayout
      title="Crear cuenta"
      subtitle="Completa tus datos para empezar a organizar tu rutina verde."
      helperNote="Te enviaremos un correo para validar tu cuenta al finalizar." 
    >
      <Pressable
        onPress={() => {
          onGoogleSubmit?.();
        }}
        disabled={loading || googleLoading || !onGoogleSubmit}
        style={[
          styles.googleButton,
          (loading || googleLoading || !onGoogleSubmit) && styles.googleButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Continuar con Google"
      >
        <View style={styles.googleIconWrap}>
          <AntDesign name="google" size={18} color="#DB4437" />
        </View>
        <AppText variant="label" color={theme.colors.textPrimary} style={styles.googleLabel}>
          {googleLoading ? "Conectando con Google..." : "Continuar con Google"}
        </AppText>
      </Pressable>

      {googleError ? (
        <AppText variant="caption" color={theme.colors.danger} style={styles.googleErrorText}>
          {googleError}
        </AppText>
      ) : null}

      <View style={styles.form}>
        <AuthInput
          label="Correo"
          value={email}
          onChangeText={onEmailChange}
          placeholder="tu-correo@ejemplo.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <AuthInput
          label="Contraseña"
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Minimo 6 caracteres"
          secureTextEntry
          textContentType="newPassword"
          helperText="Combina letras y numeros para mayor seguridad."
        />

        <AuthInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          placeholder="Repite tu contraseña"
          secureTextEntry
          textContentType="newPassword"
        />
      </View>

      <AuthActions
        submitLabel="Crear mi cuenta"
        loading={loading}
        loadingText={loadingHint}
        errorText={error}
        onSubmit={onSubmit}
        footerText="¿Ya tienes una cuenta?"
        footerActionLabel="Iniciar sesion"
        onFooterAction={onGoToLogin}
      />
    </AuthScreenLayout>
  );
}
