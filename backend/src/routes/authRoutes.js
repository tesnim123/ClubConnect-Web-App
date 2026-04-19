import express from "express";
import { changePassword, login, registerMember } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", registerMember);
router.put("/change-password", protect, changePassword);

export default router;
