import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthInput from "@/src/features/auth/components/AuthInput/AuthInput";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";

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
  return (
    <AuthScreenLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un correo para restablecer tu acceso."
    >
      <AuthInput
        label="Correo"
        value={email}
        onChangeText={onEmailChange}
        placeholder="tu-correo@ejemplo.com"
        keyboardType="email-address"
      />

      <AuthActions
        submitLabel="Enviar correo"
        loading={loading}
        errorText={error}
        successText={successMessage}
        onSubmit={onSubmit}
        footerText="¿Recordaste tu contraseña?"
        footerActionLabel="Volver a login"
        onFooterAction={onGoToLogin}
      />
    </AuthScreenLayout>
  );
}
