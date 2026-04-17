import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { ROLES } from "./constants/index.js";
import { initGlobalChannels } from "./services/channelService.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Initialize global channels if an admin exists
    const admin = await User.findOne({ role: ROLES.ADMIN });
    if (admin) {
      await initGlobalChannels(admin._id);
    }

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
