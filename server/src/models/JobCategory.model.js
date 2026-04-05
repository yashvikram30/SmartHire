import mongoose from "mongoose";

const JobCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    icon: {
      type: String,
      trim: true,
    },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      default: null,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index for filtering active categories
JobCategorySchema.index({ isActive: 1, parentCategory: 1 });

// Text index for search functionality
JobCategorySchema.index({ name: "text", description: "text" });

// Virtual for subcategories
JobCategorySchema.virtual("subcategories", {
  ref: "JobCategory",
  localField: "_id",
  foreignField: "parentCategory",
});

// Virtual to check if category is a parent (has subcategories)
JobCategorySchema.virtual("isParent").get(function () {
  return this.parentCategory === null || this.parentCategory === undefined;
});

// Virtual to check if category is a subcategory
JobCategorySchema.virtual("isSubcategory").get(function () {
  return !!this.parentCategory;
});

// Method to deactivate category
JobCategorySchema.methods.deactivate = async function () {
  this.isActive = false;
  return this.save();
};

// Method to activate category
JobCategorySchema.methods.activate = async function () {
  this.isActive = true;
  return this.save();
};

// Method to toggle active status
JobCategorySchema.methods.toggleActive = async function () {
  this.isActive = !this.isActive;
  return this.save();
};

// Method to get full category path (e.g., "Technology > Web Development")
JobCategorySchema.methods.getFullPath = async function () {
  if (!this.parentCategory) {
    return this.name;
  }

  const parent = await mongoose.model("JobCategory").findById(this.parentCategory);
  if (parent) {
    const parentPath = await parent.getFullPath();
    return `${parentPath} > ${this.name}`;
  }

  return this.name;
};

// Static method to get all active categories
JobCategorySchema.statics.getActiveCategories = function (filters = {}) {
  return this.find({ isActive: true, ...filters }).sort({ name: 1 });
};

// Static method to get parent categories (top-level)
JobCategorySchema.statics.getParentCategories = function (activeOnly = true) {
  const query = { parentCategory: null };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query).sort({ name: 1 });
};

// Static method to get subcategories of a parent
JobCategorySchema.statics.getSubcategories = function (
  parentId,
  activeOnly = true
) {
  const query = { parentCategory: parentId };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query).sort({ name: 1 });
};

// Static method to get category tree (hierarchical structure)
JobCategorySchema.statics.getCategoryTree = async function (activeOnly = true) {
  const query = { parentCategory: null };
  if (activeOnly) {
    query.isActive = true;
  }

  const parents = await this.find(query).sort({ name: 1 });

  const tree = [];

  for (const parent of parents) {
    const subcategoryQuery = { parentCategory: parent._id };
    if (activeOnly) {
      subcategoryQuery.isActive = true;
    }

    const subcategories = await this.find(subcategoryQuery).sort({ name: 1 });

    tree.push({
      _id: parent._id,
      name: parent.name,
      description: parent.description,
      icon: parent.icon,
      isActive: parent.isActive,
      subcategories: subcategories.map((sub) => ({
        _id: sub._id,
        name: sub.name,
        description: sub.description,
        icon: sub.icon,
        isActive: sub.isActive,
      })),
    });
  }

  return tree;
};

// Static method to search categories
JobCategorySchema.statics.searchCategories = function (
  searchTerm,
  activeOnly = true
) {
  const query = {
    $text: { $search: searchTerm },
  };

  if (activeOnly) {
    query.isActive = true;
  }

  return this.find(query, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .populate("parentCategory", "name");
};

// Static method to get category statistics
JobCategorySchema.statics.getStatistics = async function () {
  const totalCategories = await this.countDocuments();
  const activeCategories = await this.countDocuments({ isActive: true });
  const parentCategories = await this.countDocuments({ parentCategory: null });
  const subcategories = await this.countDocuments({
    parentCategory: { $ne: null },
  });

  // Get job count per category (requires Job model)
  const categoriesWithJobCount = await this.aggregate([
    {
      $lookup: {
        from: "jobs", // Collection name for Job model
        localField: "_id",
        foreignField: "category",
        as: "jobs",
      },
    },
    {
      $project: {
        name: 1,
        jobCount: { $size: "$jobs" },
      },
    },
    {
      $sort: { jobCount: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return {
    total: totalCategories,
    active: activeCategories,
    inactive: totalCategories - activeCategories,
    parents: parentCategories,
    subcategories: subcategories,
    topCategories: categoriesWithJobCount,
  };
};

// Static method to validate parent-child relationship
JobCategorySchema.statics.validateHierarchy = async function (
  categoryId,
  parentId
) {
  // Prevent self-reference
  if (categoryId.toString() === parentId.toString()) {
    throw new Error("A category cannot be its own parent");
  }

  // Prevent circular reference (child becoming parent of its parent)
  const parentCategory = await this.findById(parentId);
  if (parentCategory && parentCategory.parentCategory) {
    if (parentCategory.parentCategory.toString() === categoryId.toString()) {
      throw new Error("Circular reference detected: Cannot create parent-child loop");
    }
  }

  return true;
};

// Pre-save middleware to validate hierarchy
JobCategorySchema.pre("save", async function () {
  // If setting a parent category, validate the hierarchy
  if (this.isModified("parentCategory") && this.parentCategory) {
    const JobCategory = mongoose.model("JobCategory");
    await JobCategory.validateHierarchy(this._id, this.parentCategory);
  }
});

// Pre-remove middleware to handle subcategories
JobCategorySchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // Check if category has subcategories
    const subcategories = await mongoose
      .model("JobCategory")
      .find({ parentCategory: this._id });

    if (subcategories.length > 0) {
      throw new Error(
        "Cannot delete category with subcategories. Delete or reassign subcategories first."
      );
    }

    // Check if category has active jobs
    const Job = mongoose.model("Job");
    const jobCount = await Job.countDocuments({ category: this._id });

    if (jobCount > 0) {
      throw new Error(
        `Cannot delete category with ${jobCount} active job(s). Reassign jobs first.`
      );
    }
  }
);

// Ensure virtuals are included in JSON output
JobCategorySchema.set("toJSON", { virtuals: true });
JobCategorySchema.set("toObject", { virtuals: true });

export default mongoose.model("JobCategory", JobCategorySchema);