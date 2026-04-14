import { Club } from "../models/Club.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getClubs = asyncHandler(async (_req, res) => {
  const clubs = await Club.find().sort({ name: 1 }).select("name description");

  res.status(200).json({
    items: clubs,
  });
});
