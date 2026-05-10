import { useState } from "react";
import Icon from "../../../components/ui/Icon";
import { validateLoginForm } from "../utils/authValidation";
import { loginUser } from "../../../services/authApi";

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

          <button className="auth-link-button" type="button">
            Lupa password?
          </button>
        </div>

        <button className="auth-primary-button" type="submit" disabled={isLoading}>
          <span className="button-content">
            <Icon name="lock" size={15} />
            {isLoading ? "Memproses..." : "Masuk ke SAWIT"}
          </span>
        </button>
      </form>

      {successMessage && <p className="auth-success">{successMessage}</p>}

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
