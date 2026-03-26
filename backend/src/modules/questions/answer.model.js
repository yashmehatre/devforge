const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
  },
  { _id: false },
);

const answerSchema = new mongoose.Schema(
  {
    // Core Content

    body: {
      type: String,
      required: [true, "Answer must have a body"],
      minlength: [10, "Answer must be at least 10 characters"],
    },

    // Relationships

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Answer must have an author"],
      index: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Answer must belong to a question"],
      index: true,
    },

    // State

    isAccepted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },

    // Voting

    votes: {
      type: [voteSchema],
      default: [],
    },
    voteScore: {
      type: Number,
      default: 0,
    },

    // Engagement

    commentsCount: {
      type: Number,
      default: 0,
    },

    // Account Management

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

answerSchema.index({ question: 1, voteScore: -1 });
answerSchema.index({ question: 1, isAccepted: -1 });
answerSchema.index({ author: 1, createdAt: -1 });

// Pre-save Middleware

answerSchema.pre("save", function (next) {
  if (!this.isNew("body") && this.isModified("body")) {
    this.isEdited = true;
  }
  next();
});

// Virtual Fields

answerSchema.virtuals("hasVoted").get(function () {
  return function (userId) {
    return this.votes.find(
      (vote) => vote.user.toString() === userId.toString(),
    );
  }.bind(this);
});

// Query Middleware

answerSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Answer = mongoose.model("Answer", answerSchema);
module.exports = Answer;
