import Application from '../models/Application.js';
import Notice from '../models/Notice.js';

// @desc    Apply to a job notice
// @route   POST /api/applications/apply/:noticeId
// @access  Private (Worker only)
export const applyToNotice = async (req, res) => {
  try {
    const noticeId = req.params.noticeId;

    // Check notice exists and is open
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Job notice not found' });
    }
    if (notice.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This notice is closed and no longer accepting applications' });
    }

    // Ensure user is not the employer posting this job
    if (notice.employer.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Employers cannot apply to their own notices' });
    }

    // Check if worker already applied
    const alreadyApplied = await Application.findOne({ notice: noticeId, worker: req.user.id });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this notice' });
    }

    // Create application
    const application = await Application.create({
      notice: noticeId,
      worker: req.user.id
    });

    // Increment notice applied headcount count
    notice.peopleApplied = (notice.peopleApplied || 0) + 1;
    await notice.save();

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all applications submitted by logged-in worker
// @route   GET /api/applications/my-applications
// @access  Private (Worker only)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ worker: req.user.id })
      .populate({
        path: 'notice',
        populate: {
          path: 'employer',
          select: 'name companyName location profileImage phone'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all applicants for an employer's job notice
// @route   GET /api/applications/notice/:noticeId
// @access  Private (Employer only)
export const getNoticeApplicants = async (req, res) => {
  try {
    const noticeId = req.params.noticeId;

    // Check notice ownership
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    if (notice.employer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this notice' });
    }

    const applicants = await Application.find({ notice: noticeId })
      .populate('worker', 'name email phone location profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applicants.length, applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status (Accept / Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer or Worker)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate target status
    if (!['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status type' });
    }

    const application = await Application.findById(req.params.id)
      .populate('notice');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application log not found' });
    }

    // Authorization checks
    if (status === 'cancelled') {
      // Only worker who applied can cancel
      if (application.worker.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to withdraw this application' });
      }
    } else {
      // Only employer who posted notice can accept/reject
      if (application.notice.employer.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to process status for this application' });
      }
    }

    application.status = status;
    await application.save();

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
