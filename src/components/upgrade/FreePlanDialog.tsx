import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronRight, Check, Zap, Brain, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FreePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreePlanDialog({ isOpen, onClose }: FreePlanDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    setTimeout(() => {
      navigate('/payment');
    }, 100);
  };

  const features = [
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      title: "PDF Support",
      description: "Upload and process PDF documents"
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      title: "Interactive Quizzes",
      description: "AI-generated quizzes from your notes"
    },
    {
      icon: <Clock className="w-5 h-5 text-green-500" />,
      title: "Unlimited Documents",
      description: "Process as many documents as you need"
    },
    {
      icon: <Star className="w-5 h-5 text-amber-500" />,
      title: "Premium Features",
      description: "Access to all advanced features"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Free Plan Limit Reached</h3>
                    <p className="text-gray-600">Upgrade to unlock PDF support and premium features</p>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Price */}
                <div className="mt-6 text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                  <p className="text-gray-600">Upgrade to Pro for just</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">$5.99<span className="text-lg font-normal text-gray-600">/month</span></p>
                </div>

                {/* Action buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleUpgrade}
                    className="w-full bg-primary text-white rounded-xl py-3 px-4 font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Upgrade Now
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 