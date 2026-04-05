import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js"; // Adjust path as needed
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  withdrawApplication,
  updateApplicationStatus,
  addRecruiterNote,
  rateCandidate,
  scheduleInterview,
} from "../controllers/applications.controller.js";

const applicationRouter = express.Router();

// -------------------------------------------------------------------------
// Global Protection
// All routes below require a valid JWT token
// -------------------------------------------------------------------------
applicationRouter.use(protect);

// -------------------------------------------------------------------------
// Job Seeker Routes
// -------------------------------------------------------------------------

/**
 * @route   POST /api/v1/applications
 * @desc    Apply to a job
 * @access  Private (Job Seeker only)
 * @headers  Authorization: Bearer <access_token>
 * @body    {
 *   jobId: string (required),
 *   coverLetter: string (optional, max 3000 chars),
 *   screeningAnswers: Array (optional, for job screening questions)
 * }
 * @response 201 - {
 *   success: true,
 *   message: "Application submitted successfully",
 *   data: { application: ApplicationObject }
 * }
 * @response 400 - { success: false, message: "Validation error" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Job seeker access required" }
 */
applicationRouter.post("/", authorize("jobseeker"), applyToJob);

/**
 * @route   GET /api/v1/applications/my-applications
 * @desc    Get current user's job applications
 * @access  Private (Job Seeker only)
 * @headers  Authorization: Bearer <access_token>
 * @query    page: number (default: 1),
 *           limit: number (default: 10),
 *           status: string (optional filter)
 * @response 200 - {
 *   success: true,
 *   data: { applications: Array, pagination: Object }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Job seeker access required" }
 */
applicationRouter.get(
  "/my-applications",
  authorize("jobseeker"),
  getMyApplications,
);

/**
 * @route   PATCH /api/v1/applications/:id/withdraw
 * @desc    Withdraw a job application
 * @access  Private (Job Seeker - application owner only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Application ID)
 * @response 200 - {
 *   success: true,
 *   message: "Application withdrawn successfully"
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Access denied" }
 * @response 404 - { success: false, message: "Application not found" }
 */
applicationRouter.patch(
  "/:id/withdraw",
  authorize("jobseeker"),
  withdrawApplication,
);

// -------------------------------------------------------------------------
// Recruiter Routes
// -------------------------------------------------------------------------

/**
 * @route   GET /api/v1/applications/job/:jobId
 * @desc    Get all applications for a specific job
 * @access  Private (Recruiter - job owner only)
 * @headers  Authorization: Bearer <access_token>
 * @params   jobId: string (Job ID)
 * @query    page: number (default: 1),
 *           limit: number (default: 10),
 *           status: string (optional filter)
 * @response 200 - {
 *   success: true,
 *   data: { applications: Array, pagination: Object, jobStats: Object }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Access denied" }
 * @response 404 - { success: false, message: "Job not found" }
 */
applicationRouter.get(
  "/job/:jobId",
  authorize("recruiter"),
  getApplicationsForJob,
);

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @desc    Update application status (shortlist, reject, etc.)
 * @access  Private (Recruiter only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Application ID)
 * @body    {
 *   status: string (required, enum: [reviewed, shortlisted, interviewing, rejected, offered]),
 *   notes: string (optional)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Application status updated successfully",
 *   data: { application: ApplicationObject }
 * }
 * @response 400 - { success: false, message: "Invalid status transition" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Recruiter access required" }
 */
applicationRouter.patch(
  "/:id/status",
  authorize("recruiter"),
  updateApplicationStatus,
);

/**
 * @route   POST /api/v1/applications/:id/notes
 * @desc    Add private notes to an application
 * @access  Private (Recruiter only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Application ID)
 * @body    {
 *   note: string (required, max 1000 chars)
 * }
 * @response 201 - {
 *   success: true,
 *   message: "Note added successfully",
 *   data: { application: ApplicationObject }
 * }
 * @response 400 - { success: false, message: "Note content required" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Recruiter access required" }
 */
applicationRouter.post("/:id/notes", authorize("recruiter"), addRecruiterNote);

/**
 * @route   PATCH /api/v1/applications/:id/rating
 * @desc    Rate a candidate (1-5 stars)
 * @access  Private (Recruiter only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Application ID)
 * @body    {
 *   rating: number (required, min: 1, max: 5)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Candidate rated successfully",
 *   data: { application: ApplicationObject }
 * }
 * @response 400 - { success: false, message: "Invalid rating" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Recruiter access required" }
 */
applicationRouter.patch("/:id/rating", authorize("recruiter"), rateCandidate);

/**
 * @route   POST /api/v1/applications/:id/schedule-interview
 * @desc    Schedule an interview for a candidate
 * @access  Private (Recruiter only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Application ID)
 * @body    {
 *   scheduledAt: string (required, ISO datetime),
 *   meetingLink: string (optional),
 *   notes: string (optional, max 1000 chars)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Interview scheduled successfully",
 *   data: { application: ApplicationObject }
 * }
 * @response 400 - { success: false, message: "Invalid interview date" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Recruiter access required" }
 */
applicationRouter.post(
  "/:id/schedule-interview",
  authorize("recruiter"),
  scheduleInterview,
);

// -------------------------------------------------------------------------
// Shared Routes
// -------------------------------------------------------------------------

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get specific application details
 * @access  Private (Recruiter viewing candidate OR Job Seeker viewing own application)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Application ID)
 * @response 200 - {
 *   success: true,
 *   data: { application: ApplicationObject }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Access denied" }
 * @response 404 - { success: false, message: "Application not found" }
 */
applicationRouter.get(
  "/:id",
  authorize("recruiter", "jobseeker"),
  getApplicationById,
);

export default applicationRouter;
