import { ApiError } from "../utils/ApiError.js";

export const authorizeRoles = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, "Accès refusé pour ce rôle."));
  }

  next();
};
