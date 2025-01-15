import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Notelo</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          {isHomePage ? (
            <>
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-primary transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-primary transition-colors">Pricing</button>
            </>
          ) : (
            <>
              <Link to="/#features" className="text-gray-600 hover:text-primary transition-colors">Features</Link>
              <Link to="/#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            </>
          )}
          <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Contact</Link>
          <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">Login</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}