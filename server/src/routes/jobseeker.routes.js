import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";
import {
  uploadResume,
  uploadVideo,
  uploadPortfolio,
  handleMulterError,
} from "../middlewares/upload/upload.middleware.js";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  uploadResumeFile,
  deleteResume,
  uploadVideoResume,
  deleteVideoResume,
  addPortfolioItem,
  deletePortfolioItem,
  searchJobSeekers,
  getJobSeekerProfileById,
} from "../controllers/jobseeker.controller.js";

const jobseekerRouter = express.Router();

// Profile routes (Job Seeker only)
jobseekerRouter.get("/profile", protect, authorize("jobseeker"), getMyProfile);
jobseekerRouter.post("/profile", protect, authorize("jobseeker"), createProfile);
jobseekerRouter.put("/profile", protect, authorize("jobseeker"), updateProfile);

// Resume routes (Job Seeker only)
jobseekerRouter.post(
  "/profile/resume",
  protect,
  authorize("jobseeker"),
  uploadResume,
  handleMulterError,
  uploadResumeFile
);
jobseekerRouter.delete(
  "/profile/resume",
  protect,
  authorize("jobseeker"),
  deleteResume
);

// Video Resume routes (Job Seeker only)
jobseekerRouter.post(
  "/profile/video-resume",
  protect,
  authorize("jobseeker"),
  uploadVideo,
  handleMulterError,
  uploadVideoResume
);
jobseekerRouter.delete(
  "/profile/video-resume",
  protect,
  authorize("jobseeker"),
  deleteVideoResume
);



// Portfolio routes (Job Seeker only)
jobseekerRouter.post(
  "/profile/portfolio",
  protect,
  authorize("jobseeker"),
  uploadPortfolio,
  handleMulterError,
  addPortfolioItem
);
jobseekerRouter.delete(
  "/profile/portfolio/:itemId",
  protect,
  authorize("jobseeker"),
  deletePortfolioItem
);

// Search routes (Recruiter only)
jobseekerRouter.get("/search", protect, authorize("recruiter"), searchJobSeekers);

// Public profile view (Recruiter only)
jobseekerRouter.get(
  "/:id/profile",
  protect,
  authorize("recruiter"),
  getJobSeekerProfileById
);



export default jobseekerRouter;