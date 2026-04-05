import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";
import {
  getSavedJobs,
  saveJob,
  unsaveJob,
} from "../controllers/savedJobs.controller.js";

const savedJobsRouter = express.Router();

// -------------------------------------------------------------------------
// Global Protection
// All routes below require a valid JWT token
// -------------------------------------------------------------------------
savedJobsRouter.use(protect);

// -------------------------------------------------------------------------
// Routes
// -------------------------------------------------------------------------

/**
 * @route   GET /api/v1/saved-jobs
 * @desc    Get all saved jobs for the current user
 * @access  Private (Job Seeker only)
 * @headers  Authorization: Bearer <access_token>
 * @query    page: number (default: 1),
 *           limit: number (default: 10),
 *           sortBy: string (optional: [datePosted, salary, title]),
 *           sortOrder: string (optional: [asc, desc])
 * @response 200 - {
 *   success: true,
 *   data: {
 *     savedJobs: Array,
 *     pagination: { page, limit, total, pages }
 *   }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Job seeker access required" }
 */
savedJobsRouter.get("/", authorize("jobseeker"), getSavedJobs);

/**
 * @route   POST /api/v1/saved-jobs
 * @desc    Save a job to user's saved jobs list
 * @access  Private (Job Seeker only)
 * @headers  Authorization: Bearer <access_token>
 * @body    {
 *   jobId: string (required)
 * }
 * @response 201 - {
 *   success: true,
 *   message: "Job saved successfully",
 *   data: { savedJob: SavedJobObject }
 * }
 * @response 400 - { success: false, message: "Job already saved" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Job seeker access required" }
 * @response 404 - { success: false, message: "Job not found" }
 */
savedJobsRouter.post("/", authorize("jobseeker"), saveJob);

/**
 * @route   DELETE /api/v1/saved-jobs/:jobId
 * @desc    Remove a job from user's saved jobs list
 * @access  Private (Job Seeker only)
 * @headers  Authorization: Bearer <access_token>
 * @params   jobId: string (Job ID, not SavedJob ID)
 * @response 200 - {
 *   success: true,
 *   message: "Job removed from saved jobs"
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Job seeker access required" }
 * @response 404 - { success: false, message: "Saved job not found" }
 */
savedJobsRouter.delete("/:jobId", authorize("jobseeker"), unsaveJob);

export default savedJobsRouter;
