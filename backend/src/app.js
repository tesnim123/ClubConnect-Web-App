import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import presidentRoutes from "./routes/presidentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/president", presidentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/v1/groups", groupRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
