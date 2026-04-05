import mongoose from "mongoose";

const SavedJobSchema = new mongoose.Schema(
  {
    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job seeker ID is required"],
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
      index: true,
    },

    savedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound unique index to prevent duplicate saves
SavedJobSchema.index({ jobSeekerId: 1, jobId: 1 }, { unique: true });

// Compound index for sorting saved jobs by date
SavedJobSchema.index({ jobSeekerId: 1, savedAt: -1 });

// Virtual to check if saved job is still active
SavedJobSchema.virtual("isJobActive", {
  ref: "Job",
  localField: "jobId",
  foreignField: "_id",
  justOne: true,
});

// Virtual to calculate days since saved
SavedJobSchema.virtual("daysSinceSaved").get(function () {
  const diffTime = Math.abs(new Date() - this.savedAt);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get all saved jobs for a user
SavedJobSchema.statics.getUserSavedJobs = function (jobSeekerId, filters = {}) {
  return this.find({ jobSeekerId, ...filters })
    .populate({
      path: "jobId",
      select: "title description employmentType location salary status companyId postedAt applicationDeadline",
      populate: {
        path: "companyId",
        select: "companyName companyLogo industry location",
      },
    })
    .sort({ savedAt: -1 });
};

// Static method to check if job is already saved
SavedJobSchema.statics.isSaved = async function (jobSeekerId, jobId) {
  const saved = await this.findOne({ jobSeekerId, jobId });
  return !!saved;
};

// Static method to get saved job count for a user
SavedJobSchema.statics.getSavedCount = function (jobSeekerId) {
  return this.countDocuments({ jobSeekerId });
};

// Static method to get users who saved a specific job
SavedJobSchema.statics.getUsersWhoSaved = function (jobId) {
  return this.find({ jobId })
    .populate("jobSeekerId", "name email")
    .sort({ savedAt: -1 });
};

// Static method to get saved job statistics for a user
SavedJobSchema.statics.getUserStats = async function (jobSeekerId) {
  const total = await this.countDocuments({ jobSeekerId });

  // Get saved jobs with job details
  const savedJobs = await this.find({ jobSeekerId }).populate(
    "jobId",
    "status applicationDeadline"
  );

  let active = 0;
  let expired = 0;
  let closed = 0;

  savedJobs.forEach((saved) => {
    if (saved.jobId) {
      if (saved.jobId.status === "active") {
        // Check if deadline has passed
        if (
          saved.jobId.applicationDeadline &&
          new Date() > saved.jobId.applicationDeadline
        ) {
          expired++;
        } else {
          active++;
        }
      } else if (["closed", "filled"].includes(saved.jobId.status)) {
        closed++;
      }
    }
  });

  return {
    total,
    active,
    expired,
    closed,
  };
};

// Static method to remove saved jobs for inactive/deleted jobs
SavedJobSchema.statics.cleanupInvalidSavedJobs = async function () {
  const Job = mongoose.model("Job");

  // Find all saved jobs
  const allSavedJobs = await this.find().select("jobId");

  let removed = 0;

  for (const savedJob of allSavedJobs) {
    // Check if job still exists
    const job = await Job.findById(savedJob.jobId);

    if (!job) {
      // Remove saved job if job doesn't exist
      await this.deleteOne({ _id: savedJob._id });
      removed++;
    }
  }

  return { removed };
};

// Instance method to unsave/remove
SavedJobSchema.methods.unsave = async function () {
  return this.deleteOne();
};

// Pre-save middleware to validate job exists and is active
SavedJobSchema.pre("save", async function () {
  if (this.isNew) {
    const Job = mongoose.model("Job");
    const job = await Job.findById(this.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    // Optional: Only allow saving active jobs
    // Uncomment if you want to restrict saving to active jobs only
    // if (job.status !== "active") {
    //   throw new Error("Can only save active jobs");
    // }
  }
});

// Pre-deleteOne middleware to handle cleanup
SavedJobSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // Optional: Add any cleanup logic here
    // For example, notify user that saved job was removed
  }
);

// Ensure virtuals are included in JSON output
SavedJobSchema.set("toJSON", { virtuals: true });
SavedJobSchema.set("toObject", { virtuals: true });

export default mongoose.model("SavedJob", SavedJobSchema);