import Job from "../models/Jobs.models.js";
import RecruiterProfile from "../models/RecruiterProfile.model.js";
import JobSeekerProfile from "../models/JobSeekerProfile.model.js";
import JobView from "../models/JobView.model.js";
import mongoose from "mongoose";

/**
 * @desc    Get all jobs (public, paginated)
 * @route   GET /api/v1/jobs
 * @access  Public
 */
export const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      experienceLevel,
      employmentType,
      location,
      isRemote,
      isFeatured,
      sortBy = "postedAt",
      order = "desc",
    } = req.query;

    // Build filter object
    const filter = { status: "active" }; 

    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (employmentType) filter.employmentType = employmentType;
    
    // Location filter
    if (location) {
      filter.$or = [
        { "location.city": new RegExp(location, "i") },
        { "location.state": new RegExp(location, "i") },
        { "location.country": new RegExp(location, "i") },
      ];
    }
    
    if (isRemote === "true") filter["location.isRemote"] = true;
    if (isFeatured === "true") filter.isFeatured = true;

    // 🔥 Exclude expired jobs
    // This adds a condition: deadline must be either not set OR in the future
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: null },
        { applicationDeadline: { $gt: new Date() } },
      ],
    });

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);

    // Fetch jobs with population
    const jobs = await Job.find(filter)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo industry location")
      .populate("requiredSkills", "name")
      .populate("category", "name")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / parseInt(limit)),
      currentPage: parseInt(page),
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

/**
 * @desc    Search jobs with filters
 * @route   GET /api/v1/jobs/search
 * @access  Public
 */
export const searchJobs = async (req, res) => {
  try {
    const {
      q, // search query
      page = 1,
      limit = 10,
      experienceLevel,
      employmentType,
      location,
      isRemote,
      salaryMin,
      salaryMax,
      skills,
      category,
      sortBy = "relevance",
    } = req.query;

    // Build filter object
    const filter = { status: "active" };

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Apply filters
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (employmentType) filter.employmentType = employmentType;
    if (location) {
      filter.$or = [
        { "location.city": new RegExp(location, "i") },
        { "location.state": new RegExp(location, "i") },
        { "location.country": new RegExp(location, "i") },
      ];
    }
    if (isRemote === "true") filter["location.isRemote"] = true;

    // Salary range filter
    if (salaryMin) {
      filter["salary.max"] = { $gte: parseInt(salaryMin) };
    }
    if (salaryMax) {
      filter["salary.min"] = { $lte: parseInt(salaryMax) };
    }

    // Skills filter
    if (skills) {
      const skillIds = skills.split(",");
      filter.requiredSkills = { $in: skillIds };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort
    let sort = {};
    if (sortBy === "relevance" && q) {
      sort = { score: { $meta: "textScore" }, isFeatured: -1 };
    } else if (sortBy === "date") {
      sort = { postedAt: -1 };
    } else if (sortBy === "salary") {
      sort = { "salary.max": -1 };
    } else {
      sort = { isFeatured: -1, postedAt: -1 };
    }

    // Get total count
    const totalJobs = await Job.countDocuments(filter);

    // Fetch jobs
    const jobs = await Job.find(filter)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo industry location")
      .populate("requiredSkills", "name")
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / parseInt(limit)),
      currentPage: parseInt(page),
      searchQuery: q || null,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching jobs",
      error: error.message,
    });
  }
};

/**
 * @desc    Get recommended jobs for job seeker
 * @route   GET /api/v1/jobs/recommended
 * @access  Private (Job Seeker)
 */
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Get job seeker profile
    const jobSeekerProfile = await JobSeekerProfile.findOne({ userId })
      .populate("skills", "name")
      .lean();

    if (!jobSeekerProfile) {
      return res.status(404).json({
        success: false,
        message: "Job seeker profile not found",
      });
    }

    // Build recommendation filter
    const filter = { status: "active" };

    // Match skills
    const skillIds = jobSeekerProfile.skills?.map((skill) =>
      skill._id ? skill._id : skill
    );

    if (skillIds && skillIds.length > 0) {
      filter.requiredSkills = { $in: skillIds };
    }

    // Match job type preferences
    if (
      jobSeekerProfile.preferences?.jobType &&
      jobSeekerProfile.preferences.jobType.length > 0
    ) {
      filter.employmentType = { $in: jobSeekerProfile.preferences.jobType };
    }

    // Match remote work preference
    if (jobSeekerProfile.preferences?.remoteWorkPreference) {
      const remotePreference =
        jobSeekerProfile.preferences.remoteWorkPreference;
      if (remotePreference === "remote") {
        filter["location.isRemote"] = true;
      } else if (remotePreference === "onsite") {
        filter["location.isRemote"] = false;
      }
      // hybrid and flexible match any
    }

    // Match salary expectations
    if (jobSeekerProfile.preferences?.desiredSalaryMin) {
      filter["salary.max"] = {
        $gte: jobSeekerProfile.preferences.desiredSalaryMin,
      };
    }

    // Match location if not willing to relocate and not remote preference
    if (
      !jobSeekerProfile.preferences?.willingToRelocate &&
      jobSeekerProfile.preferences?.remoteWorkPreference !== "remote" &&
      jobSeekerProfile.location?.city
    ) {
      filter.$or = [
        { "location.city": jobSeekerProfile.location.city },
        { "location.isRemote": true },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const totalJobs = await Job.countDocuments(filter);

    // Fetch recommended jobs
    const jobs = await Job.find(filter)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo industry location")
      .populate("requiredSkills", "name")
      .populate("category", "name")
      .sort({ isFeatured: -1, postedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / parseInt(limit)),
      currentPage: parseInt(page),
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recommended jobs",
      error: error.message,
    });
  }
};

/**
 * @desc    Get job details by ID
 * @route   GET /api/v1/jobs/:id
 * @access  Public
 */
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo companyDescription industry location website")
      .populate("requiredSkills", "name")
      .populate("category", "name");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job details",
      error: error.message,
    });
  }
};

/**
 * @desc    Create job posting
 * @route   POST /api/v1/jobs
 * @access  Private (Recruiter - Verified)
 */
export const createJob = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // Check if recruiter profile exists and is verified
    const recruiterProfile = await RecruiterProfile.findOne({
      userId: recruiterId,
    });

    if (!recruiterProfile) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found. Please complete your profile first.",
      });
    }

    if (!recruiterProfile.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your recruiter account must be verified before posting jobs.",
      });
    }

    // 🔒 SANITIZE INPUT - Remove protected fields
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.recruiterId;
    delete sanitizedBody.companyId;
    delete sanitizedBody.views;
    delete sanitizedBody.applicationCount;
    delete sanitizedBody.moderatedBy;
    delete sanitizedBody.moderatedAt;
    delete sanitizedBody.moderationNotes;
    delete sanitizedBody.postedAt;
    delete sanitizedBody.closedAt;
    delete sanitizedBody.isFeatured; // Only admins should set this

    // Create job with recruiter and company information
    const jobData = {
      ...sanitizedBody,
      recruiterId,
      companyId: recruiterProfile._id,
      status: "draft", // Always start as draft
    };

    const job = await Job.create(jobData);

    // Populate the created job
    const populatedJob = await Job.findById(job._id)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo industry")
      .populate("requiredSkills", "name")
      .populate("category", "name");

    res.status(201).json({
      success: true,
      message: "Job posting created successfully",
      data: populatedJob,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating job posting",
      error: error.message,
    });
  }
};

/**
 * @desc    Update job posting
 * @route   PUT /api/v1/jobs/:id
 * @access  Private (Recruiter - Owner)
 */
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Find job and check ownership
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the owner
    if (job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job",
      });
    }

    // 🔒 SANITIZE INPUT - Remove ALL protected fields
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.recruiterId;
    delete sanitizedBody.companyId;
    delete sanitizedBody.views;
    delete sanitizedBody.applicationCount;
    delete sanitizedBody.moderatedBy;
    delete sanitizedBody.moderatedAt;
    delete sanitizedBody.moderationNotes;
    delete sanitizedBody.postedAt;
    delete sanitizedBody.closedAt;
    delete sanitizedBody.isFeatured;
    delete sanitizedBody.status; // Handle status separately

    // ⚠️ Only allow status changes from draft to pending-approval
   if (req.body.status) {
      if (job.status === "draft" && req.body.status === "pending-approval") {
        // Submit: Draft -> Pending
        await job.submitForApproval();
      } else if (job.status === "pending-approval" && req.body.status === "draft") {
        // Withdraw: Pending -> Draft
        job.status = "draft";
        // Optionally reset any verification/approval flags if they exist
      } else if (req.body.status !== job.status) {
        return res.status(403).json({
          success: false,
          message: "You can only toggle between Draft and Pending Approval. Other status changes require admin action.",
        });
      }
    }

    // Update job with sanitized data
    Object.assign(job, sanitizedBody);
    await job.save();

    // Populate the updated job
    const updatedJob = await Job.findById(job._id)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo industry")
      .populate("requiredSkills", "name")
      .populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Job posting updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle custom errors from methods (like submitForApproval)
    if (error.message.includes("Only draft jobs")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating job posting",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete job posting
 * @route   DELETE /api/v1/jobs/:id
 * @access  Private (Recruiter - Owner)
 */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Find job and check ownership
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the owner
    if (job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job",
      });
    }

    // Delete the job
    await Job.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting job posting",
      error: error.message,
    });
  }
};

/**
 * @desc    Close job posting
 * @route   PATCH /api/v1/jobs/:id/close
 * @access  Private (Recruiter - Owner)
 */
export const closeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user.id;
    const { reason = "closed" } = req.body; // 'closed' or 'filled'

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Find job and check ownership
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if user is the owner
    if (job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to close this job",
      });
    }

    // Close the job using the schema method
    if (reason === "filled") {
      await job.markAsFilled();
    } else {
      await job.closeJob();
    }

    // Populate the closed job
    const closedJob = await Job.findById(job._id)
      .populate("recruiterId", "name email")
      .populate("companyId", "companyName companyLogo industry")
      .populate("requiredSkills", "name")
      .populate("category", "name");

    res.status(200).json({
      success: true,
      message: `Job marked as ${reason === "filled" ? "filled" : "closed"} successfully`,
      data: closedJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error closing job posting",
      error: error.message,
    });
  }
};

/**
 * @desc    Get recruiter's jobs
 * @route   GET /api/v1/jobs/my-jobs
 * @access  Private (Recruiter)
 */
export const getMyJobs = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter
    const filter = { recruiterId };

    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Get total count
    const totalJobs = await Job.countDocuments(filter);

    // Fetch jobs
    const jobs = await Job.find(filter)
      .populate("companyId", "companyName companyLogo industry")
      .populate("requiredSkills", "name")
      .populate("category", "name")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Get status counts
    const statusCounts = await Job.aggregate([
      { $match: { recruiterId: new mongoose.Types.ObjectId(recruiterId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusSummary = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / parseInt(limit)),
      currentPage: parseInt(page),
      statusSummary,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your jobs",
      error: error.message,
    });
  }
};

/**
 * @desc    Track job view
 * @route   POST /api/v1/jobs/:id/view
 * @access  Public
 */
export const trackJobView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null; // Optional: user might not be logged in
    const { ipAddress, userAgent } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Check if job exists
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Record the view
    await JobView.recordView(id, userId, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: "Job view tracked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error tracking job view",
      error: error.message,
    });
  }
};