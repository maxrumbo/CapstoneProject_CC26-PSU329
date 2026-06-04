export const passwordRequirementMessage =
  "Password min. 8 karakter, wajib huruf besar dan angka.";

export const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const isValidPassword = (value) => passwordRegex.test(value);
