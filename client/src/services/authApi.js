const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    console.log("API Error:", data);

    const message =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      "Terjadi kesalahan saat menghubungi server";

    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export async function registerUser(payload) {
  const registerPayload = {
    email: payload.email,
    password: payload.password,
    display_name: payload.display_name || payload.name || payload.fullName,
  };

  console.log("Register payload:", registerPayload);

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerPayload),
  });

  return handleResponse(response);
}

export async function loginUser(payload) {
  const loginPayload = {
    email: payload.email,
    password: payload.password,
  };

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginPayload),
  });

  return handleResponse(response);
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}