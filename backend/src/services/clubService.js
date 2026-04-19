import { Club } from "../models/Club.js";
import { Channel } from "../models/Channel.js";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Message } from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { generateRandomPassword } from "../utils/generatePassword.js";
import { sendTemporaryCredentialsEmail } from "./emailService.js";
import { addUserToSystemChannels, createCustomChannel, createDefaultClubChannels, createGlobalSystemChannels } from "./channelService.js";
import { ROLES, STATUSES } from "../constants/index.js";
import { emitChannelMembershipSync, getIO, getUserRoom } from "./socketService.js";

const STAFF_TITLE_LABELS = {
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice-president",
  SECRETARY: "Secretary",
  TREASURER: "Treasurer",
  HR: "HR",
  PROJECT_MANAGER: "Project Manager",
  SPONSO_MANAGER: "Sponsorship Manager",
  LOGISTIC_MANAGER: "Logistic Manager",
  STAFF: "Staff",
};

const mapRoleFromStaffTitle = (staffTitle) => {
  if (staffTitle === "PRESIDENT") {
    return ROLES.PRESIDENT;
  }

  if (staffTitle === "VICE_PRESIDENT") {
    return ROLES.VICE_PRESIDENT;
  }

  return ROLES.STAFF;
};

const ensureEmailIsUnique = async (email) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, `Un utilisateur existe deja avec l'email ${email.toLowerCase()}.`);
  }
};

const getAdminIds = async () => {
  const admins = await User.find({ role: ROLES.ADMIN }).select("_id");
  return admins.map((admin) => admin._id);
};

export const createClubWithPresident = async ({ name, description, presidentName, presidentEmail, adminId }) => {
  if (!name || !presidentName || !presidentEmail) {
    throw new ApiError(400, "name, presidentName et presidentEmail sont obligatoires.");
  }

  await ensureEmailIsUnique(presidentEmail);

  const existingClub = await Club.findOne({ name });
  if (existingClub) {
    throw new ApiError(409, "Un club existe deja avec ce nom.");
  }

  const club = await Club.create({
    name,
    description,
  });

  try {
    const temporaryPassword = generateRandomPassword();
    const president = await User.create({
      name: presidentName,
      email: presidentEmail.toLowerCase(),
      password: temporaryPassword,
      role: ROLES.PRESIDENT,
      status: STATUSES.ACCEPTED,
      club: club._id,
      staffTitle: "PRESIDENT",
      mustChangePassword: true,
    });

    club.president = president._id;
    club.staff = [president._id];
    await club.save();

    await createGlobalSystemChannels({ adminId });
    await createDefaultClubChannels({
      club,
      adminId,
      presidentId: president._id,
    });

    const adminIds = await getAdminIds();
    await addUserToSystemChannels({
      user: president,
      club,
      adminIds,
    });

    await sendTemporaryCredentialsEmail({
      name: president.name,
      email: president.email,
      password: temporaryPassword,
      clubName: club.name,
      role: STAFF_TITLE_LABELS.PRESIDENT,
    });

    const savedClub = await Club.findById(club._id)
      .populate("president", "name email role status")
      .populate("vicePresident", "name email role status")
      .populate("staff", "name email role status staffTitle")
      .populate("members", "name email role status");

    await emitChannelMembershipSync(savedClub.president?._id);
    return savedClub;
  } catch (error) {
    const clubChannels = await Channel.find({ club: club._id }).select("_id");
    const channelIds = clubChannels.map((channel) => channel._id);
    if (channelIds.length > 0) {
      await Message.deleteMany({ channel: { $in: channelIds } });
    }
    await Channel.deleteMany({ club: club._id });
    await Post.deleteMany({ club: club._id });
    await User.deleteMany({ club: club._id });
    await Club.findByIdAndDelete(club._id);
    throw error;
  }
};

export const addStaffMemberToClub = async ({ clubId, name, email, staffTitle, requester }) => {
  if (!name || !email || !staffTitle) {
    throw new ApiError(400, "name, email et staffTitle sont obligatoires.");
  }

  const club = await Club.findById(clubId);
  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  if ([ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(requester.role) && String(requester.club?._id || requester.club) !== String(club._id)) {
    throw new ApiError(403, "Vous ne pouvez gerer que votre club.");
  }

  await ensureEmailIsUnique(email);

  const role = mapRoleFromStaffTitle(staffTitle);
  if (role === ROLES.PRESIDENT) {
    throw new ApiError(400, "Le president est cree uniquement lors de la creation du club.");
  }

  if (role === ROLES.VICE_PRESIDENT && club.vicePresident) {
    throw new ApiError(409, "Ce club a deja un vice-president.");
  }

  const temporaryPassword = generateRandomPassword();
  const staff = await User.create({
    name,
    email: email.toLowerCase(),
    password: temporaryPassword,
    role,
    staffTitle,
    status: STATUSES.ACCEPTED,
    club: club._id,
    mustChangePassword: true,
  });

  if (!club.staff.some((memberId) => String(memberId) === String(staff._id))) {
    club.staff.push(staff._id);
  }

  if (role === ROLES.VICE_PRESIDENT) {
    club.vicePresident = staff._id;
  }

  await club.save();

  const adminIds = await getAdminIds();
  await addUserToSystemChannels({ user: staff, club, adminIds });
  await sendTemporaryCredentialsEmail({
    name: staff.name,
    email: staff.email,
    password: temporaryPassword,
    clubName: club.name,
    role: STAFF_TITLE_LABELS[staffTitle] || "Staff",
  });

  await emitChannelMembershipSync(staff._id);

  return {
    user: staff,
    temporaryPassword,
  };
};

export const acceptMemberIntoClub = async ({ member, approver }) => {
  const club = await Club.findById(member.club);
  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  member.status = STATUSES.ACCEPTED;
  await member.save();

  if (!club.members.some((memberId) => String(memberId) === String(member._id))) {
    club.members.push(member._id);
    await club.save();
  }

  const adminIds = await getAdminIds();
  await addUserToSystemChannels({ user: member, club, adminIds });
  await emitChannelMembershipSync(member._id);

  const io = getIO();
  if (io) {
    io.to(getUserRoom(member._id)).emit("member:accepted", {
      memberId: member._id,
      clubId: club._id,
      approvedBy: approver._id,
    });
  }

  return club;
};

export const createPresidentCustomChannel = async ({ clubId, name, description, memberIds, createdBy }) => {
  const club = await Club.findById(clubId);
  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  const members = await User.find({
    _id: { $in: memberIds },
    club: clubId,
    status: STATUSES.ACCEPTED,
  }).select("_id");

  const allowedIds = new Set(members.map((member) => String(member._id)));
  allowedIds.add(String(createdBy._id));

  const channel = await createCustomChannel({
    name,
    description,
    clubId,
    memberIds: Array.from(allowedIds),
    createdBy: createdBy._id,
  });

  await Promise.all(Array.from(allowedIds).map((userId) => emitChannelMembershipSync(userId)));

  return channel;
};
