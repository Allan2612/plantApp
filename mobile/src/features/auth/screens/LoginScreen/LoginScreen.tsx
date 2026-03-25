import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
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
  const styles = createStyles();

  return (
    <AuthScreenLayout
      title="Bienvenido"
      subtitle="Inicia sesión para seguir cuidando tus plantas."
    >
      <View style={styles.form}>
        <AuthInput
          label="Correo"
          value={email}
          onChangeText={onEmailChange}
          placeholder="tu-correo@ejemplo.com"
          keyboardType="email-address"
        />

        <AuthInput
          label="Contraseña"
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Tu contraseña"
          secureTextEntry
        />
      </View>

      <AuthActions
        submitLabel="Iniciar sesión"
        loading={loading}
        errorText={error}
        onSubmit={onSubmit}
        secondaryActionLabel="Recuperar contraseña"
        onSecondaryAction={onGoToForgotPassword}
        footerText="¿No tienes cuenta?"
        footerActionLabel="Crear cuenta"
        onFooterAction={onGoToRegister}
      />
    </AuthScreenLayout>
  );
}
