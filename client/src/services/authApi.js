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

export async function getCurrentUser(token) {
  return apiRequest("/auth/me", {
    method: "GET",
    token,
  });
}
