import {
  isValidPassword,
  passwordRequirementMessage,
} from "../../../utils/passwordValidation";

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
  } else if (!isValidPassword(password)) {
    errors.password = passwordRequirementMessage;
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

  if (!isValidPassword(password)) {
    errors.password = passwordRequirementMessage;
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Password dan konfirmasi password harus sama.";
  }

  if (!acceptedTerms) {
    errors.acceptedTerms = "Persetujuan harus dicentang.";
  }

  return errors;
};
