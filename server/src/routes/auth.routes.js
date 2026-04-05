import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  refreshToken,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth/auth.middleware.js";
import { body, validationResult } from "express-validator";
const authrouter = express.Router();


const validateRegister = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
    // This function checks if there were errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];



/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 * @body    {
 *   name: string (required),
 *   email: string (required, valid email),
 *   password: string (required, min 6 chars),
 *   role: string (optional, enum: [admin, recruiter, jobseeker])
 * }
 * @response 201 - {
 *   success: true,
 *   message: "User registered successfully",
 *   data: { user: { id, name, email, role, isVerified }, token: string }
 * }
 * @response 400 - { success: false, message: "Validation error message" }
 * @response 500 - { success: false, message: "Server error" }
 */
authrouter.post("/register",validateRegister, register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return tokens
 * @access  Public
 * @body    {
 *   email: string (required),
 *   password: string (required)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Login successful",
 *   data: { user: { id, name, email, role }, accessToken: string }
 * }
 * @response 401 - { success: false, message: "Invalid credentials" }
 * @response 500 - { success: false, message: "Server error" }
 */
authrouter.post("/login", login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Private (Any authenticated user)
 * @headers  Authorization: Bearer <access_token>
 * @response 200 - { success: true, message: "Logout successful" }
 * @response 401 - { success: false, message: "Not authorized" }
 */
authrouter.post("/logout", protect, logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (requires refresh token cookie)
 * @cookies  refreshToken: string
 * @response 200 - {
 *   success: true,
 *   data: { accessToken: string }
 * }
 * @response 401 - { success: false, message: "Invalid refresh token" }
 */
authrouter.post("/refresh-token", refreshToken);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email address
 * @access  Public
 * @body    {
 *   token: string (required)
 * }
 * @response 200 - { success: true, message: "Email verified successfully" }
 * @response 400 - { success: false, message: "Invalid or expired token" }
 */
authrouter.post("/verify-email", verifyEmail);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * @body    {
 *   email: string (required)
 * }
 * @response 200 - { success: true, message: "Password reset email sent" }
 * @response 404 - { success: false, message: "User not found" }
 */
authrouter.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 * @body    {
 *   token: string (required),
 *   password: string (required, min 6 chars)
 * }
 * @response 200 - { success: true, message: "Password reset successful" }
 * @response 400 - { success: false, message: "Invalid or expired token" }
 */
authrouter.post("/reset-password", resetPassword);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user information
 * @access  Private (Any authenticated user)
 * @headers  Authorization: Bearer <access_token>
 * @response 200 - {
 *   success: true,
 *   data: { user: { id, name, email, role, isVerified, isActive } }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 */
authrouter.get("/me", protect, getCurrentUser);

export default authrouter;
