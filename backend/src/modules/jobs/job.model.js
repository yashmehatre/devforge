const mongoose = require("mongoose");
const slugify = require("slugify");

const salarySchema = new mongoose.Schema(
  {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: "USD" },
    period: {
      type: String,
      enum: ["hourly", "monthly", "yearly"],
      default: "yearly",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const jobSchema = new mongoose.Schema(
  {
    // Core Content

    title: {
      type: String,
      required: [true, "Job must have a title"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Job must have a description"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    responsibilities: {
      type: [String],
      required: [true, "Job must have responsibilities"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one responsibility is required",
      },
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },

    // Company

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job must belong to a company"],
      index: true,
    },

    // Job Details

    employmentType: {
      type: String,
      enum: ["full-tine", "part-time", "internship", "freelance"],
      default: "full-time",
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead"],
      default: "mid",
      index: true,
    },
    educationRequirement: {
      type: String,
      enum: ["not-required", "bachelors", "masters", "phd"],
      default: "not-required",
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    salary: {
      type: salarySchema,
      default: () => ({}),
    },

    // Location

    location: {
      type: String,
      trim: true,
      default: "",
    },
    isRemote: {
      type: Boolean,
      default: false,
    },

    // Status & Visibility

    status: {
      type: String,
      enum: ["draft", "published", "closed", "archived"],
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
    },
    closesAt: {
      type: Date,
    },

    // Engagement

    applicationsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes

jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ skills: 1, status: 1 });
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ experienceLevel: 1, status: 1 });
jobSchema.index({ employmentType: 1, status: 1 });
jobSchema.index({ isRemote: 1, status: 1 });
jobSchema.index({ isFeatured: 1, status: 1 });
jobSchema.index({ closesAt: 1 }, { expireAfterSeconds: 0 });
jobSchema.index(
  { title: "text", description: "text", skills: "text", location: "text" },
  { weights: { title: 10, skills: 8, description: 5, location: 3 } },
);

// Pre-save Middleware

jobSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
    });

    const existingJob = await mongoose.model("Job").findOne({
      slug: baseSlug,
      _id: { $ne: this._id },
    });

    if (existingJob) {
      const suffix = Math.random().toString(36).substring(2, 7);
      this.slug = `${baseSlug}-${suffix}`;
    } else {
      this.slug = baseSlug;
    }
  }
  next();
});

jobSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published") {
    if (!this.publishedAt) {
      this.publishedAt = Date.now();
    }
  }
  next();
});

// Custom Validation

jobSchema.pre("validate", function (next) {
  if (!this.isRemote && !this.location) {
    this.invalidate("location", "Location is required for non-remote jobs");
  }
  next();
});

// Virtual Fields

jobSchema.virtual("isOpen").get(function () {
  return (
    this.status === "published" &&
    this.isActive &&
    (!this.closesAt || this.closesAt > Date.now())
  );
});

// Query Middleware

jobSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
