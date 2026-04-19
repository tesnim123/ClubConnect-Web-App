import express from "express";
import { createPost, getClubForumPosts, getPublicEventPosts } from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/public/events", getPublicEventPosts);
router.get("/club/:clubId", protect, getClubForumPosts);
router.post("/", protect, createPost);

export default router;
