import express from "express";
import {
  createClub,
  createStaff,
  deleteClub,
  getAdminClubById,
  getAdminClubs,
  getPendingPosts,
  publishPost,
  rejectPost,
  updateClub,
} from "../controllers/adminController.js";
import { ROLES } from "../constants/index.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorizeRoles(ROLES.ADMIN));
router.get("/clubs", getAdminClubs);
router.post("/clubs", createClub);
router.get("/clubs/:id", getAdminClubById);
router.put("/clubs/:id", updateClub);
router.delete("/clubs/:id", deleteClub);
router.post("/create-staff", createStaff);
router.get("/posts/pending", getPendingPosts);
router.patch("/posts/:id/publish", publishPost);
router.patch("/posts/:id/reject", rejectPost);

export default router;
