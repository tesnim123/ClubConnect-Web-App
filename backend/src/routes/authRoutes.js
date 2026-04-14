import express from "express";
import { login, registerMember } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", registerMember);

export default router;
