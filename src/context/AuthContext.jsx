import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { authAPI, noticesAPI, applicationsAPI, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch notices from backend (supports server-side filters & pagination)
  const fetchNotices = useCallback(async (filters = {}) => {
    try {
      const data = await noticesAPI.getNotices(filters);
      if (data.success) {
        setNotices(data.notices);
        return { success: true, totalPages: data.totalPages, count: data.count, totalNotices: data.totalNotices };
      }
      return { success: false, message: 'Failed to fetch notices' };
    } catch (error) {
      console.error('Fetch notices error:', error.message);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }, []);

  // Fetch worker applications
  const fetchMyApplications = useCallback(async () => {
    try {
      const data = await applicationsAPI.getMyApplications();
      if (data.success) {
        setApplications(data.applications);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Fetch applications error:', error.message);
      return { success: false };
    }
  }, []);

  // Initialize auth — listen to Supabase session state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get the current session from Supabase (auto-restores from localStorage)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token && mounted) {
          setAuthToken(session.access_token);
          try {
            const res = await authAPI.getProfile();
            if (res.success && mounted) {
              setUser(res.user);
            }
          } catch (error) {
            console.error('Failed to fetch profile on session restore:', error.message);
            // Session exists but profile fetch failed — clear session
            await supabase.auth.signOut();
            setAuthToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.access_token) {
            setAuthToken(session.access_token);
            // Fetch profile on sign in or token refresh
            try {
              const res = await authAPI.getProfile();
              if (res.success && mounted) {
                setUser(res.user);
              }
            } catch (error) {
              console.error('Profile fetch on auth change failed:', error.message);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthToken(null);
          setUser(null);
          setApplications([]);
        }
      }
    );

    // Initial notices fetch (public)
    fetchNotices();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchNotices]);

  // Sync applications if user role or login status changes
  useEffect(() => {
    if (user && user.role === 'worker') {
      fetchMyApplications();
    } else {
      setApplications([]);
    }
  }, [user, fetchMyApplications]);

  // Register handler
  const register = async (userData) => {
    try {
      // Step 1: Call backend to create user in Supabase Auth + profiles table
      const res = await authAPI.register(userData);
      if (!res.success) {
        return { success: false, message: res.message || 'Registration failed' };
      }

      // Step 2: Sign in with Supabase client to establish a browser session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password
      });

      if (signInError) {
        // Registration succeeded but auto-login failed — user can manually log in
        return { 
          success: true, 
          user: res.user, 
          message: 'Registration successful! Please sign in manually.' 
        };
      }

      // Session established — set auth token and user
      if (signInData.session) {
        setAuthToken(signInData.session.access_token);
        setUser(res.user);
      }

      return { success: true, user: res.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  // Login handler
  const login = async (email, password) => {
    try {
      // Sign in with Supabase client (establishes browser session with auto-refresh)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // Map Supabase errors to user-friendly messages
        let message = signInError.message;
        if (message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please check your credentials.';
        } else if (message.includes('Email not confirmed')) {
          message = 'Please verify your email address before logging in.';
        }
        return { success: false, message };
      }

      // Set the access token for API calls
      setAuthToken(signInData.session.access_token);

      // Fetch full profile from backend
      const profileRes = await authAPI.getProfile();
      if (profileRes.success) {
        setUser(profileRes.user);
        return { success: true, user: profileRes.user };
      }

      return { success: false, message: 'Failed to load user profile.' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = async () => {
    await supabase.auth.signOut();
    setAuthToken(null);
    setUser(null);
    setApplications([]);
  };

  // Profile update handler (accepts either FormData for file uploads or normal objects)
  const updateProfile = async (profileData) => {
    try {
      const res = await authAPI.updateProfile(profileData);
      if (res.success) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  // Create Notice
  const createNotice = async (noticeData) => {
    try {
      const res = await noticesAPI.createNotice(noticeData);
      if (res.success) {
        fetchNotices();
        return { success: true, notice: res.notice };
      }
      return { success: false, message: 'Failed to post notice' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Posting notice failed' };
    }
  };

  // Update Notice
  const updateNotice = async (id, updatedData) => {
    try {
      const res = await noticesAPI.updateNotice(id, updatedData);
      if (res.success) {
        fetchNotices();
        return { success: true };
      }
      return { success: false, message: 'Failed to update notice' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  // Delete Notice
  const deleteNotice = async (id) => {
    try {
      const res = await noticesAPI.deleteNotice(id);
      if (res.success) {
        fetchNotices();
        return { success: true };
      }
      return { success: false, message: 'Failed to delete notice' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Deletion failed' };
    }
  };

  // Close Notice
  const closeNotice = async (id) => {
    try {
      const res = await noticesAPI.closeNotice(id);
      if (res.success) {
        fetchNotices();
        return { success: true };
      }
      return { success: false, message: 'Failed to close notice' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Action failed' };
    }
  };

  // Apply to Notice
  const applyToNotice = async (noticeId) => {
    try {
      const res = await applicationsAPI.apply(noticeId);
      if (res.success) {
        fetchMyApplications();
        fetchNotices();
        return { success: true, application: res.application };
      }
      return { success: false, message: 'Failed to apply' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to submit application' };
    }
  };

  // Update Application Status (Employer accept/reject or worker cancel)
  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      const res = await applicationsAPI.updateStatus(appId, newStatus);
      if (res.success) {
        fetchMyApplications();
        return { success: true };
      }
      return { success: false, message: 'Failed to update status' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Status update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      notices,
      applications,
      authLoading,
      login,
      register,
      logout,
      updateProfile,
      fetchNotices,
      createNotice,
      updateNotice,
      deleteNotice,
      closeNotice,
      applyToNotice,
      updateApplicationStatus,
      fetchMyApplications
    }}>
      {children}
    </AuthContext.Provider>
  );
};
