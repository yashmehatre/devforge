const User = require("./user.model");
const Follow = require("./follow.model");
const AppError = require("../../utils/AppError");

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("No user found", 404);
  return { user };
};

const updateMe = async (userId, updateData) => {
  const allowedFields = [
    "fullName",
    "username",
    "bio",
    "about",
    "location",
    "skills",
    "experience",
    "education",
    "socialLinks",
    "isOpenToWork",
    "avatar",
  ];
  const filteredData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError("User not found", 404);
  return { user };
};

const deleteMe = async (userId) => {
  await User.findByIdAndUpdate(userId, { isActive: false });
};

const getProfile = async (username) => {
  const user = await User.findOne({ username }).select(
    "-password -refreshToken -passwordResetToken -emailVerificationToken -loginAttempts -lockUntil",
  );
  if (!user) throw new AppError("No user found", 404);
  return { user };
};

const follow = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString())
    throw new AppError("You cannot follow yourself", 400);
  try {
    await Follow.create({
      follower: followerId,
      following: followingId,
    });
    await User.findByIdAndUpdate(followerId, {
      $inc: { totalFollowing: 1 },
    });
    await User.findByIdAndUpdate(followingId, { $inc: { totalFollowers: 1 } });
  } catch (err) {
    if (err.code === 11000)
      throw new AppError("Already following this user", 400);
  }
};

const unfollow = async (followerId, followingId) => {
  const result = await Follow.deleteOne({
    follower: followerId,
    following: followingId,
  });
  if (result.deletedCount !== 1)
    throw new AppError("You are not following this user", 400);
  await User.findByIdAndUpdate(followerId, {
    $inc: { totalFollowing: -1 },
  });
  await User.findByIdAndUpdate(followingId, {
    $inc: { totalFollowers: -1 },
  });
};

const getFollowers = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const followers = await Follow.find({ following: userId })
    .populate("follower", "username fullName avatar bio")
    .limit(limit)
    .skip(skip);
  return { followers };
};

const getFollowing = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const following = await Follow.find({ follower: userId })
    .populate("following", "username fullName avatar bio")
    .limit(limit)
    .skip(skip);
  return { following };
};

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getProfile,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
};
