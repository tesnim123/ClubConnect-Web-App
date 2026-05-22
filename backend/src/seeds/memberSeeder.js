import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Club } from "../models/Club.js";
import { User } from "../models/User.js";
import { ROLES, STATUSES } from "../constants/index.js";

dotenv.config();

const seedMembers = async () => {
  await connectDB();

  const clubs = await Club.find();

  if (clubs.length === 0) {
    console.log("No clubs found. Please run club seeder first.");
    process.exit(1);
  }

  const defaultPassword = "password123";

  for (const club of clubs) {
    const clubSlug = club.name.toLowerCase().replace(/\s+/g, "");

    // Create President
    const presidentEmail = `president@${clubSlug}.com`;
    let president = await User.findOne({ email: presidentEmail });
    if (!president) {
      president = await User.create({
        name: `${club.name} President`,
        email: presidentEmail,
        password: defaultPassword,
        role: ROLES.PRESIDENT,
        status: STATUSES.ACCEPTED,
        staffTitle: "PRESIDENT",
        club: club._id,
      });
      console.log(`Created President for ${club.name}: ${presidentEmail}`);
      club.president = president._id;
    }

    // Create Vice President
    const vpEmail = `vp@${clubSlug}.com`;
    let vp = await User.findOne({ email: vpEmail });
    if (!vp) {
      vp = await User.create({
        name: `${club.name} VP`,
        email: vpEmail,
        password: defaultPassword,
        role: ROLES.VICE_PRESIDENT,
        status: STATUSES.ACCEPTED,
        staffTitle: "VICE_PRESIDENT",
        club: club._id,
      });
      console.log(`Created VP for ${club.name}: ${vpEmail}`);
      club.vicePresident = vp._id;
    }

    // Create 2 Members
    for (let i = 1; i <= 2; i++) {
      const memberEmail = `member${i}@${clubSlug}.com`;
      let member = await User.findOne({ email: memberEmail });
      if (!member) {
        member = await User.create({
          name: `${club.name} Member ${i}`,
          email: memberEmail,
          password: defaultPassword,
          role: ROLES.MEMBER,
          status: STATUSES.ACCEPTED, // Automatically accepted for testing
          club: club._id,
        });
        console.log(`Created Member ${i} for ${club.name}: ${memberEmail}`);
        if (!club.members.includes(member._id)) {
          club.members.push(member._id);
        }
      }
    }

    await club.save();
  }

  console.log("-----------------------------------------");
  console.log("Member seeding completed successfully!");
  console.log("Default password for all seeded accounts is: password123");
  console.log("-----------------------------------------");

  process.exit(0);
};

seedMembers().catch((error) => {
  console.error("Members seed failed:", error);
  process.exit(1);
});