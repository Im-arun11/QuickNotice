import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, MapPin, Briefcase, Calendar, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, LOCATIONS } from '../services/constants';
import PageTransition from '../components/PageTransition';

export default function Home() {
  const { notices } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    navigate(`/notices?${params.toString()}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <PageTransition>
      <div className="flex-1 bg-white pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50/60 via-white to-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side info */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="lg:col-span-7 space-y-8 text-left"
            >
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-primary tracking-wide uppercase"
              >
                <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
                Local job board platform
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] md:max-w-xl"
              >
                Find Part-Time <br />
                <span className="text-primary relative inline-block">
                  Jobs Near You
                  <svg className="absolute -bottom-2 left-0 w-full h-2.5 text-indigo-100 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg text-slate-600 max-w-lg leading-relaxed font-normal"
              >
                QuickNotice connects employers needing quick, reliable temporary help with local workers looking for flexible gigs.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Link
                  to="/notices"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark shadow-sm hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  Browse Notices
                  <ArrowRight className="ml-2 h-4 w-4 stroke-[2.5]" />
                </Link>
                <Link
                  to="/post-notice"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  Post a Notice
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Right side Illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: 'spring', duration: 1.2, bounce: 0.1 }}
              className="lg:col-span-5 flex justify-center items-center relative"
            >
              <div className="w-full max-w-md relative select-none">
                {/* Decorative glow background */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[40px] filter blur-xl opacity-70 -z-10" />
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-2 aspect-square flex items-center justify-center overflow-hidden shadow-premium">
                  <img 
                    src="/hero-illustration.png" 
                    alt="Freelancers working on mobile"
                    className="w-full h-full object-contain object-center rounded-[24px]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Floating Search Section */}
        <section className="max-w-5xl mx-auto -mt-10 px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 15 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-premium p-4 md:p-6"
          >
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Query Input */}
              <div className="w-full md:col-span-5 relative text-left">
                <label className="sr-only">Search Jobs</label>
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 stroke-[1.8]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs (e.g. Catering, Painter, Delivery...)" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 focus:border-primary rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold"
                />
              </div>

              {/* Category Dropdown */}
              <div className="w-full md:col-span-3 relative text-left">
                <label className="sr-only">Category</label>
                <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 stroke-[1.8]" />
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 focus:border-primary rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold text-slate-700"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="w-full md:col-span-2.5 relative text-left">
                <label className="sr-only">Location</label>
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 stroke-[1.8]" />
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 focus:border-primary rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold text-slate-700"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Search Button */}
              <div className="w-full md:col-span-1.5">
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark hover:shadow-md transition-all duration-200 text-sm"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Latest Notices Grid */}
        <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 text-left">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Latest Posted Notices</h2>
              <p className="text-sm text-slate-500 mt-1">Recently active opportunities waiting for workers</p>
            </div>
            <Link 
              to="/notices" 
              className="group text-primary hover:text-primary-dark font-bold text-sm flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all"
            >
              View All Notices
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notices.slice(0, 3).map((notice, idx) => (
              <motion.div 
                key={notice.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
                className="bg-slate-50 hover:bg-white border border-slate-200/70 hover:border-indigo-100 rounded-3xl p-6 text-left transition-all duration-300 hover:shadow-premium group flex flex-col justify-between min-h-[300px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {notice.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {notice.date}
                    </span>
                  </div>
                  
                  <Link to={`/notices/${notice.id}`} className="block">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {notice.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-6">
                    {notice.description}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {notice.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-400" />
                      {notice.peopleNeeded} needed
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-200/50 pt-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Salary</span>
                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{notice.salary}
                        <span className="text-xs font-semibold text-slate-400"> / {notice.salaryType || 'day'}</span>
                      </span>
                    </div>
                    <Link 
                      to={`/notices/${notice.id}`} 
                      className="px-4 py-2.5 bg-white group-hover:bg-primary border border-slate-200 group-hover:border-primary text-slate-700 group-hover:text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
