import { supabaseAdmin } from '../config/supabase.js';

// @desc    Apply to a job notice
// @route   POST /api/applications/apply/:noticeId
// @access  Private (Worker only)
export const applyToNotice = async (req, res) => {
  try {
    const noticeId = req.params.noticeId;

    // Check notice exists and is open
    const { data: notice, error: noticeError } = await supabaseAdmin
      .from('notices')
      .select('id, status, employer_id, people_applied')
      .eq('id', noticeId)
      .single();

    if (noticeError || !notice) {
      return res.status(404).json({ success: false, message: 'Job notice not found' });
    }
    if (notice.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This notice is closed and no longer accepting applications' });
    }

    // Ensure user is not the employer posting this job
    if (notice.employer_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Employers cannot apply to their own notices' });
    }

    // Check if worker already applied
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('notice_id', noticeId)
      .eq('worker_id', req.user.id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this notice' });
    }

    // Create application
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .insert({
        notice_id: noticeId,
        worker_id: req.user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (appError) {
      console.error('Apply to notice error:', appError);
      return res.status(500).json({ success: false, message: appError.message });
    }

    // Increment notice applied headcount
    await supabaseAdmin
      .from('notices')
      .update({ people_applied: (notice.people_applied || 0) + 1 })
      .eq('id', noticeId);

    res.status(201).json({
      success: true,
      application: mapApplication(application)
    });
  } catch (error) {
    console.error('Apply to notice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all applications submitted by logged-in worker
// @route   GET /api/applications/my-applications
// @access  Private (Worker only)
export const getMyApplications = async (req, res) => {
  try {
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        notice:notices (
          *,
          employer:profiles!employer_id (id, name, company_name, district, profile_image, phone)
        )
      `)
      .eq('worker_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my applications error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    const mapped = (applications || []).map(app => {
      const result = mapApplication(app);
      if (app.notice) {
        result.notice = mapNoticeForApp(app.notice);
      }
      return result;
    });

    res.json({ success: true, count: mapped.length, applications: mapped });
  } catch (error) {
    console.error('Get my applications error:', error);
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
    const { data: notice, error: noticeError } = await supabaseAdmin
      .from('notices')
      .select('id, employer_id')
      .eq('id', noticeId)
      .single();

    if (noticeError || !notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    if (notice.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this notice' });
    }

    const { data: applicants, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        worker:profiles!worker_id (id, name, email, phone, district, profile_image)
      `)
      .eq('notice_id', noticeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get notice applicants error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    const mapped = (applicants || []).map(app => {
      const result = mapApplication(app);
      if (app.worker) {
        result.worker = {
          _id: app.worker.id,
          id: app.worker.id,
          name: app.worker.name,
          email: app.worker.email,
          phone: app.worker.phone,
          location: app.worker.district,
          profileImage: app.worker.profile_image
        };
      }
      return result;
    });

    res.json({ success: true, count: mapped.length, applicants: mapped });
  } catch (error) {
    console.error('Get notice applicants error:', error);
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

    // Fetch application with its notice
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        notice:notices (id, employer_id)
      `)
      .eq('id', req.params.id)
      .single();

    if (fetchError || !application) {
      return res.status(404).json({ success: false, message: 'Application log not found' });
    }

    // Authorization checks
    if (status === 'cancelled') {
      // Only worker who applied can cancel
      if (application.worker_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to withdraw this application' });
      }
    } else {
      // Only employer who posted notice can accept/reject
      if (!application.notice || application.notice.employer_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to process status for this application' });
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('Update application status error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, application: mapApplication(updated) });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// =====================
// Helpers
// =====================
function mapApplication(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    notice: row.notice_id,
    worker: row.worker_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapNoticeForApp(notice) {
  if (!notice) return null;
  return {
    _id: notice.id,
    id: notice.id,
    title: notice.title,
    category: notice.category,
    description: notice.description,
    salary: notice.salary,
    salaryType: notice.salary_type,
    peopleNeeded: notice.people_needed,
    peopleApplied: notice.people_applied,
    location: notice.location,
    address: notice.address,
    date: notice.date,
    workingTime: notice.working_time,
    phoneNumber: notice.phone_number,
    requirements: notice.requirements || [],
    status: notice.status,
    employer: notice.employer ? {
      _id: notice.employer.id,
      id: notice.employer.id,
      name: notice.employer.name,
      companyName: notice.employer.company_name,
      location: notice.employer.district,
      profileImage: notice.employer.profile_image,
      phone: notice.employer.phone
    } : null,
    createdAt: notice.created_at,
    updatedAt: notice.updated_at
  };
}
