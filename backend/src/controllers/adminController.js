import { ROLES, STATUSES } from "../constants/index.js";
import { Club } from "../models/Club.js";
import { User } from "../models/User.js";
import { staffWelcomeTemplate } from "../utils/emailTemplates.js";
import { generateRandomPassword } from "../utils/generatePassword.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  createClubChannels,
  onMemberAdded,
  onMemberRemoved,
  onPresidentChanged,
  onClubDeleted,
} from "../services/channelService.js";

const STAFF_TITLE_CONFIG = {
  PRESIDENT: { label: "President", role: ROLES.PRESIDENT },
  VICE_PRESIDENT: { label: "Vice President", role: ROLES.STAFF },
  SECRETARY: { label: "Secretary", role: ROLES.STAFF },
  TREASURER: { label: "Treasurer", role: ROLES.STAFF },
  HR: { label: "RH", role: ROLES.STAFF },
  PROJECT_MANAGER: { label: "Project Manager", role: ROLES.STAFF },
  SPONSO_MANAGER: { label: "Sponso Manager", role: ROLES.STAFF },
  LOGISTIC_MANAGER: { label: "Logistic Manager", role: ROLES.STAFF },
};

const populateClubQuery = (query) =>
  query.populate({
    path: "staff",
    select: "name email role status staffTitle createdAt",
  });

const validateStaffMembers = (staffMembers) => {
  if (!Array.isArray(staffMembers) || staffMembers.length === 0) {
    throw new ApiError(400, "Au moins un membre du staff est obligatoire.");
  }

  const presidentCount = staffMembers.filter((member) => member.staffTitle === "PRESIDENT").length;
  if (presidentCount !== 1) {
    throw new ApiError(400, "Le club doit avoir exactement un President.");
  }

  const seenTitles = new Set();
  for (const member of staffMembers) {
    if (!member.name || !member.email || !member.staffTitle) {
      throw new ApiError(400, "Chaque membre du staff doit avoir un nom, un email et un poste.");
    }

    if (!STAFF_TITLE_CONFIG[member.staffTitle]) {
      throw new ApiError(400, `Poste invalide: ${member.staffTitle}`);
    }

    if (seenTitles.has(member.staffTitle)) {
      throw new ApiError(400, `Le poste ${member.staffTitle} ne peut etre assigne qu'une seule fois.`);
    }

    seenTitles.add(member.staffTitle);
  }
};

const createStaffAccount = async ({ club, name, email, staffTitle }) => {
  const normalizedEmail = email.toLowerCase();
  const titleConfig = STAFF_TITLE_CONFIG[staffTitle];

  if (!titleConfig) {
    throw new ApiError(400, `Poste invalide: ${staffTitle}`);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, `Un utilisateur existe deja avec l'email ${normalizedEmail}.`);
  }

  const generatedPassword = generateRandomPassword();
  const staffUser = await User.create({
    name,
    email: normalizedEmail,
    password: generatedPassword,
    role: titleConfig.role,
    staffTitle,
    status: STATUSES.ACCEPTED,
    club: club._id,
  });

  club.staff.push(staffUser._id);

  const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;
  const template = staffWelcomeTemplate({
    name: staffUser.name,
    email: staffUser.email,
    password: generatedPassword,
    loginUrl,
    clubName: club.name,
    role: titleConfig.label,
  });

  await sendEmail({
    to: staffUser.email,
    subject: template.subject,
    html: template.html,
  });

  return {
    user: staffUser,
    generatedPassword,
  };
};

export const getAdminClubs = asyncHandler(async (_req, res) => {
  const clubs = await populateClubQuery(Club.find().sort({ createdAt: -1 }));

  res.status(200).json({
    items: clubs,
  });
});

export const getAdminClubById = asyncHandler(async (req, res) => {
  const club = await populateClubQuery(Club.findById(req.params.id));

  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  res.status(200).json({ club });
});

export const createClub = asyncHandler(async (req, res) => {
  const { name, description, staffMembers = [] } = req.body;

  if (!name) {
    throw new ApiError(400, "Le nom du club est obligatoire.");
  }

  validateStaffMembers(staffMembers);

  const club = await Club.create({
    name,
    description,
  });

  const createdStaff = [];

  try {
    for (const member of staffMembers) {
      const created = await createStaffAccount({
        club,
        name: member.name,
        email: member.email,
        staffTitle: member.staffTitle,
      });
      createdStaff.push(created);
    }

    await club.save();
  } catch (error) {
    await User.deleteMany({ club: club._id });
    await Club.findByIdAndDelete(club._id);
    throw error;
  }

  // Channel hook — fire-and-forget
  try {
    await createClubChannels(club, req.user._id);
  } catch (err) {
    console.error("[Channels] Failed to create club channels:", err.message);
  }

  const savedClub = await populateClubQuery(Club.findById(club._id));

  res.status(201).json({
    message: "Club cree avec succes et staff notifie par email.",
    club: savedClub,
    generatedPasswords:
      process.env.NODE_ENV === "development"
        ? createdStaff.map((item) => ({
            email: item.user.email,
            staffTitle: item.user.staffTitle,
            password: item.generatedPassword,
          }))
        : undefined,
  });
});

export const updateClub = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const club = await Club.findById(req.params.id);

  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  if (name) {
    club.name = name;
  }

  if (description !== undefined) {
    club.description = description;
  }

  await club.save();

  const updatedClub = await populateClubQuery(Club.findById(club._id));

  res.status(200).json({
    message: "Club mis a jour avec succes.",
    club: updatedClub,
  });
});

export const deleteClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  // Channel hook — archive all club channels before deleting
  try {
    await onClubDeleted(club);
  } catch (err) {
    console.error("[Channels] Failed to clean up club channels:", err.message);
  }

  await User.deleteMany({
    club: club._id,
    role: { $in: [ROLES.STAFF, ROLES.PRESIDENT] },
  });
  await Club.findByIdAndDelete(club._id);

  res.status(200).json({
    message: "Club supprime avec succes.",
  });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, clubId, staffTitle } = req.body;

  if (!name || !email || !clubId) {
    throw new ApiError(400, "name, email et clubId sont obligatoires.");
  }

  const club = await Club.findById(clubId);
  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  const created = await createStaffAccount({
    club,
    name,
    email,
    staffTitle: staffTitle || "PROJECT_MANAGER",
  });

  await club.save();

  // Channel hook — fire-and-forget
  try {
    await onMemberAdded(created.user._id, clubId, created.user.staffTitle);
  } catch (err) {
    console.error("[Channels] Failed to add staff to channels:", err.message);
  }

  res.status(201).json({
    message: "Compte staff cree et email envoye.",
    user: created.user.toSafeObject(),
    generatedPassword: process.env.NODE_ENV === "development" ? created.generatedPassword : undefined,
  });
});

// ─── updateMemberRole ──────────────────────────────────────────────────────────
// PATCH /api/admin/clubs/:id/members/:userId/role
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { id: clubId, userId } = req.params;
  const { staffTitle } = req.body;

  if (!staffTitle) {
    throw new ApiError(400, "staffTitle est obligatoire.");
  }

  const titleConfig = STAFF_TITLE_CONFIG[staffTitle];
  if (!titleConfig) {
    throw new ApiError(400, `Poste invalide: ${staffTitle}`);
  }

  const club = await Club.findById(clubId);
  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Utilisateur introuvable.");
  }

  if (String(user.club) !== String(clubId)) {
    throw new ApiError(400, "L'utilisateur n'appartient pas a ce club.");
  }

  const oldStaffTitle = user.staffTitle;

  // Handle president changes/demotions
  if (oldStaffTitle === "PRESIDENT" && staffTitle !== "PRESIDENT") {
    // Demoted FROM president
    try {
      await onPresidentChanged(clubId, userId, null, req.user._id);
    } catch (err) {
      console.error("[Channels] De-president archive failed:", err.message);
    }
  } else if (staffTitle === "PRESIDENT" && oldStaffTitle !== "PRESIDENT") {
    // Promoted TO president
    const currentPresident = await User.findOne({
      club: clubId,
      staffTitle: "PRESIDENT",
    });

    if (currentPresident && String(currentPresident._id) !== String(userId)) {
      // Demote current president to VICE_PRESIDENT in DB
      currentPresident.staffTitle = "VICE_PRESIDENT";
      currentPresident.role = ROLES.STAFF;
      await currentPresident.save();
    }

    // Hook handles archiving old, creating new, and global all_presidents
    try {
      await onPresidentChanged(
        clubId,
        currentPresident?._id || null,
        userId,
        req.user._id
      );
    } catch (err) {
      console.error("[Channels] President switch failed:", err.message);
    }
  }

  // Update user's title and role
  user.staffTitle = staffTitle;
  user.role = titleConfig.role;
  await user.save();

  // Ensure user is in all appropriate channels for their final role
  // (club_general, club_staff, all_staff, etc.)
  try {
    await onMemberAdded(userId, clubId, staffTitle);
  } catch (err) {
    console.error("[Channels] Failed to sync member channels:", err.message);
  }

  res.status(200).json({
    message: "Role mis a jour avec succes.",
    user: user.toSafeObject(),
  });
});

// ─── removeMember ──────────────────────────────────────────────────────────────
// DELETE /api/admin/clubs/:id/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
  const { id: clubId, userId } = req.params;

  const club = await Club.findById(clubId);
  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Utilisateur introuvable.");
  }

  if (String(user.club) !== String(clubId)) {
    throw new ApiError(400, "L'utilisateur n'appartient pas a ce club.");
  }

  // Channel hook — fire-and-forget (before removing user data)
  try {
    await onMemberRemoved(userId, clubId);
  } catch (err) {
    console.error("[Channels] Failed to remove member from channels:", err.message);
  }

  // Remove from club arrays
  club.staff.pull(userId);
  club.members.pull(userId);
  await club.save();

  // Clear user's club association
  user.club = null;
  user.staffTitle = null;
  user.role = ROLES.MEMBER;
  user.status = STATUSES.PENDING;
  await user.save();

  res.status(200).json({
    message: "Membre retire du club avec succes.",
    user: user.toSafeObject(),
  });
});
