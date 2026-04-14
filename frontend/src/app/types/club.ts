export type StaffTitle =
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "SECRETARY"
  | "TREASURER"
  | "HR"
  | "PROJECT_MANAGER"
  | "SPONSO_MANAGER"
  | "LOGISTIC_MANAGER";

export type ClubStaffUser = {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "PRESIDENT" | "MEMBER";
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  staffTitle: StaffTitle | null;
  createdAt?: string;
};

export type AdminClub = {
  _id: string;
  name: string;
  description: string;
  staff: ClubStaffUser[];
  members: string[];
  createdAt: string;
  updatedAt: string;
};
