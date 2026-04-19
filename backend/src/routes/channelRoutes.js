import express from "express";
import { getChannelMessages, getMyChannels } from "../controllers/channelController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/my", getMyChannels);
router.get("/:id/messages", getChannelMessages);

export default router;
