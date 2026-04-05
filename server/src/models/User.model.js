import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "recruiter", "jobseeker"],
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
      default: "jobseeker",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
// Note: email field already has unique: true which creates an index automatically
UserSchema.index({ isActive: 1, isVerified: 1 });

/* Hash password before save */
UserSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) return;

  try {
    // Hash password
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {}
});

/* Compare password */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* Generate verification token */
UserSchema.methods.generateVerificationToken = function () {
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  this.verificationToken = token;
  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

/* Generate password reset token */
UserSchema.methods.generateResetToken = function () {
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  this.resetPasswordToken = token;
  this.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  return token;
};

/* Update last login */
UserSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

/* Check if user account is accessible */
UserSchema.methods.canAccess = function () {
  return this.isActive && this.isVerified;
};

export default mongoose.model("User", UserSchema);
