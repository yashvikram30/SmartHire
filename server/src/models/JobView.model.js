import mongoose from "mongoose";

const JobViewSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },

    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    viewedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    ipAddress: {
      type: String,
      trim: true,
      maxlength: [45, "IP address cannot exceed 45 characters"], // IPv6 max length
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Compound indexes for analytics and querying
JobViewSchema.index({ jobId: 1, viewedAt: -1 });
JobViewSchema.index({ jobSeekerId: 1, viewedAt: -1 });
JobViewSchema.index({ jobId: 1, jobSeekerId: 1 });
JobViewSchema.index({ viewedAt: -1 }); // For time-based queries

// TTL index to auto-delete old views after 90 days (optional)
// Uncomment if you want to automatically remove old view records
// JobViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Virtual to check if view is from authenticated user
JobViewSchema.virtual("isAuthenticatedView").get(function () {
  return !!this.jobSeekerId;
});

// Virtual to calculate time since view
JobViewSchema.virtual("timeSinceView").get(function () {
  const diffMs = new Date() - this.viewedAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays > 0) return `${diffDays} day(s) ago`;
  if (diffHours > 0) return `${diffHours} hour(s) ago`;
  if (diffMins > 0) return `${diffMins} minute(s) ago`;
  return "Just now";
});

// Static method to record a job view
JobViewSchema.statics.recordView = async function (
  jobId,
  userId = null,
  ipAddress = null,
  userAgent = null,
) {
  try {
    const view = await this.create({
      jobId,
      jobSeekerId: userId,
      ipAddress,
      userAgent,
    });

    // Increment view count on the Job model
    const Job = mongoose.model("Job");
    await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });

    return view;
  } catch (error) {
    throw new Error(`Failed to record view: ${error.message}`);
  }
};

// Static method to get total views for a job
JobViewSchema.statics.getJobViewCount = function (jobId) {
  return this.countDocuments({ jobId });
};

// Static method to get unique viewers for a job (authenticated only)
JobViewSchema.statics.getUniqueViewers = async function (jobId) {
  const uniqueViewers = await this.distinct("jobSeekerId", {
    jobId,
    jobSeekerId: { $ne: null },
  });
  return uniqueViewers.length;
};

// Static method to get views by date range
JobViewSchema.statics.getViewsByDateRange = function (
  jobId,
  startDate,
  endDate,
) {
  return this.find({
    jobId,
    viewedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ viewedAt: -1 });
};

// Static method to get view analytics for a job
JobViewSchema.statics.getJobAnalytics = async function (jobId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = await this.aggregate([
    {
      $match: {
        jobId: new mongoose.Types.ObjectId(jobId),
        viewedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" },
        },
        totalViews: { $sum: 1 },
        authenticatedViews: {
          $sum: { $cond: [{ $ne: ["$jobSeekerId", null] }, 1, 0] },
        },
        anonymousViews: {
          $sum: { $cond: [{ $eq: ["$jobSeekerId", null] }, 1, 0] },
        },
        uniqueViewers: {
          $addToSet: "$jobSeekerId",
        },
      },
    },
    {
      $project: {
        date: "$_id",
        totalViews: 1,
        authenticatedViews: 1,
        anonymousViews: 1,
        uniqueViewers: { $size: "$uniqueViewers" },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // Get total stats
  const totalStats = await this.aggregate([
    {
      $match: {
        jobId: new mongoose.Types.ObjectId(jobId),
        viewedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: 1 },
        authenticatedViews: {
          $sum: { $cond: [{ $ne: ["$jobSeekerId", null] }, 1, 0] },
        },
        anonymousViews: {
          $sum: { $cond: [{ $eq: ["$jobSeekerId", null] }, 1, 0] },
        },
        uniqueViewers: {
          $addToSet: "$jobSeekerId",
        },
      },
    },
    {
      $project: {
        totalViews: 1,
        authenticatedViews: 1,
        anonymousViews: 1,
        uniqueViewers: { $size: "$uniqueViewers" },
      },
    },
  ]);

  return {
    period: `Last ${days} days`,
    dailyBreakdown: analytics,
    summary: totalStats[0] || {
      totalViews: 0,
      authenticatedViews: 0,
      anonymousViews: 0,
      uniqueViewers: 0,
    },
  };
};

// Static method to get user's view history
JobViewSchema.statics.getUserViewHistory = function (jobSeekerId, limit = 50) {
  return this.find({ jobSeekerId })
    .populate({
      path: "jobId",
      select: "title companyId employmentType location status",
      populate: {
        path: "companyId",
        select: "companyName companyLogo",
      },
    })
    .sort({ viewedAt: -1 })
    .limit(limit);
};

// Static method to check if user has viewed a job
JobViewSchema.statics.hasUserViewed = async function (jobId, jobSeekerId) {
  if (!jobSeekerId) return false;

  const view = await this.findOne({ jobId, jobSeekerId });
  return !!view;
};

// Static method to get most viewed jobs
JobViewSchema.statics.getMostViewedJobs = async function (
  limit = 10,
  days = 30,
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        viewedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$jobId",
        viewCount: { $sum: 1 },
        uniqueViewers: { $addToSet: "$jobSeekerId" },
      },
    },
    {
      $project: {
        jobId: "$_id",
        viewCount: 1,
        uniqueViewers: { $size: "$uniqueViewers" },
      },
    },
    {
      $sort: { viewCount: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job",
      },
    },
    {
      $unwind: "$job",
    },
  ]);
};

// Static method to get view trends (compare periods)
JobViewSchema.statics.getViewTrends = async function (jobId) {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentPeriod = await this.countDocuments({
    jobId,
    viewedAt: { $gte: last7Days },
  });

  const previousPeriod = await this.countDocuments({
    jobId,
    viewedAt: { $gte: previous7Days, $lt: last7Days },
  });

  const change = currentPeriod - previousPeriod;
  const percentageChange =
    previousPeriod > 0 ? ((change / previousPeriod) * 100).toFixed(2) : 0;

  return {
    currentPeriod: {
      views: currentPeriod,
      period: "Last 7 days",
    },
    previousPeriod: {
      views: previousPeriod,
      period: "Previous 7 days",
    },
    change,
    percentageChange: parseFloat(percentageChange),
    trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
  };
};

// Static method to clean up old anonymous views (data retention)
JobViewSchema.statics.cleanupOldAnonymousViews = async function (
  daysToKeep = 90,
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await this.deleteMany({
    jobSeekerId: null,
    viewedAt: { $lt: cutoffDate },
  });

  return {
    deleted: result.deletedCount,
    cutoffDate,
  };
};

// Pre-save middleware to validate job exists
JobViewSchema.pre("save", async function () {
  if (this.isNew) {
    const Job = mongoose.model("Job");
    const job = await Job.findById(this.jobId);

    if (!job) {
      throw new Error("Job not found");
    }
  }
});

// Ensure virtuals are included in JSON output
JobViewSchema.set("toJSON", { virtuals: true });
JobViewSchema.set("toObject", { virtuals: true });

export default mongoose.model("JobView", JobViewSchema);
