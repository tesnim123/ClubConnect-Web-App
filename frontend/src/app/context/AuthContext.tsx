import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { apiRequest, ApiClientError } from "../lib/api";
import { clearStoredSession, getStoredAuthUser, TOKEN_KEY, USER_KEY } from "../lib/auth";
import type { AuthUser, LoginResponse, RegisterResponse } from "../types/auth";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  clubId: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  registerMember: (payload: RegisterPayload) => Promise<RegisterResponse>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<AuthUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [loading, setLoading] = useState(false);

  const persistSession = (nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearSession = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  const refreshMe = async () => {
    if (!token || user) return;

    try {
      const response = await apiRequest<{ user: AuthUser }>("/users/me", {
        method: "GET",
        token,
      });
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearSession();
      }
    }
  };

  useEffect(() => {
    void refreshMe();
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    // Immediately update state and localStorage
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    
    // Update React state
    setToken(response.token);
    setUser(response.user);
    setLoading(false);
    
    return response.user;
  };

  const registerMember = async (payload: RegisterPayload) => {
    return apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await apiRequest<{ message: string; user: AuthUser }>("/auth/change-password", {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });

    if (token) {
      persistSession(token, response.user);
    }

    return response.user;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        registerMember,
        changePassword,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
