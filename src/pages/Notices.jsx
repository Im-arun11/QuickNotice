import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Calendar, IndianRupee, SlidersHorizontal, ArrowUpDown, RefreshCw, Grid, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_CATEGORIES, MOCK_LOCATIONS } from '../services/mockData';
import NoticeCard from '../components/NoticeCard';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import PageTransition from '../components/PageTransition';

export default function Notices() {
  const { notices, fetchNotices } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters synced from URL (e.g. from Home page search box)
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlLocation = searchParams.get('location') || '';

  // Local state for filters
  const [query, setQuery] = useState(urlQuery);
  const [category, setCategory] = useState(urlCategory);
  const [location, setLocation] = useState(urlLocation);
  const [minSalary, setMinSalary] = useState('');
  const [date, setDate] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, salaryDesc, salaryAsc
  
  // Mobile filter toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotices, setTotalNotices] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 6;

  // Sync state if URL search parameters change
  useEffect(() => {
    setQuery(urlQuery);
    setCategory(urlCategory);
    setLocation(urlLocation);
    setCurrentPage(1);
  }, [urlQuery, urlCategory, urlLocation]);

  // Load notices from backend using server-side filtering
  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy
      };
      if (query) filters.q = query;
      if (category) filters.category = category;
      if (location) filters.location = location;
      if (minSalary) filters.minSalary = minSalary;
      if (date) filters.date = date;

      const res = await fetchNotices(filters);
      if (res && res.success) {
        setTotalPages(res.totalPages || 1);
        setTotalNotices(res.totalNotices || 0);
      }
      setLoading(false);
    };

    loadNotices();
  }, [currentPage, sortBy, fetchNotices, urlQuery, urlCategory, urlLocation]);

  // Handle filter submission
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    setSearchParams(params);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategory('');
    setLocation('');
    setMinSalary('');
    setDate('');
    setSortBy('latest');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Page title and description */}
        <div className="text-left mb-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Browse Notice Board</h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Filter, search, and apply to flexible local part-time helper opportunities in real-time.
          </p>
        </div>

        {/* Outer Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 1. Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block bg-slate-50 border border-slate-200/80 rounded-3xl p-6 h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-2">
              <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
                Filters
              </h3>
              <button 
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-5">
              <Input
                label="Search Keyword"
                id="sidebar-search"
                placeholder="Title, company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={Search}
              />

              <Select
                label="Category"
                id="sidebar-category"
                options={MOCK_CATEGORIES}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                icon={Briefcase}
                placeholder="All Categories"
              />

              <Select
                label="Location"
                id="sidebar-location"
                options={MOCK_LOCATIONS}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                icon={MapPin}
                placeholder="All Locations"
              />

              <Input
                label="Min Salary (₹ / day)"
                id="sidebar-salary"
                type="number"
                placeholder="e.g. 600"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                icon={IndianRupee}
              />

              <Input
                label="Work Date"
                id="sidebar-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                icon={Calendar}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
              >
                Apply Filters
              </Button>
            </form>
          </aside>

          {/* 2. Listing Panel */}
          <section className="lg:col-span-3 space-y-6">
            {/* Header controls (Sorting, Mobile Filter toggle) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                <Grid className="h-4.5 w-4.5 text-slate-400" />
                Showing <span className="text-slate-900">{totalNotices}</span> notices found
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none pr-6 py-1 cursor-pointer border-b border-slate-200 focus:border-primary transition-colors"
                  >
                    <option value="latest">Sort: Latest</option>
                    <option value="salaryDesc">Salary: High to Low</option>
                    <option value="salaryAsc">Salary: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notice List Grid or Loading or Empty */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-450 gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-semibold">Loading notices...</span>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {notices.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {notices.map((notice) => (
                      <motion.div
                        key={notice.id || notice._id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                      >
                        <NoticeCard notice={{
                          ...notice,
                          id: notice._id || notice.id,
                          employer: {
                            id: notice.employer?._id || notice.employer?.id,
                            companyName: notice.employer?.companyName || notice.employer?.name || 'QuickNotice Employer',
                            contactPerson: notice.employer?.name || 'Employer Manager',
                            rating: 4.8
                          }
                        }} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  /* Empty State */
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 border border-dashed border-slate-350 rounded-3xl p-12 text-center py-20"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-primary mb-6">
                      <Search className="h-8 w-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No active notices found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
                      We couldn't find any job notices matching your filter criteria. Try adjusting your search query, category, or location parameters.
                    </p>
                    <Button variant="outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Pagination controls */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Prev
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 flex items-center justify-center text-sm font-semibold rounded-xl transition-all ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* 3. Mobile Filters Slide-over / Modal */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
              />

              {/* Sidebar container */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-80 h-full shadow-premium flex flex-col justify-between relative z-10 p-6 overflow-y-auto"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                      <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
                      Filter Options
                    </h3>
                    <button 
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  <form onSubmit={handleApplyFilters} className="space-y-5">
                    <Input
                      label="Search Keyword"
                      id="mobile-search"
                      placeholder="Title, company..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      icon={Search}
                    />

                    <Select
                      label="Category"
                      id="mobile-category"
                      options={MOCK_CATEGORIES}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      icon={Briefcase}
                      placeholder="All Categories"
                    />

                    <Select
                      label="Location"
                      id="mobile-location"
                      options={MOCK_LOCATIONS}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      icon={MapPin}
                      placeholder="All Locations"
                    />

                    <Input
                      label="Min Salary (₹ / day)"
                      id="mobile-salary"
                      type="number"
                      placeholder="e.g. 600"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                      icon={IndianRupee}
                    />

                    <Input
                      label="Work Date"
                      id="mobile-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      icon={Calendar}
                    />
                  </form>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 gap-3 flex">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleApplyFilters()}
                  >
                    Apply
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
