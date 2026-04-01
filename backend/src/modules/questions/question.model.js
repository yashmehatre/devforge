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

const questionSchema = new mongoose.Schema(
  {
    // Core Content

    title: {
      type: String,
      required: [true, "Question must have a title"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Question must have a body"],
      trim: true,
      minlength: [20, "Body must be at least 20 characters"],
    },

    // Author

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Question must have an author"],
      index: true,
    },

    // Categorization

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 5,
        message: "Cannot have more than 5 tags",
      },
    },

    // Solution State

    isSolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
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

    answersCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
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

questionSchema.index({ tags: 1 });
questionSchema.index({ isSolved: 1, createdAt: -1 });
questionSchema.index({ voteScore: -1 });
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index(
  { title: "text", body: "text", tags: "text" },
  { weights: { title: 10, tags: 8, body: 3 } },
);

// Pre-save Middleware

questionSchema.pre("save", function () {
  if (this.isModified("acceptedAnswer")) {
    this.isSolved = !!this.acceptedAnswer;
  }
});

// Virtual Fields

questionSchema.virtual("hasVoted").get(function () {
  return function (userId) {
    return this.votes.find(
      (vote) => vote.user.toString() === userId.toString(),
    );
  }.bind(this);
});

// Query Middleware

questionSchema.pre(/^find/, function () {
  this.find({ isActive: { $ne: false } });
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
