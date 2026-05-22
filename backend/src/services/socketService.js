import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Channel } from "../models/Channel.js";
import { Message } from "../models/Message.js";
import { getChannelRoom } from "./channelService.js";

let ioInstance = null;

export const getUserRoom = (userId) => `user:${userId}`;

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication token is required."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate("club", "name");
    if (!user) {
      return next(new Error("User not found."));
    }

    socket.user = user;
    next();
  } catch (_error) {
    next(new Error("Authentication failed."));
  }
};

const registerRealtimeHandlers = (socket) => {
  socket.on("channel:message", async ({ channelId, content, attachment, attachmentName, attachmentType, replyTo }, callback = () => {}) => {
    try {
      if (!content?.trim() && !attachment) {
        return callback({ error: "Message content or attachment is required." });
      }

      const channel = await Channel.findOne({ _id: channelId, members: socket.user._id });
      if (!channel) {
        return callback({ error: "Channel not found or access denied." });
      }

      const message = await Message.create({
        channel: channel._id,
        sender: socket.user._id,
        content: content ? content.trim() : null,
        attachment: attachment || null,
        attachmentName: attachmentName || null,
        attachmentType: attachmentType || null,
        replyTo: replyTo || null,
      });

      const payload = await Message.findById(message._id)
        .populate("sender", "name email role")
        .populate("channel", "name type")
        .populate("replyTo", "content sender attachment");

      ioInstance.to(getChannelRoom(channel._id)).emit("channel:message:new", payload);
      callback({ message: payload });
    } catch (error) {
      callback({ error: error.message || "Unable to send message." });
    }
  });

  socket.on("channel:message:delete", async ({ messageId }, callback = () => {}) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return callback({ error: "Message not found" });

      if (String(message.sender) !== String(socket.user._id) && !["ADMIN", "PRESIDENT", "VICE_PRESIDENT"].includes(socket.user.role)) {
        return callback({ error: "Not authorized to delete this message" });
      }

      message.isDeleted = true;
      message.content = "Ce message a été supprimé.";
      message.attachment = null;
      message.attachmentName = null;
      message.attachmentType = null;
      await message.save();

      ioInstance.to(getChannelRoom(message.channel)).emit("channel:message:deleted", { messageId, content: message.content });
      callback({ success: true });
    } catch (error) {
      callback({ error: error.message || "Unable to delete message." });
    }
  });

  socket.on("channel:message:react", async ({ messageId, emoji }, callback = () => {}) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return callback({ error: "Message not found" });

      const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
      const userIdStr = String(socket.user._id);

      if (reactionIndex > -1) {
        const userIndex = message.reactions[reactionIndex].users.findIndex(u => String(u) === userIdStr);
        if (userIndex > -1) {
          message.reactions[reactionIndex].users.splice(userIndex, 1);
          if (message.reactions[reactionIndex].users.length === 0) {
            message.reactions.splice(reactionIndex, 1);
          }
        } else {
          message.reactions[reactionIndex].users.push(socket.user._id);
        }
      } else {
        message.reactions.push({ emoji, users: [socket.user._id] });
      }

      await message.save();
      
      const payload = await Message.findById(message._id)
        .populate("sender", "name email role")
        .populate("channel", "name type")
        .populate("replyTo", "content sender attachment");

      ioInstance.to(getChannelRoom(message.channel)).emit("channel:message:updated", payload);
      callback({ success: true });
    } catch (error) {
      callback({ error: error.message || "Unable to react." });
    }
  });
};

export const setupSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  ioInstance.use(socketAuthMiddleware);

  ioInstance.on("connection", async (socket) => {
    const channels = await Channel.find({ members: socket.user._id }).select("_id");

    socket.join(getUserRoom(socket.user._id));
    channels.forEach((channel) => {
      socket.join(getChannelRoom(channel._id));
    });

    socket.emit("socket:ready", {
      userId: socket.user._id,
      joinedChannelIds: channels.map((channel) => channel._id),
    });

    registerRealtimeHandlers(socket);
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitChannelMembershipSync = async (userId) => {
  if (!ioInstance || !userId) {
    return;
  }

  const channels = await Channel.find({ members: userId }).select("_id");
  const rooms = channels.map((channel) => getChannelRoom(channel._id));
  if (rooms.length > 0) {
    ioInstance.in(getUserRoom(userId)).socketsJoin(rooms);
  }

  ioInstance.to(getUserRoom(userId)).emit("channels:sync", {
    userId,
    joinedChannelIds: channels.map((channel) => channel._id),
  });
};

export const sendNotification = (userId, notification) => {
  if (!ioInstance || !userId) {
    return;
  }
  ioInstance.to(getUserRoom(userId)).emit("notification:new", notification);
};
