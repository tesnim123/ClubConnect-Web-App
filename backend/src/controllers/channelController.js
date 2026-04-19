import { Channel } from "../models/Channel.js";
import { Message } from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserChannels } from "../services/channelService.js";

export const getMyChannels = asyncHandler(async (req, res) => {
  const items = await getUserChannels(req.user._id);
  res.status(200).json({
    items: items.map((channel) => channel.toSafeObject()),
  });
});

export const getChannelMessages = asyncHandler(async (req, res) => {
  const channel = await Channel.findOne({ _id: req.params.id, members: req.user._id });
  if (!channel) {
    throw new ApiError(404, "Canal introuvable ou acces refuse.");
  }

  const items = await Message.find({ channel: channel._id })
    .sort({ createdAt: 1 })
    .populate("sender", "name email role");

  res.status(200).json({ items });
});
