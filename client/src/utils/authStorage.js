const TOKEN_KEY = "token";
const USER_KEY = "user";

const parseUser = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const readAuthSession = () => {
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  const token = sessionToken || localStorage.getItem(TOKEN_KEY);
  const storageType = sessionToken ? "session" : "local";
  const storage = storageType === "session" ? sessionStorage : localStorage;
  const user = parseUser(storage.getItem(USER_KEY));

  return { token, user, storageType };
};

export const writeAuthSession = ({ token, user, rememberMe }) => {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;

  if (token) {
    target.setItem(TOKEN_KEY, token);
  }

  if (user) {
    target.setItem(USER_KEY, JSON.stringify(user));
  }

  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
};

export const updateStoredUser = (user, storageType = "local") => {
  if (!user) {
    return;
  }

  const storage = storageType === "session" ? sessionStorage : localStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};
