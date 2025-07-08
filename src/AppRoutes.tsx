// AppRoutes.tsx
// This file definesthe routes for Notelo AI.

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import Account from './components/account/Account';
import ContentViewer from './components/content/ContentViewer';
import Onboarding from './components/onboarding/Onboarding';
import FeaturesComponent from './components/Features';
import PricingComponent from './components/Pricing';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Payment from './pages/Payment';
import Upgrade from './pages/Upgrade';
import Footer from './components/layout/Footer';
import Reviews from './components/Reviews';
import ScrollToTop from './components/ScrollToTop';
import PageLayout from './components/layout/PageLayout';
import MockupGenerator from './pages/MockupGenerator';
import { Analytics } from "@vercel/analytics/react";
import Admin from './pages/Admin';
import AuthCallback from './pages/auth/Callback';

/**
 * Props interface for PrivateRoute component
 */
interface PrivateRouteProps {
  children?: React.ReactNode;
}

/**
 * Wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 */
function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
}

/**
 * Main routing component that defines all application routes
 * Handles public pages, authentication, and protected routes
 */
export default function AppRoutes() {
  return (
    <>
      <Analytics />
      <ScrollToTop />
      <Routes>
        {/* Landing page - combines hero, features, and pricing sections */}
        <Route path="/" element={
          <>
            <Navbar />
            <Hero />
            <FeaturesComponent />
            <PricingComponent />
            <Footer />
          </>
        } />

        {/* Public marketing and informational pages */}
        <Route path="/features" element={
          <PageLayout>
            <Features />
          </PageLayout>
        } />
        <Route path="/pricing" element={
          <PageLayout>
            <Pricing />
          </PageLayout>
        } />
        <Route path="/upgrade" element={
          <PageLayout>
            <Upgrade />
          </PageLayout>
        } />
        <Route path="/about" element={
          <PageLayout>
            <About />
          </PageLayout>
        } />
        <Route path="/contact" element={
          <PageLayout>
            <Contact />
          </PageLayout>
        } />
        <Route path="/terms" element={
          <PageLayout>
            <Terms />
          </PageLayout>
        } />
        <Route path="/privacy" element={
          <PageLayout>
            <Privacy />
          </PageLayout>
        } />

        {/* Authentication pages - login and signup */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected user dashboard and account routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<PageLayout includeNavbar={false}><Dashboard /></PageLayout>} />
          <Route path="/account" element={<PageLayout includeNavbar={false}><Account /></PageLayout>} />
          <Route path="/payment" element={<PageLayout includeNavbar={false}><Payment /></PageLayout>} />
        </Route>

        {/* Admin interface - separate from user routes */}
        <Route path="/admin" element={<PageLayout includeNavbar={false}><Admin /></PageLayout>} />

        {/* User onboarding flow after signup */}
        <Route path="/onboarding" element={
          <PrivateRoute>
            <PageLayout includeNavbar={false}>
              <Onboarding />
            </PageLayout>
          </PrivateRoute>
        } />

        {/* Document viewing with dynamic ID parameter */}
        <Route path="/document/:id" element={
          <PrivateRoute>
            <PageLayout>
              <ContentViewer />
            </PageLayout>
          </PrivateRoute>
        } />

        {/* OAuth callback handler for authentication */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </>
  );
} 