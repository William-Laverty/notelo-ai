import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';

const freePlanFeatures = [
  { text: 'Up to 10 documents per month', available: true },
  { text: 'Basic AI summaries', available: true },
  { text: 'Standard processing speed', available: true },
  { text: 'Basic document management', available: true },
  { text: 'Email support', available: true },
  { text: 'Advanced AI summaries with context', available: false },
  { text: 'Priority processing (2x faster)', available: false },
  { text: 'Interactive quizzes', available: false },
  { text: 'Studying flashcards', available: false }
];

const proPlanFeatures = [
  { text: 'Unlimited documents', available: true },
  { text: 'Advanced AI summaries with context', available: true },
  { text: 'Priority processing (2x faster)', available: true },
  { text: 'Advanced document organization', available: true },
  { text: 'Interactive quizzes', available: true },
  { text: 'Studying flashcards', available: true },
  { text: 'Priority email & chat support', available: true },
  { text: 'Early access to new features', available: true },
];

export default function Pricing() {
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">Simple, Transparent Pricing</h2>
          <p className="text-text-secondary">Choose the plan that works best for you</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-bold text-text-primary mb-4">Free</h3>
            <p className="text-text-secondary mb-6">Perfect for getting started</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-text-secondary">/month</span>
            </div>
            <div className="space-y-4 mb-8">
              {freePlanFeatures.map((feature) => (
                <div key={feature.text} className="flex items-start gap-3">
                  {feature.available ? (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.available ? 'text-gray-600' : 'text-gray-400'}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleSignup}
              className="w-full btn-secondary"
            >
              Get Started
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-primary text-white text-sm px-3 py-1 rounded-full">
              40% Off
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">Pro</h3>
            <p className="text-text-secondary mb-6">For power users</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">$5.99</span>
              <span className="text-text-secondary">/month</span>
              <div className="text-sm text-text-secondary mt-1">
                <span className="line-through">$9.99</span>
                <span className="text-primary ml-2">Save 40%</span>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              {proPlanFeatures.map((feature) => (
                <div key={feature.text} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">{feature.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={handleSignup}
              className="w-full btn-primary"
            >
              Upgrade Now
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}