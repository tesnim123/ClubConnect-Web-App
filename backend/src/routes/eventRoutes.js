import express from "express";
import { createEvent, getEvents, validateEvent, deleteEvent } from "../controllers/eventController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createEvent);
router.get("/", getEvents);
router.put("/:id/validate", validateEvent);
router.delete("/:id", deleteEvent);

export default router;
