export const notFound = (req, _res, next) => {
  const error = new Error(`Route introuvable: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Erreur de validation",
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Cette valeur existe déjà.",
    });
  }

  return res.status(statusCode).json({
    message: error.message || "Erreur interne du serveur.",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
