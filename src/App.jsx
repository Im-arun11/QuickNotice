import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Notices from './pages/Notices';
import NoticeDetails from './pages/NoticeDetails';
import PostNotice from './pages/PostNotice';
import MyNotices from './pages/MyNotices';
import MyApplications from './pages/MyApplications';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-white">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/notices/:id" element={<NoticeDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes — require authentication */}
              <Route path="/post-notice" element={
                <ProtectedRoute requiredRole="employer">
                  <PostNotice />
                </ProtectedRoute>
              } />
              <Route path="/my-notices" element={
                <ProtectedRoute requiredRole="employer">
                  <MyNotices />
                </ProtectedRoute>
              } />
              <Route path="/my-applications" element={
                <ProtectedRoute requiredRole="worker">
                  <MyApplications />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
