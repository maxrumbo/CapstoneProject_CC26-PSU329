import { apiRequest } from "./apiClient";

export async function registerUser(payload) {
  const registerPayload = {
    email: payload.email,
    password: payload.password,
    display_name: payload.display_name || payload.name || payload.fullName,
  };

  return apiRequest("/auth/register", {
    method: "POST",
    body: registerPayload,
  });
}

export async function loginUser(payload) {
  const loginPayload = {
    email: payload.email,
    password: payload.password,
  };

  return apiRequest("/auth/login", {
    method: "POST",
    body: loginPayload,
  });
}

export async function requestOtp(payload) {
  return apiRequest("/auth/request-otp", {
    method: "POST",
    body: payload,
  });
}

export async function resendVerification(payload) {
  return apiRequest("/auth/resend-verification", {
    method: "POST",
    body: payload,
  });
}

export async function registerWithOtp(payload) {
  const registerPayload = {
    email: payload.email,
    password: payload.password,
    display_name: payload.display_name || payload.name || payload.fullName,
    code: payload.code,
  };

  return apiRequest("/auth/register-otp", {
    method: "POST",
    body: registerPayload,
  });
}

export async function resetPassword(payload) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export async function requestProfileOtp(token) {
  return apiRequest("/auth/profile/request-otp", {
    method: "POST",
    token,
  });
}

export async function changePasswordWithOtp(token, payload) {
  return apiRequest("/auth/profile/change-password", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function getCurrentUser(token) {
  return apiRequest("/auth/me", {
    method: "GET",
    token,
  });
}
