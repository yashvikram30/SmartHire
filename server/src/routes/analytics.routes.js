import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";
import {
  getRecruiterDashboardAnalytics,
  getJobPerformanceMetrics,
  getAdminDashboardAnalytics,
  getUserAnalytics,
  getJobAnalytics,
} from "../controllers/analytics.controller.js";

const analyticsRouter = express.Router();

// -------------------------------------------------------------------------
// Global Protection
// All analytics routes require a valid token
// -------------------------------------------------------------------------
analyticsRouter.use(protect);

// -------------------------------------------------------------------------
// Recruiter Routes
// -------------------------------------------------------------------------

/**
 * @route   GET /api/v1/analytics/recruiter/dashboard
 * @desc    Get recruiter overview analytics and dashboard metrics
 * @access  Private (Recruiter only)
 * @headers  Authorization: Bearer <access_token>
 * @query    period: string (optional: [7d, 30d, 90d, 1y], default: 30d)
 * @response 200 - {
 *   success: true,
 *   data: {
 *     overview: { totalJobs, activeJobs, totalApplications, newApplications },
 *     charts: { applicationsByDay, statusBreakdown, topPerformingJobs },
 *     metrics: { avgTimeToHire, conversionRate, viewToApplicationRatio }
 *   }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Recruiter access required" }
 */
analyticsRouter.get(
  "/recruiter/dashboard",
  authorize("recruiter"),
  getRecruiterDashboardAnalytics,
);

/**
 * @route   GET /api/v1/analytics/recruiter/job/:jobId
 * @desc    Get specific job performance metrics and analytics
 * @access  Private (Recruiter - job owner only)
 * @headers  Authorization: Bearer <access_token>
 * @params   jobId: string (Job ID)
 * @query    period: string (optional: [7d, 30d, 90d], default: 30d)
 * @response 200 - {
 *   success: true,
 *   data: {
 *     jobMetrics: { views, applications, conversionRate, avgTimeToApply },
 *     applicationFunnel: { views, clicks, applications, shortlisted, interviews },
 *     candidateQuality: { avgRating, experienceBreakdown, skillMatch },
 *     timeline: { dailyViews, dailyApplications }
 *   }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Access denied" }
 * @response 404 - { success: false, message: "Job not found" }
 */
analyticsRouter.get(
  "/recruiter/job/:jobId",
  authorize("recruiter"),
  getJobPerformanceMetrics,
);

// -------------------------------------------------------------------------
// Admin Routes
// -------------------------------------------------------------------------

/**
 * @route   GET /api/v1/analytics/admin/dashboard
 * @desc    Get platform-wide dashboard analytics for administrators
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @query    period: string (optional: [7d, 30d, 90d, 1y], default: 30d)
 * @response 200 - {
 *   success: true,
 *   data: {
 *     platformOverview: { totalUsers, totalJobs, totalApplications, activeRecruiters },
 *     growthMetrics: { userGrowth, jobGrowth, applicationGrowth },
 *     engagement: { dailyActiveUsers, avgSessionDuration, retentionRate },
 *     revenue: { totalRevenue, revenueByPlan, mrr, arr }
 *   }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 */
analyticsRouter.get(
  "/admin/dashboard",
  authorize("admin"),
  getAdminDashboardAnalytics,
);

/**
 * @route   GET /api/v1/analytics/admin/users
 * @desc    Get user growth statistics and demographics analytics
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @query    period: string (optional: [7d, 30d, 90d, 1y], default: 30d),
 *           groupBy: string (optional: [day, week, month], default: day)
 * @response 200 - {
 *   success: true,
 *   data: {
 *     userGrowth: { totalUsers, newUsers, churnedUsers, growthRate },
 *     demographics: { roleBreakdown, locationBreakdown, industryBreakdown },
 *     activity: { activeUsers, loginFrequency, featureUsage },
 *     retention: { cohortAnalysis, retentionByMonth }
 *   }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 */
analyticsRouter.get("/admin/users", authorize("admin"), getUserAnalytics);

/**
 * @route   GET /api/v1/analytics/admin/jobs
 * @desc    Get job statistics and marketplace health analytics
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @query    period: string (optional: [7d, 30d, 90d, 1y], default: 30d),
 *           status: string (optional filter by job status)
 * @response 200 - {
 *   success: true,
 *   data: {
 *     jobMetrics: { totalJobs, activeJobs, filledJobs, avgTimeToFill },
 *     marketplaceHealth: { jobsByCategory, salaryTrends, locationDistribution },
 *     qualityMetrics: { avgJobQuality, spamRate, approvalRate },
 *     recruiterPerformance: { topRecruiters, avgJobsPerRecruiter }
 *   }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 */
analyticsRouter.get("/admin/jobs", authorize("admin"), getJobAnalytics);

export default analyticsRouter;
