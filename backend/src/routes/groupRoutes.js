import express from "express";
import {
  getGroups,
  getGroupMessages,
  createGroup,
  addGroupMember,
  removeGroupMember,
} from "../controllers/groupController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../constants/index.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Any authenticated user can list their groups and read messages
router.get("/", getGroups);
router.get("/:id/messages", getGroupMessages);

// Only presidents can create custom groups and manage their members
router.post("/", authorizeRoles(ROLES.PRESIDENT), createGroup);
router.post("/:id/members", authorizeRoles(ROLES.PRESIDENT), addGroupMember);
router.delete(
  "/:id/members/:uid",
  authorizeRoles(ROLES.PRESIDENT),
  removeGroupMember
);

export default router;
