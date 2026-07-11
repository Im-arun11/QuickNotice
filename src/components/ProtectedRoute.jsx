import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * If the user is not logged in, redirects to /login with a redirect query parameter.
 * Shows a loading spinner while auth state is being determined.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-sm font-semibold">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login with return path
  if (!user) {
    const redirectPath = location.pathname.replace(/^\//, ''); // strip leading slash
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  // Role check (e.g. employer-only routes)
  if (requiredRole && user.role !== requiredRole) {
    // Redirect employer to their dashboard, worker to theirs
    const fallback = user.role === 'employer' ? '/my-notices' : '/notices';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
