import express from "express";
import {
  getPendingJobApprovals,
  approveJob,
  rejectJob,
  featureJob,
  deleteJob,
  getAllJobs,
  getJobStatistics,
  bulkApproveJobs,
} from "../controllers/adminJob.controller.js";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";

const adminJobRouter = express.Router();

// Apply authentication and authorization middleware to all routes
adminJobRouter.use(protect);
adminJobRouter.use(authorize("admin"));

/**
 * @route   GET /api/v1/admin/jobs/pending
 * @desc    Get all pending job approvals with pagination
 * @access  Private/Admin
 */
adminJobRouter.get("/pending", getPendingJobApprovals);

/**
 * @route   GET /api/v1/admin/jobs/statistics
 * @desc    Get job statistics for admin dashboard
 * @access  Private/Admin
 */
adminJobRouter.get("/statistics", getJobStatistics);

/**
 * @route   GET /api/v1/admin/jobs
 * @desc    Get all jobs with filters (for admin dashboard)
 * @access  Private/Admin
 */
adminJobRouter.get("/", getAllJobs);

/**
 * @route   PATCH /api/v1/admin/jobs/:id/approve
 * @desc    Approve a job posting
 * @access  Private/Admin
 */
adminJobRouter.patch("/:id/approve", approveJob);

/**
 * @route   PATCH /api/v1/admin/jobs/:id/reject
 * @desc    Reject a job posting with notes
 * @access  Private/Admin
 */
adminJobRouter.patch("/:id/reject", rejectJob);

/**
 * @route   PATCH /api/v1/admin/jobs/:id/feature
 * @desc    Toggle or set featured status of a job
 * @access  Private/Admin
 */
adminJobRouter.patch("/:id/feature", featureJob);

/**
 * @route   DELETE /api/v1/admin/jobs/:id
 * @desc    Delete (or close) a job posting
 * @query   permanent - set to 'true' for permanent deletion (use with caution)
 * @access  Private/Admin
 */
adminJobRouter.delete("/:id", deleteJob);

/**
 * @route   PATCH /api/v1/admin/jobs/bulk/approve
 * @desc    Bulk approve multiple jobs
 * @access  Private/Admin
 */
adminJobRouter.patch("/bulk/approve", bulkApproveJobs);

export default adminJobRouter;