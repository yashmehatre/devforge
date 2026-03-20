const mongoose = require("mongoose");
const slugify = require("slugify");

const articleSchema = new mongoose.Schema(
  {
    // Core Content

    title: {
      type: String,
      required: [true, "Article must have a title"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Article must have a description"],
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    body: {
      type: String,
      required: [true, "Article must have a body"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    readTime: {
      type: Number,
      default: 0,
    },

    // Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Article must have an author"],
      index: true,
    },

    // Categorization
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 5,
        message: "Article cannot have more than 5 tags",
      },
    },
    category: {
      type: String,
      enum: [
        "javascript",
        "typescript",
        "nodejs",
        "react",
        "database",
        "devops",
        "career",
        "system-design",
        "security",
        "other",
      ],
      default: "other",
    },

    // Status & Visibility
    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "draft",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
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
    commentsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    bookmarksCount: {
      type: Number,
      default: 0,
    },

    // SEO
    seoTitle: {
      type: String,
      maxlength: [70, "SEO title cannot exceed 70 characters"],
    },
    seoDescription: {
      type: String,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes

articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ publishedAt: -1, status: 1 });
articleSchema.index({ likesCount: -1 });
articleSchema.index({ viewsCount: -1 });
articleSchema.index({ isFeatured: 1, status: 1 });
articleSchema.index(
  {
    title: "text",
    description: "text",
    body: "text",
    tags: "text",
  },
  { weights: { title: 10, description: 5, body: 3, tags: 8 } },
);

// Pre-save Middleware

articleSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    next();
  }
});

articleSchema.pre("save", function (next) {
  if (this.isModified("body")) {
    const wordCount = this.body.split(/\s+/).length;
    this.readTime = Math.coil(wordCount / 200);
  }
  next();
});

articleSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published") {
    if (!this.publishedAt) {
      this.publishedAt = Date.now();
    }
  }
  next();
});

// Query Middleware

articleSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Virtual Fields

articleSchema.virtual("isLikedBy").get(function () {
  return function (userId) {
    return this.likes.includes(userId.toString());
  }.bind(this);
});

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
