import { POST_STATUSES, ROLES } from "../constants/index.js";
import { Club } from "../models/Club.js";
import { Channel } from "../models/Channel.js";
import { Message } from "../models/Message.js";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { addStaffMemberToClub, createClubWithPresident } from "../services/clubService.js";

const populateClubQuery = (query) =>
  query
    .populate("president", "name email role status")
    .populate("vicePresident", "name email role status")
    .populate({
      path: "staff",
      select: "name email role status staffTitle createdAt",
    })
    .populate({
      path: "members",
      select: "name email role status createdAt",
    });

export const getAdminClubs = asyncHandler(async (_req, res) => {
  const clubs = await populateClubQuery(Club.find().sort({ createdAt: -1 }));
  res.status(200).json({ items: clubs });
});

export const getAdminClubById = asyncHandler(async (req, res) => {
  const club = await populateClubQuery(Club.findById(req.params.id));

  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  res.status(200).json({ club });
});

export const createClub = asyncHandler(async (req, res) => {
  const { name, description, presidentName, presidentEmail } = req.body;
  const club = await createClubWithPresident({
    name,
    description,
    presidentName,
    presidentEmail,
    adminId: req.user._id,
  });

  res.status(201).json({
    message: "Club cree avec succes et president notifie par email.",
    club,
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
    role: { $in: [ROLES.STAFF, ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.MEMBER] },
  });
  const clubChannels = await Channel.find({ club: club._id }).select("_id");
  const channelIds = clubChannels.map((channel) => channel._id);
  if (channelIds.length > 0) {
    await Message.deleteMany({ channel: { $in: channelIds } });
  }
  await Channel.deleteMany({ club: club._id });
  await Post.deleteMany({ club: club._id });
  await Club.findByIdAndDelete(club._id);

  res.status(200).json({
    message: "Club supprime avec succes.",
  });
});

export const createStaff = asyncHandler(async (req, res) => {
  const { name, email, clubId, staffTitle } = req.body;
  const created = await addStaffMemberToClub({
    name,
    email,
    clubId,
    staffTitle: staffTitle || "STAFF",
    requester: req.user,
  });

  res.status(201).json({
    message: "Compte staff cree et email envoye.",
    user: created.user.toSafeObject(),
    generatedPassword: process.env.NODE_ENV === "development" ? created.temporaryPassword : undefined,
  });
});

export const getPendingPosts = asyncHandler(async (_req, res) => {
  const items = await Post.find({ status: POST_STATUSES.PENDING })
    .sort({ createdAt: -1 })
    .populate("club", "name")
    .populate("author", "name email role");

  res.status(200).json({ items });
});

export const publishPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, "Publication introuvable.");
  }

  post.status = POST_STATUSES.PUBLISHED;
  post.validatedBy = req.user._id;
  post.publishedAt = new Date();
  await post.save();

  res.status(200).json({
    message: "Publication validee.",
    post,
  });
});

export const rejectPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, "Publication introuvable.");
  }

  post.status = POST_STATUSES.REJECTED;
  post.validatedBy = req.user._id;
  await post.save();

  res.status(200).json({
    message: "Publication rejetee.",
    post,
  });
});
