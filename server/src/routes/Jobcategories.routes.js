import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/jobcategories.controller.js";

const jobCategoryRouter = express.Router();

// -------------------------------------------------------------------------
// Public Routes
// Accessible by anyone (even without login)
// -------------------------------------------------------------------------

/**
 * @route   GET /api/v1/categories
 * @desc    Get all job categories with hierarchical structure
 * @access  Public
 * @query    view: string (optional: [tree, flat], default: flat),
 *           parentId: string (optional, get subcategories of parent),
 *           q: string (optional, search by category name),
 *           page: number (default: 1),
 *           limit: number (default: 50)
 * @response 200 - {
 *   success: true,
 *   data: {
 *     categories: Array<{ id, name, description, parentId, level }>,
 *     pagination: { page, limit, total, pages }
 *   }
 * }
 */
jobCategoryRouter.get("/", getAllCategories);

// -------------------------------------------------------------------------
// Protected Routes
// Require Login + 'admin' Role
// -------------------------------------------------------------------------

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new job category
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @body    {
 *   name: string (required, unique),
 *   description: string (optional, max 1000 chars),
 *   parentId: string (optional, for subcategories),
 *   icon: string (optional, icon name or URL)
 * }
 * @response 201 - {
 *   success: true,
 *   message: "Category created successfully",
 *   data: { category: CategoryObject }
 * }
 * @response 400 - { success: false, message: "Category already exists" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 */
jobCategoryRouter.post("/", protect, authorize("admin"), createCategory);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update an existing job category
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Category ID)
 * @body    {
 *   name: string (optional),
 *   description: string (optional, max 1000 chars),
 *   parentId: string (optional),
 *   icon: string (optional)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Category updated successfully",
 *   data: { category: CategoryObject }
 * }
 * @response 400 - { success: false, message: "Cannot create circular reference" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 404 - { success: false, message: "Category not found" }
 */
jobCategoryRouter.put("/:id", protect, authorize("admin"), updateCategory);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete a job category
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Category ID)
 * @query    force: boolean (optional, force delete even if category has jobs)
 * @response 200 - {
 *   success: true,
 *   message: "Category deleted successfully"
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 404 - { success: false, message: "Category not found" }
 * @response 409 - { success: false, message: "Category has subcategories or jobs and cannot be deleted" }
 */
jobCategoryRouter.delete("/:id", protect, authorize("admin"), deleteCategory);

export default jobCategoryRouter;
