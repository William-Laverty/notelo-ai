import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mail, Lock, ArrowRight, Shield, Brain, Upload, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

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
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        toast.error('An account with this email already exists');
        return;
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user?.id) throw new Error('No user ID returned from signup');

      // Create their profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            onboarding_completed: false,
          }
        ]);

      if (profileError) throw profileError;
      
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message.includes('duplicate key')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-300" />
      )}
      <span className={met ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Join thousands of students and professionals</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm backdrop-filter">
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
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
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Password Requirements</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <PasswordRequirement met={hasMinLength} label="At least 8 characters" />
                  <PasswordRequirement met={hasUpperCase} label="One uppercase letter" />
                  <PasswordRequirement met={hasLowerCase} label="One lowercase letter" />
                  <PasswordRequirement met={hasNumber} label="One number" />
                  <PasswordRequirement met={hasSpecialChar} label="One special character" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                <input type="checkbox" required className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Smart Summaries</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Brain className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">AI Quizzes</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Easy Uploads</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}