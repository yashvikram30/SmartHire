import RecruiterProfile from "../models/RecruiterProfile.model.js";
import { deleteFile } from "../middlewares/upload/upload.middleware.js"; // Adjust path if your middleware is in a different folder
import fs from "fs";

/**
 * @desc    Get current recruiter's company profile
 * @route   GET /api/v1/recruiters/profile
 * @access  Private (Recruiter)
 */
export const getMyCompanyProfile = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Create company profile
 * @route   POST /api/v1/recruiters/profile
 * @access  Private (Recruiter)
 */
export const createCompanyProfile = async (req, res) => {
  try {
    // Check if profile already exists for this user
    const existingProfile = await RecruiterProfile.findOne({
      userId: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists for this user",
      });
    }
    // Ssanitization of the request body
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.isVerified;
    delete sanitizedBody.verificationStatus;
    delete sanitizedBody.verifiedAt;
    delete sanitizedBody.verifiedBy;
    delete sanitizedBody.userId;


    // Create new profile linked to the logged-in user
    const profile = await RecruiterProfile.create({
      ...sanitizedBody,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Company profile created successfully",
      data: profile,
    });
  } catch (error) {
    // Handle Mongoose duplicate key or validation errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate field value entered",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update company profile
 * @route   PUT /api/v1/recruiters/profile
 * @access  Private (Recruiter)
 */
export const updateCompanyProfile = async (req, res) => {
  try {
    // Remove sensitive fields
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.isVerified;
    delete sanitizedBody.verificationStatus;
    delete sanitizedBody.verifiedAt;
    delete sanitizedBody.verifiedBy;
    delete sanitizedBody.userId;

    const profile = await RecruiterProfile.findOneAndUpdate(
      { userId: req.user.id },
      sanitizedBody,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: profile,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Upload company logo
 * @route   POST /api/v1/recruiters/profile/logo
 * @access  Private (Recruiter)
 */
export const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const profile = await RecruiterProfile.findOne({ userId: req.user.id });

    if (!profile) {
      // If profile doesn't exist, we delete the uploaded file to save space
      await deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Please create a company profile before uploading a logo",
      });
    }

    // If there is an existing logo, delete the old file
    if (profile.companyLogo) {
      try {
        await deleteFile(profile.companyLogo);
      } catch (err) {
        console.error("Failed to delete old logo:", err);
        // Continue even if delete fails
      }
    }

    // Update profile with new logo path
    profile.companyLogo = req.file.path;
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Company logo uploaded successfully",
      data: {
        companyLogo: profile.companyLogo,
      },
    });
  } catch (error) {
    // If error occurs, attempt to clean up the file just uploaded
    if (req.file) await deleteFile(req.file.path);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Upload company banner
 * @route   POST /api/v1/recruiters/profile/banner
 * @access  Private (Recruiter)
 */
export const uploadCompanyBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const profile = await RecruiterProfile.findOne({ userId: req.user.id });

    if (!profile) {
      await deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Please create a company profile before uploading a banner",
      });
    }

    // If there is an existing banner, delete the old file
    if (profile.companyBanner) {
      try {
        await deleteFile(profile.companyBanner);
      } catch (err) {
        console.error("Failed to delete old banner:", err);
      }
    }

    profile.companyBanner = req.file.path;
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Company banner uploaded successfully",
      data: {
        companyBanner: profile.companyBanner,
      },
    });
  } catch (error) {
    if (req.file) await deleteFile(req.file.path);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get verification status
 * @route   GET /api/v1/recruiters/verification-status
 * @access  Private (Recruiter)
 */
export const getVerificationStatus = async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({
      userId: req.user.id,
    }).select("isVerified verificationStatus verificationNotes");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ... existing imports

/**
 * @desc    Get public company profile by ID
 * @route   GET /api/v1/recruiters/:id/profile
 * @access  Public
 */
export const getPublicCompanyProfile = async (req, res) => {
  try {
    const id = req.params.id;

    // Try to find by userId first (assuming the ID passed is the User ID)
    let profile = await RecruiterProfile.findOne({ userId: id }).populate(
      "userId",
      "firstName lastName email", // Optionally show recruiter basic info
    );

    // If not found by userId, try finding by the Profile document _id
    if (!profile) {
      try {
        profile = await RecruiterProfile.findById(id).populate(
          "userId",
          "firstName lastName email",
        );
      } catch (err) {
        // Ignore casting error if ID is invalid for findById
        profile = null;
      }
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
