import express from "express";
import { getClubById, getClubs } from "../controllers/clubController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getClubs);
router.get("/:id", protect, getClubById);

export default router;
