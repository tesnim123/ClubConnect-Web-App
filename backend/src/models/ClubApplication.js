import mongoose from "mongoose";
import { STATUSES } from "../constants/index.js";

const clubApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// A user can apply only once to each club
clubApplicationSchema.index({ user: 1, club: 1 }, { unique: true });

export const ClubApplication = mongoose.model("ClubApplication", clubApplicationSchema);
