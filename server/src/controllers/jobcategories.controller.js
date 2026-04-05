import JobCategory from "../models/JobCategory.model.js";

/**
 * @desc    Get all job categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getAllCategories = async (req, res) => {
  try {
    const { view, parentId, includeInactive } = req.query;
    const activeOnly = includeInactive !== "true";

    let categories;

    // 1. Tree View (Hierarchical)
    if (view === "tree") {
      categories = await JobCategory.getCategoryTree(activeOnly);
    } 
    // 2. Subcategories View (Specific Parent)
    else if (parentId) {
      categories = await JobCategory.getSubcategories(parentId, activeOnly);
    } 
    // 3. Parent Only View (Top Level)
    else if (view === "parents") {
      categories = await JobCategory.getParentCategories(activeOnly);
    } 
    // 4. Default: Flat List
    else {
      const filter = {};
      if (activeOnly) filter.isActive = true;
      
      // If searching text
      if (req.query.q) {
        categories = await JobCategory.searchCategories(req.query.q, activeOnly);
      } else {
        categories = await JobCategory.find(filter)
          .populate("parentCategory", "name") // Useful context
          .sort({ name: 1 });
      }
    }

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new job category
 * @route   POST /api/v1/categories
 * @access  Private (Admin)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, parentCategory } = req.body;

    // Check if category already exists
    const categoryExists = await JobCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    // Create category
    // Note: The pre-save middleware in your schema will validate hierarchy
    const category = await JobCategory.create({
      name,
      description,
      icon,
      parentCategory: parentCategory || null,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message, // Will catch "Circular reference" errors from schema
    });
  }
};

/**
 * @desc    Update a job category
 * @route   PUT /api/v1/categories/:id
 * @access  Private (Admin)
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, parentCategory, isActive } = req.body;

    const category = await JobCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    
    // Handle parent category change
    if (parentCategory !== undefined) {
      category.parentCategory = parentCategory || null;
    }

    // We use .save() instead of findByIdAndUpdate to ensure the 
    // pre('save') middleware runs to validate hierarchy/circular dependencies
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a job category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (Admin)
 */
export const deleteCategory = async (req, res) => {
  try {
    // We must find the document first to trigger the 'deleteOne' document middleware
    // which checks for subcategories and active jobs
    const category = await JobCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Trigger the pre('deleteOne') middleware defined in schema
    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message, // Will catch "Cannot delete category with..." errors
    });
  }
};