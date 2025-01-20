import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Check,
  Zap,
  Star,
  Shield,
  Clock,
  Brain,
  MessageCircle,
  Sparkles,
  X
} from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for trying out our service",
      features: [
        "Up to 3 documents per month",
        "Basic AI summaries",
        "Standard processing speed",
        "Basic document management",
        "Email support"
      ],
      negativeFeatures: [
        "Advanced AI summaries with context",
        "Priority processing (2x faster)",
        "Interactive quizzes",
        "Studying flashcards"
      ],
      color: "from-gray-600 to-gray-500",
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "5.99",
      description: "Unlock unlimited potential",
      features: [
        "Unlimited documents",
        "Advanced AI summaries with context",
        "Priority processing (2x faster)",
        "Advanced document organization",
        "Interactive quizzes",
        "Studying flashcards",
        "Priority email & chat support",
        "Early access to new features"
      ],
      color: "from-purple-600 to-blue-500",
      buttonText: "Upgrade Now",
      popular: true
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Get your summaries in seconds"
    },
    {
      icon: <Brain className="w-6 h-6 text-blue-500" />,
      title: "Smart Analysis",
      description: "AI-powered insights and key points"
    },
    {
      icon: <Shield className="w-6 h-6 text-red-500" />,
      title: "Secure",
      description: "Enterprise-grade security"
    },
    {
      icon: <Clock className="w-6 h-6 text-green-500" />,
      title: "Time Saving",
      description: "Reduce reading time by 80%"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"> Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your needs. Upgrade or downgrade at any time.
            </p>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-purple-50 to-transparent opacity-50" />
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + i * 0.1 }}
                      className="flex items-center text-gray-600"
                    >
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                  {plan.negativeFeatures && plan.negativeFeatures.map((feature, i) => (
                    <motion.li
                      key={`negative-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + (i + plan.features.length) * 0.1 }}
                      className="flex items-center text-gray-400"
                    >
                      <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(plan.name === "Free" ? '/signup' : '/payment')}
                  className={`w-full py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Pro Plan?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock the full potential of AI-powered document analysis
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-block p-3 bg-gray-50 rounded-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Find answers to common questions about our plans and features
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What's included in the free plan?
            </h3>
            <p className="text-gray-600">
              The free plan includes up to 3 documents per month, basic AI summaries, standard processing speed, basic document management, and email support. It's perfect for trying out our service.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Can I upgrade or downgrade my plan at any time?
            </h3>
            <p className="text-gray-600">
              Yes! You can upgrade to Pro whenever you need more features, or downgrade back to the free plan at the end of your billing cycle. Your subscription is flexible to match your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What makes the Pro plan worth it?
            </h3>
            <p className="text-gray-600">
              The Pro plan offers unlimited documents, advanced AI summaries with context, 2x faster processing, interactive quizzes, flashcards, priority support, and early access to new features. It's designed for users who want to maximize their learning efficiency.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Is there a money-back guarantee?
            </h3>
            <p className="text-gray-600">
              Yes, we offer a 30-day money-back guarantee for the Pro plan. If you're not satisfied with our service, we'll provide a full refund, no questions asked.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Start Saving Time Today
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Try our service for free and upgrade whenever you're ready.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Free <Sparkles className="inline-block w-5 h-5 ml-1" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 