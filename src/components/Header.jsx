import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Settings, Briefcase, Bell } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive 
        ? 'text-primary' 
        : 'text-slate-600 hover:text-slate-900'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${
      isActive 
        ? 'bg-indigo-50/50 text-primary' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-white shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
              <Briefcase className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="font-heading text-xl font-bold text-slate-900 tracking-tight">
              Quick<span className="text-primary">Notice</span>
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/notices" className={navLinkClass}>Notices</NavLink>
            
            {/* Contextual Links based on role */}
            {(!user || user.role === 'employer') && (
              <NavLink to="/post-notice" className={navLinkClass}>Post Notice</NavLink>
            )}
            
            {user && user.role === 'employer' && (
              <NavLink to="/my-notices" className={navLinkClass}>My Notices</NavLink>
            )}
            
            {user && user.role === 'worker' && (
              <NavLink to="/my-applications" className={navLinkClass}>My Applications</NavLink>
            )}
          </nav>

          {/* Actions / User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 relative">
                {/* Notifications Icon (Premium Feel) */}
                <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="relative inline-block">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
                  </span>
                </button>
                
                {/* User Dropdown Button */}
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-11 w-52 bg-white border border-slate-100 rounded-2xl shadow-premium py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <span className="block text-xs text-slate-400 font-medium">Logged in as</span>
                        <span className="block text-sm font-bold text-slate-800 truncate">{user.name}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-[10px] font-bold text-primary rounded-full uppercase">
                          {user.role}
                        </span>
                      </div>
                      <Link 
                        to="/profile" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-slate-100 mt-1 pt-2"
                      >
                        <LogOut className="h-4 w-4" /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:shadow duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Menu Button - Mobile */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-inner">
          <nav className="space-y-1">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>Home</NavLink>
            <NavLink to="/notices" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>Notices</NavLink>
            
            {(!user || user.role === 'employer') && (
              <NavLink to="/post-notice" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>Post Notice</NavLink>
            )}
            
            {user && user.role === 'employer' && (
              <NavLink to="/my-notices" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>My Notices</NavLink>
            )}
            
            {user && user.role === 'worker' && (
              <NavLink to="/my-applications" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>My Applications</NavLink>
            )}
          </nav>

          <hr className="border-slate-100 my-2" />

          {user ? (
            <div className="space-y-1">
              <div className="px-3 py-2 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-800">{user.name}</span>
                  <span className="block text-xs text-slate-400 capitalize">{user.role}</span>
                </div>
              </div>
              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl"
              >
                <User className="h-5 w-5 text-slate-400" /> My Profile
              </Link>
              <Link 
                to="/settings" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl"
              >
                <Settings className="h-5 w-5 text-slate-400" /> Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl text-left mt-2"
              >
                <LogOut className="h-5 w-5" /> Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 border border-slate-200 text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
