import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, IndianRupee, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function NoticeCard({ notice }) {
  const getCategoryColor = (cat) => {
    const colors = {
      'Catering': 'bg-violet-50 text-violet-700 border-violet-100',
      'Delivery': 'bg-blue-50 text-blue-700 border-blue-100',
      'Construction': 'bg-amber-50 text-amber-700 border-amber-100',
      'Cleaning': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Painter': 'bg-pink-50 text-pink-700 border-pink-100',
      'Driver': 'bg-cyan-50 text-cyan-700 border-cyan-100',
      'College Events': 'bg-indigo-50 text-indigo-700 border-indigo-100',
      'Warehouse': 'bg-slate-100 text-slate-700 border-slate-200',
      'Electrician': 'bg-orange-50 text-orange-700 border-orange-100',
      'Cook': 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return colors[cat] || 'bg-slate-50 text-slate-600 border-slate-150';
  };

  return (
    <div className="bg-slate-50 hover:bg-white border border-slate-200/70 hover:border-indigo-100 rounded-3xl p-6 text-left transition-all duration-300 hover:shadow-premium group flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-block px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(notice.category)}`}>
            {notice.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Calendar className="h-3.5 w-3.5 stroke-[2]" />
            {notice.date}
          </span>
        </div>
        
        <Link to={`/notices/${notice.id}`} className="block group-hover:text-primary">
          <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {notice.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 line-clamp-3 mb-6">
          {notice.description}
        </p>
      </div>
      
      <div>
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 font-semibold">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400 stroke-[2]" />
            {notice.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-400 stroke-[2]" />
            {notice.peopleNeeded} helper{notice.peopleNeeded > 1 ? 's' : ''} needed
          </span>
        </div>
        
        <div className="flex items-center justify-between border-t border-slate-200/50 pt-4">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Salary</span>
            <span className="text-xl font-extrabold text-slate-900 flex items-center">
              <IndianRupee className="h-4.5 w-4.5 stroke-[2.5]" />
              {notice.salary}
              <span className="text-xs font-semibold text-slate-400 ml-0.5"> / {notice.salaryType || 'day'}</span>
            </span>
          </div>
          <Link to={`/notices/${notice.id}`}>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              className="text-xs font-bold border-slate-200 hover:border-primary hover:bg-primary hover:text-white"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
