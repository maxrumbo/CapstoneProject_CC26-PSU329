import { useState } from "react";
import Icon from "../../../components/ui/Icon";
import { validateLoginForm } from "../utils/authValidation";
import { loginUser, requestOtp, resetPassword } from "../../../services/authApi";

const initialFormData = {
  email: "",
  password: "",
  rememberMe: false,
};

const getRequiredMessage = (name) => {
  if (name === "email") {
    return "Email wajib diisi.";
  }

  if (name === "password") {
    return "Password wajib diisi.";
  }

  return "";
};

function LoginForm({ onAuthSuccess, onSwitchToRegister }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [dirtyFields, setDirtyFields] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetData, setResetData] = useState({
    email: "",
    otp: "",
    new_password: "",
  });
  const [resetMessage, setResetMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const updateFieldError = (name, value, nextFormData, nextDirtyFields) => {
    if (hasSubmitted) {
      setErrors(validateLoginForm(nextFormData));
      return;
    }

    if (nextDirtyFields[name] && name !== "rememberMe" && !value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [name]: getRequiredMessage(name),
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    const nextFormData = {
      ...formData,
      [name]: nextValue,
    };
    const nextDirtyFields = {
      ...dirtyFields,
      [name]: dirtyFields[name] || Boolean(nextValue),
    };

    setFormData(nextFormData);
    setDirtyFields(nextDirtyFields);
    setSuccessMessage("");
    updateFieldError(name, nextValue, nextFormData, nextDirtyFields);
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setResetData((prev) => ({ ...prev, [name]: value }));
    setResetMessage("");
    setApiError("");
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setResetMessage("");
    setApiError("");

    try {
      const response = await requestOtp({
        email: resetData.email,
        purpose: "reset_password",
      });
      const otpCode = response?.data?.otp_code;
      setResetMessage(
        otpCode
          ? `OTP terkirim. (DEV) Kode: ${otpCode}`
          : "OTP terkirim ke email."
      );
    } catch (error) {
      setApiError(error.message || "Gagal mengirim OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setIsResetting(true);
    setResetMessage("");
    setApiError("");

    try {
      await resetPassword({
        email: resetData.email,
        code: resetData.otp,
        new_password: resetData.new_password,
      });
      setResetMessage("Password berhasil direset. Silakan login.");
      setShowReset(false);
      setResetData({ email: "", otp: "", new_password: "" });
    } catch (error) {
      setApiError(error.message || "Reset password gagal.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    setApiError("");

    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      const { access_token, user } = response.data;

      setSuccessMessage("Login berhasil. Mengarahkan ke dashboard...");
      onAuthSuccess(access_token, user, formData.rememberMe);
    } catch (error) {
      setApiError(error.message || "Login gagal. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <p className="eyebrow">Welcome Back</p>
        <h2>Masuk ke SAWIT</h2>
        <span>Kelola uang harianmu dengan cara yang lebih santai dan rapi.</span>
      </div>

      <form
        className="auth-form"
        aria-busy={isLoading}
        onSubmit={handleSubmit}
        noValidate
      >
        {apiError && (
          <p className="auth-error" role="alert">
            {apiError}
          </p>
        )}
        <label>
          <span className="field-label">
            <Icon name="mail" size={14} />
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={formData.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            onChange={handleChange}
          />
          {errors.email && (
            <small className="auth-error" id="login-email-error">
              {errors.email}
            </small>
          )}
        </label>

        <label>
          <span className="field-label">
            <Icon name="lock" size={14} />
            Password
          </span>
          <div className="auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={formData.password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              onChange={handleChange}
            />
            <button
              type="button"
              className="auth-password-toggle"
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={15} />
            </button>
          </div>
          {errors.password && (
            <small className="auth-error" id="login-password-error">
              {errors.password}
            </small>
          )}
        </label>

        <div className="auth-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Ingat saya
          </label>

          <button
            className="auth-link-button"
            type="button"
            onClick={() => setShowReset((prev) => !prev)}
          >
            Lupa password?
          </button>
        </div>

        <button className="auth-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="button-content">
              <span className="auth-inline-loader" aria-hidden="true" />
              Memproses...
            </span>
          ) : (
            <span className="button-content">
              <Icon name="lock" size={15} />
              Masuk ke SAWIT
            </span>
          )}
        </button>
      </form>

      {successMessage && <p className="auth-success">{successMessage}</p>}

      {showReset && (
        <form className="auth-reset-panel" onSubmit={handleResetSubmit} noValidate>
          <label>
            <span className="field-label">
              <Icon name="mail" size={14} />
              Email
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={resetData.email}
              onChange={handleResetChange}
            />
          </label>

          <label>
            <span className="field-label">
              <Icon name="lock" size={14} />
              Kode OTP
            </span>
            <input
              type="text"
              name="otp"
              placeholder="Masukkan OTP"
              value={resetData.otp}
              onChange={handleResetChange}
            />
          </label>

          <label>
            <span className="field-label">
              <Icon name="lock" size={14} />
              Password baru
            </span>
            <input
              type="password"
              name="new_password"
              placeholder="Minimal 8 karakter"
              value={resetData.new_password}
              onChange={handleResetChange}
            />
          </label>

          {resetMessage && <p className="auth-success">{resetMessage}</p>}

          <div className="auth-reset-actions">
            <button
              className="auth-secondary-button"
              type="button"
              onClick={handleSendOtp}
              disabled={!resetData.email || isSendingOtp}
            >
              {isSendingOtp ? (
                <span className="button-content">
                  <span className="auth-inline-loader auth-inline-loader-muted" aria-hidden="true" />
                  Mengirim OTP...
                </span>
              ) : (
                "Kirim OTP"
              )}
            </button>
            <button className="auth-primary-button" type="submit" disabled={isResetting}>
              {isResetting ? (
                <span className="button-content">
                  <span className="auth-inline-loader" aria-hidden="true" />
                  Memproses...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      )}

      <p className="auth-switch">
        Belum punya akun?
        <button type="button" disabled={isLoading} onClick={onSwitchToRegister}>
          Daftar sekarang
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
