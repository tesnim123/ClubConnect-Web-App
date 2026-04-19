import { User } from "../models/User.js";
import { ROLES, STATUSES } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMemberAcceptedEmail } from "../services/emailService.js";
import { acceptMemberIntoClub, addStaffMemberToClub, createPresidentCustomChannel } from "../services/clubService.js";

export const acceptMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id).populate("club", "name");

  if (!member) {
    throw new ApiError(404, "Membre introuvable.");
  }

  if (member.role !== ROLES.MEMBER) {
    throw new ApiError(400, "L'utilisateur cible n'est pas un membre.");
  }

  if (!req.user.club || String(req.user.club._id) !== String(member.club?._id)) {
    throw new ApiError(403, "Vous ne pouvez gerer que les membres de votre club.");
  }

  const club = await acceptMemberIntoClub({ member, approver: req.user });
  await sendMemberAcceptedEmail({
    name: member.name,
    email: member.email,
    clubName: club.name,
  });

  res.status(200).json({
    message: "Membre accepte et email envoye.",
    user: member.toSafeObject(),
  });
});

export const rejectMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Membre introuvable.");
  }

  if (member.role !== ROLES.MEMBER) {
    throw new ApiError(400, "L'utilisateur cible n'est pas un membre.");
  }

  if (!req.user.club || String(req.user.club._id) !== String(member.club)) {
    throw new ApiError(403, "Vous ne pouvez gerer que les membres de votre club.");
  }

  member.status = STATUSES.REJECTED;
  await member.save();

  res.status(200).json({
    message: "Membre rejete.",
    user: member.toSafeObject(),
  });
});

export const addStaffMember = asyncHandler(async (req, res) => {
  const { name, email, staffTitle } = req.body;
  const created = await addStaffMemberToClub({
    name,
    email,
    staffTitle,
    clubId: req.user.club?._id || req.user.club,
    requester: req.user,
  });

  res.status(201).json({
    message: "Membre du staff ajoute et notifie par email.",
    user: created.user.toSafeObject(),
    generatedPassword: process.env.NODE_ENV === "development" ? created.temporaryPassword : undefined,
  });
});

export const createCustomClubChannel = asyncHandler(async (req, res) => {
  const { name, description, memberIds = [] } = req.body;
  if (!name) {
    throw new ApiError(400, "Le nom du canal est obligatoire.");
  }

  const channel = await createPresidentCustomChannel({
    clubId: req.user.club?._id || req.user.club,
    name,
    description,
    memberIds,
    createdBy: req.user,
  });

  res.status(201).json({
    message: "Canal personnalise cree.",
    channel: channel.toSafeObject(),
  });
});
