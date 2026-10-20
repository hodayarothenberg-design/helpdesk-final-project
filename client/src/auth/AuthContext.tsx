import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthState } from "../types/auth";

const STORAGE_KEY = "helpdesk.auth";

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, username: null };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "token" in parsed &&
      "username" in parsed &&
      typeof parsed.token === "string" &&
      typeof parsed.username === "string"
    ) {
      return { token: parsed.token, username: parsed.username };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { token: null, username: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(readStoredAuth);

  const login = useCallback((token: string, username: string) => {
    const next: AuthState = { token, username };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ token: null, username: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth.token,
      username: auth.username,
      isAuthenticated: Boolean(auth.token),
      login,
      logout,
    }),
    [auth.token, auth.username, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
