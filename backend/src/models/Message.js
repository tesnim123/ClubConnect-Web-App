import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: false,
      trim: true,
      maxlength: 5000,
    },
    attachment: {
      type: String, // base64 or url
      default: null,
    },
    attachmentName: {
      type: String,
      default: null,
    },
    attachmentType: {
      type: String, // 'image' | 'file'
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model("Message", messageSchema);
