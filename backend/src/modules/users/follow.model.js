const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    // Relationships

    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follow must have a follower"],
      index: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follow must have a following"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });
module.exports = follow;
