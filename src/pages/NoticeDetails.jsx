import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Clock, Phone, FileText, ArrowLeft, CheckCircle2, User, Building2, Star, IndianRupee, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { noticesAPI } from '../services/api';
import Button from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';
import PageTransition from '../components/PageTransition';

export default function NoticeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, applications, applyToNotice } = useAuth();
  
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Load specific notice details on mount
  useEffect(() => {
    const loadNoticeDetails = async () => {
      try {
        setLoading(true);
        const res = await noticesAPI.getNotice(id);
        if (res.success) {
          setNotice(res.notice);
        }
      } catch (error) {
        console.error('Failed to load notice details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadNoticeDetails();
  }, [id]);

  // Check if worker has already applied
  const hasApplied = user && applications.some(app => 
    (app.notice?._id === id || app.notice?.id === id || app.noticeId === id) && 
    (app.worker?._id === user.id || app.worker?.id === user.id || app.workerId === user.id)
  );

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login?redirect=notices/' + id);
      return;
    }
    setModalOpen(true);
  };

  const handleConfirmApply = async () => {
    setIsApplying(true);
    try {
      const res = await applyToNotice(id);
      setIsApplying(false);
      setModalOpen(false);
      if (res.success) {
        setSuccessMessage('Your application has been submitted successfully!');
        // Reload details to show updated applicant count
        const updatedNotice = await noticesAPI.getNotice(id);
        if (updatedNotice.success) {
          setNotice(updatedNotice.notice);
        }
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(res.message || 'Failed to submit application');
      }
    } catch (error) {
      setIsApplying(false);
      setModalOpen(false);
      alert(error.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-slate-450 gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="text-sm font-semibold">Loading job details...</span>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-850">Notice not found</h2>
        <p className="text-slate-550 mt-2">The job notice you are looking for does not exist or has been removed.</p>
        <Link to="/notices" className="mt-6 inline-block text-primary hover:underline font-semibold">
          Return to Notice Board
        </Link>
      </div>
    );
  }

  const employerDetail = {
    name: notice.employer?.name || 'QuickNotice Employer',
    companyName: notice.employer?.companyName || notice.employer?.name || 'Ramesh Catering Services',
    contactPerson: notice.employer?.name || 'Ramesh Kumar',
    rating: notice.employer?.rating || '4.8'
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="text-left mb-6">
          <Link 
            to="/notices" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Notice Board
          </Link>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold text-left"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            {successMessage}
          </motion.div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Left Panel: Primary Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6">
              {/* Category & Date */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="px-3.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                  {notice.category}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Posted {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title & Location details */}
              <div className="space-y-4">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                  {notice.title}
                </h1>
                
                <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-500 font-semibold pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4.5 w-4.5 text-slate-400 stroke-[2]" />
                    {notice.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-slate-400 stroke-[2]" />
                    Work Date: {notice.date}
                  </span>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-slate-400" />
                  Job Description
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                  {notice.description}
                </p>
              </div>

              {/* Requirements Checklist */}
              {notice.requirements && notice.requirements.length > 0 && (
                <div className="space-y-3.5 pt-2">
                  <h3 className="font-heading text-lg font-bold text-slate-900">Requirements</h3>
                  <ul className="space-y-2.5">
                    {notice.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="h-4.5 w-4.5 text-primary mt-0.5 shrink-0 stroke-[2]" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="h-4.5 w-4.5 text-slate-400" />
                  Address & Contact Details
                </h3>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-sm">
                  <p className="text-slate-600 leading-normal">
                    <span className="font-bold text-slate-800 block mb-0.5">Work Address:</span>
                    {notice.address}
                  </p>
                  {user ? (
                    <p className="text-slate-600 flex items-center gap-2">
                      <span className="font-bold text-slate-800">Phone:</span>
                      <a href={`tel:${notice.phoneNumber}`} className="text-primary hover:underline font-semibold">
                        {notice.phoneNumber}
                      </a>
                    </p>
                  ) : (
                    <p className="text-slate-400 italic text-xs">
                      * Log in to view employer's phone contact details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Job Info Summary & Apply Action */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sidebar Summary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Salary Offer</span>
                <div className="text-3xl font-extrabold text-slate-900 flex items-center">
                  <IndianRupee className="h-6 w-6 stroke-[2.5]" />
                  {notice.salary}
                  <span className="text-sm font-semibold text-slate-400 ml-1"> / {notice.salaryType || 'day'}</span>
                </div>
              </div>

              <hr className="border-slate-200/60" />

              <div className="space-y-4 text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Working Time</span>
                    <span className="text-slate-800">{notice.workingTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Staff Needed</span>
                    <span className="text-slate-800">{notice.peopleNeeded} helper{notice.peopleNeeded > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Applicants</span>
                    <span className="text-slate-800">{notice.peopleApplied || 0} applied</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {user && user.role === 'employer' ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center bg-slate-100 hover:bg-slate-100 hover:text-slate-500 cursor-not-allowed border-none text-slate-400 text-xs"
                    disabled
                  >
                    Employers cannot apply for jobs
                  </Button>
                ) : hasApplied ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center bg-slate-100 border-none text-slate-400 cursor-not-allowed text-sm"
                    disabled
                  >
                    Applied ✓
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleApplyClick}
                    className="w-full justify-center py-3.5 shadow-md shadow-primary/20"
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </div>

            {/* Employer Info Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <h4 className="font-heading text-sm font-bold text-slate-400 uppercase tracking-wider">Posted By</h4>
              
              <div className="flex items-center gap-3.5 text-left">
                <div className="h-11 w-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-primary font-bold">
                  {notice.employer?.companyName ? <Building2 className="h-5.5 w-5.5 stroke-[1.8]" /> : <User className="h-5.5 w-5.5 stroke-[1.8]" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                    {employerDetail.companyName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Manager: {employerDetail.contactPerson}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-2">
                <div className="flex text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="text-sm font-bold text-slate-700">{employerDetail.rating}</span>
                <span className="text-xs text-slate-400 font-semibold">• Employer Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Confirmation Modal */}
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmApply}
          title="Apply for this helper job?"
          description={`By applying, you confirm that you are available on ${notice.date} from ${notice.workingTime} at ${notice.location}. The employer will review your profile details and reach out to you if selected.`}
          confirmText="Submit Application"
          loading={isApplying}
        />
      </div>
    </PageTransition>
  );
}
