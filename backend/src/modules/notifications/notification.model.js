const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Relationships

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must have a recipient"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification Type

    type: {
      type: String,
      required: [true, "Notification must have a type"],
      enum: [
        "like",
        "comment",
        "follow",
        "asnwer",
        "mention",
        "application",
        "application_update",
        "job_match",
        "system",
      ],
      index: true,
    },

    // Polymorphic Reference

    onModel: {
      type: String,
      enum: ["Article", "Question", "Answer", "Comment", "Job", "Application"],
    },
    onId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel",
    },

    // State

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// indexes

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isDelivered: 1 });

// Static Methods

notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true },
  );
};

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
