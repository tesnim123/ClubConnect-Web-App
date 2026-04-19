import { User } from "../models/User.js";
import { ROLES, STATUSES } from "../constants/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: req.user.toSafeObject(),
  });
});

export const getPendingMembersForMyClub = asyncHandler(async (req, res) => {
  if (![ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(req.user.role)) {
    throw new ApiError(403, "Seuls le president et le vice-president peuvent voir cette liste.");
  }

  const pendingMembers = await User.find({
    club: req.user.club?._id,
    role: ROLES.MEMBER,
    status: STATUSES.PENDING,
  }).select("-password");

  res.status(200).json({
    items: pendingMembers.map((member) => member.toSafeObject()),
  });
});
