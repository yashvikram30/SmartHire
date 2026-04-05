import mongoose from "mongoose";
import Application from "../models/Application.model.js";
import Job from "../models/Jobs.models.js"; // Assuming this path
import JobSeekerProfile from "../models/JobSeekerProfile.model.js";

/**
 * @desc    Apply to a job
 * @route   POST /api/v1/applications
 * @access  Private (Job Seeker)
 */
export const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter, screeningAnswers, resumeUsed } = req.body;
    const jobSeekerId = req.user.id;

    // 1. Validate Job Existence
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // 2. Prevent Recruiter from applying to their own job (if logic allows users to have dual roles)
    if (job.recruiterId.toString() === jobSeekerId) {
      return res.status(400).json({ success: false, message: "You cannot apply to your own job listing" });
    }

    // 3. Check if already applied
    const hasApplied = await Application.hasApplied(jobId, jobSeekerId);
    if (hasApplied) {
      return res.status(400).json({ success: false, message: "You have already applied to this job" });
    }

    // 4. Check if Job Seeker Profile exists
    const profile = await JobSeekerProfile.findOne({ userId: jobSeekerId });
    if (!profile) {
      return res.status(400).json({ success: false, message: "Please complete your job seeker profile before applying" });
    }

    // 5. Create Application
    // We get recruiterId directly from the Job model to ensure accuracy
    const application = await Application.create({
      jobId,
      jobSeekerId,
      recruiterId: job.recruiterId,
      coverLetter,
      screeningAnswers,
      resumeUsed: resumeUsed || (profile.resume ? {
        fileName: profile.resume.fileName,
        fileUrl: profile.resume.fileUrl
      } : undefined),
      status: "submitted",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get logged-in job seeker's applications
 * @route   GET /api/v1/applications/my-applications
 * @access  Private (Job Seeker)
 */
export const getMyApplications = async (req, res) => {
  try {
    // Uses the static method defined in your Schema
    const applications = await Application.getByJobSeeker(req.user.id);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all applications for a specific job
 * @route   GET /api/v1/applications/job/:jobId
 * @access  Private (Recruiter)
 */
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Verify Job Ownership
    // We must ensure the person requesting the applications is the recruiter who posted the job
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to view applications for this job" });
    }

    // 2. Fetch Applications
    // Uses the static method defined in Schema
    const applications = await Application.getByJob(jobId);
    
    // 3. Get Stats
    const stats = await Application.getJobStats(jobId);

    res.status(200).json({
      success: true,
      count: applications.length,
      stats,
      data: applications,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single application details
 * @route   GET /api/v1/applications/:id
 * @access  Private (Owner/Recruiter)
 */
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("jobId", "title company location employmentType salary")
      .populate("jobSeekerId", "firstName lastName email phone avatar")
      .populate("recruiterId", "firstName lastName email");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Security Check:
    // User must be either the Job Seeker (Applicant) OR the Recruiter
    const isApplicant = application.jobSeekerId._id.toString() === req.user.id;
    const isRecruiter = application.recruiterId._id.toString() === req.user.id;

    if (!isApplicant && !isRecruiter) {
      return res.status(403).json({ success: false, message: "Not authorized to view this application" });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Withdraw an application
 * @route   PATCH /api/v1/applications/:id/withdraw
 * @access  Private (Job Seeker)
 */
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Verify ownership
    if (application.jobSeekerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to withdraw this application" });
    }

    // Use schema method
    await application.withdraw(req.user.id);

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
      data: application,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update application status
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Private (Recruiter)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Verify ownership (Recruiter only)
    if (application.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this application" });
    }

    // Use schema method to handle logic and history
    await application.updateStatus(status, req.user.id, notes);

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add a note to an application
 * @route   POST /api/v1/applications/:id/notes
 * @access  Private (Recruiter)
 */
export const addRecruiterNote = async (req, res) => {
  try {
    const { note } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await application.addRecruiterNote(note, req.user.id);

    res.status(200).json({
      success: true,
      message: "Note added successfully",
      data: application.recruiterNotes,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Rate a candidate
 * @route   PATCH /api/v1/applications/:id/rating
 * @access  Private (Recruiter)
 */
export const rateCandidate = async (req, res) => {
  try {
    const { rating } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await application.rateApplication(rating);

    res.status(200).json({
      success: true,
      message: "Candidate rated successfully",
      data: { rating: application.rating },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Schedule an interview
 * @route   POST /api/v1/applications/:id/schedule-interview
 * @access  Private (Recruiter)
 */
export const scheduleInterview = async (req, res) => {
  try {
    const { scheduledAt, meetingLink, notes } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await application.scheduleInterview(scheduledAt, meetingLink, notes);

    res.status(200).json({
      success: true,
      message: "Interview scheduled successfully",
      data: application.interviewDetails,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};