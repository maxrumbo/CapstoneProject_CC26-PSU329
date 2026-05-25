import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../features/auth/components/AuthLayout";
import LoginForm from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";
import { useAuth } from "../context/useAuth";

const getAuthMode = (value) => (value === "signup" ? "signup" : "signin");

function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const mode = useMemo(
    () => getAuthMode(searchParams.get("mode")),
    [searchParams]
  );
  const isSignup = mode === "signup";

  const handleAuthSuccess = (token, nextUser, rememberMe = true) => {
    setSession(token, nextUser, rememberMe);
    navigate("/dashboard", { replace: true });
  };

  const switchTo = (nextMode) => {
    setSearchParams({ mode: nextMode });
  };

  return (
    <div className="auth-shell">
      <main className="auth-main">
        <AuthLayout>
          {isSignup ? (
            <RegisterForm onSwitchToLogin={() => switchTo("signin")} />
          ) : (
            <LoginForm
              onAuthSuccess={handleAuthSuccess}
              onSwitchToRegister={() => switchTo("signup")}
            />
          )}
        </AuthLayout>
      </main>
    </div>
  );
}

export default AuthPage;
