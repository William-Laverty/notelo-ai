import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, BookOpen, Brain, ArrowRight, CheckCircle2, Sparkles, Target, Zap, Star, Rocket, Timer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase-client';
import { toast } from 'react-hot-toast';

// Add global type declaration for Reddit tracking
declare global {
  interface Window {
    trackRedditConversion?: (event: string, email?: string, conversionId?: string) => void;
  }
}

interface OnboardingData {
  fullName: string;
  studyHours: number;
  contentTypes: string[];
  goal: 'better_grades' | 'save_time' | 'deeper_understanding' | 'exam_prep';
}

interface OnboardingProps {
  onComplete?: () => void;
}

const contentTypeOptions = [
  { value: 'textbooks', label: 'Textbooks', icon: BookOpen },
  { value: 'articles', label: 'Articles & Papers', icon: BookOpen },
  { value: 'lectures', label: 'Lecture Notes', icon: BookOpen },
  { value: 'other', label: 'Other Content', icon: BookOpen },
];

const goalOptions = [
  { value: 'better_grades', label: 'Get Better Grades', description: 'Improve academic performance' },
  { value: 'save_time', label: 'Save Study Time', description: 'Study more efficiently' },
  { value: 'deeper_understanding', label: 'Understand Deeply', description: 'Master complex topics' },
  { value: 'exam_prep', label: 'Exam Preparation', description: 'Prepare effectively for tests' },
];

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const floatingAnimation = {
  y: [0, -15, 0],
  x: [0, 10, 0],
  rotate: [0, 5, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const goalBenefits = {
  better_grades: {
    title: "Boost Your Academic Performance",
    description: "With the time you'll save using Notelo, you could:",
    benefits: [
      { text: "Review your notes more thoroughly", icon: CheckCircle2 },
      { text: "Practice extra problem sets", icon: Target },
      { text: "Create detailed study guides", icon: BookOpen },
      { text: "Join study groups", icon: User }
    ]
  },
  save_time: {
    title: "Maximize Your Study Efficiency",
    description: "Here's how you can use your saved time:",
    benefits: [
      { text: "Balance academics with other activities", icon: Clock },
      { text: "Reduce study stress", icon: Brain },
      { text: "Focus on challenging topics", icon: Target },
      { text: "Maintain a healthy study-life balance", icon: Star }
    ]
  },
  deeper_understanding: {
    title: "Master Complex Topics",
    description: "Use your extra time to truly understand your subjects:",
    benefits: [
      { text: "Deep dive into challenging concepts", icon: Brain },
      { text: "Connect ideas across subjects", icon: Target },
      { text: "Create mind maps and summaries", icon: BookOpen },
      { text: "Explore advanced topics", icon: Rocket }
    ]
  },
  exam_prep: {
    title: "Excel in Your Exams",
    description: "Optimize your exam preparation with saved time:",
    benefits: [
      { text: "Create comprehensive study plans", icon: Target },
      { text: "Practice past exam questions", icon: CheckCircle2 },
      { text: "Review weak areas thoroughly", icon: Brain },
      { text: "Take practice tests", icon: BookOpen }
    ]
  }
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [studyGoal, setStudyGoal] = useState<string>('save_time');
  const [studyHours, setStudyHours] = useState<number>(2);
  const [contentPreference, setContentPreference] = useState<string>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    studyHours: 5,
    contentTypes: ['textbooks'],
    goal: 'save_time',
  });

  // Load saved onboarding state
  useEffect(() => {
    const loadOnboardingState = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_page, study_goal, study_hours, content_preference')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setCurrentStep(profile.onboarding_page || 1);
          setStudyGoal(profile.study_goal || 'save_time');
          setStudyHours(profile.study_hours || 2);
          setContentPreference(profile.content_preference || 'text');
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      }
    };

    loadOnboardingState();
  }, [user]);

  // Save current step to Supabase
  const saveOnboardingProgress = async (step: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_page: step,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const handleNext = async () => {
    const nextStep = currentStep + 1;
    
    // Save name to Supabase when completing step 1
    if (currentStep === 1) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            full_name: data.fullName,
            updated_at: new Date().toISOString()
          })
          .eq('id', user?.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error saving name:', error);
        toast.error('Failed to save your name');
        return;
      }
    }

    setCurrentStep(nextStep);
    await saveOnboardingProgress(nextStep);
  };

  const handleBack = async () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    await saveOnboardingProgress(prevStep);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Update profile with all onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          study_goal: studyGoal,
          study_hours: studyHours,
          content_preference: contentPreference,
          onboarding_completed: true,
          onboarding_page: 1, // Reset for next time if needed
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Verify the update
      const { data: profile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (verifyError || !profile) {
        throw new Error('Failed to verify profile update');
      }

      // Generate a unique conversion ID for onboarding completion
      const onboardingConversionId = `onboarding_${user?.id}_${Date.now()}`;
      
      // Track Reddit conversion client-side
      if (typeof window !== 'undefined' && window.trackRedditConversion) {
        window.trackRedditConversion('onboarding_completed', user?.email, onboardingConversionId);
        console.log('Reddit conversion tracked client-side for onboarding with ID:', onboardingConversionId);
      }
      
      // Also send to server for server-side tracking
      try {
        await fetch('/api/users/onboarding/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            email: user?.email,
            conversionId: onboardingConversionId
          }),
        });
      } catch (serverError) {
        // If server-side tracking fails, we still have client-side tracking
        console.warn('Server-side conversion tracking failed:', serverError);
      }

      onComplete?.(); // Call onComplete if provided
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeSaved = () => {
    // Estimate time saved based on study hours
    const weeklyTimeSaved = Math.round(data.studyHours * 0.3); // 30% time savings
    const monthlyTimeSaved = weeklyTimeSaved * 4;
    return { weeklyTimeSaved, monthlyTimeSaved };
  };

  const handleContinueFree = async () => {
    await handleComplete();
  };

  const handleUpgradeClick = async () => {
    if (!user?.id) {
      toast.error('Please sign in to upgrade');
      return;
    }

    // Store the current step in localStorage to handle navigation after payment
    localStorage.setItem('onboarding_payment_pending', 'true');
    navigate('/payment');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mx-auto mb-4"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome! Let's get to know you</h2>
              <p className="text-gray-600 mt-2">Start your journey to smarter learning</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">What's your name?</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors group-hover:text-primary" />
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">Your study habits</h2>
              <p className="text-gray-600 mt-2">Help us understand your learning routine</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                How many hours do you spend studying per week?
              </label>
              <div className="relative group">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-colors group-hover:text-primary" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={data.studyHours}
                  onChange={(e) => setData({ ...data, studyHours: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mx-auto mb-4"
              >
                <BookOpen className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">Your study materials</h2>
              <p className="text-gray-600 mt-2">Select the types of content you work with most</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {contentTypeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const newContentTypes = data.contentTypes.includes(option.value)
                      ? data.contentTypes.filter(type => type !== option.value)
                      : [...data.contentTypes, option.value];
                    setData({ ...data, contentTypes: newContentTypes });
                  }}
                  className={`p-4 rounded-xl border ${
                    data.contentTypes.includes(option.value)
                      ? 'border-primary bg-gradient-to-br from-primary/5 to-violet-500/5'
                      : 'border-gray-200 hover:border-primary/50'
                  } text-left transition-all duration-300`}
                >
                  <option.icon className={`h-6 w-6 ${
                    data.contentTypes.includes(option.value) ? 'text-primary' : 'text-gray-400'
                  } mb-2 transition-colors`} />
                  <h3 className={`font-medium ${
                    data.contentTypes.includes(option.value) ? 'text-primary' : 'text-gray-900'
                  } transition-colors`}>
                    {option.label}
                  </h3>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        const { weeklyTimeSaved, monthlyTimeSaved } = calculateTimeSaved();
        const goalContent = goalBenefits[data.goal];
        
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">{goalContent.title}</h2>
              <p className="text-gray-600 mt-2">See what you could achieve with Notelo</p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-2xl p-6 border border-primary/10">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-white rounded-xl shadow-lg shadow-primary/5"
                >
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent"
                  >
                    {weeklyTimeSaved}h
                  </motion.p>
                  <p className="text-sm font-medium text-gray-600">Weekly Time Saved</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-white rounded-xl shadow-lg shadow-primary/5"
                >
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent"
                  >
                    {monthlyTimeSaved}h
                  </motion.p>
                  <p className="text-sm font-medium text-gray-600">Monthly Time Saved</p>
                </motion.div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">{goalContent.description}</h3>
              
              <div className="grid gap-3">
                {goalContent.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.6 }}
                    className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
                  >
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-gray-700">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col items-center space-y-4"
            >
              <p className="text-sm text-gray-500">
                Unlock your full potential with Notelo Premium
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="w-full btn-primary relative overflow-hidden bg-gradient-to-r from-primary via-violet-500 to-primary bg-size-200 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-medium shadow-xl shadow-primary/20 hover:bg-right transition-all duration-500"
              >
                View Special Offer
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleContinueFree}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Continue with free plan
              </motion.button>
            </motion.div>
          </motion.div>
        );

      case 5:
        const { monthlyTimeSaved: timeSaved } = calculateTimeSaved();
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-primary/20 overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8">
                <div className="flex items-center justify-center gap-3 text-primary font-semibold mb-4">
                  <Timer className="w-5 h-5" />
                  <span>Special New User Offer</span>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                  You Could Save {Math.round(timeSaved)} Hours Every Month!
                </h2>
                <p className="text-center text-gray-600 max-w-lg mx-auto">
                  Upgrade to Pro now and unlock advanced AI summaries, priority processing, and interactive quizzes.
                  Start saving more time today!
                </p>
              </div>

              <div className="p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50">
                    <Star className="w-6 h-6 text-amber-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">40% Off Pro Plan</h3>
                      <p className="text-gray-600">Limited time offer for new users</p>
                    </div>
                    <div className="ml-auto">
                      <div className="text-2xl font-bold text-gray-900">$5.99</div>
                      <div className="text-sm text-gray-500 line-through">$9.99</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpgradeClick}
                      className="w-full btn-primary relative overflow-hidden bg-gradient-to-r from-primary via-violet-500 to-primary bg-size-200 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-medium shadow-xl shadow-primary/20 hover:bg-right transition-all duration-500"
                    >
                      Upgrade Now
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleComplete}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Continue with free plan
                    </motion.button>
                  </div>

                  <p className="text-center text-sm text-gray-500">
                    30-day money-back guarantee. Cancel anytime.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-violet-100/20">
      {/* Enhanced animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-violet-500/10 via-primary/5 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Enhanced floating elements */}
      <motion.div 
        animate={floatingAnimation} 
        className="absolute top-20 left-[10%]"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
      </motion.div>
      <motion.div 
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 }
        }}
        className="absolute top-40 right-[15%]"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 backdrop-blur-sm flex items-center justify-center">
          <Star className="w-5 h-5 text-violet-500" />
        </div>
      </motion.div>
      <motion.div 
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 2 }
        }}
        className="absolute bottom-32 left-[20%]"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm flex items-center justify-center">
          <Target className="w-4 h-4 text-primary" />
        </div>
      </motion.div>
      <motion.div 
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 3 }
        }}
        className="absolute bottom-20 right-[25%]"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 backdrop-blur-sm flex items-center justify-center">
          <Rocket className="w-7 h-7 text-violet-500" />
        </div>
      </motion.div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-h-[80vh] flex flex-col">
            {/* Enhanced progress indicator */}
            <div className="p-8 pb-0 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <motion.div 
                  className="flex items-center gap-3"
                  variants={itemVariants}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                  >
                    <Zap className="w-5 h-5 text-primary" />
                  </motion.div>
                  <span className="font-medium text-gray-700">Step {currentStep} of 5</span>
                </motion.div>
                <motion.div 
                  variants={itemVariants}
                  className="text-sm font-medium bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent"
                >
                  {Math.round((currentStep / 5) * 100)}% Complete
                </motion.div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-violet-500 to-primary bg-size-200"
                  initial={{ width: '20%', backgroundPosition: '0% 0%' }}
                  animate={{ 
                    width: `${currentStep * 20}%`,
                    backgroundPosition: ['0% 0%', '100% 0%']
                  }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.22, 1, 0.36, 1],
                    backgroundPosition: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                />
              </div>
            </div>

            {/* Step content with enhanced animations */}
            <div className="p-8 overflow-y-auto flex-grow">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {/* Enhanced navigation */}
              {currentStep < 5 && currentStep !== 4 && (
                <motion.div 
                  className="mt-8 flex justify-end"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={isLoading || (currentStep === 1 && !data.fullName)}
                    className={`btn-primary relative overflow-hidden bg-gradient-to-r from-primary via-violet-500 to-primary bg-size-200 flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-medium shadow-xl shadow-primary/20 ${
                      (isLoading || (currentStep === 1 && !data.fullName)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-right transition-all duration-500'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 