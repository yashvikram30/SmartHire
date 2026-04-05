import express from "express";
import { protect, authorize } from "../middlewares/auth/auth.middleware.js";
import {
  getAllSkills,
  searchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skills.controller.js";

const skillsRouter = express.Router();

// -------------------------------------------------------------------------
// Public Routes
// Accessible by anyone (even without login)
// -------------------------------------------------------------------------

/**
 * @route   GET /api/v1/skills
 * @desc    Get all available skills with pagination
 * @access  Public
 * @query    page: number (default: 1),
 *           limit: number (default: 50),
 *           search: string (optional search by skill name),
 *           category: string (optional filter by category)
 * @response 200 - {
 *   success: true,
 *   data: {
 *     skills: Array<{ id, name, category, description }>,
 *     pagination: { page, limit, total, pages }
 *   }
 * }
 */
skillsRouter.get("/", getAllSkills);

/**
 * @route   GET /api/v1/skills/search
 * @desc    Search skills by name or partial match
 * @access  Public
 * @query    q: string (required, search term),
 *           limit: number (default: 10, max: 50)
 * @response 200 - {
 *   success: true,
 *   data: { skills: Array<{ id, name, category }> }
 * }
 * @response 400 - { success: false, message: "Search query required" }
 */
skillsRouter.get("/search", searchSkills);

// -------------------------------------------------------------------------
// Protected Routes
// Require Login + 'admin' Role
// -------------------------------------------------------------------------

/**
 * @route   POST /api/v1/skills
 * @desc    Create a new skill
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @body    {
 *   name: string (required, unique),
 *   category: string (optional),
 *   description: string (optional, max 500 chars)
 * }
 * @response 201 - {
 *   success: true,
 *   message: "Skill created successfully",
 *   data: { skill: SkillObject }
 * }
 * @response 400 - { success: false, message: "Skill already exists" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 */
skillsRouter.post("/", protect, authorize("admin"), createSkill);

/**
 * @route   PUT /api/v1/skills/:id
 * @desc    Update an existing skill
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Skill ID)
 * @body    {
 *   name: string (optional),
 *   category: string (optional),
 *   description: string (optional, max 500 chars)
 * }
 * @response 200 - {
 *   success: true,
 *   message: "Skill updated successfully",
 *   data: { skill: SkillObject }
 * }
 * @response 400 - { success: false, message: "Skill name already exists" }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 404 - { success: false, message: "Skill not found" }
 */
skillsRouter.put("/:id", protect, authorize("admin"), updateSkill);

/**
 * @route   DELETE /api/v1/skills/:id
 * @desc    Delete a skill
 * @access  Private (Admin only)
 * @headers  Authorization: Bearer <access_token>
 * @params   id: string (Skill ID)
 * @response 200 - {
 *   success: true,
 *   message: "Skill deleted successfully"
 * }
 * @response 401 - { success: false, message: "Not authorized" }
 * @response 403 - { success: false, message: "Admin access required" }
 * @response 404 - { success: false, message: "Skill not found" }
 * @response 409 - { success: false, message: "Skill is in use and cannot be deleted" }
 */
skillsRouter.delete("/:id", protect, authorize("admin"), deleteSkill);

export default skillsRouter;
