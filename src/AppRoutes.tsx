import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import Account from './components/account/Account';
import ContentViewer from './components/content/ContentViewer';
import PrivateRoute from './components/auth/PrivateRoute';
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
import Footer from './components/layout/Footer';
import Reviews from './components/Reviews';
import ScrollToTop from './components/ScrollToTop';
import PageLayout from './components/layout/PageLayout';
import MockupGenerator from './pages/MockupGenerator';
import { Analytics } from "@vercel/analytics/react";

export default function AppRoutes() {
  return (
    <>
      <Analytics />
      <ScrollToTop />
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={
          <PageLayout>
            <Hero />
            <FeaturesComponent id="features" />
            <Reviews />
            <PricingComponent />
          </PageLayout>
        } />
        
        {/* Public pages */}
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
        
        {/* Marketing Assets */}
        <Route path="/mockups" element={<MockupGenerator />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <PageLayout>
              <Dashboard />
            </PageLayout>
          </PrivateRoute>
        } />
        <Route path="/account" element={
          <PrivateRoute>
            <PageLayout includeFooter={false}>
              <Account />
            </PageLayout>
          </PrivateRoute>
        } />
        <Route path="/payment" element={
          <PrivateRoute>
            <PageLayout includeFooter={false}>
              <Payment />
            </PageLayout>
          </PrivateRoute>
        } />
        <Route path="/onboarding" element={
          <PrivateRoute>
            <Onboarding />
          </PrivateRoute>
        } />
        <Route path="/document/:id" element={
          <PrivateRoute>
            <PageLayout includeFooter={false}>
              <ContentViewer />
            </PageLayout>
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
} 