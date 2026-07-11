import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Building2, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';
import { LOCATIONS } from '../services/constants';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('worker'); // 'worker' or 'employer'
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'employer' ? '/my-notices' : '/notices');
    }
  }, [user, navigate]);

  const validate = () => {
    if (!name.trim()) return 'Full Name is required';
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (!phone.trim()) return 'Phone number is required';
    if (!district) return 'Please select a location';
    if (role === 'employer' && !companyName.trim()) return 'Company Name is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const userData = {
      name,
      email,
      password,
      role,
      phone,
      district,
      companyName: role === 'employer' ? companyName : undefined,
      address: role === 'employer' ? `${companyName}, ${district}` : `${name}, ${district}`
    };

    const res = await register(userData);
    setLoading(false);

    if (res.success) {
      navigate(role === 'employer' ? '/my-notices' : '/notices');
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <PageTransition>
      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-xl w-full space-y-8 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-premium text-left">
          
          <div className="text-center">
            <h2 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Join QuickNotice to post helper positions or find part-time jobs.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5">
            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                role === 'worker' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              <User className="h-4 w-4" />
              Job Seeker (Worker)
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                role === 'employer' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Employer (Business)
            </button>
          </div>

          {/* Error panel */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                id="name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />

              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />
            </div>

            {role === 'employer' && (
              <Input
                label="Company / Agency Name"
                id="companyName"
                placeholder="e.g. Ramesh Catering Services"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                icon={Building2}
                required
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Phone Number"
                id="phone"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={Phone}
                required
              />

              <Select
                label="Your City"
                id="district"
                options={LOCATIONS}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                icon={MapPin}
                placeholder="Select location"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Password (6+ chars)"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <Input
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={Lock}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3.5 mt-2"
              loading={loading}
              icon={UserPlus}
            >
              Register as {role === 'employer' ? 'Employer' : 'Worker'}
            </Button>
          </form>

          <div className="text-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign in instead
            </Link>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
