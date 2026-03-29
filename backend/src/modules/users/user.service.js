const User = require("./user.model");
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
    "-password -refreshToken -passwordResetToken - emailVerificationToken -loginAttempts -lockUntil",
  );
  if (!user) throw new AppError("No user found", 404);
  return { user };
};

module.exports = { getMe, updateMe, deleteMe, getProfile };
