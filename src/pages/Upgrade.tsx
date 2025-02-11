import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Infinity,
  Brain,
  FileText,
  BookOpen,
  Headphones,
  Clock,
  Star,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Upgrade() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgradeClick = () => {
    if (!user) {
      navigate('/login?redirect=/payment');
    } else {
      navigate('/payment');
    }
  };

  const features = [
    {
      icon: <Infinity className="w-5 h-5" />,
      title: "Unlimited Documents",
      description: "Process as many documents as you need"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Advanced AI Summaries",
      description: "More detailed and customizable summaries"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Interactive Flashcards",
      description: "Auto-generated smart flashcards for better retention"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Custom Quizzes",
      description: "AI-generated quizzes to test your knowledge"
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: "Audio Notes",
      description: "Convert summaries to audio for on-the-go learning"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Priority Processing",
      description: "Faster processing times for all your content"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50 py-20 px-4 sm:px-6 lg:px-8">
      {/* Early Access Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mb-12"
      >
        <div className="bg-gradient-to-r from-violet-500/10 to-primary/10 rounded-2xl p-1">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Early Access Offer</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Get 40% off Notelo Pro - Limited time offer for early users!
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Upgrade to{' '}
            <span className="bg-gradient-to-r from-primary to-violet-500 text-transparent bg-clip-text">
              Notelo Pro
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your learning experience with advanced AI features and unlimited access
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg mx-auto mb-16"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-500 rounded-2xl blur opacity-30"></div>
            
            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Star className="w-6 h-6 text-primary" />
                      Pro Plan
                    </h2>
                    <p className="text-gray-600">All features unlocked</p>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 line-through text-sm">$9.99/mo</div>
                    <div className="text-3xl font-bold text-primary">$5.99<span className="text-sm font-normal text-gray-600">/mo</span></div>
                  </div>
                </div>

                <button
                  onClick={handleUpgradeClick}
                  className="w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white rounded-lg py-4 px-6 font-medium flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all duration-200"
                >
                  {user ? 'Upgrade Now' : 'Sign In to Upgrade'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-lg p-3 text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">
            Questions? We're here to help!{' '}
            <a href="mailto:support@notelo-ai.com" className="text-primary hover:underline">
              Contact support
            </a>
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Check className="w-4 h-4 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 