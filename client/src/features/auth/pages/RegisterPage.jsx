import AuthLayout from "../components/AuthLayout";
import RegisterForm from "../components/RegisterForm";

function RegisterPage({ onAuthSuccess, onNavigate }) {
  return (
    <AuthLayout>
      <RegisterForm
        onAuthSuccess={onAuthSuccess}
        onSwitchToLogin={() => onNavigate("login")}
      />
    </AuthLayout>
  );
}

export default RegisterPage;
