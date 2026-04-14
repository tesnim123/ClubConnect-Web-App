import { Club } from "../models/Club.js";
import { User } from "../models/User.js";
import { ROLES, STATUSES } from "../constants/index.js";
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

  if (user.role === ROLES.MEMBER && user.status !== STATUSES.ACCEPTED) {
    throw new ApiError(403, "Votre compte membre n'est pas encore accepté.");
  }

  if ([ROLES.ADMIN, ROLES.STAFF, ROLES.PRESIDENT].includes(user.role) && user.status !== STATUSES.ACCEPTED) {
    throw new ApiError(403, "Votre compte staff n'est pas actif.");
  }

  res.status(200).json({
    message: "Connexion réussie.",
    token: generateToken(user._id),
    user: user.toSafeObject(),
  });
});

export const registerMember = asyncHandler(async (req, res) => {
  const { name, email, password, clubId } = req.body;

  if (!name || !email || !password || !clubId) {
    throw new ApiError(400, "name, email, password et clubId sont obligatoires.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "Un compte existe déjà avec cet email.");
  }

  const club = await Club.findById(clubId);
  if (!club) {
    throw new ApiError(404, "Club introuvable.");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: ROLES.MEMBER,
    status: STATUSES.PENDING,
    club: club._id,
  });

  club.members.push(user._id);
  await club.save();

  res.status(201).json({
    message: "Inscription enregistrée. En attente de validation par le président.",
    user: user.toSafeObject(),
  });
});
