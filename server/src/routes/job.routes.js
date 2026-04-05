import express from "express";
import {
  getAllJobs,
  searchJobs,
  getRecommendedJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  closeJob,
  getMyJobs,
  trackJobView,
} from "../controllers/job.controller.js";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";

const jobRouter = express.Router();



/**
 * @route   GET /api/v1/jobs
 * @desc    Get all active jobs with pagination and filters
 * @access  Public
 */
jobRouter.get("/", getAllJobs);

/**
 * @route   GET /api/v1/jobs/search
 * @desc    Search jobs with advanced filters
 * @access  Public
 */
jobRouter.get("/search", searchJobs);

/**
 * @route   GET /api/v1/jobs/my-jobs
 * @desc    Get all jobs posted by the recruiter
 * @access  Private (Recruiter)
 */
jobRouter.get("/my-jobs", protect, authorize("recruiter"), getMyJobs);

/**
 * @route   POST /api/v1/jobs
 * @desc    Create a new job posting
 * @access  Private (Recruiter - Verified)
 */
jobRouter.post("/", protect, authorize("recruiter"), createJob);


/**
 * @route   GET /api/v1/jobs/recommended
 * @desc    Get recommended jobs based on job seeker profile
 * @access  Private (Job Seeker)
 */
jobRouter.get("/recommended", protect, authorize("jobseeker"), getRecommendedJobs);

/**
 * @route   GET /api/v1/jobs/:id
 * @desc    Get job details by ID
 * @access  Public
 */
jobRouter.get("/:id", getJobById);

/**
 * @route   POST /api/v1/jobs/:id/view
 * @desc    Track job view (can be authenticated or anonymous)
 * @access  Public
 */
jobRouter.post("/:id/view", trackJobView);



/**
 * @route   PUT /api/v1/jobs/:id
 * @desc    Update job posting (owner only)
 * @access  Private (Recruiter - Owner)
 */
jobRouter.put("/:id", protect, authorize("recruiter"), updateJob);

/**
 * @route   DELETE /api/v1/jobs/:id
 * @desc    Delete job posting (owner only)
 * @access  Private (Recruiter - Owner)
 */
jobRouter.delete("/:id", protect, authorize("recruiter"), deleteJob);

/**
 * @route   PATCH /api/v1/jobs/:id/close
 * @desc    Close or mark job as filled (owner only)
 * @access  Private (Recruiter - Owner)
 */
jobRouter.patch("/:id/close", protect, authorize("recruiter"), closeJob);

export default jobRouter;