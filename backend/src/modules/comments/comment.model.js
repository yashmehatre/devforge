const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // Core Content

    body: {
      type: String,
      required: [true, "Comment must have a body"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    // Polymorphic Relationship

    onModel: {
      type: String,
      required: [true, "Comment must belong to a parent"],
      enum: ["Article", "Question", "Answer", "Comment"],
    },
    onId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Comment must have a parent ID"],
      refPath: "onModel",
      index: true,
    },

    // Author

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment must have an author"],
      index: true,
    },

    // Engagement

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },

    // State

    isEdited: {
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

commentSchema.index({ onId: 1, createdAt: 1 });
commentSchema.index({ onId: 1, onModel: 1 });
commentSchema.index({ author: 1, createdAt: -1 });

// Pre-save Middleware

commentSchema.pre("save", function (next) {
  if (!this.isNew("body") && this.isModified("body")) {
    this.isEdited = true;
  }
  next();
});

// Virtual Fields

commentSchema.virtual("isLikedBy").get(function () {
  return function (userId) {
    return this.likes.map((id) => id.toString()).includes(userId.toString());
  }.bind(this);
});

// Query Middleware

commentSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
