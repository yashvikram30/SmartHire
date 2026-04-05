import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recruiter ID is required"],
      index: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruiterProfile",
      required: [true, "Company ID is required"],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Job title cannot exceed 200 characters"],
      index: true,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [5000, "Job description cannot exceed 5000 characters"],
    },

    requiredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],

    qualifications: [
      {
        type: String,
        trim: true,
        maxlength: [500, "Qualification cannot exceed 500 characters"],
      },
    ],

    experienceLevel: {
      type: String,
      enum: {
        values: ["entry", "mid", "senior", "lead", "executive"],
        message: "{VALUE} is not a valid experience level",
      },
      required: [true, "Experience level is required"],
      index: true,
    },

    experienceYears: {
      min: {
        type: Number,
        min: [0, "Minimum experience cannot be negative"],
        default: 0,
      },
      max: {
        type: Number,
        min: [0, "Maximum experience cannot be negative"],
        validate: {
          validator: function (value) {
            return !this.experienceYears.min || value >= this.experienceYears.min;
          },
          message: "Maximum experience must be greater than or equal to minimum experience",
        },
      },
    },

    education: {
      minDegree: {
        type: String,
        enum: {
          values: ["high-school", "associate", "bachelor", "master", "doctorate"],
          message: "{VALUE} is not a valid degree level",
        },
      },
      preferredFields: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    salary: {
      min: {
        type: Number,
        min: [0, "Minimum salary cannot be negative"],
      },
      max: {
        type: Number,
        min: [0, "Maximum salary cannot be negative"],
        validate: {
          validator: function (value) {
            return !this.salary.min || value >= this.salary.min;
          },
          message: "Maximum salary must be greater than or equal to minimum salary",
        },
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
        trim: true,
      },
      isVisible: {
        type: Boolean,
        default: true,
      },
    },

    location: {
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      isRemote: {
        type: Boolean,
        default: false,
        index: true,
      },
      remoteType: {
        type: String,
        enum: {
          values: ["fully-remote", "hybrid", "onsite"],
          message: "{VALUE} is not a valid remote type",
        },
      },
    },

    employmentType: {
      type: String,
      enum: {
        values: ["full-time", "part-time", "contract", "internship"],
        message: "{VALUE} is not a valid employment type",
      },
      required: [true, "Employment type is required"],
      index: true,
    },

    numberOfOpenings: {
      type: Number,
      default: 1,
      min: [1, "Number of openings must be at least 1"],
    },

    applicationDeadline: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: "Application deadline must be in the future",
      },
    },

    screeningQuestions: [
      {
        question: {
          type: String,
          required: [true, "Screening question is required"],
          trim: true,
          maxlength: [500, "Question cannot exceed 500 characters"],
        },
        isRequired: {
          type: Boolean,
          default: false,
        },
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["draft", "pending-approval", "active", "closed", "filled", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "draft",
      index: true,
    },

    moderationNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Moderation notes cannot exceed 1000 characters"],
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    moderatedAt: {
      type: Date,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    applicationCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    postedAt: {
      type: Date,
    },

    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

// Compound indexes for common queries
JobSchema.index({ status: 1, postedAt: -1 });
JobSchema.index({ recruiterId: 1, status: 1 });
JobSchema.index({ companyId: 1, status: 1 });
JobSchema.index({ category: 1, status: 1 });
JobSchema.index({ "location.city": 1, "location.country": 1 });
JobSchema.index({ experienceLevel: 1, employmentType: 1 });
JobSchema.index({ requiredSkills: 1 });
JobSchema.index({ isFeatured: 1, status: 1, postedAt: -1 });

// Text index for search functionality
JobSchema.index({ title: "text", description: "text" });

// Virtual for full location
JobSchema.virtual("fullLocation").get(function () {
  const parts = [];

  if (this.location?.city) parts.push(this.location.city);
  if (this.location?.state) parts.push(this.location.state);
  if (this.location?.country) parts.push(this.location.country);

  return parts.length > 0 ? parts.join(", ") : null;
});

// Virtual for salary range display
JobSchema.virtual("salaryRange").get(function () {
  if (!this.salary?.min && !this.salary?.max) return null;

  const currency = this.salary.currency || "USD";

  if (this.salary.min && this.salary.max) {
    return `${currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  } else if (this.salary.min) {
    return `${currency} ${this.salary.min.toLocaleString()}+`;
  } else if (this.salary.max) {
    return `Up to ${currency} ${this.salary.max.toLocaleString()}`;
  }

  return null;
});

// Virtual to check if job is expired
JobSchema.virtual("isExpired").get(function () {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

// Virtual to check if job is accepting applications
JobSchema.virtual("isAcceptingApplications").get(function () {
  return (
    this.status === "active" &&
    !this.isExpired &&
    this.applicationCount < this.numberOfOpenings * 100 // Safety limit
  );
});

// Method to increment views
JobSchema.methods.incrementViews = async function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to increment application count
JobSchema.methods.incrementApplicationCount = async function () {
  this.applicationCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to submit job for approval
JobSchema.methods.submitForApproval = async function () {
  if (this.status !== "draft") {
    throw new Error("Only draft jobs can be submitted for approval");
  }

  this.status = "pending-approval";
  return this.save();
};

// Method to approve job (admin action)
JobSchema.methods.approve = async function (adminId) {
  if (this.status !== "pending-approval") {
    throw new Error("Only pending jobs can be approved");
  }

  this.status = "active";
  this.postedAt = new Date();
  this.moderatedBy = adminId;
  this.moderatedAt = new Date();

  return this.save();
};

// Method to reject job (admin action)
JobSchema.methods.reject = async function (adminId, notes) {
  if (this.status !== "pending-approval") {
    throw new Error("Only pending jobs can be rejected");
  }

  this.status = "rejected";
  this.moderationNotes = notes;
  this.moderatedBy = adminId;
  this.moderatedAt = new Date();

  return this.save();
};

// Method to close job
JobSchema.methods.closeJob = async function (reason = "closed") {
  if (!["active", "pending-approval"].includes(this.status)) {
    throw new Error("Only active or pending jobs can be closed");
  }

  this.status = reason === "filled" ? "filled" : "closed";
  this.closedAt = new Date();

  return this.save();
};

// Method to mark job as filled
JobSchema.methods.markAsFilled = async function () {
  return this.closeJob("filled");
};

// Method to reactivate job
JobSchema.methods.reactivate = async function () {
  if (!["closed", "filled"].includes(this.status)) {
    throw new Error("Only closed or filled jobs can be reactivated");
  }

  this.status = "active";
  this.closedAt = null;

  return this.save();
};

// Method to toggle featured status
JobSchema.methods.toggleFeatured = async function () {
  this.isFeatured = !this.isFeatured;
  return this.save();
};

// Static method to get active jobs
JobSchema.statics.getActiveJobs = function (filter = {}) {
  return this.find({ status: "active", ...filter })
    .populate("recruiterId", "name email")
    .populate("companyId", "companyName companyLogo industry location")
    .populate("requiredSkills", "name")
    .populate("category", "name")
    .sort({ isFeatured: -1, postedAt: -1 });
};

// Static method to get jobs pending approval
JobSchema.statics.getPendingJobs = function () {
  return this.find({ status: "pending-approval" })
    .populate("recruiterId", "name email")
    .populate("companyId", "companyName companyLogo")
    .sort({ createdAt: -1 });
};

// Static method to search jobs
JobSchema.statics.searchJobs = function (searchTerm, filters = {}) {
  const query = {
    status: "active",
    $text: { $search: searchTerm },
    ...filters,
  };

  return this.find(query)
    .populate("recruiterId", "name email")
    .populate("companyId", "companyName companyLogo industry")
    .populate("requiredSkills", "name")
    .populate("category", "name")
    .sort({ score: { $meta: "textScore" }, isFeatured: -1 });
};

// Pre-save middleware to auto-set postedAt when status changes to active
JobSchema.pre("save", function () {
  // Set postedAt when job becomes active
  if (this.isModified("status") && this.status === "active" && !this.postedAt) {
    this.postedAt = new Date();
  }

  // Set closedAt when job is closed or filled
  if (
    this.isModified("status") &&
    ["closed", "filled"].includes(this.status) &&
    !this.closedAt
  ) {
    this.closedAt = new Date();
  }

  // Validate remote type is set if isRemote is true
  if (this.location?.isRemote && !this.location?.remoteType) {
    throw new Error("Remote type must be specified for remote jobs");
  }
});

// Ensure virtuals are included in JSON output
JobSchema.set("toJSON", { virtuals: true });
JobSchema.set("toObject", { virtuals: true });

export default mongoose.model("Job", JobSchema);