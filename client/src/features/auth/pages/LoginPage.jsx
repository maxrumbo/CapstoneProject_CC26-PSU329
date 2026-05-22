import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

function LoginPage({ onAuthSuccess, onNavigate }) {
  return (
    <AuthLayout>
      <LoginForm
        onAuthSuccess={onAuthSuccess}
        onSwitchToRegister={() => onNavigate("register")}
      />
    </AuthLayout>
  );
}

export default LoginPage;
