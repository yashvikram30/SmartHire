import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },

    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job seeker ID is required"],
    },

    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recruiter ID is required"],
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: [3000, "Cover letter cannot exceed 3000 characters"],
    },

    resumeUsed: {
      fileName: {
        type: String,
        trim: true,
      },
      fileUrl: {
        type: String,
        trim: true,
      },
    },

    screeningAnswers: [
      {
        question: {
          type: String,
          required: [true, "Screening question is required"],
          trim: true,
        },
        answer: {
          type: String,
          required: [true, "Screening answer is required"],
          trim: true,
          maxlength: [1000, "Answer cannot exceed 1000 characters"],
        },
      },
    ],

    status: {
      type: String,
      enum: {
        values: [
          "submitted",
          "reviewed",
          "shortlisted",
          "interviewing",
          "rejected",
          "offered",
          "hired",
          "withdrawn",
        ],
        message: "{VALUE} is not a valid application status",
      },
      default: "submitted",
      index: true,
    },

    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [500, "Status notes cannot exceed 500 characters"],
        },
      },
    ],

    recruiterNotes: [
      {
        note: {
          type: String,
          required: [true, "Note content is required"],
          trim: true,
          maxlength: [1000, "Note cannot exceed 1000 characters"],
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },

    interviewDetails: {
      scheduledAt: {
        type: Date,
      },
      meetingLink: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [1000, "Interview notes cannot exceed 1000 characters"],
      },
    },

    appliedAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Compound indexes for common queries
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ jobSeekerId: 1, status: 1 });
ApplicationSchema.index({ recruiterId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, jobSeekerId: 1 }, { unique: true }); // Prevent duplicate applications
ApplicationSchema.index({ status: 1, appliedAt: -1 });

// Virtual to check if application is in active status
ApplicationSchema.virtual("isActive").get(function () {
  return !["rejected", "hired", "withdrawn"].includes(this.status);
});

// Virtual to check if application can be withdrawn
ApplicationSchema.virtual("canWithdraw").get(function () {
  return ["submitted", "reviewed"].includes(this.status);
});

// Virtual to check if interview is scheduled
ApplicationSchema.virtual("hasInterview").get(function () {
  return !!this.interviewDetails?.scheduledAt;
});

// Virtual to get days since application
ApplicationSchema.virtual("daysSinceApplied").get(function () {
  const diffTime = Math.abs(new Date() - this.appliedAt);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Method to update status
ApplicationSchema.methods.updateStatus = async function (
  newStatus,
  userId,
  notes = "",
) {
  // Validate status transition
  const validTransitions = {
    submitted: ["reviewed", "rejected", "withdrawn"],
    reviewed: ["shortlisted", "rejected", "withdrawn"],
    shortlisted: ["interviewing", "rejected", "withdrawn"],
    interviewing: ["offered", "rejected", "withdrawn"],
    rejected: [],
    offered: ["hired", "rejected"],
    hired: [],
    withdrawn: [],
  };

  if (!validTransitions[this.status]?.includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  // Update status
  this.status = newStatus;
  this.lastUpdated = new Date();

  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    changedAt: new Date(),
    notes,
  });

  return this.save();
};

// Method to add recruiter note
ApplicationSchema.methods.addRecruiterNote = async function (note, userId) {
  if (!note || note.trim() === "") {
    throw new Error("Note content is required");
  }

  this.recruiterNotes.push({
    note: note.trim(),
    createdBy: userId,
    createdAt: new Date(),
  });

  this.lastUpdated = new Date();

  return this.save();
};

// Method to schedule interview
ApplicationSchema.methods.scheduleInterview = async function (
  scheduledAt,
  meetingLink,
  notes = "",
) {
  if (!scheduledAt) {
    throw new Error("Interview date and time is required");
  }

  if (new Date(scheduledAt) <= new Date()) {
    throw new Error("Interview must be scheduled for a future date");
  }

  this.interviewDetails = {
    scheduledAt: new Date(scheduledAt),
    meetingLink: meetingLink || "",
    notes: notes || "",
  };

  // Update status to interviewing if not already
  if (this.status === "shortlisted") {
    this.status = "interviewing";
  }

  this.lastUpdated = new Date();

  return this.save();
};

// Method to rate application
ApplicationSchema.methods.rateApplication = async function (rating) {
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  this.rating = Math.floor(rating); // Ensure integer
  this.lastUpdated = new Date();

  return this.save();
};

// Method to withdraw application (by job seeker)
ApplicationSchema.methods.withdraw = async function (userId) {
  if (!this.canWithdraw) {
    throw new Error(
      "Application can only be withdrawn if status is submitted or reviewed",
    );
  }

  return this.updateStatus("withdrawn", userId, "Withdrawn by applicant");
};

// Method to reject application
ApplicationSchema.methods.reject = async function (userId, reason = "") {
  if (["hired", "withdrawn"].includes(this.status)) {
    throw new Error(
      "Cannot reject an application that is already hired or withdrawn",
    );
  }

  return this.updateStatus("rejected", userId, reason);
};

// Method to shortlist application
ApplicationSchema.methods.shortlist = async function (userId, notes = "") {
  if (this.status !== "reviewed") {
    throw new Error("Only reviewed applications can be shortlisted");
  }

  return this.updateStatus("shortlisted", userId, notes);
};

// Method to make offer
ApplicationSchema.methods.makeOffer = async function (userId, notes = "") {
  if (this.status !== "interviewing") {
    throw new Error("Only interviewing applications can receive offers");
  }

  return this.updateStatus("offered", userId, notes);
};

// Method to hire
ApplicationSchema.methods.hire = async function (userId, notes = "") {
  if (this.status !== "offered") {
    throw new Error("Only offered applications can be hired");
  }

  return this.updateStatus("hired", userId, notes);
};

// Static method to get applications by job
ApplicationSchema.statics.getByJob = function (jobId, filters = {}) {
  return this.find({ jobId, ...filters })
    .populate("jobSeekerId", "name email")
    .populate("recruiterId", "name email")
    .sort({ appliedAt: -1 });
};

// Static method to get applications by job seeker
ApplicationSchema.statics.getByJobSeeker = function (
  jobSeekerId,
  filters = {},
) {
  return this.find({ jobSeekerId, ...filters })
    .populate("jobId", "title employmentType location")
    .populate("recruiterId", "name email")
    .sort({ appliedAt: -1 });
};

// Static method to get applications by recruiter
ApplicationSchema.statics.getByRecruiter = function (
  recruiterId,
  filters = {},
) {
  return this.find({ recruiterId, ...filters })
    .populate("jobSeekerId", "name email")
    .populate("jobId", "title")
    .sort({ appliedAt: -1 });
};

// Static method to check if user already applied
ApplicationSchema.statics.hasApplied = async function (jobId, jobSeekerId) {
  const application = await this.findOne({ jobId, jobSeekerId });
  return !!application;
};

// Static method to get application statistics for a job
ApplicationSchema.statics.getJobStats = async function (jobId) {
  const stats = await this.aggregate([
    { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const formattedStats = {
    total: 0,
    submitted: 0,
    reviewed: 0,
    shortlisted: 0,
    interviewing: 0,
    rejected: 0,
    offered: 0,
    hired: 0,
    withdrawn: 0,
  };

  stats.forEach((stat) => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });

  return formattedStats;
};

// Pre-save middleware to update lastUpdated
ApplicationSchema.pre("save", function () {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }

  // Add initial status to history if new application
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.jobSeekerId,
      changedAt: this.appliedAt,
      notes: "Application submitted",
    });
  }
});

// Ensure virtuals are included in JSON output
ApplicationSchema.set("toJSON", { virtuals: true });
ApplicationSchema.set("toObject", { virtuals: true });

export default mongoose.model("Application", ApplicationSchema);
