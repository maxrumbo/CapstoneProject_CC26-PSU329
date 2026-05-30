import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../services/authApi";
import { useAuth } from "../../../context/useAuth";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return params.get("access_token");
  }, []);
  const [message, setMessage] = useState(
    token ? "Memverifikasi email..." : "Link verifikasi tidak valid."
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let isActive = true;

    getCurrentUser(token)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setSession(token, response.data, true);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        if (isActive) {
          setMessage("Verifikasi berhasil, tetapi sesi login gagal dibuat.");
        }
      });

    return () => {
      isActive = false;
    };
  }, [navigate, setSession, token]);

  return (
    <div className="auth-shell">
      <main className="auth-main">
        <div className="page-loading" role="status">
          {message}
        </div>
      </main>
    </div>
  );
}

export default VerifyEmailPage;
