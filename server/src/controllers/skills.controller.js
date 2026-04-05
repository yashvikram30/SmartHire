import Skill from "../models/Skills.model.js";

/**
 * @desc    Get all skills (with optional filtering)
 * @route   GET /api/v1/skills
 * @access  Public
 */
export const getAllSkills = async (req, res) => {
  try {
    const { category, includeInactive } = req.query;
    
    // Determine if we should show inactive skills (defaults to false)
    const activeOnly = includeInactive !== "true";
    
    let skills;

    // Use schema static methods based on query params
    if (category) {
      skills = await Skill.getByCategory(category, activeOnly);
    } else if (activeOnly) {
      skills = await Skill.getActiveSkills();
    } else {
      // If no category and includeInactive is true, fetch everything
      skills = await Skill.find().sort({ name: 1 });
    }

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching skills",
      error: error.message,
    });
  }
};

/**
 * @desc    Search for skills
 * @route   GET /api/v1/skills/search
 * @access  Public
 */
export const searchSkills = async (req, res) => {
  try {
    const { q, includeInactive } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search term using the 'q' query parameter",
      });
    }

    const activeOnly = includeInactive !== "true";

    // Use the updated search method that returns exact matches first
    const skills = await Skill.searchSkills(q, activeOnly);

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching skills",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new skill
 * @route   POST /api/v1/skills
 * @access  Private (Admin)
 */
export const createSkill = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    // Use findOrCreate static method to handle duplicates gracefully
    // Note: The schema normalizes the name to lowercase automatically
    const skill = await Skill.findOrCreate(name, category);

    // Check if it was just created or if it already existed
    // Mongoose findOrCreate usually implies returning the doc. 
    // Since we wrote a custom static, we know it returns the document.
    // If you need to know if it was *new*, you might need to check creation time,
    // but typically for this use case returning the skill is sufficient.

    res.status(201).json({
      success: true,
      message: "Skill created (or retrieved if existing)",
      data: skill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating skill",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a skill
 * @route   PUT /api/v1/skills/:id
 * @access  Private (Admin)
 */
export const updateSkill = async (req, res) => {
  try {
    const { name, category, isActive } = req.body;

    // Find and update
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      {
        name: name ? name.toLowerCase() : undefined, // Ensure lowercase if updating name
        category,
        isActive,
      },
      { new: true, runValidators: true } // Return updated doc & run schema validators
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    // Handle duplicate name error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A skill with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating skill",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a skill
 * @route   DELETE /api/v1/skills/:id
 * @access  Private (Admin)
 */
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check if skill is being used in any jobs
    const Job = mongoose.model("Job");
    const jobCount = await Job.countDocuments({ requiredSkills: skill._id });

    if (jobCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Skill is in use by ${jobCount} job(s) and cannot be deleted`,
      });
    }

    await skill.deleteOne();

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting skill",
      error: error.message,
    });
  }
};