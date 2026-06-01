import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser, registerUser, requestOtp, resetPassword } from "../services/authApi";
import { useAuth } from "../context/useAuth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const isValidEmail = (value) => emailRegex.test(value.trim());
const isValidPassword = (value) => passwordRegex.test(value);
const invalidCredentialHints = [
  "invalid credential",
  "invalid credentials",
  "incorrect email or password",
  "email atau password",
  "wrong password",
  "unauthorized",
  "login gagal",
  "bad credentials",
];

const isCredentialMismatchError = (message = "") => {
  const normalized = message.toLowerCase();
  return invalidCredentialHints.some((hint) => normalized.includes(hint));
};

/* ─── Toast notification ─── */
function Toast({ message, type = "success", onClose, fixed = true, emphasized = false, duration = 5000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const colors = {
    success: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)", text: "#4ade80", icon: "✓" },
    error:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.35)",  text: "#f87171", icon: "✕" },
    info:    { bg: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.35)", text: "#93c5fd", icon: "ℹ" },
  };
  const c = colors[type];

  const positionClass = fixed
    ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    : "absolute -top-16 inset-x-0";

  const innerClass = fixed
    ? "flex items-start gap-3 px-5 py-4 rounded-2xl text-sm max-w-sm w-full mx-4 shadow-2xl"
    : "flex items-start gap-3 px-5 py-4 rounded-2xl text-sm max-w-sm w-auto mx-auto shadow-2xl";

  const boxShadow = emphasized ? "0 18px 60px rgba(0,0,0,0.6)" : "0 12px 32px rgba(0,0,0,0.5)";
  const borderStyle = emphasized ? `2px solid ${c.border}` : `1px solid ${c.border}`;
  const pulse = emphasized ? "toastPulse 0.9s ease-in-out both" : undefined;

  return (
    <div className={`${positionClass} z-100 flex justify-center`} style={{ pointerEvents: "none" }}>
      <div className={innerClass} style={{ background: c.bg, border: borderStyle, backdropFilter: "blur(20px)", animation: pulse || "toastIn 0.35s cubic-bezier(0.16,1,0.3,1) both", pointerEvents: "auto", boxShadow }}>
        <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: c.border, color: c.text }}>{c.icon}</span>
        <span style={{ color: "rgba(255,255,255,0.95)" }} className="leading-relaxed">{message}</span>
        <button onClick={onClose} className="shrink-0 ml-auto text-white/30 hover:text-white/70 transition-colors">✕</button>
      </div>
    </div>
  );
}

/* ─── Input field ─── */
function Input({ label, type = "text", value, onChange, placeholder, autoComplete, required, error }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5">
      <label className="font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.45)", fontSize: "9px" }}>
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
          aria-invalid={!!error}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-9 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: error ? "1px solid rgba(248,113,113,0.75)" : focused ? "1px solid rgba(245,166,35,0.6)" : "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            boxShadow: focused && !error ? "0 0 0 3px rgba(245,166,35,0.12)" : "none",
            paddingRight: isPassword ? "32px" : "12px",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm sm:text-lg transition-opacity hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {error && <p className="mt-0.5" style={{ color: "#fda4af", fontSize: "9px" }}>{error}</p>}
    </div>
  );
}

/* ─── Step indicator ─── */
function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-3 sm:mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{ width: i === current ? "16px" : "5px", height: "5px", background: i === current ? "#F5A623" : i < current ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.15)" }} />
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
    <div className="flex gap-1.5 sm:gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i} ref={el => inputs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e)} onKeyDown={e => handleKey(i, e)}
          className="w-9 h-9 sm:w-11 sm:h-12 text-center text-sm sm:text-lg font-bold rounded-lg sm:rounded-xl outline-none transition-all duration-200"
          style={{ background: d ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.05)", border: d ? "1px solid rgba(245,166,35,0.5)" : "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
        />
      ))}
    </div>
  );
}

/* ─── AUTH STATES ─── */

function LoginForm({ onSwitch }) {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const nextErrors = { email: "", password: "" };
    if (!isValidEmail(email)) nextErrors.email = "Format email tidak valid.";
    if (!isValidPassword(password)) nextErrors.password = "Password min. 8 karakter, wajib huruf dan angka.";
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      const authData = response?.data ?? response;
      const accessToken = authData?.access_token || authData?.token;
      const user = authData?.user || null;
      if (!accessToken) throw new Error("Token login tidak ditemukan.");
      setSession(accessToken, user, true);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const backendMessage = error?.message || "";
      if (isCredentialMismatchError(backendMessage)) setApiError("Email atau password tidak cocok.");
      else setApiError(backendMessage || "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "cardSlide 0.35s ease both" }}>
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-base sm:text-2xl font-extrabold text-white mb-0.5 sm:mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>Welcome back</h2>
        <p className="sm:text-sm" style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>Sign in to your SAWIT account</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:gap-4">
        {apiError && <p className="font-semibold text-red-300" role="alert" style={{ fontSize: "10px" }}>{apiError}</p>}
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required error={errors.email} />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required error={errors.password} />
        
        {/* Tombol Forgot Password Diperkecil Maksimal */}
        <div className="text-right -mt-2 sm:-mt-1">
          <button type="button" onClick={() => onSwitch("forgot")} className="font-medium transition-colors hover:opacity-80" style={{ color: "#F5A623", fontSize: "10px" }}>Forgot password?</button>
        </div>

        {/* Tombol Sign In Diperpendek */}
        <button type="submit" disabled={loading} className="w-full h-9 sm:h-12 rounded-full font-bold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 mt-1 sm:mt-2 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)", fontSize: "12px" }}>
          {loading && <span className="auth-inline-loader" />}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="text-center mt-5 sm:mt-6" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>
        Don't have an account? <button onClick={() => onSwitch("register")} className="font-semibold transition-colors hover:opacity-80" style={{ color: "#F5A623" }}>Create one</button>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch, toast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", confirm: "" });
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
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-base sm:text-2xl font-extrabold text-white mb-0.5 sm:mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>Create account</h2>
        <p className="sm:text-sm" style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>Start growing your estate</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2.5 sm:gap-4">
        <Input label="Full Name" value={form.name} onChange={set("name")} required />
        <Input label="Email" type="email" value={form.email} onChange={set("email")} required error={errors.email} />
        <Input label="Password" type="password" value={form.password} onChange={set("password")} required error={errors.password} />
        <Input label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} required error={errors.confirm} />
        
        {/* Tombol Register Diperpendek */}
        <button type="submit" disabled={loading} className="w-full h-9 sm:h-12 rounded-full font-bold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60 mt-1 sm:mt-2 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)", fontSize: "12px" }}>
          {loading && <span className="auth-inline-loader" />}
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <p className="text-center mt-4 sm:mt-6" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>
        Already have an account? <button onClick={() => onSwitch("login")} className="font-semibold transition-colors hover:opacity-80" style={{ color: "#F5A623" }}>Sign in</button>
      </p>
    </div>
  );
}

function ForgotForm({ onSwitch, toast }) {
  const [step, setStep] = useState(0); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", newPw: "", confirmPw: "" });

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
    if (otp.length < 6) return toast("Please enter the complete 6-digit code.", "error");
    setLoading(true); await new Promise(r => setTimeout(r, 800)); setLoading(false); setStep(2);
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
        <h2 className="text-base sm:text-2xl font-extrabold text-white mb-0.5 sm:mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>Reset Password</h2>
        <p className="sm:text-sm" style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>{stepLabels[step]}</p>
      </div>
      <StepDots total={3} current={step} />
      {step === 0 && (
        <form onSubmit={submitEmail} className="flex w-full flex-col gap-3 sm:gap-4">
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required error={errors.email} />
          <p className="sm:text-xs" style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px" }}>We'll send a one-time code to this address.</p>
          <button type="submit" disabled={loading} className="w-full h-9 sm:h-12 rounded-full font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-1 sm:mt-2" style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)", fontSize: "12px" }}>
            {loading && <span className="auth-inline-loader" />} {loading ? "Sending…" : "Send OTP"}
          </button>
        </form>
      )}
      {step === 1 && (
        <form onSubmit={submitOtp} className="flex flex-col gap-4 sm:gap-6">
          <div>
            <p className="text-center mb-3 sm:mb-4" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Enter the 6-digit code sent to <span style={{ color: "#F5A623" }}>{email}</span></p>
            <OtpInput value={otp} onChange={setOtp} />
          </div>
          <button type="submit" disabled={loading} className="w-full h-9 sm:h-12 rounded-full font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)", fontSize: "12px" }}>
            {loading && <span className="auth-inline-loader" />} {loading ? "Verifying…" : "Verify Code"}
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
        <form onSubmit={submitNewPw} className="flex w-full flex-col gap-3 sm:gap-4">
          <Input label="New Password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required error={errors.newPw} />
          <Input label="Confirm New Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required error={errors.confirmPw} />
          <button type="submit" disabled={loading} className="w-full h-9 sm:h-12 rounded-full font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 sm:mt-2" style={{ background: "linear-gradient(135deg, #F5A623, #e08000)", color: "#1a1000", boxShadow: "0 8px 24px rgba(245,166,35,0.4)", fontSize: "12px" }}>
            {loading && <span className="auth-inline-loader" />} {loading ? "Saving…" : "Set New Password"}
          </button>
        </form>
      )}
      <p className="text-center mt-5 sm:mt-6" style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>
        <button onClick={() => onSwitch("login")} className="font-semibold transition-colors hover:opacity-80" style={{ color: "#F5A623" }}>← Back to Sign In</button>
      </p>
    </div>
  );
}

/* ─── MAIN ─── */
export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") || "login");
  const [toastData, setToastData] = useState(null);
  const toastAttemptsRef = useRef({});

  const showToast = (message, type = "success", opts = {}) => {
    const key = `${message}|${type}`;
    const record = toastAttemptsRef.current[key] || { count: 0, timer: null };
    record.count += 1;
    if (record.timer) clearTimeout(record.timer);
    record.timer = setTimeout(() => { delete toastAttemptsRef.current[key]; }, 5000);
    toastAttemptsRef.current[key] = record;
    const emphasized = !!opts.force || record.count > 1;
    const duration = emphasized ? 6500 : 5000;
    setToastData({ message, type, id: Date.now(), emphasized, duration });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setSearchParams({ mode: newMode });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-12 relative overflow-hidden" style={{ background: "#0F1419", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes toastIn { from { opacity: 0; transform: translateY(-12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastPulse { 0% { transform: translateY(-6px) scale(0.98); } 30% { transform: translateY(-10px) scale(1.02); } 60% { transform: translateY(-6px) scale(1.01); } 100% { transform: translateY(0) scale(1); } }
        @keyframes cardSlide { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bgFloat { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -30px) scale(1.05); } 66% { transform: translate(-15px, 20px) scale(0.98); } }
        @keyframes loading-spin { to { transform: rotate(360deg); } }
        .auth-inline-loader { width: 16px; height: 16px; border-radius: 999px; display: inline-block; background: conic-gradient(from 0deg, rgba(26, 16, 0, 0.18), rgba(26, 16, 0, 0.96) 58%, rgba(255, 255, 255, 0.18)); mask: radial-gradient(circle at center, transparent 52%, #000 54%); -webkit-mask: radial-gradient(circle at center, transparent 52%, #000 54%); animation: loading-spin 0.9s linear infinite; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill, input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 1000px rgba(30,35,40,1) inset !important; -webkit-text-fill-color: #fff !important; }
      `}</style>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.18), transparent)", animation: "bgFloat 12s ease-in-out infinite" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(245,166,35,0.15), transparent)", animation: "bgFloat 15s ease-in-out infinite reverse" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(96,165,250,0.05), transparent)" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      {/* Back to home */}
      <a href="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1 sm:gap-2 transition-colors hover:opacity-80" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Home
      </a>

      {/* Card */}
      <div className="relative z-10 w-[92%] mx-auto max-w-70 sm:max-w-md md:w-1/3 md:max-w-none rounded-2xl sm:rounded-3xl px-5 sm:px-8 pb-5 pt-4 sm:pb-10 sm:pt-6"
        style={{ background: "rgba(20,26,32,0.85)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset", backdropFilter: "blur(24px)" }}>
        {toastData && <Toast key={toastData.id} message={toastData.message} type={toastData.type} onClose={() => setToastData(null)} fixed={false} emphasized={toastData.emphasized} duration={toastData.duration} />}
        
        {/* Logo */}
        <div className="flex items-center justify-center mb-0">
          <img src="/logo-no-bg.png" alt="SAWIT" className="h-auto w-24 sm:w-42.5 -mb-4 sm:-mb-6" loading="lazy" />
        </div>

        {/* Dynamic state */}
        {mode === "login"    && <LoginForm    onSwitch={switchMode} />}
        {mode === "register" && <RegisterForm onSwitch={switchMode} toast={showToast} />}
        {mode === "forgot"   && <ForgotForm   onSwitch={switchMode} toast={showToast} />}
      </div>
    </div>
  );
}