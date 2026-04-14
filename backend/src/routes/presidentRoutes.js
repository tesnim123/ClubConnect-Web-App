import express from "express";
import { acceptMember, rejectMember } from "../controllers/presidentController.js";
import { getPendingMembersForMyClub } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../constants/index.js";

const router = express.Router();

router.use(protect, authorizeRoles(ROLES.PRESIDENT));
router.get("/pending-members", getPendingMembersForMyClub);
router.put("/accept-member/:id", acceptMember);
router.put("/reject-member/:id", rejectMember);

export default router;
