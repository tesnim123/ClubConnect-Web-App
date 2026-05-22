import { Post } from "../models/Post.js";
import { CLUB_OFFICE_ROLES, POST_STATUSES, POST_TYPES, ROLES, STATUSES } from "../constants/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendNotification } from "../services/socketService.js";

const canAutoPublish = (user) => user.role === ROLES.ADMIN;
const hasForumAccess = (user, clubId) => user.role === ROLES.ADMIN || String(user.club?._id || user.club) === String(clubId);

export const createPost = asyncHandler(async (req, res) => {
  const { title, content, type = POST_TYPES.DISCUSSION, clubId, attachment, attachmentName } = req.body;
  const effectiveClubId = clubId || req.user.club?._id || req.user.club;

  if (!title || !content || !effectiveClubId) {
    throw new ApiError(400, "title, content et clubId sont obligatoires.");
  }

  // Temporarily allow member posts regardless of status for testing
  // if (req.user.role === ROLES.MEMBER && req.user.status !== STATUSES.ACCEPTED) {
  //   throw new ApiError(403, "Votre compte membre n'est pas encore valide.");
  // }

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
    attachment: attachment || null,
    attachmentName: attachmentName || null,
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
    $or: [
      { status: POST_STATUSES.PUBLISHED },
      { author: req.user._id }
    ]
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .populate("club", "name")
    .populate("author", "name role")
    .populate("comments.author", "name role");

  res.status(200).json({ items });
});

export const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Publication introuvable.");
  }

  if (!hasForumAccess(req.user, post.club)) {
    throw new ApiError(403, "Acces refuse.");
  }

  const isLiked = post.likes.includes(req.user._id);

  if (isLiked) {
    post.likes = post.likes.filter((id) => String(id) !== String(req.user._id));
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  res.status(200).json({
    message: isLiked ? "Post unliked" : "Post liked",
    likes: post.likes,
  });
});

export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  
  if (!text || !text.trim()) {
    throw new ApiError(400, "Le commentaire ne peut pas etre vide.");
  }

  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Publication introuvable.");
  }

  if (!hasForumAccess(req.user, post.club)) {
    throw new ApiError(403, "Acces refuse.");
  }

  post.comments.push({
    author: req.user._id,
    text: text.trim(),
  });

  await post.save();

  const populatedPost = await Post.findById(post._id)
    .populate("comments.author", "name role");

  res.status(201).json({
    message: "Commentaire ajoute.",
    comments: populatedPost.comments,
  });

  // Notify post author
  if (String(post.author) !== String(req.user._id)) {
    sendNotification(post.author, {
      title: "Nouveau commentaire",
      message: `${req.user.name} a commente votre publication.`,
      type: "comment",
    });
  }
});

export const reactToPost = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) {
    throw new ApiError(400, "L'emoji est obligatoire.");
  }

  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Publication introuvable.");
  }

  if (!hasForumAccess(req.user, post.club)) {
    throw new ApiError(403, "Acces refuse.");
  }

  const reactionIndex = post.reactions.findIndex((r) => r.emoji === emoji);
  const userIdStr = String(req.user._id);

  if (reactionIndex > -1) {
    const userIndex = post.reactions[reactionIndex].users.findIndex((u) => String(u) === userIdStr);
    if (userIndex > -1) {
      post.reactions[reactionIndex].users.splice(userIndex, 1);
      if (post.reactions[reactionIndex].users.length === 0) {
        post.reactions.splice(reactionIndex, 1);
      }
    } else {
      post.reactions[reactionIndex].users.push(req.user._id);
    }
  } else {
    post.reactions.push({ emoji, users: [req.user._id] });
  }

  await post.save();

  res.status(200).json({
    message: "Reaction mise a jour",
    reactions: post.reactions,
  });
});
