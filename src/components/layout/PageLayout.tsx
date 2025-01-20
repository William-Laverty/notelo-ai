import React from 'react';
import Navbar from '../Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  includeFooter?: boolean;
  includeNavbar?: boolean;
}

export default function PageLayout({ children, includeFooter = true, includeNavbar = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-violet-100/20">
      {includeNavbar && <Navbar />}
      <div>
        {children}
      </div>
      {includeFooter && <Footer />}
    </div>
  );
} 