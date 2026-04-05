import User from "../models/User.model.js";

/**
 * @desc    Get all users with pagination
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    // Optional filters
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Fetch users
    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken -refreshToken')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUsersbyId = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message
    });
  }
};

/**
 * @desc    Activate user account
 * @route   PATCH /api/v1/users/:id/activate
 * @access  Private/Admin
 */
export const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if already active
    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User account is already active"
      });
    }

    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "User account activated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error activating user",
      error: error.message
    });
  }
};

/**
 * @desc    Deactivate user account
 * @route   PATCH /api/v1/users/:id/deactivate
 * @access  Private/Admin
 */
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      });
    }

    // Check if already inactive
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User account is already inactive"
      });
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "User account deactivated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deactivating user",
      error: error.message
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
};