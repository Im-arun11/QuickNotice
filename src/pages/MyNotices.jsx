import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Calendar, MapPin, Trash2, Ban, X, Check, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { noticesAPI, applicationsAPI } from '../services/api';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';

export default function MyNotices() {
  const { user, deleteNotice, closeNotice, updateApplicationStatus } = useAuth();
  const navigate = useNavigate();

  // Dashboard states
  const [myNoticesList, setMyNoticesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  
  // Applicants state
  const [activeApplicants, setActiveApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // Redirect if not logged in or not employer
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=my-notices');
    } else if (user.role !== 'employer') {
      navigate('/my-applications');
    }
  }, [user, navigate]);

  // Load notices posted by this employer
  const loadMyNotices = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await noticesAPI.getNotices({ employer: user.id, limit: 100 });
      if (res.success) {
        setMyNoticesList(res.notices);
      }
    } catch (error) {
      console.error('Failed to load posted notices:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyNotices();
    }
  }, [user]);

  // Load applicants whenever a notice is selected
  const loadApplicants = async () => {
    if (!selectedNoticeId) {
      setActiveApplicants([]);
      return;
    }
    try {
      setApplicantsLoading(true);
      const res = await applicationsAPI.getNoticeApplicants(selectedNoticeId);
      if (res.success) {
        setActiveApplicants(res.applicants);
      }
    } catch (error) {
      console.error('Failed to load applicants:', error.message);
    } finally {
      setApplicantsLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [selectedNoticeId]);

  if (!user) return null;

  const activeNotice = myNoticesList.find(n => (n._id || n.id) === selectedNoticeId);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice? All applications will be lost.')) {
      const res = await deleteNotice(id);
      if (res.success) {
        if (selectedNoticeId === id) setSelectedNoticeId(null);
        loadMyNotices();
      } else {
        alert('Failed to delete notice');
      }
    }
  };

  const handleClose = async (id) => {
    if (window.confirm('Are you sure you want to close this notice? No more applications will be accepted.')) {
      const res = await closeNotice(id);
      if (res.success) {
        loadMyNotices();
      } else {
        alert('Failed to close notice');
      }
    }
  };

  const handleApplicationAction = async (appId, status) => {
    const res = await updateApplicationStatus(appId, status);
    if (res.success) {
      // Reload applicants to show new status
      loadApplicants();
      // Reload notices list to show updated applicant count if relevant
      loadMyNotices();
    } else {
      alert('Failed to update application status');
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 text-left">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employer Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your posted job notices and hire workers</p>
          </div>
          <Link to="/post-notice">
            <Button variant="primary" icon={Plus} className="shadow-md shadow-primary/10">
              Post a New Notice
            </Button>
          </Link>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Left panel: List of Posted Notices */}
          <div className={`${selectedNoticeId ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-6">Your Posted Notices ({myNoticesList.length})</h3>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-xs font-semibold">Loading dashboard notices...</span>
                </div>
              ) : myNoticesList.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {myNoticesList.map((notice) => {
                    const noticeId = notice._id || notice.id;
                    const pendingAppsCount = notice.peopleApplied || 0; // standard backend tracking
                    
                    return (
                      <div 
                        key={noticeId} 
                        className={`py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                          selectedNoticeId === noticeId ? 'bg-indigo-50/20 -mx-6 px-6 rounded-2xl border border-indigo-50' : ''
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                              {notice.category}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              notice.status === 'open' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {notice.status}
                            </span>
                          </div>
                          
                          <Link to={`/notices/${noticeId}`}>
                            <h4 className="font-bold text-slate-950 text-base sm:text-lg group-hover:text-primary transition-colors leading-snug line-clamp-1">
                              {notice.title}
                            </h4>
                          </Link>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold">
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {notice.location}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {notice.date}</span>
                            <span className="flex items-center gap-1 font-bold text-slate-700">₹{notice.salary} / {notice.salaryType || 'day'}</span>
                          </div>
                        </div>

                        {/* Actions for Notice */}
                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => setSelectedNoticeId(selectedNoticeId === noticeId ? null : noticeId)}
                            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${
                              selectedNoticeId === noticeId
                                ? 'bg-primary border-primary text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                            title="View Applicants"
                          >
                            <Users className="h-4 w-4" />
                            <span>Applicants ({pendingAppsCount})</span>
                          </button>

                          {notice.status === 'open' && (
                            <button
                              onClick={() => handleClose(noticeId)}
                              className="p-2.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-xl text-slate-500 transition-colors"
                              title="Close Notice"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(noticeId)}
                            className="p-2.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-slate-500 transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="font-semibold">You haven't posted any notices yet.</p>
                  <p className="text-sm mt-1 mb-6">Create a job notice and look for helpers in your city.</p>
                  <Link to="/post-notice">
                    <Button variant="outline" size="sm">Post Your First Notice</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Slide-in Applicants Reviewer */}
          <AnimatePresence>
            {selectedNoticeId && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="lg:col-span-6 space-y-6"
              >
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative">
                  
                  {/* Close applicant panel */}
                  <button 
                    onClick={() => setSelectedNoticeId(null)}
                    className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="mb-6 pr-6">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Applicants for</span>
                    <h3 className="font-heading text-lg font-bold text-slate-900 line-clamp-2 mt-0.5 leading-snug">
                      {activeNotice?.title}
                    </h3>
                  </div>

                  {applicantsLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-450 gap-2">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      <span className="text-xs font-semibold">Loading applicants...</span>
                    </div>
                  ) : activeApplicants.length > 0 ? (
                    <div className="space-y-4">
                      {activeApplicants.map((app) => {
                        const applicant = app.worker || {};
                        const applicantId = applicant._id || applicant.id;
                        
                        return (
                          <div key={app._id || app.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                            {/* Worker details */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex gap-3 text-left">
                                <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-primary font-bold">
                                  {applicant.name ? applicant.name.charAt(0) : 'W'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                                    {applicant.name}
                                  </h4>
                                  <span className="text-xs text-slate-400 block mt-0.5">{applicant.email}</span>
                                  <span className="text-xs font-semibold text-slate-700 block mt-1">Phone: {applicant.phone}</span>
                                  <span className="text-[10px] text-slate-450 block mt-0.5">Location: {applicant.location}</span>
                                </div>
                              </div>

                              {/* Status label */}
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                app.status === 'accepted' 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : app.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700'
                                  : app.status === 'cancelled'
                                  ? 'bg-slate-100 text-slate-500'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {app.status}
                              </span>
                            </div>

                            {/* Decision Buttons (for pending) */}
                            {app.status === 'pending' && (
                              <div className="flex gap-2 border-t border-slate-200/50 pt-3">
                                <button
                                  onClick={() => handleApplicationAction(app._id || app.id, 'rejected')}
                                  className="flex-1 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApplicationAction(app._id || app.id, 'accepted')}
                                  className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Accept Worker
                                </button>
                              </div>
                            )}

                            {/* Display contact message if accepted */}
                            {app.status === 'accepted' && (
                              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Worker accepted! Please call their contact number to align schedules.</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 space-y-3">
                      <Users className="h-8 w-8 mx-auto text-slate-300 stroke-[1.5]" />
                      <p className="text-sm font-semibold">No applications yet.</p>
                      <p className="text-xs text-slate-400 px-6">We will notify you here when local job seekers apply for this notice.</p>
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </PageTransition>
  );
}
