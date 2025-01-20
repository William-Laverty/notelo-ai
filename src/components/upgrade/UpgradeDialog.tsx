import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Brain, FileText, Layers, Headphones } from 'lucide-react';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeDialog({ isOpen, onClose }: UpgradeDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/payment');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="p-8 overflow-y-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Unlock Premium Features
                </h2>
                <p className="text-center text-gray-600 mb-8">
                  Upgrade to Pro to access interactive quizzes, flashcards, and more!
                </p>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-900">Interactive AI Quizzes</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-900">Smart Flashcards</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50">
                    <FileText className="w-5 h-5 text-violet-600" />
                    <span className="text-violet-900">PDF Support</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                    <Headphones className="w-5 h-5 text-purple-600" />
                    <span className="text-purple-900">Audio Notes (Coming Soon)</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="text-gray-600">Special Launch Price</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-gray-900">$5.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <div className="text-sm text-gray-500">Regular price $9.99/month</div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleUpgrade}
                    className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg shadow-blue-200 hover:shadow-xl transition-shadow"
                  >
                    Upgrade Now
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
} 