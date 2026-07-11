import { supabaseAdmin } from '../config/supabase.js';

// @desc    Create a new job notice
// @route   POST /api/notices
// @access  Private (Employer only)
export const createNotice = async (req, res) => {
  try {
    const { title, category, description, salary, salaryType, peopleNeeded, location, address, date, workingTime, phoneNumber, requirements } = req.body;

    const { data: notice, error } = await supabaseAdmin
      .from('notices')
      .insert({
        title,
        category,
        description,
        salary: Number(salary),
        salary_type: salaryType || 'day',
        people_needed: Number(peopleNeeded) || 1,
        people_applied: 0,
        location,
        address,
        date,
        working_time: workingTime,
        phone_number: phoneNumber,
        requirements: requirements || [],
        status: 'open',
        employer_id: req.user.id
      })
      .select(`
        *,
        employer:profiles!employer_id (id, name, company_name, district, profile_image)
      `)
      .single();

    if (error) {
      console.error('Create notice error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    // Map to frontend-expected format
    const mapped = mapNotice(notice);
    res.status(201).json({ success: true, notice: mapped });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all notices (with filtering, search, sorting & pagination)
// @route   GET /api/notices
// @access  Public
export const getNotices = async (req, res) => {
  try {
    const { q, category, location, minSalary, date, sortBy, employer, page = 1, limit = 6 } = req.query;

    let query = supabaseAdmin
      .from('notices')
      .select(`
        *,
        employer:profiles!employer_id (id, name, company_name, district, profile_image)
      `, { count: 'exact' });

    // Filter by employer or only open notices
    if (employer) {
      query = query.eq('employer_id', employer);
    } else {
      query = query.eq('status', 'open');
    }

    // Search query keyword filter (title or description)
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Location filter
    if (location) {
      query = query.eq('location', location);
    }

    // Date filter
    if (date) {
      query = query.eq('date', date);
    }

    // Min salary filter
    if (minSalary) {
      query = query.gte('salary', Number(minSalary));
    }

    // Sort setup
    if (sortBy === 'salaryDesc') {
      query = query.order('salary', { ascending: false });
    } else if (sortBy === 'salaryAsc') {
      query = query.order('salary', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    query = query.range(from, to);

    const { data: notices, count, error } = await query;

    if (error) {
      console.error('Get notices error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    const total = count || 0;
    const mappedNotices = (notices || []).map(mapNotice);

    res.json({
      success: true,
      count: mappedNotices.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalNotices: total,
      notices: mappedNotices
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get specific notice details by ID
// @route   GET /api/notices/:id
// @access  Public
export const getNoticeById = async (req, res) => {
  try {
    const { data: notice, error } = await supabaseAdmin
      .from('notices')
      .select(`
        *,
        employer:profiles!employer_id (id, name, company_name, district, profile_image, phone)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.json({ success: true, notice: mapNotice(notice) });
  } catch (error) {
    console.error('Get notice by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Update a job notice
// @route   PUT /api/notices/:id
// @access  Private (Employer only)
export const updateNotice = async (req, res) => {
  try {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('notices')
      .select('employer_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (existing.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this notice' });
    }

    // Build update object — map camelCase from frontend to snake_case
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.salary !== undefined) updates.salary = Number(req.body.salary);
    if (req.body.salaryType !== undefined) updates.salary_type = req.body.salaryType;
    if (req.body.peopleNeeded !== undefined) updates.people_needed = Number(req.body.peopleNeeded);
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (req.body.date !== undefined) updates.date = req.body.date;
    if (req.body.workingTime !== undefined) updates.working_time = req.body.workingTime;
    if (req.body.phoneNumber !== undefined) updates.phone_number = req.body.phoneNumber;
    if (req.body.requirements !== undefined) updates.requirements = req.body.requirements;
    if (req.body.status !== undefined) updates.status = req.body.status;

    const { data: notice, error } = await supabaseAdmin
      .from('notices')
      .update(updates)
      .eq('id', req.params.id)
      .select(`
        *,
        employer:profiles!employer_id (id, name, company_name, district, profile_image)
      `)
      .single();

    if (error) {
      console.error('Update notice error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, notice: mapNotice(notice) });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Delete a job notice
// @route   DELETE /api/notices/:id
// @access  Private (Employer only)
export const deleteNotice = async (req, res) => {
  try {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('notices')
      .select('employer_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (existing.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this notice' });
    }

    // Cascade delete associated applications first
    await supabaseAdmin
      .from('applications')
      .delete()
      .eq('notice_id', req.params.id);

    // Delete notice
    const { error } = await supabaseAdmin
      .from('notices')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Delete notice error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Close a job notice (stop accepting applications)
// @route   POST /api/notices/:id/close
// @access  Private (Employer only)
export const closeNotice = async (req, res) => {
  try {
    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('notices')
      .select('employer_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (existing.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this notice' });
    }

    const { data: notice, error } = await supabaseAdmin
      .from('notices')
      .update({ status: 'closed' })
      .eq('id', req.params.id)
      .select(`
        *,
        employer:profiles!employer_id (id, name, company_name, district, profile_image)
      `)
      .single();

    if (error) {
      console.error('Close notice error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, notice: mapNotice(notice) });
  } catch (error) {
    console.error('Close notice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// =====================
// Helper: Map Supabase row to frontend-expected format
// =====================
function mapNotice(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    salary: row.salary,
    salaryType: row.salary_type,
    peopleNeeded: row.people_needed,
    peopleApplied: row.people_applied,
    location: row.location,
    address: row.address,
    date: row.date,
    workingTime: row.working_time,
    phoneNumber: row.phone_number,
    requirements: row.requirements || [],
    status: row.status,
    employer: row.employer ? {
      _id: row.employer.id,
      id: row.employer.id,
      name: row.employer.name,
      companyName: row.employer.company_name,
      location: row.employer.district,
      profileImage: row.employer.profile_image,
      phone: row.employer.phone
    } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
