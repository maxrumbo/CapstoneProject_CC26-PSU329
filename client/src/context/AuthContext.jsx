import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../services/authApi";
import { AuthContext } from "./authContext";
import {
  clearAuthSession,
  readAuthSession,
  updateStoredUser,
  writeAuthSession,
} from "../utils/authStorage";

export function AuthProvider({ children }) {
  const [initialSession] = useState(readAuthSession);
  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(initialSession.token)
  );
  const [isChecking, setIsChecking] = useState(Boolean(initialSession.token));

  useEffect(() => {
    if (!initialSession.token) {
      return;
    }

    let isActive = true;

    getCurrentUser(initialSession.token)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setUser(response.data);
        updateStoredUser(response.data, initialSession.storageType);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        clearAuthSession();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (isActive) {
          setIsChecking(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [initialSession]);

  const setSession = useCallback((tokenValue, userValue, rememberMe = true) => {
    writeAuthSession({ token: tokenValue, user: userValue, rememberMe });
    setToken(tokenValue || null);
    setUser(userValue || null);
    setIsAuthenticated(Boolean(tokenValue));
  }, []);

  const clearSession = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isChecking,
      setSession,
      clearSession,
    }),
    [user, token, isAuthenticated, isChecking, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
