import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, BookOpen, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase-client';
import { toast } from 'react-hot-toast';
import SpecialOffer from './SpecialOffer';

interface OnboardingData {
  fullName: string;
  studyHours: number;
  contentType: 'textbooks' | 'articles' | 'lectures' | 'other';
  goal: 'better_grades' | 'save_time' | 'deeper_understanding' | 'exam_prep';
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

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    studyHours: 5,
    contentType: 'textbooks',
    goal: 'save_time',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const calculateTimeSaved = () => {
    // Estimate time saved based on study hours
    const weeklyTimeSaved = Math.round(data.studyHours * 0.3); // 30% time savings
    const monthlyTimeSaved = weeklyTimeSaved * 4;
    return { weeklyTimeSaved, monthlyTimeSaved };
  };

  const handleContinueFree = async () => {
    await handleSubmit();
    navigate('/dashboard');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!user?.id) throw new Error('No user ID found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          study_hours: data.studyHours,
          content_preference: data.contentType,
          study_goal: data.goal,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Welcome! Let's get to know you</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">What's your name?</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
            <h2 className="text-2xl font-bold text-gray-900">Your study habits</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                How many hours do you spend studying per week?
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={data.studyHours}
                  onChange={(e) => setData({ ...data, studyHours: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
            <h2 className="text-2xl font-bold text-gray-900">Your study materials</h2>
            <div className="grid grid-cols-2 gap-4">
              {contentTypeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setData({ ...data, contentType: option.value as any })}
                  className={`p-4 rounded-xl border ${
                    data.contentType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  } text-left transition-all`}
                >
                  <option.icon className={`h-6 w-6 ${
                    data.contentType === option.value ? 'text-primary' : 'text-gray-400'
                  } mb-2`} />
                  <h3 className={`font-medium ${
                    data.contentType === option.value ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </h3>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        const { weeklyTimeSaved, monthlyTimeSaved } = calculateTimeSaved();
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Your learning goals</h2>
            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setData({ ...data, goal: option.value as any })}
                  className={`p-4 rounded-xl border ${
                    data.goal === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  } text-left transition-all`}
                >
                  <Brain className={`h-6 w-6 ${
                    data.goal === option.value ? 'text-primary' : 'text-gray-400'
                  } mb-2`} />
                  <h3 className={`font-medium ${
                    data.goal === option.value ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </motion.button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-xl">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Your Potential Time Savings
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{weeklyTimeSaved}h</p>
                  <p className="text-sm text-gray-600">Weekly</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{monthlyTimeSaved}h</p>
                  <p className="text-sm text-gray-600">Monthly</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        const { monthlyTimeSaved: timeSaved } = calculateTimeSaved();
        return <SpecialOffer timeSaved={timeSaved} onContinueFree={handleContinueFree} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-100 rounded-full">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '20%' }}
                animate={{ width: `${step * 20}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500 text-right">Step {step} of 5</div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          {step < 5 && (
            <motion.div className="mt-8 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                disabled={isSubmitting || (step === 1 && !data.fullName)}
                className={`btn-primary flex items-center gap-2 ${
                  (isSubmitting || (step === 1 && !data.fullName)) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {step === 4 ? 'View Special Offer' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 