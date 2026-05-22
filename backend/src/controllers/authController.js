import bcrypt from "bcryptjs";
import { Club } from "../models/Club.js";
import { User } from "../models/User.js";
import { ClubApplication } from "../models/ClubApplication.js";
import { ROLES, STAFF_ROLES, STATUSES } from "../constants/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email et mot de passe sont obligatoires.");
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password")
    .populate("club", "name description");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Identifiants invalides.");
  }

  // Temporarily allow member login regardless of status for testing
  // if (user.role === ROLES.MEMBER && user.status !== STATUSES.ACCEPTED) {
  //   throw new ApiError(403, "Votre compte membre n'est pas encore accepté.");
  // }

  // Temporarily allow staff login regardless of status for testing
  // if (STAFF_ROLES.includes(user.role) && user.status !== STATUSES.ACCEPTED) {
  //   throw new ApiError(403, "Votre compte staff n'est pas actif.");
  // }

  res.status(200).json({
    message: "Connexion réussie.",
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});

export const registerMember = asyncHandler(async (req, res) => {
  const { name, email, password, clubId, clubIds, phone } = req.body;

  const clubIdsArray = Array.isArray(clubIds) ? clubIds : (clubId ? [clubId] : []);

  if (!name || !email || !password || clubIdsArray.length === 0) {
    throw new ApiError(400, "name, email, password et au moins un clubId sont obligatoires.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "Un compte existe deja avec cet email.");
  }

  // Validate all clubs exist
  const clubs = await Club.find({ _id: { $in: clubIdsArray } });
  if (clubs.length !== clubIdsArray.length) {
    throw new ApiError(404, "Un ou plusieurs clubs selectionnes sont introuvables.");
  }

  const firstClubId = clubIdsArray[0];

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: ROLES.MEMBER,
    status: STATUSES.PENDING,
    club: firstClubId, // default club for backward compatibility
    clubs: [],
    pendingClubs: clubIdsArray,
    phone: phone || null,
  });

  // Create individual club application records
  await Promise.all(
    clubIdsArray.map((cid) =>
      ClubApplication.create({
        user: user._id,
        club: cid,
        status: STATUSES.PENDING,
      })
    )
  );

  res.status(201).json({
    message: "Inscription enregistree. En attente de validation par les presidents des clubs selectionnes.",
    user: user.toSafeObject(),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "currentPassword et newPassword sont obligatoires.");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "Utilisateur introuvable.");
  }

  const passwordIsValid = await bcrypt.compare(currentPassword, user.password);
  if (!passwordIsValid) {
    throw new ApiError(401, "Mot de passe actuel invalide.");
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  res.status(200).json({
    message: "Mot de passe mis a jour.",
    user: user.toSafeObject(),
  });
});
