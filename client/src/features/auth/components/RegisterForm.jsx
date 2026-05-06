import { useState } from "react";
import Icon from "../../../components/ui/Icon";
import { validateRegisterForm } from "../utils/authValidation";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

const getRequiredMessage = (name) => {
  const messages = {
    name: "Nama wajib diisi.",
    email: "Email wajib diisi.",
    password: "Password minimal 8 karakter.",
    confirmPassword: "Password dan konfirmasi password harus sama.",
    acceptedTerms: "Persetujuan harus dicentang.",
  };

  return messages[name] ?? "";
};

function RegisterForm({ onAuthSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [dirtyFields, setDirtyFields] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const updateFieldError = (name, value, nextFormData, nextDirtyFields) => {
    if (hasSubmitted) {
      setErrors(validateRegisterForm(nextFormData));
      return;
    }

    const isEmptyValue =
      typeof value === "boolean" ? !value : !String(value).trim();

    if (nextDirtyFields[name] && isEmptyValue) {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setHasSubmitted(true);

    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    console.log("Register SAWIT", {
      name: formData.name,
      email: formData.email,
      acceptedTerms: formData.acceptedTerms,
    });

    window.setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Akun siap digunakan. Mengarahkan ke dashboard...");
      onAuthSuccess();
    }, 650);
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <p className="eyebrow">Mulai Sekarang</p>
        <h2>Buat Akun SAWIT</h2>
        <span>Bangun kebiasaan finansial yang lebih aware dari hari pertama.</span>
      </div>

      <form
        className="auth-form"
        aria-busy={isLoading}
        onSubmit={handleSubmit}
        noValidate
      >
        <label>
          <span className="field-label">
            <Icon name="user" size={14} />
            Nama lengkap
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Nama kamu"
            value={formData.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            onChange={handleChange}
          />
          {errors.name && (
            <small className="auth-error" id="register-name-error">
              {errors.name}
            </small>
          )}
        </label>

        <label>
          <span className="field-label">
            <Icon name="mail" size={14} />
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={formData.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            onChange={handleChange}
          />
          {errors.email && (
            <small className="auth-error" id="register-email-error">
              {errors.email}
            </small>
          )}
        </label>

        <div className="auth-form-grid">
          <label>
            <span className="field-label">
              <Icon name="lock" size={14} />
              Password
            </span>
            <div className="auth-password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "register-password-error" : undefined
                }
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Lihat password"
                }
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={15} />
              </button>
            </div>
            {errors.password && (
              <small className="auth-error" id="register-password-error">
                {errors.password}
              </small>
            )}
          </label>

          <label>
            <span className="field-label">
              <Icon name="lock" size={14} />
              Konfirmasi password
            </span>
            <div className="auth-password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword
                    ? "register-confirm-password-error"
                    : undefined
                }
                onChange={handleChange}
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi password"
                    : "Lihat konfirmasi password"
                }
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <Icon name={showConfirmPassword ? "eyeOff" : "eye"} size={15} />
              </button>
            </div>
            {errors.confirmPassword && (
              <small
                className="auth-error"
                id="register-confirm-password-error"
              >
                {errors.confirmPassword}
              </small>
            )}
          </label>
        </div>

        <label className="auth-checkbox auth-terms">
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={formData.acceptedTerms}
            aria-describedby={
              errors.acceptedTerms ? "register-terms-error" : undefined
            }
            onChange={handleChange}
          />
          Saya setuju menggunakan SAWIT untuk mengelola data keuangan pribadi
          saya.
        </label>
        {errors.acceptedTerms && (
          <small className="auth-error" id="register-terms-error">
            {errors.acceptedTerms}
          </small>
        )}

        <button className="auth-primary-button" type="submit" disabled={isLoading}>
          <span className="button-content">
            <Icon name="user" size={15} />
            {isLoading ? "Memproses..." : "Daftar"}
          </span>
        </button>
      </form>

      {successMessage && <p className="auth-success">{successMessage}</p>}

      <p className="auth-switch">
        Sudah punya akun?
        <button type="button" disabled={isLoading} onClick={onSwitchToLogin}>
          Masuk di sini
        </button>
      </p>
    </div>
  );
}

export default RegisterForm;
