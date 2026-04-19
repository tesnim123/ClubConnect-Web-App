import type { UserRole } from "../types/auth";

export type RoleSection = "admin" | "president" | "staff" | "member";

export const getRoleSection = (role?: UserRole | null): RoleSection => {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "PRESIDENT":
    case "VICE_PRESIDENT":
      return "president";
    case "STAFF":
      return "staff";
    default:
      return "member";
  }
};

export const getRoleLabel = (role?: UserRole | null) => {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "PRESIDENT":
      return "President";
    case "VICE_PRESIDENT":
      return "Vice-president";
    case "STAFF":
      return "Staff";
    default:
      return "Membre";
  }
};
