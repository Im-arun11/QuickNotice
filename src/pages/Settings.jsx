import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=settings');
    }
  }, [user, navigate]);

  // Settings mock states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [lang, setLang] = useState('English');
  const [theme, setTheme] = useState('light');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    }, 800);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-left">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure account alerts and platform preferences.</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            {message}
          </div>
        )}

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* 1. Notifications */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-400" /> Notifications
              </h3>
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-200/60 cursor-pointer transition-colors">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">Email Alerts</span>
                    <span className="text-xs text-slate-400 mt-0.5 font-medium">Receive email notifications on applications or hires</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary border-slate-200 h-5 w-5"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-200/60 cursor-pointer transition-colors">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">Push Notifications</span>
                    <span className="text-xs text-slate-400 mt-0.5 font-medium">Receive real-time desktop notification updates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary border-slate-200 h-5 w-5"
                  />
                </label>
              </div>
            </div>

            {/* 2. Platform Options */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-slate-400" /> Regional & App Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Display Language</label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Interface Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  >
                    <option value="light">Light Theme (Default)</option>
                    <option value="dark" disabled>Dark Theme (Coming soon)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={Save}
              >
                Save Preferences
              </Button>
            </div>

          </form>
        </div>
      </div>
    </PageTransition>
  );
}
