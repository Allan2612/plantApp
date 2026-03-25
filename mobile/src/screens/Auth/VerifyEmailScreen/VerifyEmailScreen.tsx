import AuthActions from "@/src/components/Auth/AuthActions";
import AuthScreenLayout from "@/src/components/Auth/AuthScreenLayout";

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
      title="Confirma tu cuenta"
      subtitle={`Revisa tu correo (${email}) y confirma tu cuenta para continuar.`}
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
