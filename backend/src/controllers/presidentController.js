import { User } from "../models/User.js";
import { ROLES, STATUSES } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { memberAcceptedTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";
import { onMemberAdded } from "../services/channelService.js";

export const acceptMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id).populate("club", "name");

  if (!member) {
    throw new ApiError(404, "Membre introuvable.");
  }

  if (member.role !== ROLES.MEMBER) {
    throw new ApiError(400, "L'utilisateur ciblé n'est pas un membre.");
  }

  if (!req.user.club || String(req.user.club._id) !== String(member.club?._id)) {
    throw new ApiError(403, "Vous ne pouvez gérer que les membres de votre club.");
  }

  member.status = STATUSES.ACCEPTED;
  await member.save();

  // Channel hook — add accepted member to club_general
  try {
    await onMemberAdded(member._id, member.club._id, null);
  } catch (err) {
    console.error("[Channels] Failed to add accepted member to channels:", err.message);
  }

  const template = memberAcceptedTemplate({
    name: member.name,
    clubName: member.club.name,
    loginUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
  });

  await sendEmail({
    to: member.email,
    subject: template.subject,
    html: template.html,
  });

  res.status(200).json({
    message: "Membre accepté et email envoyé.",
    user: member.toSafeObject(),
  });
});

export const rejectMember = asyncHandler(async (req, res) => {
  const member = await User.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Membre introuvable.");
  }

  if (member.role !== ROLES.MEMBER) {
    throw new ApiError(400, "L'utilisateur ciblé n'est pas un membre.");
  }

  if (!req.user.club || String(req.user.club._id) !== String(member.club)) {
    throw new ApiError(403, "Vous ne pouvez gérer que les membres de votre club.");
  }

  member.status = STATUSES.REJECTED;
  await member.save();

  res.status(200).json({
    message: "Membre refusé.",
    user: member.toSafeObject(),
  });
});
