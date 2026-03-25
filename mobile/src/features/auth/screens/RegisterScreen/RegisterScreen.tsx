import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
import { useAppTheme } from "@/src/theme/ThemeContext";
import { View } from "react-native";

import { createStyles } from "./styles";

interface RegisterScreenProps {
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({
  email,
  password,
  confirmPassword,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
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
        errorText={error}
        onSubmit={onSubmit}
        footerText="¿Ya tienes una cuenta?"
        footerActionLabel="Iniciar sesion"
        onFooterAction={onGoToLogin}
      />
    </AuthScreenLayout>
  );
}
