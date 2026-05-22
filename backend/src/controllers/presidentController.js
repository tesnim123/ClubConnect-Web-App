import { User } from "../models/User.js";
import { ClubApplication } from "../models/ClubApplication.js";
import { ROLES, STATUSES } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMemberAcceptedEmail } from "../services/emailService.js";
import { acceptMemberIntoClub, addStaffMemberToClub, createPresidentCustomChannel, removeMemberFromClub, updateMemberRoleInClub } from "../services/clubService.js";

export const acceptMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Membre introuvable.");
  }

  if (member.role !== ROLES.MEMBER) {
    throw new ApiError(400, "L'utilisateur cible n'est pas un membre.");
  }

  const presidentClubId = req.user.club?._id || req.user.club;
  if (!presidentClubId) {
    throw new ApiError(403, "Vous n'avez pas de club associe.");
  }

  const hasPendingRequest = member.pendingClubs && member.pendingClubs.some(cid => String(cid) === String(presidentClubId));
  if (!hasPendingRequest) {
    throw new ApiError(403, "Cet utilisateur n'a pas demande a rejoindre votre club.");
  }

  const club = await acceptMemberIntoClub({ member, approver: req.user, clubId: presidentClubId });
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

  const presidentClubId = req.user.club?._id || req.user.club;
  if (!presidentClubId) {
    throw new ApiError(403, "Vous n'avez pas de club associe.");
  }

  const hasPendingRequest = member.pendingClubs && member.pendingClubs.some(cid => String(cid) === String(presidentClubId));
  if (!hasPendingRequest) {
    throw new ApiError(403, "Cet utilisateur n'a pas demande a rejoindre votre club.");
  }

  // Update ClubApplication
  await ClubApplication.findOneAndUpdate(
    { user: member._id, club: presidentClubId },
    { status: STATUSES.REJECTED },
    { upsert: true }
  );

  // Remove from user pending list
  member.pendingClubs = member.pendingClubs.filter(cid => String(cid) !== String(presidentClubId));
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

export const removeMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Membre introuvable.");
  }

  const presidentClubId = req.user.club?._id || req.user.club;
  if (!presidentClubId) {
    throw new ApiError(403, "Vous n'avez pas de club associe.");
  }

  // Verify that the user belongs to this club in their clubs array or is the VP/staff of this club
  const belongsToClub = 
    (member.clubs && member.clubs.some((cid) => String(cid) === String(presidentClubId))) ||
    String(member.club?._id || member.club) === String(presidentClubId);

  if (!belongsToClub) {
    throw new ApiError(403, "Cet utilisateur n'est pas membre de votre club.");
  }

  await removeMemberFromClub({ member, clubId: presidentClubId });

  res.status(200).json({
    message: "Membre retire du club avec succes.",
  });
});

export const editMemberRole = asyncHandler(async (req, res) => {
  const { role, staffTitle } = req.body;
  const member = await User.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Membre introuvable.");
  }

  const presidentClubId = req.user.club?._id || req.user.club;
  if (!presidentClubId) {
    throw new ApiError(403, "Vous n'avez pas de club associe.");
  }

  const belongsToClub = 
    (member.clubs && member.clubs.some((cid) => String(cid) === String(presidentClubId))) ||
    String(member.club?._id || member.club) === String(presidentClubId);

  if (!belongsToClub) {
    throw new ApiError(403, "Cet utilisateur n'est pas membre de votre club.");
  }

  if (role === ROLES.PRESIDENT) {
    throw new ApiError(400, "Vous ne pouvez pas ceder votre role de president par cette action.");
  }

  if (!Object.values(ROLES).includes(role)) {
    throw new ApiError(400, "Role invalide.");
  }

  const updatedClub = await updateMemberRoleInClub({
    member,
    clubId: presidentClubId,
    role,
    staffTitle: staffTitle || null,
  });

  res.status(200).json({
    message: "Role du membre mis a jour avec succes.",
    user: member.toSafeObject(),
  });
});
