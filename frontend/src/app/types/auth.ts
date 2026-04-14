export type UserRole = "ADMIN" | "STAFF" | "PRESIDENT" | "MEMBER";
export type UserStatus = "PENDING" | "ACCEPTED" | "REJECTED";

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
