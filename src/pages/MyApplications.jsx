import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';

export default function MyApplications() {
  const { user, applications, fetchMyApplications, updateApplicationStatus } = useAuth();
  const navigate = useNavigate();

  // Selected tab for status filter
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in or not worker
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=my-applications');
    } else if (user.role !== 'worker') {
      navigate('/my-notices');
    }
  }, [user, navigate]);

  // Load worker applications on mount
  useEffect(() => {
    const loadApps = async () => {
      if (user && user.role === 'worker') {
        setLoading(true);
        await fetchMyApplications();
        setLoading(false);
      }
    };
    loadApps();
  }, [user, fetchMyApplications]);

  if (!user) return null;

  const filteredApps = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const handleCancelApplication = async (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      const res = await updateApplicationStatus(appId, 'cancelled');
      if (res.success) {
        fetchMyApplications();
      } else {
        alert('Failed to withdraw application');
      }
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      accepted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      rejected: 'bg-rose-50 text-rose-700 border-rose-100',
      cancelled: 'bg-slate-100 text-slate-500 border-slate-200'
    };
    return styles[status] || 'bg-slate-50 text-slate-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'accepted') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (status === 'rejected') return <XCircle className="h-4 w-4 text-rose-600" />;
    if (status === 'cancelled') return <AlertCircle className="h-4 w-4 text-slate-400" />;
    return <Clock className="h-4 w-4 text-amber-650 animate-pulse" />;
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-left mb-10 space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Worker Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Track the status of your submitted part-time helper applications</p>
        </div>

        {/* Navigation tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-6 text-sm font-bold">
          {['all', 'pending', 'accepted', 'rejected', 'cancelled'].map((tab) => {
            const tabAppsCount = applications.filter(app => tab === 'all' || app.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 border-b-2 transition-colors duration-200 capitalize shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === tab 
                    ? 'bg-indigo-50 text-primary' 
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  {tabAppsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-450 gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm font-semibold">Loading applications...</span>
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app) => {
                const noticeDetails = app.notice || {};
                const noticeId = noticeDetails._id || noticeDetails.id;
                const noticeTitle = noticeDetails.title || 'Job Notice Board Post';
                const employerDetails = noticeDetails.employer || {};

                return (
                  <motion.div
                    key={app._id || app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top bar status and date */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Title link */}
                      <div>
                        {noticeId ? (
                          <Link to={`/notices/${noticeId}`} className="block group">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {noticeTitle}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug line-clamp-2">
                            {noticeTitle}
                          </h3>
                        )}
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-50 text-[10px] font-bold text-slate-500 rounded border border-slate-100 uppercase">
                          {noticeDetails.category || 'Part-Time'}
                        </span>
                      </div>

                      {/* Display employer contact details if accepted */}
                      {app.status === 'accepted' && noticeId && (
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 space-y-2 text-sm">
                          <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                            Congratulations! You are selected
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Employer <span className="font-bold text-slate-800">{employerDetails.companyName || employerDetails.name}</span> has approved your application. Please connect directly using coordinates below:
                          </p>
                          <div className="pt-2 text-xs font-semibold text-slate-700 space-y-1">
                            <p>Contact Person: {employerDetails.name}</p>
                            <p>Phone Number:{' '}
                              <a href={`tel:${noticeDetails.phoneNumber}`} className="text-primary hover:underline font-bold">
                                {noticeDetails.phoneNumber}
                              </a>
                            </p>
                            <p className="text-slate-500 font-normal leading-normal mt-1">Address: {noticeDetails.address}</p>
                          </div>
                        </div>
                      )}

                      {/* Notice removed details */}
                      {!noticeId && (
                        <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-450 italic">
                          * This notice has been closed or removed by the employer.
                        </div>
                      )}
                    </div>

                    {/* Bottom row summary & withdraw action */}
                    <div className="flex items-center justify-between border-t border-slate-100 mt-6 pt-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Salary Offer</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{noticeDetails.salary || app.salary || 0} / day</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {noticeId && (
                          <Link to={`/notices/${noticeId}`}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              View Details
                            </Button>
                          </Link>
                        )}
                        {app.status === 'pending' && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs bg-red-50 text-red-600 border-none"
                            onClick={() => handleCancelApplication(app._id || app.id)}
                            icon={Trash2}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-350 rounded-3xl p-12 py-20 text-center">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-slate-950">No applications in this category</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              {activeTab === 'all' 
                ? "You haven't submitted any job notices applications yet."
                : `No applications with status "${activeTab}" found.`}
            </p>
            <Link to="/notices">
              <Button variant="primary" size="sm">Search Notice Board</Button>
            </Link>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
