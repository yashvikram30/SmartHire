import SavedJob from "../models/SavedJobs.model.js";
import Job from "../models/Jobs.models.js";
import JobSeekerProfile from "../models/JobSeekerProfile.model.js";

/**
 * @desc    Get all saved jobs for the current user
 * @route   GET /api/v1/saved-jobs
 * @access  Private (Job Seeker)
 */
export const getSavedJobs = async (req, res) => {
  try {
    const jobSeekerId = req.user.id;

    // Use the static method defined in schema for consistent population
    const savedJobs = await SavedJob.getUserSavedJobs(jobSeekerId);

    // Get stats using the schema static method
    const stats = await SavedJob.getUserStats(jobSeekerId);

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      stats,
      data: savedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching saved jobs",
      error: error.message,
    });
  }
};

/**
 * @desc    Save a job
 * @route   POST /api/v1/saved-jobs
 * @access  Private (Job Seeker)
 */
export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const jobSeekerId = req.user.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // 1. Verify Job exists
    // (Note: The schema pre-save hook also does this, but checking here gives a cleaner error)
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // 2. Check if already saved
    // We use the static method isSaved from your schema
    const isAlreadySaved = await SavedJob.isSaved(jobSeekerId, jobId);
    if (isAlreadySaved) {
      return res.status(400).json({
        success: false,
        message: "You have already saved this job",
      });
    }

    // 3. Create saved job entry
    const savedJob = await SavedJob.create({
      jobSeekerId,
      jobId,
    });

    res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: savedJob,
    });
  } catch (error) {
    // Handle duplicate key error just in case race condition occurs
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Job already saved",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saving job",
      error: error.message,
    });
  }
};

/**
 * @desc    Unsave a job
 * @route   DELETE /api/v1/saved-jobs/:jobId
 * @access  Private (Job Seeker)
 */
export const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobSeekerId = req.user.id;

    // We search by both jobSeekerId and jobId to ensure the user owns the save
    // This assumes :jobId in the route refers to the JOB's _id, not the SavedJob document _id
    const deletedJob = await SavedJob.findOneAndDelete({
      jobId: jobId,
      jobSeekerId: jobSeekerId,
    });

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found or already removed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing saved job",
      error: error.message,
    });
  }
};
