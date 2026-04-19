export type UserRole = "ADMIN" | "PRESIDENT" | "VICE_PRESIDENT" | "STAFF" | "MEMBER";
export type UserStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type StaffTitle =
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "SECRETARY"
  | "TREASURER"
  | "HR"
  | "PROJECT_MANAGER"
  | "SPONSO_MANAGER"
  | "LOGISTIC_MANAGER"
  | "STAFF";

export type ClubSummary = {
  _id: string;
  name: string;
  description?: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  club: ClubSummary | string | null;
  staffTitle?: StaffTitle | null;
  mustChangePassword?: boolean;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type RegisterResponse = {
  message: string;
  user: AuthUser;
};
