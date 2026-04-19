import mongoose from "mongoose";
import { CHANNEL_TYPES } from "../constants/index.js";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: Object.values(CHANNEL_TYPES),
      required: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      default: null,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

channelSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    key: this.key,
    type: this.type,
    club: this.club,
    description: this.description,
    isSystem: this.isSystem,
    members: this.members,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Channel = mongoose.model("Channel", channelSchema);
