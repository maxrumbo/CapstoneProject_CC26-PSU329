import AuthLayout from "../components/AuthLayout";
import RegisterForm from "../components/RegisterForm";

function RegisterPage({ onNavigate }) {
  return (
    <AuthLayout>
      <RegisterForm
        onSwitchToLogin={() => onNavigate("login")}
      />
    </AuthLayout>
  );
}

export default RegisterPage;
