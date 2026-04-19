import type { StaffTitle, UserRole, UserStatus } from "./auth";

export type ClubStaffUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  staffTitle: StaffTitle | null;
  createdAt?: string;
};

export type ClubMemberUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
};

export type AdminClub = {
  _id: string;
  name: string;
  description: string;
  president?: ClubStaffUser | null;
  vicePresident?: ClubStaffUser | null;
  staff: ClubStaffUser[];
  members: ClubMemberUser[];
  createdAt: string;
  updatedAt: string;
};

export type ChannelType = "GENERAL" | "STAFF" | "GLOBAL_STAFF" | "ADMIN_PRESIDENT" | "GLOBAL_PRESIDENTS" | "CUSTOM";

export type Channel = {
  _id: string;
  name: string;
  key?: string;
  type: ChannelType;
  club?: { _id: string; name: string } | string | null;
  description?: string;
  isSystem: boolean;
  members: Array<{
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  }> | string[];
  createdBy: string;
};

export type ChannelMessage = {
  _id: string;
  channel: string | { _id: string; name: string; type: ChannelType };
  sender: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  content: string;
  createdAt: string;
};

export type ClubPostType = "EVENT" | "ANNOUNCEMENT" | "DISCUSSION";
export type ClubPostStatus = "PENDING" | "PUBLISHED" | "REJECTED";

export type ClubPost = {
  _id: string;
  title: string;
  content: string;
  type: ClubPostType;
  status: ClubPostStatus;
  publishedAt?: string | null;
  createdAt: string;
  club: { _id: string; name: string };
  author: {
    _id: string;
    name: string;
    email?: string;
    role: UserRole;
  };
  validatedBy?: {
    _id: string;
    name: string;
    email?: string;
    role: UserRole;
  } | null;
};
