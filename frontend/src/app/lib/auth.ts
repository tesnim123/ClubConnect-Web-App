import type { AuthUser } from "../types/auth";

export const TOKEN_KEY = "clubconnect_token";
export const USER_KEY = "clubconnect_user";

export const roleHomeMap: Record<AuthUser["role"], string> = {
  ADMIN: "/admin/dashboard",
  STAFF: "/staff/dashboard",
  PRESIDENT: "/president/dashboard",
  MEMBER: "/member/dashboard",
};

export const getRoleHomePath = (role: AuthUser["role"]) => roleHomeMap[role];

export const getRoleSlug = (role: AuthUser["role"] | string) => role.toLowerCase();

export const getStoredAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY) ?? localStorage.getItem("user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("admin");
};
