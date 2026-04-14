import { User } from "../models/User.js";
import { STATUSES } from "../constants/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: req.user.toSafeObject(),
  });
});

export const getPendingMembersForMyClub = asyncHandler(async (req, res) => {
  const pendingMembers = await User.find({
    club: req.user.club?._id,
    status: STATUSES.PENDING,
  }).select("-password");

  res.status(200).json({
    items: pendingMembers.map((member) => member.toSafeObject()),
  });
});
