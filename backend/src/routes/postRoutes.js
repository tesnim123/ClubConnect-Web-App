import express from "express";
import { createPost, getClubForumPosts, getPublicEventPosts, toggleLike, addComment, reactToPost } from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/public/events", getPublicEventPosts);
router.get("/club/:clubId", protect, getClubForumPosts);
router.post("/", protect, createPost);
router.post("/:postId/like", protect, toggleLike);
router.post("/:postId/react", protect, reactToPost);
router.post("/:postId/comment", protect, addComment);

export default router;
