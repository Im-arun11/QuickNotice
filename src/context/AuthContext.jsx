import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Load user profile on mount if token is saved in localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('qn_token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await authAPI.getProfile();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('qn_token');
            setAuthToken(null);
          }
        } catch (error) {
          console.error('Token validation failed. Session cleared.', error.message);
          localStorage.removeItem('qn_token');
          setAuthToken(null);
        }
      }
      setAuthLoading(false);
    };

    initializeAuth();
    fetchNotices(); // Initial notices fetch
  }, [fetchNotices]);

  // Sync applications if user role or login status changes
  useEffect(() => {
    if (user && user.role === 'worker') {
      fetchMyApplications();
    } else {
      setApplications([]);
    }
  }, [user, fetchMyApplications]);

  // Login handler
  const login = async (email, password, role) => {
    try {
      const res = await authAPI.login({ email, password, role });
      if (res.success) {
        localStorage.setItem('qn_token', res.token);
        setAuthToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.success) {
        localStorage.setItem('qn_token', res.token);
        setAuthToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('qn_token');
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
        // Refresh notices list
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
        fetchNotices(); // Update headcount applied on dashboard
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
