import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    const newErrors: { email?: string; password?: string } = {};
    
    if (!emailValidation.success) {
      newErrors.email = emailValidation.error;
    }
    
    if (!passwordValidation.success) {
      newErrors.password = passwordValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowError(false);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please try again.');
        } else if (error.message.includes('Too many login attempts')) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Failed to sign in. Please try again later.');
        }
        setShowError(true);
        return;
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMessage(error.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/5 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-6">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">Notelo</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue learning</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm backdrop-filter">
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Sign in failed</h3>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  } focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                    setShowError(false);
                  }}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 bg-red-100 text-red-700 text-sm px-2 py-1 rounded"
                    >
                      {errors.email}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  } focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                    setShowError(false);
                  }}
                />
                <AnimatePresence>
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 bg-red-100 text-red-700 text-sm px-2 py-1 rounded"
                    >
                      {errors.password}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-primary hover:text-primary/80 transition-colors hover:bg-primary/5 px-3 py-2 rounded-lg"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg bg-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Trusted by students and professionals worldwide</p>
          <div className="mt-4 flex justify-center gap-8">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=50&h=50&fit=crop&crop=faces&auto=format&q=80" 
              className="w-8 h-8 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
              alt="University 1" 
            />
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=50&h=50&fit=crop&crop=faces&auto=format&q=80" 
              className="w-8 h-8 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
              alt="University 2" 
            />
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src="https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=50&h=50&fit=crop&crop=faces&auto=format&q=80" 
              className="w-8 h-8 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
              alt="University 3" 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}