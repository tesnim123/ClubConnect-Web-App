import { Channel } from "../models/Channel.js";
import { CHANNEL_KEYS, CHANNEL_TYPES, ROLES } from "../constants/index.js";

const ensureMember = (members, userId) => {
  const id = String(userId);
  if (!members.some((memberId) => String(memberId) === id)) {
    members.push(userId);
  }
};

export const getChannelRoom = (channelId) => `channel:${channelId}`;

export const createGlobalSystemChannels = async ({ adminId }) => {
  await Channel.findOneAndUpdate(
    { key: CHANNEL_KEYS.GLOBAL_STAFF },
    {
      $setOnInsert: {
        name: "Global Staff",
        key: CHANNEL_KEYS.GLOBAL_STAFF,
        type: CHANNEL_TYPES.GLOBAL_STAFF,
        isSystem: true,
        createdBy: adminId,
        members: [adminId],
      },
    },
    { new: true, upsert: true }
  );

  await Channel.findOneAndUpdate(
    { key: CHANNEL_KEYS.GLOBAL_PRESIDENTS },
    {
      $setOnInsert: {
        name: "Presidents & Admin",
        key: CHANNEL_KEYS.GLOBAL_PRESIDENTS,
        type: CHANNEL_TYPES.GLOBAL_PRESIDENTS,
        isSystem: true,
        createdBy: adminId,
        members: [adminId],
      },
    },
    { new: true, upsert: true }
  );
};

export const createDefaultClubChannels = async ({ club, adminId, presidentId }) => {
  const general = await Channel.create({
    name: `${club.name} - General`,
    key: `club:${club._id}:general`,
    type: CHANNEL_TYPES.GENERAL,
    club: club._id,
    isSystem: true,
    createdBy: adminId,
    members: [presidentId],
  });

  const staff = await Channel.create({
    name: `${club.name} - Staff`,
    key: `club:${club._id}:staff`,
    type: CHANNEL_TYPES.STAFF,
    club: club._id,
    isSystem: true,
    createdBy: adminId,
    members: [adminId, presidentId],
  });

  const adminPresident = await Channel.create({
    name: `${club.name} - Admin & President`,
    key: `club:${club._id}:admin-president`,
    type: CHANNEL_TYPES.ADMIN_PRESIDENT,
    club: club._id,
    isSystem: true,
    createdBy: adminId,
    members: [adminId, presidentId],
  });

  return { general, staff, adminPresident };
};

export const addUserToSystemChannels = async ({ user, club, adminIds = [] }) => {
  const channels = await Channel.find({
    $or: [{ club: club._id }, { key: { $in: [CHANNEL_KEYS.GLOBAL_STAFF, CHANNEL_KEYS.GLOBAL_PRESIDENTS] } }],
  });

  for (const channel of channels) {
    const shouldJoin =
      channel.type === CHANNEL_TYPES.GENERAL
        ? [ROLES.MEMBER, ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.STAFF].includes(user.role)
        : channel.type === CHANNEL_TYPES.STAFF
          ? [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.STAFF].includes(user.role) || adminIds.some((id) => String(id) === String(user._id))
          : channel.type === CHANNEL_TYPES.ADMIN_PRESIDENT
            ? [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(user.role) || adminIds.some((id) => String(id) === String(user._id))
            : channel.type === CHANNEL_TYPES.GLOBAL_STAFF
              ? [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT, ROLES.STAFF].includes(user.role) || adminIds.some((id) => String(id) === String(user._id))
              : channel.type === CHANNEL_TYPES.GLOBAL_PRESIDENTS
                ? [ROLES.PRESIDENT, ROLES.VICE_PRESIDENT].includes(user.role) || adminIds.some((id) => String(id) === String(user._id))
                : false;

    if (!shouldJoin) {
      continue;
    }

    ensureMember(channel.members, user._id);

    for (const adminId of adminIds) {
      if (channel.type !== CHANNEL_TYPES.GENERAL) {
        ensureMember(channel.members, adminId);
      }
    }

    await channel.save();
  }
};

export const createCustomChannel = async ({ name, description, clubId, memberIds, createdBy }) => {
  const channel = await Channel.create({
    name,
    description,
    type: CHANNEL_TYPES.CUSTOM,
    club: clubId,
    isSystem: false,
    createdBy,
    members: memberIds,
  });

  return channel;
};

export const getUserChannels = async (userId) =>
  Channel.find({ members: userId }).sort({ updatedAt: -1 }).populate("club", "name").populate("members", "name email role status");
