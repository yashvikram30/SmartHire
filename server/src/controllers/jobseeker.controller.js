import JobSeekerProfile from "../models/JobSeekerProfile.model.js";
import User from "../models/User.model.js";
import Skill from "../models/Skills.model.js";
import { deleteFile } from "../middlewares/upload/upload.middleware.js";
import path from "path";

/**
 * @desc    Get current user's job seeker profile
 * @route   GET /api/v1/jobseekers/profile
 * @access  Private (Job Seeker only)
 */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOne({ userId: req.user.id })
      .populate("skills", "name category level");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create your profile first.",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Create job seeker profile
 * @route   POST /api/v1/jobseekers/profile
 * @access  Private (Job Seeker only)
 */
export const createProfile = async (req, res) => {
  try {
    // Check if profile already exists
    const existingProfile = await JobSeekerProfile.findOne({
      userId: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists. Use PUT to update.",
      });
    }

    // Create new profile
    const profile = await JobSeekerProfile.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Update job seeker profile
 * @route   PUT /api/v1/jobseekers/profile
 * @access  Private (Job Seeker only)
 */
export const updateProfile = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create a profile first.",
      });
    }

    // Update fields
    const allowedUpdates = [
      "firstName",
      "lastName",
      "phone",
      "location",
      "profilePicture",
      "headline",
      "summary",
      "workExperience",
      "education",
      "skills",
      "certifications",
      "portfolio",
      "socialLinks",
      "preferences",
      "privacy",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/**
 * @desc    Upload resume (PDF/DOC/DOCX)
 * @route   POST /api/v1/jobseekers/profile/resume
 * @access  Private (Job Seeker only)
 */
export const uploadResumeFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file",
      });
    }
    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      // Delete uploaded file if profile doesn't exist
      await deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create a profile first.",
      });
    }

    // Delete old resume file if exists
    if (profile.resume?.fileUrl) {
      const oldFilePath = path.join(process.cwd(), profile.resume.fileUrl);
      await deleteFile(oldFilePath).catch((err) =>
        console.error("Error deleting old resume:", err)
      );
    }

    // Save new resume info
    profile.resume = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: profile.resume,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await deleteFile(req.file.path).catch((err) =>
        console.error("Error deleting file:", err)
      );
    }

    res.status(500).json({
      success: false,
      message: "Error uploading resume",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete resume
 * @route   DELETE /api/v1/jobseekers/profile/resume
 * @access  Private (Job Seeker only)
 */
export const deleteResume = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (!profile.resume || !profile.resume.fileUrl) {
      return res.status(404).json({
        success: false,
        message: "No resume found to delete",
      });
    }

    // Delete file from server
    const filePath = path.join(process.cwd(), profile.resume.fileUrl);
    await deleteFile(filePath).catch((err) =>
      console.error("Error deleting resume file:", err)
    );

    // Clear resume data from database
    profile.resume = {
      fileName: null,
      fileUrl: null,
      uploadedAt: null,
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting resume",
      error: error.message,
    });
  }
};

/**
 * @desc    Upload video resume
 * @route   POST /api/v1/jobseekers/profile/video-resume
 * @access  Private (Job Seeker only)
 */
export const uploadVideoResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a video file",
      });
    }

    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      // Delete uploaded file if profile doesn't exist
      await deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create a profile first.",
      });
    }

    // Delete old video file if exists
    if (profile.videoResume?.fileUrl) {
      const oldFilePath = path.join(process.cwd(), profile.videoResume.fileUrl);
      await deleteFile(oldFilePath).catch((err) =>
        console.error("Error deleting old video:", err)
      );
    }

    // Save new video info
    profile.videoResume = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/videos/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Video resume uploaded successfully",
      data: profile.videoResume,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await deleteFile(req.file.path).catch((err) =>
        console.error("Error deleting file:", err)
      );
    }

    res.status(500).json({
      success: false,
      message: "Error uploading video resume",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete video resume
 * @route   DELETE /api/v1/jobseekers/profile/video-resume
 * @access  Private (Job Seeker only)
 */
export const deleteVideoResume = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (!profile.videoResume || !profile.videoResume.fileUrl) {
      return res.status(404).json({
        success: false,
        message: "No video resume found to delete",
      });
    }

    // Delete file from server
    const filePath = path.join(process.cwd(), profile.videoResume.fileUrl);
    await deleteFile(filePath).catch((err) =>
      console.error("Error deleting video file:", err)
    );

    // Clear video data from database
    profile.videoResume = {
      fileName: null,
      fileUrl: null,
      uploadedAt: null,
    };

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Video resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting video resume",
      error: error.message,
    });
  }
};

/**
 * @desc    Add portfolio item
 * @route   POST /api/v1/jobseekers/profile/portfolio
 * @access  Private (Job Seeker only)
 */
export const addPortfolioItem = async (req, res) => {
  try {
    const { title, description, projectUrl } = req.body;

    if (!title) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      // Delete uploaded file if profile doesn't exist
      if (req.file) {
        await deleteFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const portfolioItem = {
      title,
      description,
      projectUrl,
    };

    // Add file URL if file was uploaded
    if (req.file) {
      portfolioItem.fileUrl = `/uploads/portfolio/${req.file.filename}`;
    }

    profile.portfolio.push(portfolioItem);
    await profile.save();

    res.status(201).json({
      success: true,
      message: "Portfolio item added successfully",
      data: profile.portfolio[profile.portfolio.length - 1],
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await deleteFile(req.file.path).catch((err) =>
        console.error("Error deleting file:", err)
      );
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding portfolio item",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete portfolio item
 * @route   DELETE /api/v1/jobseekers/profile/portfolio/:itemId
 * @access  Private (Job Seeker only)
 */
export const deletePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const profile = await JobSeekerProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const item = profile.portfolio.find(
      (item) => item._id.toString() === itemId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Portfolio item not found",
      });
    }

    // Delete file from server if exists
    if (item.fileUrl) {
      const filePath = path.join(process.cwd(), item.fileUrl);
      await deleteFile(filePath).catch((err) =>
        console.error("Error deleting portfolio file:", err)
      );
    }

    // Remove item from array
    profile.portfolio = profile.portfolio.filter(
      (item) => item._id.toString() !== itemId
    );

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Portfolio item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting portfolio item",
      error: error.message,
    });
  }
};

/**
 * @desc    Search job seekers (for recruiters)
 * @route   GET /api/v1/jobseekers/search
 * @access  Private (Recruiter only)
 */
export const searchJobSeekers = async (req, res) => {
  try {
    const {
      skills,
      location,
      jobType,
      remoteWorkPreference,
      minExperience,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      "privacy.profileVisibility": "public",
    };

    // Search by skills
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      query.skills = { $in: skillsArray };
    }

    // Search by location
    if (location) {
      query.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } },
      ];
    }

    // Filter by job type preference
    if (jobType) {
      query["preferences.jobType"] = jobType;
    }

    // Filter by remote work preference
    if (remoteWorkPreference) {
      query["preferences.remoteWorkPreference"] = remoteWorkPreference;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const profiles = await JobSeekerProfile.find(query)
      .populate("skills", "name category level")
      .select("-privacy -preferences.desiredSalaryMin -preferences.desiredSalaryMax")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ profileCompleteness: -1, createdAt: -1 });

    const total = await JobSeekerProfile.countDocuments(query);

    res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching job seekers",
      error: error.message,
    });
  }
};

/**
 * @desc    Get job seeker profile by ID (for recruiters)
 * @route   GET /api/v1/jobseekers/:id/profile
 * @access  Private (Recruiter only)
 */
export const getJobSeekerProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await JobSeekerProfile.findOne({
      userId: id,
      "privacy.profileVisibility": "public",
    }).populate("skills", "name category level");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found or not public",
      });
    }

    // Increment profile views
    await profile.incrementViews();

    // Remove sensitive information based on privacy settings
    const profileData = profile.toObject();
    
    if (!profile.privacy.showEmail) {
      delete profileData.email;
    }
    
    if (!profile.privacy.showPhone) {
      delete profileData.phone;
    }

    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving profile",
      error: error.message,
    });
  }
};