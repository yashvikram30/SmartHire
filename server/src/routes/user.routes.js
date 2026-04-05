import e from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";
import {
  getUsers,
  getUsersbyId,
  activateUser,
  deactivateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const userRouter = e.Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @query    page: number (default: 1),
 *           limit: number (default: 10),
 *           role: string (optional filter),
 *           isActive: boolean (optional filter),
 *           search: string (optional search by name/email)
 * @response 200 - {
 *   success: true,
 *   data: { users: Array, pagination: { page, limit, total, pages } }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 */
userRouter.get("/", protect, authorize("admin"), getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get specific user by ID
 * @access  Private (Admin or Recruiter)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (User ID)
 * @response 200 - {
 *   success: true,
 *   data: { user: { id, name, email, role, isActive, isVerified, createdAt } }
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Insufficient permissions" }
 * @response 404 - { success: false, message: "User not found" }
 */
userRouter.get("/:id", protect, authorize("admin", "recruiter"), getUsersbyId);

/**
 * @route   PATCH /api/v1/users/:id/activate
 * @desc    Activate a user account
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (User ID)
 * @response 200 - { success: true, message: "User activated successfully" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 404 - { success: false, message: "User not found" }
 */
userRouter.patch("/:id/activate", protect, authorize("admin"), activateUser);

/**
 * @route   PATCH /api/v1/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (User ID)
 * @response 200 - { success: true, message: "User deactivated successfully" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 404 - { success: false, message: "User not found" }
 */
userRouter.patch(
  "/:id/deactivate",
  protect,
  authorize("admin"),
  deactivateUser,
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user account permanently
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (User ID)
 * @response 200 - { success: true, message: "User deleted successfully" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 404 - { success: false, message: "User not found" }
 */
userRouter.delete("/:id", protect, authorize("admin"), deleteUser);

export default userRouter;
