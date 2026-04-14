import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { ROLES, STATUSES } from "../constants/index.js";

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@clubconnect.com").toLowerCase();
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log("Admin already exists.");
    process.exit(0);
  }

  await User.create({
    name: process.env.ADMIN_NAME || "Platform Admin",
    email,
    password: process.env.ADMIN_PASSWORD || "Admin@123456",
    role: ROLES.ADMIN,
    status: STATUSES.ACCEPTED,
  });

  console.log("Admin created successfully.");
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Admin seed failed", error);
  process.exit(1);
});
