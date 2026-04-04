const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Conversation must have exactly 2 participants",
      },
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },

    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes

conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ participants: 1 }, { unique: false });

// Static Methods

conversationSchema.statics.findOrCreate = async function (userId1, userId2) {
  const existing = await this.findOne({
    participants: { $all: [userId1, userId2] },
  });

  if (existing) return existing;

  return this.create({
    participants: [userId1, userId2],
    unreadCounts: {
      [userId1.toString()]: 0,
      [userId2.toString()]: 0,
    },
  });
};

// Instance Methods

conversationSchema.methods.incrementUnread = async function (excludeUserId) {
  this.participants.forEach((participantId) => {
    if (participantId.toString() !== excludeUserId.toString()) {
      const current = this.unreadCount.get(participantId.toString()) || 0;
      this.unreadCount.set(participantId.toString(), current + 1);
    }
  });
  return this.save();
};

conversationSchema.methods.resetUnread = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Query Middleware

conversationSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
