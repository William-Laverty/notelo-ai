import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-text-primary">Notelo</span>
            </Link>
            <p className="mt-4 text-text-secondary">
              Transform your learning experience with AI-powered study tools.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-text-secondary hover:text-primary">Features</Link></li>
              <li><Link to="/pricing" className="text-text-secondary hover:text-primary">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-text-secondary hover:text-primary">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-text-secondary hover:text-primary">About</Link></li>
              <li><Link to="/contact" className="text-text-secondary hover:text-primary">Contact</Link></li>
              <li><Link to="/privacy" className="text-text-secondary hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-primary">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary">
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-text-secondary">
          <p>&copy; {new Date().getFullYear()} Notelo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}