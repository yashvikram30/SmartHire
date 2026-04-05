import mongoose from "mongoose";
import { type } from "os";

const RecruiterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },

    companyLogo: {
      type: String,
      trim: true,
    },

    companyBanner: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },

    companySize: {
      type: String,
      enum: {
        values: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
        message: "{VALUE} is not a valid company size",
      },
    },

    companyDescription: {
      type: String,
      trim: true,
      maxlength: [2000, "Company description cannot exceed 2000 characters"],
    },

    companyCulture: {
      type: String,
      trim: true,
      maxlength: [1000, "Company culture cannot exceed 1000 characters"],
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
      address: {
        type: String,
        trim: true,
        maxlength: [300, "Address cannot exceed 300 characters"],
      },
    },
    foundedYear: {
      type: Number,
      min: [1800, "Founded year must be after 1800"],
      max: [new Date().getFullYear(), "Founded year cannot be in the future"],
    },
    contactPerson: {
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      designation: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Please provide a valid email address",
        ],
      },
      phone: {
        type: String,
        trim: true,
        match: [
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
          "Please provide a valid phone number",
        ],
      },
    },

    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
        "Please provide a valid website URL",
      ],
    },

    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      facebook: {
        type: String,
        trim: true,
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a valid verification status",
      },
      default: "pending",
    },

    verificationNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Verification notes cannot exceed 1000 characters"],
    },

    verifiedAt: {
      type: Date,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  },
);

// Indexes for better query performance
// Note: userId field already has unique: true which creates an index automatically
RecruiterProfileSchema.index({ companyName: 1 });
RecruiterProfileSchema.index({ industry: 1 });
RecruiterProfileSchema.index({ "location.city": 1, "location.country": 1 });
RecruiterProfileSchema.index({ verificationStatus: 1 });
RecruiterProfileSchema.index({ isVerified: 1 });

// Virtual for contact person full name
RecruiterProfileSchema.virtual("contactPersonFullName").get(function () {
  if (this.contactPerson?.firstName && this.contactPerson?.lastName) {
    return `${this.contactPerson.firstName} ${this.contactPerson.lastName}`;
  }
  return null;
});

// Virtual for full location
RecruiterProfileSchema.virtual("fullLocation").get(function () {
  const parts = [];

  if (this.location?.city) parts.push(this.location.city);
  if (this.location?.state) parts.push(this.location.state);
  if (this.location?.country) parts.push(this.location.country);

  return parts.length > 0 ? parts.join(", ") : null;
});

// Method to approve verification
RecruiterProfileSchema.methods.approveVerification = async function (adminId) {
  this.isVerified = true;
  this.verificationStatus = "approved";
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;

  return this.save();
};

// Method to reject verification
RecruiterProfileSchema.methods.rejectVerification = async function (
  adminId,
  notes,
) {
  this.isVerified = false;
  this.verificationStatus = "rejected";
  this.verificationNotes = notes;
  this.verifiedBy = adminId;

  return this.save();
};

// Method to check if profile is complete
RecruiterProfileSchema.methods.isProfileComplete = function () {
  const requiredFields = [
    this.companyName,
    this.industry,
    this.companyDescription,
    this.location?.city,
    this.location?.country,
    this.contactPerson?.firstName,
    this.contactPerson?.lastName,
    this.contactPerson?.email,
    this.contactPerson?.phone,
  ];

  return requiredFields.every((field) => field && field.trim !== "");
};

// Method to calculate profile completeness percentage
RecruiterProfileSchema.methods.calculateProfileCompleteness = function () {
  let completeness = 0;
  const weights = {
    companyName: 10,
    companyLogo: 10,
    industry: 10,
    companySize: 5,
    companyDescription: 15,
    companyCulture: 10,
    location: 10,
    contactPerson: 15,
    website: 10,
    socialLinks: 5,
  };

  if (this.companyName) completeness += weights.companyName;
  if (this.companyLogo) completeness += weights.companyLogo;
  if (this.industry) completeness += weights.industry;
  if (this.companySize) completeness += weights.companySize;
  if (this.companyDescription) completeness += weights.companyDescription;
  if (this.companyCulture) completeness += weights.companyCulture;
  if (this.location?.city && this.location?.country)
    completeness += weights.location;

  // Contact person completeness
  const contactFields = [
    this.contactPerson?.firstName,
    this.contactPerson?.lastName,
    this.contactPerson?.email,
    this.contactPerson?.phone,
  ];
  const contactComplete = contactFields.filter(Boolean).length;
  completeness += (contactComplete / 4) * weights.contactPerson;

  if (this.website) completeness += weights.website;

  // Social links completeness
  const socialLinks = [
    this.socialLinks?.linkedin,
    this.socialLinks?.twitter,
    this.socialLinks?.facebook,
  ];
  const socialComplete = socialLinks.filter(Boolean).length;
  completeness += (socialComplete / 3) * weights.socialLinks;

  return Math.min(Math.round(completeness), 100);
};

// Pre-save middleware to auto-update verification status
RecruiterProfileSchema.pre("save", function () {
  // If verification is approved, ensure isVerified is true
  if (this.verificationStatus === "approved" && !this.isVerified) {
    this.isVerified = true;
  }

  // If verification is pending or rejected, ensure isVerified is false
  if (
    (this.verificationStatus === "pending" ||
      this.verificationStatus === "rejected") &&
    this.isVerified
  ) {
    this.isVerified = false;
  }
});

// Ensure virtuals are included in JSON output
RecruiterProfileSchema.set("toJSON", { virtuals: true });
RecruiterProfileSchema.set("toObject", { virtuals: true });

export default mongoose.model("RecruiterProfile", RecruiterProfileSchema);
