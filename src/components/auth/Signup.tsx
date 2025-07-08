import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { 
  Mail, Lock, Shield, CheckCircle2, XCircle, ArrowRight,
  FileText, BookOpen, MessageSquare, Podcast, ArrowDown,
  FileUp, Youtube, Newspaper, Wand2, Sparkles
} from 'lucide-react';
import { supabase, signInWithGoogle } from '../../lib/supabase-client';
import { validateEmail, validatePassword } from '../../utils/validation';
import PageLayout from '../../components/layout/PageLayout';

declare global {
  interface Window {
    trackRedditConversion?: (event: string, email?: string, conversionId?: string) => void;
  }
}

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSignup, setShowSignup] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Get the redirect path from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/onboarding';

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Show signup form after animation sequence, immediately on mobile
    const timer = setTimeout(() => {
      setShowSignup(true);
    }, isMobile ? 0 : 3200);
    return () => clearTimeout(timer);
  }, [isMobile]);

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
      // Sign up the user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned after signup');
      }

      // Create profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            created_at: new Date().toISOString(),
            study_hours: 0,
            content_preference: 'text',
            study_goal: 'save_time',
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
            subscription_status: 'free',
            subscription_tier: 'free',
            usage_count: 0
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Verify profile was created
      const { data: profile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (verifyError || !profile) {
        throw new Error('Failed to verify profile creation');
      }

      // Generate a unique conversion ID for signup
      const conversionId = `signup_${authData.user.id}_${Date.now()}`;
      
      // Track Reddit conversion client-side
      if (typeof window.trackRedditConversion === 'function') {
        window.trackRedditConversion('signup', email, conversionId);
        console.log('Reddit conversion tracked client-side for signup with ID:', conversionId);
      }
      
      // Also send to server for server-side tracking
      try {
        await fetch('/api/users/registration/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authData.user.id,
            email,
            conversionId
          }),
        });
      } catch (serverError) {
        // If server-side tracking fails, we still have client-side tracking
        console.warn('Server-side conversion tracking failed:', serverError);
      }

      toast.success('Account created successfully!');
      navigate(redirectTo);
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

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // The redirect will happen automatically
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google');
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
    <PageLayout includeFooter={false}>
      <div className="relative min-h-screen flex items-center justify-center p-4 pt-24">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30" />

        {/* Animated gradient layers */}
        <div className="absolute inset-0">
          {/* Primary gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-primary/10 to-violet-400/20 animate-gradient-slow blur-[100px]" />
          
          {/* Secondary gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-blue-400/10 to-primary/10 mix-blend-soft-light animate-gradient-slow-reverse blur-[80px]" />
          
          {/* Accent gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-violet-500/10 animate-gradient-slow-delay blur-[120px]" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/30 mix-blend-overlay animate-shimmer blur-[60px]" />
        </div>

        <AnimatePresence mode="wait">
          {!showSignup && !isMobile ? (
            // Only show animation on non-mobile devices
            <motion.div
              key="animation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl text-center relative"
            >
              {/* Animated Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-12"
              >
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Supercharge Your Learning</span>
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug sm:leading-normal max-w-xl mx-auto"
                >
                  Transform any content into personalized study materials
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 text-gray-600 text-sm sm:text-base lg:text-lg max-w-lg mx-auto"
                >
                  Save time and study smarter with AI-powered learning tools
                </motion.p>
              </motion.div>

              {/* Input Types */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex justify-center gap-4 mb-8"
              >
                {[
                  { icon: FileUp, text: 'PDFs' },
                  { icon: Youtube, text: 'Videos' },
                  { icon: Newspaper, text: 'Articles' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/80 shadow-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Transform Arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="mb-8 flex justify-center items-center gap-3"
              >
                <ArrowDown className="w-6 h-6 text-primary animate-bounce" />
                <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
                  <Wand2 className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <ArrowDown className="w-6 h-6 text-primary animate-bounce" />
              </motion.div>

              {/* Output Types */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {[
                  { 
                    icon: FileText, 
                    text: 'Smart Summaries',
                    color: 'from-blue-500/20 to-blue-600/20',
                    delay: 1.1
                  },
                  { 
                    icon: MessageSquare, 
                    text: 'Practice Quizzes',
                    color: 'from-violet-500/20 to-violet-600/20',
                    delay: 1.2
                  },
                  { 
                    icon: BookOpen, 
                    text: 'Flashcards',
                    color: 'from-emerald-500/20 to-emerald-600/20',
                    delay: 1.3
                  },
                  { 
                    icon: Podcast, 
                    text: 'Audio Notes',
                    color: 'from-orange-500/20 to-orange-600/20',
                    delay: 1.4
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: item.delay }}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/80 shadow-lg backdrop-blur-sm"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md relative"
            >
              {/* Logo and Welcome */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Create your account</h1>
                <p className="text-sm sm:text-base text-gray-600">Join thousands of students and professionals</p>
              </div>

              {/* Login Form */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
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
                          className="absolute right-0 top-full mt-1 bg-red-100 text-red-700 text-xs sm:text-sm px-2 py-1 rounded"
                        >
                          {errors.email}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400" />
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
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
                          className="absolute right-0 top-full mt-1 bg-red-100 text-red-700 text-xs sm:text-sm px-2 py-1 rounded"
                        >
                          {errors.password}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 sm:p-3 rounded-lg transition-colors">
                      <input type="checkbox" required className="mt-1 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="text-xs sm:text-sm text-gray-600">
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
                    className={`w-full py-2.5 sm:py-3 px-4 rounded-lg bg-primary text-white text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Google Sign In Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Sign up with Google
                    </span>
                  </button>
                </div>

                <div className="mt-6 sm:mt-8 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}