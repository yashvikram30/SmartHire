import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";
import {
  contactCandidate,
  sendBroadcastEmail,
} from "../controllers/email.controller.js";

const emailRouter = express.Router();

// -------------------------------------------------------------------------
// Global Protection
// -------------------------------------------------------------------------
emailRouter.use(protect);

// -------------------------------------------------------------------------
// Recruiter Routes
// -------------------------------------------------------------------------

/**
 * @route   POST /api/v1/emails/contact-candidate
 * @desc    Send email directly to a job candidate
 * @access  Private (Recruiter only)
 * @headers  Authorization: Bearer <access_token>
 * @body    {
 *   candidateId: string (required, User ID),
 *   subject: string (required, max 200 chars),
 *   message: string (required, max 5000 chars),
 *   applicationId: string (optional, for context),
 *   ccEmails: Array<string> (optional, CC recipients)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Email sent successfully",
 *   data: { emailId: string, sentAt: string }
 * }
 * @response 400 - { success: false, message: "Validation error" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Recruiter access required" }
 * @response 404 - { success: false, message: "Candidate not found" }
 * @response 429 - { success: false, message: "Rate limit exceeded" }
 */
emailRouter.post(
  "/contact-candidate",
  authorize("recruiter"),
  contactCandidate,
);

// -------------------------------------------------------------------------
// Admin Routes
// -------------------------------------------------------------------------

/**
 * @route   POST /api/v1/emails/admin/broadcast
 * @desc    Send broadcast email to multiple users
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @body    {
 *   subject: string (required, max 200 chars),
 *   message: string (required, max 10000 chars),
 *   targetAudience: string (required, enum: [all, recruiters, jobseekers, active, inactive]),
 *   filters: {
 *     role: Array<string> (optional),
 *     location: Array<string> (optional),
 *     registrationDate: { start: string, end: string } (optional),
 *     lastActive: { start: string, end: string } (optional)
 *   },
 *   scheduleAt: string (optional, ISO datetime for scheduled sending),
 *   testMode: boolean (optional, default: false)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Broadcast email queued successfully",
 *   data: {
 *     campaignId: string,
 *     estimatedRecipients: number,
 *     scheduledAt: string,
 *     testMode: boolean
 *   }
 * }
 * @response 400 - { success: false, message: "Invalid target audience or filters" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 429 - { success: false, message: "Rate limit exceeded" }
 */
emailRouter.post("/admin/broadcast", authorize("admin"), sendBroadcastEmail);

export default emailRouter;
