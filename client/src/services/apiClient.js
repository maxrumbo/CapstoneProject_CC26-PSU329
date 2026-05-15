const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const buildApiUrl = (path) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

const parseResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getErrorMessage = (data) => {
  const message =
    data?.detail?.[0]?.msg ||
    data?.detail ||
    data?.message ||
    data?.error ||
    "Terjadi kesalahan saat menghubungi server";

  return typeof message === "string" ? message : JSON.stringify(message);
};

export const apiRequest = async (
  path,
  { body, headers = {}, token, ...options } = {}
) => {
  const hasBody = body !== undefined;
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
};
