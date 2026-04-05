import Job from "../models/Jobs.models.js";
import User from "../models/User.model.js";
import RecruiterProfile from "../models/RecruiterProfile.model.js";

/**
 * @desc    Get all pending job approvals
 * @route   GET /api/v1/admin/jobs/pending
 * @access  Private/Admin
 */
export const getPendingJobApprovals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Get pending jobs using the static method from the model
    const jobs = await Job.find({ status: "pending-approval" })
      .populate("recruiterId", "name email phoneNumber")
      .populate("companyId", "companyName companyLogo industry location website")
      .populate("requiredSkills", "name category")
      .populate("category", "name description")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalJobs = await Job.countDocuments({ status: "pending-approval" });
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Pending job approvals retrieved successfully",
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          jobsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching pending jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve pending job approvals",
      error: error.message,
    });
  }
};

/**
 * @desc    Approve a job posting
 * @route   PATCH /api/v1/admin/jobs/:id/approve
 * @access  Private/Admin
 */
export const approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Find the job
    const job = await Job.findById(id)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if job is in pending status
    if (job.status !== "pending-approval") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve job with status '${job.status}'. Only pending jobs can be approved.`,
      });
    }

    // Approve the job using the model method
    await job.approve(adminId);

    // Optional: Send notification to recruiter (implement notification service)
    // await notificationService.sendJobApprovalNotification(job.recruiterId, job);

    res.status(200).json({
      success: true,
      message: "Job approved and published successfully",
      data: {
        job: {
          id: job._id,
          title: job.title,
          status: job.status,
          postedAt: job.postedAt,
          recruiter: job.recruiterId?.name,
          company: job.companyId?.companyName,
        },
      },
    });
  } catch (error) {
    console.error("Error approving job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve job",
      error: error.message,
    });
  }
};

/**
 * @desc    Reject a job posting
 * @route   PATCH /api/v1/admin/jobs/:id/reject
 * @access  Private/Admin
 */
export const rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, reason } = req.body;
    const adminId = req.user.id;

    // Validate rejection notes
    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection notes are required",
      });
    }

    if (notes.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Rejection notes cannot exceed 1000 characters",
      });
    }

    // Find the job
    const job = await Job.findById(id)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if job is in pending status
    if (job.status !== "pending-approval") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject job with status '${job.status}'. Only pending jobs can be rejected.`,
      });
    }

    // Format rejection notes with optional reason
    const formattedNotes = reason
      ? `Reason: ${reason}\n\nDetails: ${notes}`
      : notes;

    // Reject the job using the model method
    await job.reject(adminId, formattedNotes);

    // Optional: Send notification to recruiter
    // await notificationService.sendJobRejectionNotification(job.recruiterId, job, notes);

    res.status(200).json({
      success: true,
      message: "Job rejected successfully",
      data: {
        job: {
          id: job._id,
          title: job.title,
          status: job.status,
          moderationNotes: job.moderationNotes,
          recruiter: job.recruiterId?.name,
          company: job.companyId?.companyName,
        },
      },
    });
  } catch (error) {
    console.error("Error rejecting job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject job",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle featured status of a job
 * @route   PATCH /api/v1/admin/jobs/:id/feature
 * @access  Private/Admin
 */
export const featureJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    // Find the job
    const job = await Job.findById(id)
      .populate("companyId", "companyName");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Only active jobs can be featured
    if (job.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active jobs can be featured",
      });
    }

    // Set featured status
    if (typeof isFeatured === "boolean") {
      job.isFeatured = isFeatured;
    } else {
      // Toggle if not specified
      await job.toggleFeatured();
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${job.isFeatured ? "featured" : "unfeatured"} successfully`,
      data: {
        job: {
          id: job._id,
          title: job.title,
          isFeatured: job.isFeatured,
          company: job.companyId?.companyName,
        },
      },
    });
  } catch (error) {
    console.error("Error featuring job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update job featured status",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a job posting (soft delete by changing status)
 * @route   DELETE /api/v1/admin/jobs/:id
 * @access  Private/Admin
 */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    // Find the job
    const job = await Job.findById(id)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (permanent === "true" || permanent === true) {
      // Permanent deletion - use with caution
      // Check if job has applications before deleting
      if (job.applicationCount > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot permanently delete job with existing applications. Close it instead.",
        });
      }

      await Job.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Job permanently deleted successfully",
        data: {
          deletedJob: {
            id: job._id,
            title: job.title,
          },
        },
      });
    } else {
      // Soft delete - close the job
      await job.closeJob("closed");

      res.status(200).json({
        success: true,
        message: "Job closed successfully",
        data: {
          job: {
            id: job._id,
            title: job.title,
            status: job.status,
            closedAt: job.closedAt,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all jobs with filters (for admin dashboard)
 * @route   GET /api/v1/admin/jobs
 * @access  Private/Admin
 */
export const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      recruiterId,
      companyId,
      category,
      isFeatured,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Build filter query
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (recruiterId) {
      filter.recruiterId = recruiterId;
    }

    if (companyId) {
      filter.companyId = companyId;
    }

    if (category) {
      filter.category = category;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // Add text search if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Query jobs
    const jobsQuery = Job.find(filter)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo industry")
      .populate("requiredSkills", "name")
      .populate("category", "name")
      .populate("moderatedBy", "name email")
      .sort(search ? { score: { $meta: "textScore" }, [sortBy]: sortOrder } : { [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const jobs = await jobsQuery;

    // Get total count
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    // Get statistics
    const statistics = await Job.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalApplications: { $sum: "$applicationCount" },
          avgViews: { $avg: "$views" },
          avgApplications: { $avg: "$applicationCount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          jobsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
        statistics: statistics[0] || {
          totalViews: 0,
          totalApplications: 0,
          avgViews: 0,
          avgApplications: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve jobs",
      error: error.message,
    });
  }
};

/**
 * @desc    Get job statistics for admin dashboard
 * @route   GET /api/v1/admin/jobs/statistics
 * @access  Private/Admin
 */
export const getJobStatistics = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Job.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get jobs by category
    const categoryCounts = await Job.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "jobcategories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get jobs by experience level
    const experienceLevelCounts = await Job.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$experienceLevel",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get jobs by employment type
    const employmentTypeCounts = await Job.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$employmentType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent job trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentJobTrends = await Job.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top companies by job postings
    const topCompanies = await Job.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$companyId",
          jobCount: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalApplications: { $sum: "$applicationCount" },
        },
      },
      {
        $lookup: {
          from: "recruiterprofiles",
          localField: "_id",
          foreignField: "_id",
          as: "companyInfo",
        },
      },
      { $unwind: "$companyInfo" },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      message: "Job statistics retrieved successfully",
      data: {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        categoryCounts: categoryCounts.map((item) => ({
          category: item.categoryInfo?.name || "Uncategorized",
          count: item.count,
        })),
        experienceLevelCounts: experienceLevelCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        employmentTypeCounts: employmentTypeCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentJobTrends,
        topCompanies: topCompanies.map((item) => ({
          companyId: item._id,
          companyName: item.companyInfo.companyName,
          jobCount: item.jobCount,
          totalViews: item.totalViews,
          totalApplications: item.totalApplications,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching job statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve job statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Bulk approve jobs
 * @route   PATCH /api/v1/admin/jobs/bulk/approve
 * @access  Private/Admin
 */
export const bulkApproveJobs = async (req, res) => {
  try {
    const { jobIds } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Job IDs array is required",
      });
    }

    const results = {
      approved: [],
      failed: [],
    };

    // Process each job
    for (const jobId of jobIds) {
      try {
        const job = await Job.findById(jobId);

        if (!job) {
          results.failed.push({ jobId, reason: "Job not found" });
          continue;
        }

        if (job.status !== "pending-approval") {
          results.failed.push({
            jobId,
            reason: `Job status is '${job.status}', not pending`,
          });
          continue;
        }

        await job.approve(adminId);
        results.approved.push(jobId);
      } catch (error) {
        results.failed.push({ jobId, reason: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk approval completed. ${results.approved.length} approved, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Error in bulk approve:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk approve jobs",
      error: error.message,
    });
  }
};