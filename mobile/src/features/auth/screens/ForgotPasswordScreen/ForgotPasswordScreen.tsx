import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { View } from "react-native";
import { createStyles } from "./styles";

interface ForgotPasswordScreenProps {
  email: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onGoToLogin: () => void;
}

export default function ForgotPasswordScreen({
  email,
  loading,
  error,
  successMessage,
  onEmailChange,
  onSubmit,
  onGoToLogin,
}: ForgotPasswordScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <AuthScreenLayout
      title="Recuperar acceso"
      subtitle="Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."
      helperNote="Si no lo ves, revisa spam o promociones." 
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
          helperText="Usa el correo asociado a tu cuenta de PlanTica."
        />

        <AuthActions
          submitLabel="Enviar enlace de recuperacion"
          loading={loading}
          errorText={error}
          successText={successMessage}
          onSubmit={onSubmit}
          footerText="¿Recordaste tu contraseña?"
          footerActionLabel="Volver al inicio"
          onFooterAction={onGoToLogin}
        />
      </View>
    </AuthScreenLayout>
  );
}
