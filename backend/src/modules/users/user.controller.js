const UserService = require("./user.service");
const catchAsync = require("../../utils/catchAsync");

const uploadAvatar = catchAsync(async (req, res, next) => {
  const updatedUser = await UserService.uploadAvatar(req.user._id, req.file);

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { user } = await UserService.getMe(userId);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const updateData = req.body;
  const { user } = await UserService.updateMe(userId, updateData);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  await UserService.deleteMe(userId);
  res.status(204).json({
    status: "success",
  });
});

const getProfile = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  const { user } = await UserService.getProfile(username);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const follow = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;
  const followingId = req.params.id;
  await UserService.follow(followerId, followingId);
  res.status(200).json({
    status: "success",
    message: "User followed successfully",
  });
});

const unfollow = catchAsync(async (req, res, next) => {
  const followerId = req.user._id;
  const followingId = req.params.id;
  await UserService.unfollow(followerId, followingId);
  res.status(200).json({
    status: "success",
    message: "User unfollowed successfully",
  });
});

const getFollowers = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { page, limit } = req.query;
  const { followers } = await UserService.getFollowers(userId, page, limit);
  res.status(200).json({
    status: "success",
    data: { followers },
  });
});

const getFollowing = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const { page, limit } = req.query;
  const { following } = await UserService.getFollowing(userId, page, limit);
  res.status(200).json({
    status: "success",
    data: { following },
  });
});

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getProfile,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  uploadAvatar,
};
