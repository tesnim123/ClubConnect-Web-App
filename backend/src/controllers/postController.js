import { Post } from "../models/Post.js";
import { CLUB_OFFICE_ROLES, POST_STATUSES, POST_TYPES, ROLES, STATUSES } from "../constants/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const canAutoPublish = (user) => user.role === ROLES.ADMIN || CLUB_OFFICE_ROLES.includes(user.role);
const hasForumAccess = (user, clubId) => user.role === ROLES.ADMIN || String(user.club?._id || user.club) === String(clubId);

export const createPost = asyncHandler(async (req, res) => {
  const { title, content, type = POST_TYPES.DISCUSSION, clubId } = req.body;
  const effectiveClubId = clubId || req.user.club?._id || req.user.club;

  if (!title || !content || !effectiveClubId) {
    throw new ApiError(400, "title, content et clubId sont obligatoires.");
  }

  if (req.user.role === ROLES.MEMBER && req.user.status !== STATUSES.ACCEPTED) {
    throw new ApiError(403, "Votre compte membre n'est pas encore valide.");
  }

  if (!hasForumAccess(req.user, effectiveClubId)) {
    throw new ApiError(403, "Vous ne pouvez publier que dans le forum de votre club.");
  }

  const autoPublish = canAutoPublish(req.user);
  const post = await Post.create({
    title,
    content,
    type,
    club: effectiveClubId,
    author: req.user._id,
    status: autoPublish ? POST_STATUSES.PUBLISHED : POST_STATUSES.PENDING,
    publishedAt: autoPublish ? new Date() : null,
    validatedBy: autoPublish ? req.user._id : null,
  });

  const populatedPost = await Post.findById(post._id)
    .populate("club", "name")
    .populate("author", "name email role")
    .populate("validatedBy", "name email role");

  res.status(201).json({
    message: autoPublish ? "Publication publiee." : "Publication en attente de validation.",
    post: populatedPost,
  });
});

export const getPublicEventPosts = asyncHandler(async (_req, res) => {
  const items = await Post.find({
    type: POST_TYPES.EVENT,
    status: POST_STATUSES.PUBLISHED,
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .populate("club", "name")
    .populate("author", "name role");

  res.status(200).json({ items });
});

export const getClubForumPosts = asyncHandler(async (req, res) => {
  if (!hasForumAccess(req.user, req.params.clubId)) {
    throw new ApiError(403, "Acces refuse a ce forum.");
  }

  const items = await Post.find({
    club: req.params.clubId,
    status: POST_STATUSES.PUBLISHED,
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .populate("club", "name")
    .populate("author", "name role");

  res.status(200).json({ items });
});
