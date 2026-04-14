import { ROLES, STATUSES } from "../constants/index.js";
import { Club } from "../models/Club.js";
import { User } from "../models/User.js";
import { staffWelcomeTemplate } from "../utils/emailTemplates.js";
import { generateRandomPassword } from "../utils/generatePassword.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

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

  res.status(201).json({
    message: "Compte staff cree et email envoye.",
    user: created.user.toSafeObject(),
    generatedPassword: process.env.NODE_ENV === "development" ? created.generatedPassword : undefined,
  });
});
