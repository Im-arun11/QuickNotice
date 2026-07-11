import { supabaseAdmin } from '../config/supabase.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';

// Helper to map Supabase error messages to user-friendly messages
const mapAuthError = (error) => {
  const msg = error?.message || '';
  const status = error?.status || 400;

  if (msg.includes('User already registered') || msg.includes('already been registered')) {
    return { status: 400, message: 'Email already registered. Please use a different email or log in.' };
  }
  if (msg.includes('Password should be at least')) {
    return { status: 400, message: 'Password must be at least 6 characters long.' };
  }
  if (msg.includes('Unable to validate email')) {
    return { status: 400, message: 'Invalid email format. Please enter a valid email address.' };
  }
  if (msg.includes('Invalid login credentials')) {
    return { status: 401, message: 'Invalid email or password. Please check your credentials.' };
  }
  if (msg.includes('Email not confirmed')) {
    return { status: 400, message: 'Please verify your email address before logging in.' };
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return { status: 429, message: 'Too many attempts. Please wait a moment and try again.' };
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return { status: 503, message: 'Network error. Please check your internet connection.' };
  }

  return { status: status >= 400 ? status : 400, message: msg || 'An unexpected error occurred.' };
};


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, district, companyName, address } = req.body;

    // Server-side validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (!role || !['worker', 'employer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please select a valid role (worker or employer).' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    if (!district || !district.trim()) {
      return res.status(400).json({ success: false, message: 'Please select your city / district.' });
    }
    if (role === 'employer' && (!companyName || !companyName.trim())) {
      return res.status(400).json({ success: false, message: 'Company name is required for employers.' });
    }

    // Create user in Supabase Auth
    // User metadata is passed here and will be used by the trigger to auto-create the profile row
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,  // Auto-confirm email (no verification email sent)
      user_metadata: {
        name: name.trim(),
        role,
        phone: phone.trim(),
        district: district.trim(),
        company_name: role === 'employer' ? (companyName || '').trim() : '',
        address: (address || '').trim()
      }
    });

    if (authError) {
      const mapped = mapAuthError(authError);
      return res.status(mapped.status).json({ success: false, message: mapped.message });
    }

    // Generate a session for the new user so they're immediately logged in
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email
    });

    // Fetch the created profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error after registration:', profileError);
    }

    const userProfile = profile || {
      id: authData.user.id,
      name: name.trim(),
      email,
      role,
      phone: phone.trim(),
      district: district.trim(),
      company_name: role === 'employer' ? (companyName || '').trim() : '',
      address: (address || '').trim(),
      profile_image: ''
    };

    res.status(201).json({
      success: true,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        phone: userProfile.phone,
        district: userProfile.district,
        companyName: userProfile.company_name,
        address: userProfile.address,
        profileImage: userProfile.profile_image
      },
      // Note: Frontend will sign in separately via Supabase client to get a proper session
      message: 'Registration successful! Please sign in.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected server error occurred during registration. Please try again.' 
    });
  }
};


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required.' 
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const mapped = mapAuthError(error);
      return res.status(mapped.status).json({ success: false, message: mapped.message });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found. Please contact support.' 
      });
    }

    res.json({
      success: true,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        district: profile.district,
        companyName: profile.company_name,
        address: profile.address,
        profileImage: profile.profile_image
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected server error occurred during login. Please try again.' 
    });
  }
};


// @desc    Get user profile details
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user is populated by auth middleware
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        district: req.user.district,
        companyName: req.user.companyName,
        address: req.user.address,
        profileImage: req.user.profileImage
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.district) updates.district = req.body.district;
    if (req.body.address !== undefined) updates.address = req.body.address;
    
    if (req.user.role === 'employer' && req.body.companyName) {
      updates.company_name = req.body.companyName;
    }

    // Handle profile picture file upload if present
    if (req.file) {
      const uploadedImageUrl = await uploadToCloudinary(req.file.path);
      updates.profile_image = uploadedImageUrl;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update.' });
    }

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }

    res.json({
      success: true,
      user: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        phone: updatedProfile.phone,
        district: updatedProfile.district,
        companyName: updatedProfile.company_name,
        address: updatedProfile.address,
        profileImage: updatedProfile.profile_image
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
