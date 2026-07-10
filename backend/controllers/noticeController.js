import Notice from '../models/Notice.js';
import Application from '../models/Application.js';

// @desc    Create a new job notice
// @route   POST /api/notices
// @access  Private (Employer only)
export const createNotice = async (req, res) => {
  try {
    const { title, category, description, salary, salaryType, peopleNeeded, location, address, date, workingTime, phoneNumber, requirements } = req.body;

    const notice = await Notice.create({
      title,
      category,
      description,
      salary,
      salaryType,
      peopleNeeded,
      location,
      address,
      date,
      workingTime,
      phoneNumber,
      requirements: requirements || [],
      employer: req.user.id
    });

    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notices (with filtering, search, sorting & pagination)
// @route   GET /api/notices
// @access  Public
export const getNotices = async (req, res) => {
  try {
    const { q, category, location, minSalary, date, sortBy, employer, page = 1, limit = 6 } = req.query;

    // Build filters object
    const filter = {};
    if (employer) {
      filter.employer = employer;
    } else {
      filter.status = 'open';
    }

    // Search query keyword filter
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Location filter
    if (location) {
      filter.location = location;
    }

    // Date filter
    if (date) {
      filter.date = date;
    }

    // Min salary filter
    if (minSalary) {
      filter.salary = { $gte: Number(minSalary) };
    }

    // Sort setup
    let sortObj = { createdAt: -1 }; // default: latest
    if (sortBy === 'salaryDesc') {
      sortObj = { salary: -1 };
    } else if (sortBy === 'salaryAsc') {
      sortObj = { salary: 1 };
    }

    // Pagination numbers
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Notice.countDocuments(filter);
    
    // Execute query, populating employer company/contact details
    const notices = await Notice.find(filter)
      .populate('employer', 'name companyName location profileImage')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: notices.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalNotices: total,
      notices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific notice details by ID
// @route   GET /api/notices/:id
// @access  Public
export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('employer', 'name companyName location profileImage phone');

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a job notice
// @route   PUT /api/notices/:id
// @access  Private (Employer only)
export const updateNotice = async (req, res) => {
  try {
    let notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    // Make sure user owns the notice
    if (notice.employer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this notice' });
    }

    notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a job notice
// @route   DELETE /api/notices/:id
// @access  Private (Employer only)
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    // Make sure user owns the notice
    if (notice.employer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this notice' });
    }

    // Delete notice
    await Notice.findByIdAndDelete(req.params.id);

    // Cascade delete associated applications
    await Application.deleteMany({ notice: req.params.id });

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Close a job notice (stop accepting applications)
// @route   POST /api/notices/:id/close
// @access  Private (Employer only)
export const closeNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    // Make sure user owns the notice
    if (notice.employer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this notice' });
    }

    notice.status = 'closed';
    await notice.save();

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
