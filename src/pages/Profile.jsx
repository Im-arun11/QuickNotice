import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Building2, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';
import { MOCK_LOCATIONS } from '../services/mockData';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=profile');
    }
  }, [user, navigate]);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [address, setAddress] = useState(user?.address || '');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state if context loads late
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setCompanyName(user.companyName || '');
      setAddress(user.address || '');
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Simulate database delay
    setTimeout(() => {
      const updatedData = {
        name,
        phone,
        location,
        address,
        companyName: user.role === 'employer' ? companyName : undefined
      };

      const res = updateProfile(updatedData);
      setLoading(false);

      if (res.success) {
        setMessage('Profile updated successfully!');
        // Clear message after 4s
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert(res.message || 'Failed to update profile');
      }
    }, 800);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Update your personal account coordinates and details.</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold text-left">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* User Card info summary */}
          <div className="md:col-span-1 bg-slate-50 border border-slate-200/85 rounded-3xl p-6 h-fit text-center space-y-4">
            <div className="h-20 w-20 bg-indigo-50 border-2 border-indigo-100 text-primary text-3xl font-extrabold rounded-full flex items-center justify-center mx-auto shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950 truncate">{user.name}</h3>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-50 text-[10px] font-bold text-primary rounded-full uppercase">
                {user.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-semibold border-t border-slate-200/60 pt-4 text-left space-y-2">
              <p>Email: <span className="text-slate-600 block truncate">{user.email}</span></p>
              <p>Registered City: <span className="text-slate-600 block">{user.location}</span></p>
            </div>
          </div>

          {/* User Edit Form Panel */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2">
                Edit Details
              </h3>

              <Input
                label="Full Name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />

              {user.role === 'employer' && (
                <Input
                  label="Company Name"
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  icon={Building2}
                  required
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Contact Phone"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                  required
                />

                <Select
                  label="City Location"
                  id="location"
                  options={MOCK_LOCATIONS}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  icon={MapPin}
                  placeholder="Select location"
                  required
                />
              </div>

              <Input
                label="Billing / Communication Address"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                icon={MapPin}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={Save}
                  className="shadow-sm"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
