export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!validateEmail(email)) {
    errors.email = "Format email harus valid.";
  }

  if (!password) {
    errors.password = "Password wajib diisi.";
  }

  return errors;
};

export const validateRegisterForm = ({
  name,
  email,
  password,
  confirmPassword,
  acceptedTerms,
}) => {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Nama wajib diisi.";
  }

  if (!email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!validateEmail(email)) {
    errors.email = "Format email harus valid.";
  }

  if (password.length < 8) {
    errors.password = "Password minimal 8 karakter.";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Password dan konfirmasi password harus sama.";
  }

  if (!acceptedTerms) {
    errors.acceptedTerms = "Persetujuan harus dicentang.";
  }

  return errors;
};
