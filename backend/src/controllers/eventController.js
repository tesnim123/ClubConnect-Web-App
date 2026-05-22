import { Event } from "../models/Event.js";
import { Club } from "../models/Club.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper to check if two time ranges overlap
const checkTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

// Check for room reservation conflict
export const checkConflict = async (room, date, startTime, endTime, excludeEventId = null) => {
  const queryDate = new Date(date);
  // Set time of queryDate to midnight UTC to compare only dates
  queryDate.setUTCHours(0, 0, 0, 0);

  const startOfDay = new Date(queryDate);
  const endOfDay = new Date(queryDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingBookings = await Event.find({
    room,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: "APPROVED",
    _id: { $ne: excludeEventId },
  });

  for (const booking of existingBookings) {
    if (checkTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
      return booking;
    }
  }

  return null;
};

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, clubs = [], date, startTime, endTime, room, equipments } = req.body;

  if (!title || !date || !startTime || !endTime || !room) {
    throw new ApiError(400, "Les champs title, date, startTime, endTime et room sont obligatoires.");
  }

  const creatorClubId = req.user.club?._id || req.user.club;
  if (!creatorClubId) {
    throw new ApiError(403, "Vous devez faire partie d'un club pour creer un evenement.");
  }

  // Ensure all referenced clubs exist
  const clubIds = Array.from(new Set([creatorClubId, ...clubs]));
  const existingClubs = await Club.find({ _id: { $in: clubIds } });
  if (existingClubs.length !== clubIds.length) {
    throw new ApiError(400, "Un ou plusieurs clubs selectionnes sont invalides.");
  }

  // Check if there is an approved event conflict for the room/time
  const conflict = await checkConflict(room, date, startTime, endTime);
  if (conflict) {
    throw new ApiError(409, `Conflit de salle : La salle "${room}" est deja reservee pour le ${new Date(date).toLocaleDateString()} de ${conflict.startTime} à ${conflict.endTime} par le club "${existingClubs.find(c => String(c._id) === String(conflict.club))?.name || 'autre club'}".`);
  }

  const event = await Event.create({
    title,
    description,
    club: creatorClubId,
    clubs: clubIds,
    date: new Date(date),
    startTime,
    endTime,
    room,
    equipments: equipments || [],
    status: "PENDING",
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Demande de reservation d'evenement soumise avec succes.",
    event,
  });
});

export const getEvents = asyncHandler(async (req, res) => {
  const userClubs = req.user.clubs || [];
  if (req.user.club) {
    const primaryClubId = String(req.user.club?._id || req.user.club);
    if (!userClubs.map(String).includes(primaryClubId)) {
      userClubs.push(primaryClubId);
    }
  }

  let query = {};

  if (req.user.role !== "ADMIN") {
    // Non-admin users see:
    // 1. All APPROVED events
    // 2. Or PENDING/REJECTED events where their club is involved
    query = {
      $or: [
        { status: "APPROVED" },
        { clubs: { $in: userClubs } },
      ],
    };
  }

  const events = await Event.find(query)
    .sort({ date: 1, startTime: 1 })
    .populate("club", "name")
    .populate("clubs", "name")
    .populate("createdBy", "name email");

  res.status(200).json({
    items: events,
  });
});

export const validateEvent = asyncHandler(async (req, res) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Seul l'administrateur peut valider les reservations.");
  }

  const { action, rejectionReason } = req.body;
  if (!["APPROVED", "REJECTED"].includes(action)) {
    throw new ApiError(400, "Action invalide. Doit etre APPROVED ou REJECTED.");
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "Evenement introuvable.");
  }

  if (action === "APPROVED") {
    // Check for scheduling conflicts before approving
    const conflict = await checkConflict(event.room, event.date, event.startTime, event.endTime, event._id);
    if (conflict) {
      const conflictingClub = await Club.findById(conflict.club);
      throw new ApiError(
        409,
        `Impossible d'approuver : La salle "${event.room}" est deja reservee par le club "${conflictingClub?.name || 'autre'}" sur ce creneau (${conflict.startTime} - ${conflict.endTime}).`
      );
    }
    event.status = "APPROVED";
    event.rejectionReason = "";
  } else {
    event.status = "REJECTED";
    event.rejectionReason = rejectionReason || "Refuse par l'administrateur.";
  }

  event.validatedBy = req.user._id;
  await event.save();

  res.status(200).json({
    message: action === "APPROVED" ? "Evenement approuve et salle reservee." : "Evenement rejete.",
    event,
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "Evenement introuvable.");
  }

  const userClubId = req.user.club?._id || req.user.club;
  const isCreator = String(event.createdBy) === String(req.user._id);
  const isClubOfficer = [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(req.user.role) && String(event.club) === String(userClubId);
  const isAdmin = req.user.role === "ADMIN";

  if (!isCreator && !isClubOfficer && !isAdmin) {
    throw new ApiError(403, "Vous n'avez pas l'autorisation de supprimer cet evenement.");
  }

  await Event.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Evenement supprime avec succes.",
  });
});
