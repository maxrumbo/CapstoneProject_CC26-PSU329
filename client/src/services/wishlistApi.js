const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const buildAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      "Terjadi kesalahan saat menghubungi server";

    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
};

export const createWishlist = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/wishlists`, {
    method: "POST",
    headers: buildAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};
