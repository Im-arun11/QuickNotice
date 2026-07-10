import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || null;

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker'); // 'worker' or 'employer'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      if (redirectPath) {
        navigate(`/${redirectPath}`);
      } else {
        navigate(user.role === 'employer' ? '/my-notices' : '/notices');
      }
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate login server request
    setTimeout(() => {
      const res = login(email, password, role);
      setLoading(false);

      if (res.success) {
        if (redirectPath) {
          navigate(`/${redirectPath}`);
        } else {
          navigate(role === 'employer' ? '/my-notices' : '/notices');
        }
      } else {
        setError(res.message || 'Invalid credentials');
      }
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-md w-full space-y-8 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-premium text-left">
          
          {/* Title header */}
          <div className="text-center">
            <h2 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Log in to search part-time notices or post jobs
            </p>
          </div>

          {/* Role selector tabs */}
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
              Employer
            </button>
          </div>

          {/* Error panel */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="e.g. worker@quicknotice.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-800">
                <input type="checkbox" className="rounded text-primary focus:ring-primary border-slate-200 h-4 w-4" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3.5"
              loading={loading}
              icon={LogIn}
            >
              Sign In as {role === 'employer' ? 'Employer' : 'Worker'}
            </Button>
          </form>

          {/* Footer note */}
          <div className="text-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-bold">
              Register here
            </Link>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
