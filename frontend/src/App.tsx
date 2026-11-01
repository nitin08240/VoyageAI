import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Public pages
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import SharedTrip from '@/pages/SharedTrip';
import NotFound from '@/pages/NotFound';

// Protected pages
import Dashboard from '@/pages/dashboard/Dashboard';
import CreateTrip from '@/pages/trips/CreateTrip';
import AIProgress from '@/pages/trips/AIProgress';
import ItineraryResults from '@/pages/trips/ItineraryResults';
import MyTrips from '@/pages/trips/MyTrips';
import TripDetails from '@/pages/trips/TripDetails';
import Profile from '@/pages/user/Profile';
import Settings from '@/pages/user/Settings';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Guard
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Guest Guard (prevents logged in users from seeing login/register)
function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export const App: React.FC = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route
          path="/login"
          element={
            <GuestGuard>
              <Login />
            </GuestGuard>
          }
        />
        <Route
          path="/register"
          element={
            <GuestGuard>
              <Register />
            </GuestGuard>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/shared/:token" element={<SharedTrip />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/trips/create"
          element={
            <AuthGuard>
              <CreateTrip />
            </AuthGuard>
          }
        />
        <Route
          path="/trips/:id/generate"
          element={
            <AuthGuard>
              <AIProgress />
            </AuthGuard>
          }
        />
        <Route
          path="/trips/:id/itinerary"
          element={
            <AuthGuard>
              <ItineraryResults />
            </AuthGuard>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <AuthGuard>
              <TripDetails />
            </AuthGuard>
          }
        />
        <Route
          path="/trips"
          element={
            <AuthGuard>
              <MyTrips />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <Settings />
            </AuthGuard>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingChatWidget />
    </BrowserRouter>
  );
};

export default App;

