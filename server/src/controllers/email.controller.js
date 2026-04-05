import User from "../models/User.model.js";
import { sendEmail } from "../utils/emailService.js"; // Adjust path to your service file

/**
 * @desc    Recruiter contacts a candidate directly
 * @route   POST /api/v1/emails/contact-candidate
 * @access  Private (Recruiter)
 */
export const contactCandidate = async (req, res) => {
  try {
    const { candidateId, subject, message } = req.body;
    const recruiterName = `${req.user.firstName} ${req.user.lastName}`; // Assuming attached by middleware

    // 1. Validate input
    if (!candidateId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide candidateId, subject, and message",
      });
    }

    // 2. Find Candidate
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // 3. Construct Email HTML
    // We wrap the message to look professional
    const emailHtml = `
      <h3>New Message from Recruiter via Smart Hire</h3>
      <p><strong>From:</strong> ${recruiterName}</p>
      <hr />
      <h4>${subject}</h4>
      <p style="white-space: pre-wrap;">${message}</p>
      <hr />
      <p><small>You can reply directly to this email to contact the recruiter.</small></p>
    `;

    // 4. Send Email
    // We set the "replyTo" as the recruiter's email so the candidate can reply directly
    // Note: Since our generic helper might not support replyTo yet, we use the transporter directly or update helper
    // For now, we will just send it normally.
    await sendEmail({
      to: candidate.email,
      subject: `[Smart Hire] ${subject}`,
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: "Email sent to candidate successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending email",
      error: error.message,
    });
  }
};

/**
 * @desc    Admin sends broadcast email to users
 * @route   POST /api/v1/emails/admin/broadcast
 * @access  Private (Admin)
 */
export const sendBroadcastEmail = async (req, res) => {
  try {
    const { targetRole, subject, message } = req.body;

    // 1. Validate Input
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide subject and message",
      });
    }

    // 2. Determine Recipients
    let query = {};
    if (targetRole && targetRole !== "all") {
      query.role = targetRole;
    }

    // Fetch users (select only email to be lightweight)
    const users = await User.find(query).select("email");

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for the specified target",
      });
    }

    // 3. Construct Email HTML
    const emailHtml = `
      <h3>Announcement from Smart Hire Admin</h3>
      <hr />
      <h3>${subject}</h3>
      <div style="white-space: pre-wrap;">${message}</div>
      <hr />
      <p><small>You are receiving this email because you are a registered user of Smart Hire.</small></p>
    `;

    // 4. Send Emails (Bulk)
    // Sending individually to avoid exposing all emails in "To" field
    // In production, use a queue (like BullMQ) for this. For now, Promise.all is okay for small batches.
    const emailPromises = users.map((user) =>
      sendEmail({
        to: user.email,
        subject: `[Announcement] ${subject}`,
        html: emailHtml,
      })
    );

    await Promise.allSettled(emailPromises);

    res.status(200).json({
      success: true,
      message: `Broadcast email queued for ${users.length} users`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending broadcast emails",
      error: error.message,
    });
  }
};