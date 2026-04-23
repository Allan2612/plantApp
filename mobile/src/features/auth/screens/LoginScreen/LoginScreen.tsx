import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { AntDesign } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { createStyles } from "./styles";

interface LoginScreenProps {
  email: string;
  password: string;
  loading: boolean;
  loadingHint?: string | null;
  error: string | null;
  googleError?: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onGoogleSubmit: () => void;
  googleLoading?: boolean;
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
}

export default function LoginScreen({
  email,
  password,
  loading,
  loadingHint = null,
  error,
  googleError = null,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSubmit,
  googleLoading = false,
  onGoToRegister,
  onGoToForgotPassword,
}: LoginScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <AuthScreenLayout
      title="Iniciar sesion"
      subtitle="Accede a tu cuenta para continuar con el cuidado de tus plantas."
    >
      <Pressable
        onPress={() => {
          onGoogleSubmit();
        }}
        disabled={loading || googleLoading}
        style={[
          styles.googleButton,
          (loading || googleLoading) && styles.googleButtonDisabled,
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
          helperText="Usa el mismo correo con el que te registraste."
        />

        <AuthInput
          label="Contraseña"
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Tu contraseña"
          secureTextEntry
          textContentType="password"
        />
      </View>

      <AuthActions
        submitLabel="Iniciar sesion"
        loading={loading}
        loadingText={loadingHint}
        errorText={error}
        onSubmit={onSubmit}
        secondaryActionLabel="Olvide mi contraseña"
        onSecondaryAction={onGoToForgotPassword}
        footerText="¿Primera vez en PlanTica?"
        footerActionLabel="Crear cuenta"
        onFooterAction={onGoToRegister}
      />
    </AuthScreenLayout>
  );
}
