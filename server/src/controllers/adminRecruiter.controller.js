import RecruiterProfile from "../models/RecruiterProfile.model.js";
import User from "../models/User.model.js";

/**
 * @desc    Get all pending recruiter verifications
 * @route   GET /api/v1/admin/recruiters/pending
 * @access  Admin only
 */
export const getPendingVerification = async (req, res) => {
  try {
    // Find all recruiter profiles with pending verification status
    const pendingRecruiters = await RecruiterProfile.find({
      verificationStatus: "pending",
    })
      .populate("userId", "name email createdAt lastLogin")
      .sort({ createdAt: -1 }); // Most recent first

    // Calculate profile completeness for each recruiter
    const recruitersWithCompleteness = pendingRecruiters.map((recruiter) => {
      const recruiterObj = recruiter.toObject();
      recruiterObj.profileCompleteness = recruiter.calculateProfileCompleteness();
      return recruiterObj;
    });

    return res.status(200).json({
      success: true,
      count: recruitersWithCompleteness.length,
      data: recruitersWithCompleteness,
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching pending verifications",
      error: error.message,
    });
  }
};

/**
 * @desc    Approve/verify a recruiter
 * @route   PATCH /api/v1/admin/recruiters/:id/verify
 * @access  Admin only
 */
export const verifyRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id; // Admin user ID from protect middleware

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recruiter profile ID format",
      });
    }

    // Find the recruiter profile
    const recruiterProfile = await RecruiterProfile.findById(id).populate(
      "userId",
      "name email"
    );

    if (!recruiterProfile) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    // Check if already verified
    if (recruiterProfile.verificationStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Recruiter is already verified",
      });
    }

    // Use the schema method to approve verification
    await recruiterProfile.approveVerification(adminId);

    // Update the User model's isVerified field
    await User.findByIdAndUpdate(recruiterProfile.userId, {
      isVerified: true,
    });

    return res.status(200).json({
      success: true,
      message: "Recruiter verified successfully",
      data: {
        recruiterId: recruiterProfile._id,
        companyName: recruiterProfile.companyName,
        verificationStatus: recruiterProfile.verificationStatus,
        verifiedAt: recruiterProfile.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Error verifying recruiter:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying recruiter",
      error: error.message,
    });
  }
};

/**
 * @desc    Reject a recruiter verification
 * @route   PATCH /api/v1/admin/recruiters/:id/reject
 * @access  Admin only
 */
export const rejectRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id; // Admin user ID from protect middleware

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recruiter profile ID format",
      });
    }

    // Validate rejection notes
    if (!notes || notes.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection notes are required",
      });
    }

    // Find the recruiter profile
    const recruiterProfile = await RecruiterProfile.findById(id).populate(
      "userId",
      "name email"
    );

    if (!recruiterProfile) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    // Check if already rejected
    if (recruiterProfile.verificationStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Recruiter is already rejected",
      });
    }

    // Use the schema method to reject verification
    await recruiterProfile.rejectVerification(adminId, notes);

    // Update the User model's isVerified field
    await User.findByIdAndUpdate(recruiterProfile.userId, {
      isVerified: false,
    });

    return res.status(200).json({
      success: true,
      message: "Recruiter verification rejected",
      data: {
        recruiterId: recruiterProfile._id,
        companyName: recruiterProfile.companyName,
        verificationStatus: recruiterProfile.verificationStatus,
        verificationNotes: recruiterProfile.verificationNotes,
      },
    });
  } catch (error) {
    console.error("Error rejecting recruiter:", error);
    return res.status(500).json({
      success: false,
      message: "Error rejecting recruiter",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/v1/admin/recruiters/
 * @desc    Get all recruiter profiles
 * @access  Admin only
 */
export const getallprofiles = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get filter parameters (optional)
    const { verificationStatus, isVerified, industry, companySize } = req.query;

    // Build filter object
    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (industry) filter.industry = industry;
    if (companySize) filter.companySize = companySize;

    // Get total count for pagination
    const totalProfiles = await RecruiterProfile.countDocuments(filter);

    // Fetch recruiter profiles with pagination and sorting
    const profiles = await RecruiterProfile.find(filter)
      .populate('userId', 'name email role') // Populate user details
      .populate('verifiedBy', 'name email') // Populate admin who verified
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for better performance

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProfiles / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: 'Recruiter profiles retrieved successfully',
      data: {
        profiles,
        pagination: {
          currentPage: page,
          totalPages,
          totalProfiles,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching recruiter profiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching recruiter profiles',
      error: error.message,
    });
  }
};