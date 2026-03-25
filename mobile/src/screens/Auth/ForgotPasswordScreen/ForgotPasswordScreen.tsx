import AuthActions from "@/src/components/Auth/AuthActions";
import AuthInput from "@/src/components/Auth/AuthInput";
import AuthScreenLayout from "@/src/components/Auth/AuthScreenLayout";

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
