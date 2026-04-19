import { Club } from "../models/Club.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getClubs = asyncHandler(async (_req, res) => {
  const clubs = await Club.find()
    .sort({ name: 1 })
    .select("name description president vicePresident")
    .populate("president", "name")
    .populate("vicePresident", "name");

  res.status(200).json({
    items: clubs,
  });
});

export const getClubById = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id)
    .populate("president", "name email role status staffTitle")
    .populate("vicePresident", "name email role status staffTitle")
    .populate("staff", "name email role status staffTitle createdAt")
    .populate("members", "name email role status createdAt");

  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  const requesterClubId = req.user?.club?._id || req.user?.club;
  const canAccess = req.user?.role === "ADMIN" || String(requesterClubId) === String(club._id);

  if (!canAccess) {
    throw new ApiError(403, "Acces refuse a ce club.");
  }

  res.status(200).json({ club });
});
