import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    president: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    vicePresident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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

clubSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    president: this.president,
    vicePresident: this.vicePresident,
    staff: this.staff,
    members: this.members,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Club = mongoose.model("Club", clubSchema);
