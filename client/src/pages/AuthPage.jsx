import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, registerUser, requestOtp, resetPassword } from "../services/authApi";
import { useAuth } from "../context/useAuth";

/* ─── Toast notification ─── */
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)", text: "#4ade80", icon: "✓" },
    error:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.35)",  text: "#f87171", icon: "✕" },
    info:    { bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.35)", text: "#93c5fd", icon: "ℹ" },
  };
  const c = colors[type];

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-100 flex items-start gap-3 px-5 py-4 rounded-2xl text-sm max-w-sm w-full mx-4 shadow-2xl"
      style={{
        background: c.bg, border: `1px solid ${c.border}`,
        backdropFilter: "blur(20px)",
        animation: "toastIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: c.border, color: c.text }}>{c.icon}</span>
      <span style={{ color: "rgba(255,255,255,0.9)" }} className="leading-relaxed">{message}</span>
      <button onClick={onClose} className="shrink-0 ml-auto text-white/30 hover:text-white/70 transition-colors">✕</button>
    </div>
  );
}

/* ─── Input field ─── */
function Input({ label, type = "text", value, onChange, placeholder, autoComplete, required }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && showPw ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: focused ? "1px solid rgba(245,166,35,0.6)" : "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            boxShadow: focused ? "0 0 0 3px rgba(245,166,35,0.12)" : "none",
            paddingRight: isPassword ? "44px" : "16px",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-opacity hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Step indicator ─── */
function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? "20px" : "6px",
            height: "6px",
            background: i === current ? "#F5A623" : i < current ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </div>
  );
}

/* ─── OTP input ─── */
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      next[i] = "";
      onChange(next.join(""));
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };
  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    onChange(next.join(""));
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          className="w-11 h-12 text-center text-lg font-bold rounded-xl outline-none transition-all duration-200"
          style={{
            background: d ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.05)",
            border: d ? "1px solid rgba(245,166,35,0.5)" : "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
          }}
        />
      ))}
    </div>
  );
}

/* ─── AUTH STATES ─── */

function LoginForm({ onSwitch, toast }) {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      const response = await loginUser({ email, password });
      const authData = response?.data ?? response;
      const accessToken = authData?.access_token || authData?.token;
      const user = authData?.user || null;

      if (!accessToken) {
        throw new Error("Token login tidak ditemukan.");
      }

      setSession(accessToken, user, true);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setApiError(error.message || "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "cardSlide 0.35s ease both" }}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
          Welcome back
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Sign in to your SAWIT account</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {apiError ? (
          <p className="text-sm font-semibold text-red-300" role="alert">
            {apiError}
          </p>
        ) : null}
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com" autoComplete="email" required />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" autoComplete="current-password" required />
        <div className="text-right -mt-1">
          <button type="button" onClick={() => onSwitch("forgot")}
            className="text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: "#F5A623" }}>
            Forgot password?
          </button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)" }}>
          {loading ? <span className="auth-inline-loader" /> : null}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
        Don't have an account?{" "}
        <button onClick={() => onSwitch("register")} className="font-semibold transition-colors hover:opacity-80"
          style={{ color: "#F5A623" }}>Create one</button>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch, toast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast("Password minimal 8 karakter.", "error"); return;
    }
    if (form.password !== form.confirm) {
      toast("Passwords do not match.", "error"); return;
    }
    setLoading(true);
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      onSwitch("login");
      setTimeout(() => toast("Account created! Please check your email for the activation link.", "success"), 100);
    } catch (error) {
      toast(error.message || "Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "cardSlide 0.35s ease both" }}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
          Create account
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Start growing your palm estate today</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="Budi Santoso" required />
        <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" required />
        <Input label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Re-enter password" required />
        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)" }}>
          {loading ? <span className="auth-inline-loader" /> : null}
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
        Already have an account?{" "}
        <button onClick={() => onSwitch("login")} className="font-semibold transition-colors hover:opacity-80"
          style={{ color: "#F5A623" }}>Sign in</button>
      </p>
    </div>
  );
}

function ForgotForm({ onSwitch, toast }) {
  const [step, setStep] = useState(0); // 0=email, 1=otp, 2=newpw
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp({
        email,
        purpose: "reset_password",
      });
      toast(`OTP sent to ${email}`, "info");
      setStep(1);
    } catch (error) {
      toast(error.message || "Failed to send OTP.", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { toast("Please enter the complete 6-digit code.", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep(2);
  };

  const submitNewPw = async (e) => {
    e.preventDefault();
    if (newPw.length < 8) { toast("Password minimal 8 karakter.", "error"); return; }
    if (newPw !== confirmPw) { toast("Passwords do not match.", "error"); return; }
    setLoading(true);
    try {
      await resetPassword({
        email,
        code: otp,
        new_password: newPw,
      });
      onSwitch("login");
      setTimeout(() => toast("Password updated! Please sign in.", "success"), 100);
    } catch (error) {
      toast(error.message || "Failed to update password.", "error");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

  return (
    <div style={{ animation: "cardSlide 0.35s ease both" }}>
      <div className="text-center mb-2">
        <h2 className="text-2xl font-extrabold text-white mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>
          Reset Password
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{stepLabels[step]}</p>
      </div>
      <StepDots total={3} current={step} />

      {step === 0 && (
        <form onSubmit={submitEmail} className="flex flex-col gap-4">
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            We'll send a one-time code to this address.
          </p>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)" }}>
            {loading ? <span className="auth-inline-loader" /> : null}
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={submitOtp} className="flex flex-col gap-6">
          <div>
            <p className="text-xs text-center mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
              Enter the 6-digit code sent to <span style={{ color: "#F5A623" }}>{email}</span>
            </p>
            <OtpInput value={otp} onChange={setOtp} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)" }}>
            {loading ? <span className="auth-inline-loader" /> : null}
            {loading ? "Verifying…" : "Verify Code"}
          </button>
          <button type="button" onClick={async () => {
            setLoading(true);
            try {
              await requestOtp({ email, purpose: "reset_password" });
              toast(`New OTP sent to ${email}`, "info");
              setOtp("");
            } catch (error) {
              toast(error.message || "Failed to resend OTP.", "error");
            } finally {
              setLoading(false);
            }
          }}
            className="text-sm text-center transition-colors hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            Didn't receive it? <span style={{ color: "#F5A623" }}>Resend</span>
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitNewPw} className="flex flex-col gap-4">
          <Input label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder="Min. 8 characters" required />
          <Input label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder="Re-enter password" required />
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)" }}>
            {loading ? <span className="auth-inline-loader" /> : null}
            {loading ? "Saving…" : "Set New Password"}
          </button>
        </form>
      )}

      <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
        <button onClick={() => onSwitch("login")} className="font-semibold transition-colors hover:opacity-80"
          style={{ color: "#F5A623" }}>← Back to Sign In</button>
      </p>
    </div>
  );
}

/* ─── MAIN ─── */
export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") || "login");
  const [toastData, setToastData] = useState(null);

  const showToast = (message, type = "success") => {
    setToastData({ message, type, id: Date.now() });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setSearchParams({ mode: newMode });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0F1419", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, 0)      scale(1); }
        }
        @keyframes cardSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bgFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-15px, 20px) scale(0.98); }
        }
        @keyframes loading-spin {
          to { transform: rotate(360deg); }
        }
        .auth-inline-loader {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          display: inline-block;
          background: conic-gradient(from 0deg, rgba(26, 16, 0, 0.18), rgba(26, 16, 0, 0.96) 58%, rgba(255, 255, 255, 0.18));
          mask: radial-gradient(circle at center, transparent 52%, #000 54%);
          -webkit-mask: radial-gradient(circle at center, transparent 52%, #000 54%);
          animation: loading-spin 0.9s linear infinite;
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(30,35,40,1) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      {/* Toast */}
      {toastData && (
        <Toast key={toastData.id} message={toastData.message} type={toastData.type}
          onClose={() => setToastData(null)} />
      )}

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.18), transparent)", animation: "bgFloat 12s ease-in-out infinite" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15), transparent)", animation: "bgFloat 15s ease-in-out infinite reverse" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.05), transparent)" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
      </div>

      {/* Back to home */}
      <a href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm transition-colors hover:opacity-80"
        style={{ color: "rgba(255,255,255,0.4)" }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Home
      </a>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl px-8 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-6"
        style={{
          background: "rgba(20,26,32,0.85)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-0">
          <img
            src="/logo-no-bg.png"
            alt="SAWIT"
            className="h-auto w-42.5 -mb-6"
            loading="lazy"
          />
        </div>

        {/* Dynamic state */}
        {mode === "login"    && <LoginForm    onSwitch={switchMode} toast={showToast} />}
        {mode === "register" && <RegisterForm onSwitch={switchMode} toast={showToast} />}
        {mode === "forgot"   && <ForgotForm   onSwitch={switchMode} toast={showToast} />}
      </div>
    </div>
  );
}
