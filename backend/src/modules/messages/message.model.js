const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Relationships

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Message must belong to a conversation"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message must have a sender"],
      index: true,
    },

    // Content

    body: {
      type: String,
      required: [true, "Message must have a body"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    // Delivery State

    deliveredTo: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // State

    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// Pre-save Middleware

messageSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("body")) {
    this.isEdited = true;
  }
  next();
});

// Virtuals Fields

messageSchema.virtuals("isReadBy").get(function () {
  return function (userId) {
    return this.readBy.map((id) => id.toString()).includes(userId.toString());
  }.bind(this);
});

messageSchema.virtuals("displayBody").get(function () {
  return this.isDeleted ? "This message was deleted" : this.body;
});

// Query Middleware

messageSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
