import AuthActions from "@/src/features/auth/components/AuthActions/AuthActions";
import AuthScreenLayout from "@/src/features/auth/components/AuthScreenLayout/AuthScreenLayout";

interface VerifyEmailScreenProps {
  email: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  onRefreshVerification: () => void;
  onResendEmail: () => void;
}

export default function VerifyEmailScreen({
  email,
  loading,
  error,
  successMessage,
  onRefreshVerification,
  onResendEmail,
}: VerifyEmailScreenProps) {
  return (
    <AuthScreenLayout
      title="Verifica tu correo"
      subtitle={`Revisa el correo (${email}) y confirma tu cuenta para continuar.`}
      helperNote="Cuando termines, vuelve aqui y toca el boton para validar el estado."
    >
      <AuthActions
        submitLabel="Ya confirmé mi correo"
        loading={loading}
        errorText={error}
        successText={successMessage}
        onSubmit={onRefreshVerification}
        secondaryActionLabel="Reenviar correo"
        onSecondaryAction={onResendEmail}
      />
    </AuthScreenLayout>
  );
}
