import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Club } from "../models/Club.js";

dotenv.config();

const seedClubs = async () => {
  await connectDB();

  const clubsData = [
    {
      name: "Robotics Club",
      description: "A club for building and programming robots.",
    },
    {
      name: "Photography Club",
      description: "Share and improve your photography skills.",
    },
    {
      name: "Debate Society",
      description: "Discuss and debate various topics.",
    },
  ];

  for (const clubData of clubsData) {
    const existingClub = await Club.findOne({ name: clubData.name });

    if (!existingClub) {
      await Club.create(clubData);
      console.log(`Club '${clubData.name}' created successfully.`);
    } else {
      console.log(`Club '${clubData.name}' already exists.`);
    }
  }

  process.exit(0);
};

seedClubs().catch((error) => {
  console.error("Clubs seed failed", error);
  process.exit(1);
});