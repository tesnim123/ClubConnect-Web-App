import { Group } from "../models/Group.js";
import { Message } from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/groups — all non-archived groups the user is a member of
export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({
    members: req.user._id,
    isArchived: false,
  })
    .populate("members", "name email staffTitle")
    .populate("clubId", "name")
    .sort({ updatedAt: -1 });

  res.status(200).json({ items: groups });
});

// GET /api/groups/:id/messages — paginated messages for a group
export const getGroupMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 30 } = req.query;

  const group = await Group.findById(id);
  if (!group) {
    throw new ApiError(404, "Groupe introuvable.");
  }

  // Only members can read messages
  if (!group.members.some((m) => m.equals(req.user._id))) {
    throw new ApiError(403, "Vous n'êtes pas membre de ce groupe.");
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const messages = await Message.find({ groupId: id, isDeleted: false })
    .populate("senderId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Message.countDocuments({ groupId: id, isDeleted: false });

  res.status(200).json({
    items: messages,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// POST /api/groups — president creates a custom group (project / event)
export const createGroup = asyncHandler(async (req, res) => {
  const { name, type = "project", memberIds = [] } = req.body;

  if (!name) {
    throw new ApiError(400, "Le nom du groupe est obligatoire.");
  }

  if (!["project", "event"].includes(type)) {
    throw new ApiError(
      400,
      'Type de groupe invalide. Utilisez "project" ou "event".'
    );
  }

  const clubId = req.user.club?._id || req.user.club;

  if (!clubId) {
    throw new ApiError(400, "Vous devez être associé à un club.");
  }

  // Deduplicate: always include the creator
  const uniqueMembers = [
    ...new Set([String(req.user._id), ...memberIds.map(String)]),
  ];

  const group = await Group.create({
    name,
    type,
    clubId,
    members: uniqueMembers,
    createdBy: req.user._id,
  });

  res.status(201).json({ group });
});

// POST /api/groups/:id/members — president adds a member to a custom group
export const addGroupMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "userId est obligatoire.");
  }

  const group = await Group.findById(id);
  if (!group) {
    throw new ApiError(404, "Groupe introuvable.");
  }

  if (!["project", "event"].includes(group.type)) {
    throw new ApiError(
      403,
      "Vous ne pouvez ajouter des membres qu'aux groupes projet ou événement."
    );
  }

  await Group.findByIdAndUpdate(id, { $addToSet: { members: userId } });

  res.status(200).json({ message: "Membre ajouté au groupe." });
});

// DELETE /api/groups/:id/members/:uid — president removes a member from a custom group
export const removeGroupMember = asyncHandler(async (req, res) => {
  const { id, uid } = req.params;

  const group = await Group.findById(id);
  if (!group) {
    throw new ApiError(404, "Groupe introuvable.");
  }

  if (!["project", "event"].includes(group.type)) {
    throw new ApiError(
      403,
      "Vous ne pouvez retirer des membres que des groupes projet ou événement."
    );
  }

  await Group.findByIdAndUpdate(id, { $pull: { members: uid } });

  res.status(200).json({ message: "Membre retiré du groupe." });
});
