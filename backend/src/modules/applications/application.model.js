const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "submitted",
        "reviewed",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    // Relationships

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Application must have an applicant"],
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Application must belong to a jon"],
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Application must belong to a company"],
      index: true,
    },

    // Application Content

    resume: {
      type: String,
      required: [true, "Resume is required"],
      select: false,
    },
    resumeKey: {
      type: String,
      select: false,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
      default: "",
    },

    // Status Tracking

    status: {
      type: String,
      enum: [
        "submitted",
        "reviewed",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "submitted",
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    // Company Management

    seenByCompany: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      maxlength: [1000, "Note cannot exceed 1000 characters"],
      default: "",
      select: false,
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

applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ company: 1, status: 1 });
(applicationSchema.index({ job: 1, status: 1 }),
  applicationSchema.index({ applicant: 1, job: 1 }, { unique: true }));
applicationSchema.index({ createdAt: -1 });

// Pre-save Middleware

applicationSchema.pre("save", function () {
  if (this.isNew) {
    this.statusHistory.push({
      status: "submitted",
      changedAt: Date.now(),
      changedBy: this.applicant,
    });
  }
});

applicationSchema.pre("save", function () {
  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: Date.now(),
      changedBy: this.changedBy || this.applicant,
    });
  }
});

// Virtual Fields

applicationSchema.virtual("isWithdrawn").get(function () {
  return this.status === "withdrawn";
});

applicationSchema.virtual("isPending").get(function () {
  return ["submitted", "reviewed", "shortlisted", "interview"].includes(
    this.status,
  );
});

// Query Middleware

applicationSchema.pre(/^find/, function () {
  this.find({ isActive: { $ne: false } });
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
