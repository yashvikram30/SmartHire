import express from "express";
import {
  getPendingVerification,
  verifyRecruiter,
  rejectRecruiter,
  getallprofiles,
} from "../controllers/adminRecruiter.controller.js";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";

const adminRecruiterRouter = express.Router();

/**
 * Apply authentication to all routes
 * Then authorize only admin role
 */
adminRecruiterRouter.use(protect);
adminRecruiterRouter.use(authorize("admin"));

/**
 * @route   GET /api/v1/admin/recruiters/
 * @desc    Get all  recruiter profiles
 * @access  Admin only
 */
adminRecruiterRouter.get("/", getallprofiles);
/**
 * @route   GET /api/v1/admin/recruiters/pending
 * @desc    Get all pending recruiter verifications
 * @access  Admin only
 */
adminRecruiterRouter.get("/pending", getPendingVerification);

/**
 * @route   PATCH /api/v1/admin/recruiters/:id/verify
 * @desc    Approve/verify a recruiter
 * @access  Admin only
 */
adminRecruiterRouter.patch("/:id/verify", verifyRecruiter);

/**
 * @route   PATCH /api/v1/admin/recruiters/:id/reject
 * @desc    Reject a recruiter verification with notes
 * @access  Admin only
 */
adminRecruiterRouter.patch("/:id/reject", rejectRecruiter);

export default adminRecruiterRouter;