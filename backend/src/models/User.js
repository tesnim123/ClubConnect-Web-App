import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, STATUSES } from "../constants/index.js";

const STAFF_TITLES = ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER", "HR", "PROJECT_MANAGER", "SPONSO_MANAGER", "LOGISTIC_MANAGER", "STAFF"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.PENDING,
    },
    staffTitle: {
      type: String,
      enum: STAFF_TITLES,
      default: null,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      default: null,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    staffTitle: this.staffTitle,
    club: this.club,
    mustChangePassword: this.mustChangePassword,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model("User", userSchema);
export { STAFF_TITLES };
