import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";
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
  const styles = createStyles();

  return (
    <AuthScreenLayout
      title="Crear cuenta"
      subtitle="Regístrate para sincronizar tu progreso en PlanTica."
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
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
        />

        <AuthInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          placeholder="Repite tu contraseña"
          secureTextEntry
        />
      </View>

      <AuthActions
        submitLabel="Crear cuenta"
        loading={loading}
        errorText={error}
        onSubmit={onSubmit}
        footerText="¿Ya tienes cuenta?"
        footerActionLabel="Iniciar sesión"
        onFooterAction={onGoToLogin}
      />
    </AuthScreenLayout>
  );
}
