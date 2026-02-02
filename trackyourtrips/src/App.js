import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import DriverVerification from './pages/admin/DriverVerification';
import FleetManagement from './pages/admin/FleetManagement';
import RouteManager from './pages/admin/RouteManager';
import LiveDashboard from './pages/admin/LiveDashboard';
import BookingManagement from './pages/admin/BookingManagement';
import PricingConfiguration from './pages/admin/PricingConfiguration';
import PaymentHistory from './pages/admin/PaymentHistory';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import BroadcastTool from './pages/admin/BroadcastTool';
import NotificationCenter from './pages/admin/NotificationCenter';
import DriverDashboard from './pages/DriverDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw"
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: "100vw"
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[72px]"> {/* Offset for fixed navbar */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Login />
                </motion.div>
              }
            />
            <Route
              path="/admin/login"
              element={
                <AdminLogin />
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  {/* Placeholder for Admin Dashboard, or reuse Dashboard for now */}
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/driver-verification/:userId"
              element={
                <AdminRoute>
                  <DriverVerification />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/fleet"
              element={
                <AdminRoute>
                  <FleetManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/routes"
              element={
                <AdminRoute>
                  <RouteManager />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/live-tracking"
              element={
                <AdminRoute>
                  <LiveDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminRoute>
                  <BookingManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pricing"
              element={
                <AdminRoute>
                  <PricingConfiguration />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminRoute>
                  <PaymentHistory />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AnalyticsDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/notifications/broadcast"
              element={
                <AdminRoute>
                  <BroadcastTool />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminRoute>
                  <NotificationCenter />
                </AdminRoute>
              }
            />
            <Route
              path="/register"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Register />
                </motion.div>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Dashboard />
                  </motion.div>
                </PrivateRoute>
              }
            />
            <Route
              path="/driver-dashboard"
              element={
                <PrivateRoute>
                  <DriverDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
