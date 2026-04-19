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
  socket.on("channel:message", async ({ channelId, content }, callback = () => {}) => {
    try {
      if (!content?.trim()) {
        return callback({ error: "Message content is required." });
      }

      const channel = await Channel.findOne({ _id: channelId, members: socket.user._id });
      if (!channel) {
        return callback({ error: "Channel not found or access denied." });
      }

      const message = await Message.create({
        channel: channel._id,
        sender: socket.user._id,
        content: content.trim(),
      });

      const payload = await Message.findById(message._id)
        .populate("sender", "name email role")
        .populate("channel", "name type");

      ioInstance.to(getChannelRoom(channel._id)).emit("channel:message:new", payload);
      callback({ message: payload });
    } catch (error) {
      callback({ error: error.message || "Unable to send message." });
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
