import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js"; // Import your auth
import { uploadCompanyImage, handleMulterError } from "../middlewares/upload/upload.middleware.js"; // Import new multer config
import {
  getMyCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  uploadCompanyBanner,
  getVerificationStatus,
  getPublicCompanyProfile
} from "../controllers/recruiter.controller.js";

const recruiterRouter = express.Router();


recruiterRouter.get("/:id/profile", getPublicCompanyProfile);
// Apply protection to all routes
recruiterRouter.use(protect);
recruiterRouter.use(authorize('recruiter')); // Optional: Ensure only recruiters access

// Profile Routes
recruiterRouter.get("/profile", getMyCompanyProfile);
recruiterRouter.post("/profile", createCompanyProfile);
recruiterRouter.put("/profile", updateCompanyProfile);

// Media Upload Routes (Inject Middleware Here)
recruiterRouter.post(
  "/profile/logo", 
  uploadCompanyImage, 
  handleMulterError, 
  uploadCompanyLogo
);

recruiterRouter.post(
  "/profile/banner", 
  uploadCompanyImage, 
  handleMulterError, 
  uploadCompanyBanner
);

recruiterRouter.get("/verification-status", getVerificationStatus);

export default recruiterRouter;