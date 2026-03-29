import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import GoogleSignInButton from "@/src/features/auth/components/GoogleSignInButton";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
import AppText from "@/src/components/shared/AppText/AppText";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { View } from "react-native";

import { createStyles } from "./styles";

interface LoginScreenProps {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
}

export default function LoginScreen({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoToRegister,
  onGoToForgotPassword,
}: LoginScreenProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const handleGooglePress = () => undefined;

  return (
    <AuthScreenLayout
      title="Iniciar sesion"
      subtitle="Accede a tu cuenta para continuar con el cuidado de tus plantas."
    >
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
          placeholder="Tu contraseña"
          secureTextEntry
          textContentType="password"
        />
      </View>

      <AuthActions
        submitLabel="Iniciar sesion"
        loading={loading}
        errorText={error}
        onSubmit={onSubmit}
        secondaryActionLabel="Olvide mi contraseña"
        onSecondaryAction={onGoToForgotPassword}
        footerText="¿Primera vez en PlanTica?"
        footerActionLabel="Crear cuenta"
        onFooterAction={onGoToRegister}
      />

      <View style={styles.separatorRow}>
        <View style={styles.separatorLine} />
        <AppText variant="caption" color={colors.textSecondary} style={styles.separatorText}>
          o
        </AppText>
        <View style={styles.separatorLine} />
      </View>

      <GoogleSignInButton onPress={handleGooglePress} />
    </AuthScreenLayout>
  );
}
