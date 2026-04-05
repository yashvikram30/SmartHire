import mongoose from "mongoose";
import Job from "../models/Jobs.models.js";
import JobView from "../models/JobView.model.js";
import Application from "../models/Application.model.js";
import User from "../models/User.model.js"; // Assumed standard User model

// -------------------------------------------------------------------------
// Recruiter Analytics
// -------------------------------------------------------------------------

/**
 * @desc    Get dashboard stats for a recruiter
 * @route   GET /api/v1/analytics/recruiter/dashboard
 * @access  Private (Recruiter)
 */
export const getRecruiterDashboardAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // 1. Fetch all jobs for this recruiter
    const jobs = await Job.find({ recruiterId }).select(
      "views applicationCount status title postedAt"
    );

    // 2. Calculate Aggregate Stats
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === "active").length;
    const totalViews = jobs.reduce((acc, job) => acc + (job.views || 0), 0);
    const totalApplications = jobs.reduce(
      (acc, job) => acc + (job.applicationCount || 0),
      0
    );

    // 3. Get Recent Applications (across all their jobs)
    // We find applications where the job belongs to this recruiter
    // This requires the Application model to populate the Job and check recruiterId
    // OR we filter Applications by the recruiterId field in ApplicationSchema
    const recentApplications = await Application.find({ recruiterId })
      .sort({ appliedAt: -1 })
      .limit(5)
      .populate("jobId", "title")
      .populate("jobSeekerId", "firstName lastName profilePicture");

    // 4. Get Views Over Time (Last 7 Days) for all jobs combined
    // This is a bit complex, so we might just return the summary for now
    // or calculate it if needed. For dashboard, aggregate totals are usually sufficient.

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalJobs,
          activeJobs,
          totalViews,
          totalApplications,
        },
        jobs: jobs.slice(0, 5), // Return top 5 recent jobs for list
        recentApplications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recruiter analytics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific job performance metrics
 * @route   GET /api/v1/analytics/recruiter/job/:jobId
 * @access  Private (Recruiter)
 */
export const getJobPerformanceMetrics = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.id;

    // 1. Verify Job Ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.recruiterId.toString() !== recruiterId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this job's analytics" });
    }

    // 2. Get View Analytics (Using JobView static method)
    // Defaults to last 30 days
    const viewAnalytics = await JobView.getJobAnalytics(jobId, 30);

    // 3. Get View Trends (Compare to previous period)
    const viewTrends = await JobView.getViewTrends(jobId);

    // 4. Get Application Funnel Stats
    // Using Application static method getJobStats
    const applicationStats = await Application.getJobStats(jobId);

    res.status(200).json({
      success: true,
      data: {
        jobSummary: {
          title: job.title,
          status: job.status,
          postedAt: job.postedAt,
          daysActive: job.postedAt
            ? Math.floor((new Date() - job.postedAt) / (1000 * 60 * 60 * 24))
            : 0,
        },
        traffic: {
          daily: viewAnalytics.dailyBreakdown,
          summary: viewAnalytics.summary,
          trends: viewTrends,
        },
        applications: {
          total: applicationStats.total,
          funnel: applicationStats, // breakdown by status (submitted, interviewing, hired)
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job metrics",
      error: error.message,
    });
  }
};

// -------------------------------------------------------------------------
// Admin Analytics
// -------------------------------------------------------------------------

/**
 * @desc    Get platform-wide analytics
 * @route   GET /api/v1/analytics/admin/dashboard
 * @access  Private (Admin)
 */
export const getAdminDashboardAnalytics = async (req, res) => {
  try {
    // Run counts in parallel for performance
    const [
      totalUsers,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments({ role: "jobseeker" }),
      User.countDocuments({ role: "recruiter" }),
      Job.countDocuments(),
      Job.countDocuments({ status: "active" }),
      Application.countDocuments(),
    ]);
    res.status(200).json({
      success: true,
      data: {
        users: {
          jobSeekers: totalUsers,
          recruiters: totalRecruiters,
          total: totalUsers + totalRecruiters,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
        },
        applications: {
          total: totalApplications,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user growth and distribution
 * @route   GET /api/v1/analytics/admin/users
 * @access  Private (Admin)
 */
export const getUserAnalytics = async (req, res) => {
  try {
    // Get user growth for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        growth: userGrowth,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user analytics",
      error: error.message,
    });
  }
};

/**
 * @desc    Get job posting stats
 * @route   GET /api/v1/analytics/admin/jobs
 * @access  Private (Admin)
 */
export const getJobAnalytics = async (req, res) => {
  try {
    // 1. Jobs by Status
    const jobsByStatus = await Job.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 2. Jobs by Category (Top 10)
    const jobsByCategory = await Job.aggregate([
      {
        $lookup: {
          from: "jobcategories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$categoryDetails.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: jobsByStatus,
        byCategory: jobsByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job analytics",
      error: error.message,
    });
  }
};