import mongoose from "mongoose";

const JobSeekerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        "Please provide a valid phone number",
      ],
    },
    location: {
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [120, "Headline cannot exceed 120 characters"],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [2000, "Summary cannot exceed 2000 characters"],
    },

    workExperience: [
      {
        company: {
          type: String,
          required: [true, "Company name is required"],
          trim: true,
        },
        title: {
          type: String,
          required: [true, "Job title is required"],
          trim: true,
        },
        startDate: {
          type: Date,
          required: [true, "Start date is required"],
        },
        endDate: {
          type: Date,
        },
        isCurrentRole: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          trim: true,
          maxlength: [1000, "Description cannot exceed 1000 characters"],
        },
        location: {
          type: String,
          trim: true,
        },
      },
    ],

    education: [
      {
        institution: {
          type: String,
          required: [true, "Institution name is required"],
          trim: true,
        },
        degree: {
          type: String,
          required: [true, "Degree is required"],
          trim: true,
        },
        fieldOfStudy: {
          type: String,
          trim: true,
        },
        startDate: {
          type: Date,
          required: [true, "Start date is required"],
        },
        endDate: {
          type: Date,
        },
        grade: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
          maxlength: [500, "Description cannot exceed 500 characters"],
        },
      },
    ],

    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],

    certifications: [
      {
        name: {
          type: String,
          required: [true, "Certification name is required"],
          trim: true,
        },
        issuingOrganization: {
          type: String,
          required: [true, "Issuing organization is required"],
          trim: true,
        },
        issueDate: {
          type: Date,
          required: [true, "Issue date is required"],
        },
        expiryDate: {
          type: Date,
        },
        credentialId: {
          type: String,
          trim: true,
        },
        credentialUrl: {
          type: String,
          trim: true,
        },
      },
    ],

    resume: {
      fileName: {
        type: String,
        trim: true,
      },
      fileUrl: {
        type: String,
        trim: true,
      },
      uploadedAt: {
        type: Date,
      },
    },

    portfolio: [
      {
        title: {
          type: String,
          required: [true, "Portfolio title is required"],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
          maxlength: [500, "Description cannot exceed 500 characters"],
        },
        fileUrl: {
          type: String,
          trim: true,
        },
        projectUrl: {
          type: String,
          trim: true,
        },
      },
    ],

    videoResume: {
      fileName: {
        type: String,
        trim: true,
      },
      fileUrl: {
        type: String,
        trim: true,
      },
      uploadedAt: {
        type: Date,
      },
    },

    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
      },
      github: {
        type: String,
        trim: true,
      },
      portfolio: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
    },

    preferences: {
      jobType: [
        {
          type: String,
          enum: {
            values: ["full-time", "part-time", "contract", "internship","freelance"],
            message: "{VALUE} is not a valid job type",
          },
        },
      ],
      desiredSalaryMin: {
        type: Number,
        min: [0, "Minimum salary cannot be negative"],
      },
      desiredSalaryMax: {
        type: Number,
        min: [0, "Maximum salary cannot be negative"],
        validate: {
          validator: function (value) {
            return (
              !this.preferences.desiredSalaryMin ||
              value >= this.preferences.desiredSalaryMin
            );
          },
          message:
            "Maximum salary must be greater than or equal to minimum salary",
        },
      },
      willingToRelocate: {
        type: Boolean,
        default: false,
      },
      remoteWorkPreference: {
        type: String,
        enum: {
          values: ["remote", "hybrid", "onsite", "flexible"],
          message: "{VALUE} is not a valid remote work preference",
        },
      },
    },

    privacy: {
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      profileVisibility: {
        type: String,
        enum: {
          values: ["public", "private"],
          message: "{VALUE} is not a valid visibility option",
        },
        default: "public",
      },
    },

    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    profileViews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  },
);

// Indexes for better query performance
// Note: userId field already has unique: true which creates an index automatically
JobSeekerProfileSchema.index({ "location.city": 1, "location.country": 1 });
JobSeekerProfileSchema.index({ skills: 1 });
JobSeekerProfileSchema.index({ profileCompleteness: -1 });
JobSeekerProfileSchema.index({ "privacy.profileVisibility": 1 });

// Virtual for full name
JobSeekerProfileSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to calculate profile completeness
JobSeekerProfileSchema.methods.calculateProfileCompleteness = function () {
  let completeness = 0;
  const weights = {
    firstName: 5,
    lastName: 5,
    phone: 5,
    location: 5,
    profilePicture: 10,
    headline: 10,
    summary: 10,
    workExperience: 15,
    education: 15,
    skills: 10,
    resume: 10,
  };

  if (this.firstName) completeness += weights.firstName;
  if (this.lastName) completeness += weights.lastName;
  if (this.phone) completeness += weights.phone;
  if (this.location?.city && this.location?.country)
    completeness += weights.location;
  if (this.profilePicture) completeness += weights.profilePicture;
  if (this.headline) completeness += weights.headline;
  if (this.summary) completeness += weights.summary;
  if (this.workExperience?.length > 0) completeness += weights.workExperience;
  if (this.education?.length > 0) completeness += weights.education;
  if (this.skills?.length > 0) completeness += weights.skills;
  if (this.resume?.fileUrl) completeness += weights.resume;

  this.profileCompleteness = Math.min(completeness, 100);
  return this.profileCompleteness;
};

// Method to increment profile views
JobSeekerProfileSchema.methods.incrementViews = async function () {
  this.profileViews += 1;
  return this.save({ validateBeforeSave: false });
};

// Pre-save hook to auto-calculate profile completeness
JobSeekerProfileSchema.pre("save", function () {
  if (this.isModified()) {
    this.calculateProfileCompleteness();
  }
});

// Ensure virtuals are included in JSON output
JobSeekerProfileSchema.set("toJSON", { virtuals: true });
JobSeekerProfileSchema.set("toObject", { virtuals: true });

export default mongoose.model("JobSeekerProfile", JobSeekerProfileSchema);
