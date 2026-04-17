import { Group } from "../models/Group.js";
import { Club } from "../models/Club.js";
import { User } from "../models/User.js";
import { ROLES, GROUP_TYPES } from "../constants/index.js";

// ─── initGlobalChannels ────────────────────────────────────────────────────────
// Called at server startup / seed. Creates all_staff and all_presidents if missing.
export const initGlobalChannels = async (adminId) => {
  try {
    const allStaff = await Group.findOneAndUpdate(
      { type: GROUP_TYPES.ALL_STAFF },
      {
        $setOnInsert: {
          name: "All Staff",
          type: GROUP_TYPES.ALL_STAFF,
          clubId: null,
          createdBy: adminId,
        },
        $addToSet: { members: adminId },
      },
      { upsert: true, new: true }
    );

    const allPresidents = await Group.findOneAndUpdate(
      { type: GROUP_TYPES.ALL_PRESIDENTS },
      {
        $setOnInsert: {
          name: "All Presidents",
          type: GROUP_TYPES.ALL_PRESIDENTS,
          clubId: null,
          createdBy: adminId,
        },
        $addToSet: { members: adminId },
      },
      { upsert: true, new: true }
    );

    console.log("[Channels] Global channels ready:", {
      allStaff: allStaff._id,
      allPresidents: allPresidents._id,
    });

    return { allStaff, allPresidents };
  } catch (error) {
    console.error("[Channels] Error initializing global channels:", error.message);
  }
};

// ─── createClubChannels ────────────────────────────────────────────────────────
// Called right after a new club is created (with its staff already saved).
export const createClubChannels = async (club, adminId) => {
  try {
    // Populate staff to get their names and staffTitles
    const populatedClub = await Club.findById(club._id).populate(
      "staff",
      "name staffTitle"
    );

    const staffUsers = populatedClub.staff || [];
    const memberIds = populatedClub.members || [];
    const staffIds = staffUsers.map((u) => u._id);
    const president = staffUsers.find((u) => u.staffTitle === "PRESIDENT");

    // 1. club_general — all staff + all members (no admin)
    const clubGeneral = await Group.create({
      name: `${club.name} — General`,
      type: GROUP_TYPES.CLUB_GENERAL,
      clubId: club._id,
      members: [...staffIds, ...memberIds],
      createdBy: adminId,
    });

    // 2. club_staff — all staff + admin
    const clubStaff = await Group.create({
      name: `${club.name} — Staff`,
      type: GROUP_TYPES.CLUB_STAFF,
      clubId: club._id,
      members: [adminId, ...staffIds],
      createdBy: adminId,
    });

    // 3. admin_president_private — admin + president
    let adminPresidentPrivate = null;
    if (president) {
      adminPresidentPrivate = await Group.create({
        name: `Admin ↔ ${president.name}`,
        type: GROUP_TYPES.ADMIN_PRESIDENT_PRIVATE,
        clubId: null,
        members: [adminId, president._id],
        createdBy: adminId,
        metadata: {
          clubId: club._id,
          presidentUserId: president._id,
        },
      });

      // Add president to global channels
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_PRESIDENTS, isArchived: false },
        { $addToSet: { members: president._id } }
      );
    }

    // Add ALL staff (including president) to all_staff global channel
    for (const staffUser of staffUsers) {
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_STAFF, isArchived: false },
        { $addToSet: { members: staffUser._id } }
      );
    }

    console.log("[Channels] Club channels created for:", club.name, {
      clubGeneral: clubGeneral._id,
      clubStaff: clubStaff._id,
      adminPresidentPrivate: adminPresidentPrivate?._id,
    });

    return { clubGeneral, clubStaff, adminPresidentPrivate };
  } catch (error) {
    console.error("[Channels] Error creating club channels:", error.message);
  }
};

// ─── onMemberAdded ─────────────────────────────────────────────────────────────
// Called when a member is added to a club or their role changes.
// staffTitle: one of STAFF_TITLES (e.g. "PRESIDENT", "SECRETARY") or null for regular members.
export const onMemberAdded = async (userId, clubId, staffTitle) => {
  try {
    // Always add to club_general
    await Group.findOneAndUpdate(
      { type: GROUP_TYPES.CLUB_GENERAL, clubId, isArchived: false },
      { $addToSet: { members: userId } }
    );

    if (staffTitle) {
      // Staff → also add to club_staff + all_staff
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.CLUB_STAFF, clubId, isArchived: false },
        { $addToSet: { members: userId } }
      );
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_STAFF, isArchived: false },
        { $addToSet: { members: userId } }
      );

      if (staffTitle === "PRESIDENT") {
        // President → also add to all_presidents + create private channel
        await Group.findOneAndUpdate(
          { type: GROUP_TYPES.ALL_PRESIDENTS, isArchived: false },
          { $addToSet: { members: userId } }
        );

        // Create admin_president_private if it doesn't already exist
        const existingPrivate = await Group.findOne({
          type: GROUP_TYPES.ADMIN_PRESIDENT_PRIVATE,
          "metadata.presidentUserId": userId,
          "metadata.clubId": clubId,
          isArchived: false,
        });

        if (!existingPrivate) {
          const admin = await User.findOne({ role: ROLES.ADMIN });
          const user = await User.findById(userId);
          if (admin && user) {
            await Group.create({
              name: `Admin ↔ ${user.name}`,
              type: GROUP_TYPES.ADMIN_PRESIDENT_PRIVATE,
              clubId: null,
              members: [admin._id, userId],
              createdBy: admin._id,
              metadata: { clubId, presidentUserId: userId },
            });
          }
        }
      }
    }

    console.log("[Channels] Member added to channels:", {
      userId: String(userId),
      clubId: String(clubId),
      staffTitle,
    });
  } catch (error) {
    console.error("[Channels] Error adding member to channels:", error.message);
  }
};

// ─── onPresidentChanged ────────────────────────────────────────────────────────
// Called when a club's president changes. newPresidentId can be null (just archive).
export const onPresidentChanged = async (
  clubId,
  oldPresidentId,
  newPresidentId,
  adminId
) => {
  try {
    // Archive the old president's private channel
    if (oldPresidentId) {
      await Group.findOneAndUpdate(
        {
          type: GROUP_TYPES.ADMIN_PRESIDENT_PRIVATE,
          "metadata.presidentUserId": oldPresidentId,
          "metadata.clubId": clubId,
          isArchived: false,
        },
        { isArchived: true }
      );

      // Remove old president from all_presidents
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_PRESIDENTS, isArchived: false },
        { $pull: { members: oldPresidentId } }
      );
    }

    // Create new private channel + add to all_presidents
    if (newPresidentId) {
      const newPresident = await User.findById(newPresidentId);
      if (newPresident) {
        await Group.create({
          name: `Admin ↔ ${newPresident.name}`,
          type: GROUP_TYPES.ADMIN_PRESIDENT_PRIVATE,
          clubId: null,
          members: [adminId, newPresidentId],
          createdBy: adminId,
          metadata: { clubId, presidentUserId: newPresidentId },
        });

        await Group.findOneAndUpdate(
          { type: GROUP_TYPES.ALL_PRESIDENTS, isArchived: false },
          { $addToSet: { members: newPresidentId } }
        );
      }
    }

    console.log("[Channels] President changed:", {
      clubId: String(clubId),
      oldPresidentId: oldPresidentId ? String(oldPresidentId) : null,
      newPresidentId: newPresidentId ? String(newPresidentId) : null,
    });
  } catch (error) {
    console.error("[Channels] Error changing president:", error.message);
  }
};

// ─── onMemberRemoved ───────────────────────────────────────────────────────────
// Called when a member is removed from a club.
export const onMemberRemoved = async (userId, clubId) => {
  try {
    // Remove from all club channels (matched by clubId)
    await Group.updateMany(
      { clubId, members: userId, isArchived: false },
      { $pull: { members: userId } }
    );

    // Look up the user to check their staffTitle
    const user = await User.findById(userId);

    if (user && user.staffTitle === "PRESIDENT") {
      // Archive private channel and remove from all_presidents
      await Group.findOneAndUpdate(
        {
          type: GROUP_TYPES.ADMIN_PRESIDENT_PRIVATE,
          "metadata.presidentUserId": userId,
          "metadata.clubId": clubId,
          isArchived: false,
        },
        { isArchived: true }
      );

      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_PRESIDENTS, isArchived: false },
        { $pull: { members: userId } }
      );
    }

    // If user had any staffTitle → remove from all_staff
    // (users belong to one club only, so removal = no longer staff anywhere)
    if (user && user.staffTitle) {
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_STAFF, isArchived: false },
        { $pull: { members: userId } }
      );
    }

    console.log("[Channels] Member removed from channels:", {
      userId: String(userId),
      clubId: String(clubId),
    });
  } catch (error) {
    console.error("[Channels] Error removing member from channels:", error.message);
  }
};

// ─── onClubDeleted ─────────────────────────────────────────────────────────────
// Called when a club is deleted. Archives all its channels and cleans up global channels.
export const onClubDeleted = async (club) => {
  try {
    // Archive all channels that belong to this club
    await Group.updateMany({ clubId: club._id }, { isArchived: true });

    // Archive any admin_president_private channels for this club
    await Group.updateMany(
      { type: GROUP_TYPES.ADMIN_PRESIDENT_PRIVATE, "metadata.clubId": club._id },
      { isArchived: true }
    );

    // Remove all club staff from global channels
    const staffIds = club.staff || [];
    for (const staffId of staffIds) {
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_STAFF, isArchived: false },
        { $pull: { members: staffId } }
      );
      await Group.findOneAndUpdate(
        { type: GROUP_TYPES.ALL_PRESIDENTS, isArchived: false },
        { $pull: { members: staffId } }
      );
    }

    console.log("[Channels] Club channels archived for:", club.name);
  } catch (error) {
    console.error("[Channels] Error cleaning up club channels:", error.message);
  }
};
