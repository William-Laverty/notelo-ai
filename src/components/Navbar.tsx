import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full top-0 z-50 px-4"
    >
      <div className="max-w-7xl mx-auto mt-2">
        <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-sm">
          <div className="px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 flex items-center justify-center transform transition-all duration-200 group-hover:scale-105 group-hover:rotate-3 shadow-sm p-2">
                <img src="/notebook.png" alt="Notelo" className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Notelo
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/features">Features</NavLink>
              <NavLink to="/pricing">Pricing</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <div className="w-px h-6 bg-gray-200/50 mx-2" />
              <NavLink to="/login">Login</NavLink>
              <Link 
                to="/signup" 
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium 
                  hover:shadow-lg hover:shadow-blue-400/20 transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-white/10 bg-white/5 backdrop-blur-lg"
              >
                <div className="px-6 py-4 space-y-2">
                  <MobileNavLink to="/features" onClick={() => setIsMenuOpen(false)}>Features</MobileNavLink>
                  <MobileNavLink to="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</MobileNavLink>
                  <MobileNavLink to="/about" onClick={() => setIsMenuOpen(false)}>About</MobileNavLink>
                  <MobileNavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</MobileNavLink>
                  <div className="w-full h-px bg-white/10 my-2" />
                  <MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>Login</MobileNavLink>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium 
                      text-center hover:shadow-lg hover:shadow-blue-400/20 transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 relative group ${
        isActive 
          ? 'text-purple-600' 
          : 'text-gray-600 hover:text-purple-600'
      }`}
    >
      {children}
      <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full transform origin-left transition-all duration-200 
        ${isActive 
          ? 'bg-gradient-to-r from-purple-600 to-blue-500 scale-x-100' 
          : 'bg-purple-600 scale-x-0 group-hover:scale-x-100'
        }`} 
      />
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block w-full px-4 py-2 rounded-xl font-medium transition-colors ${
        isActive 
          ? 'text-purple-600 bg-white/5 backdrop-blur-sm' 
          : 'text-gray-600 hover:text-purple-600 hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
}