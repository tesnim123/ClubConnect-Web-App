import { User } from "../models/User.js";
import { ClubApplication } from "../models/ClubApplication.js";
import { ROLES, STATUSES } from "../constants/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: req.user.toSafeObject(),
  });
});

export const updateCurrentUser = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id).populate("club", "name description");
  
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.status(200).json({
    message: "Profil mis à jour",
    user: user.toSafeObject(),
  });
});

export const getPendingMembersForMyClub = asyncHandler(async (req, res) => {
  if (![ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(req.user.role)) {
    throw new ApiError(403, "Seuls le president et le vice-president peuvent voir cette liste.");
  }

  const clubId = req.user.club?._id || req.user.club;
  if (!clubId) {
    return res.status(200).json({ items: [] });
  }

  const applications = await ClubApplication.find({
    club: clubId,
    status: STATUSES.PENDING,
  }).populate("user");

  const pendingUsers = applications
    .filter((app) => app.user)
    .map((app) => app.user.toSafeObject());

  res.status(200).json({
    items: pendingUsers,
  });
});
