import express from "express";
import {
  createClub,
  createStaff,
  deleteClub,
  getAdminClubById,
  getAdminClubs,
  updateClub,
  updateMemberRole,
  removeMember,
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
router.patch("/clubs/:id/members/:userId/role", updateMemberRole);
router.delete("/clubs/:id/members/:userId", removeMember);

export default router;

