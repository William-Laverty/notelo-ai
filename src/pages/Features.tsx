import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Brain, 
  Clock, 
  FileText, 
  Star, 
  Shield, 
  MessageCircle, 
  Rocket, 
  History, 
  RefreshCw,
  ChevronRight,
  Sparkles,
  BookOpen,
  Headphones,
  GraduationCap
} from 'lucide-react';

export default function Features() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Summaries",
      description: "Transform lengthy documents into clear, concise summaries in seconds. Our advanced AI understands context and maintains accuracy.",
      color: "text-yellow-500"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Analysis",
      description: "Get intelligent insights and key takeaways from your documents. Our AI identifies main themes and important details.",
      color: "text-blue-500"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Interactive Quizzes",
      description: "Test your understanding with AI-generated quizzes based on your documents. Perfect for active learning and retention.",
      color: "text-green-500"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Study Flashcards",
      description: "Convert key concepts into interactive flashcards for effective memorization and revision. Personalized to your content.",
      color: "text-purple-500"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Audio Summaries",
      description: "Listen to your document summaries as podcasts. Perfect for learning on the go or while multitasking.",
      color: "text-orange-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Time Optimization",
      description: "Save hours of reading time with instant summaries. Track your time savings and boost productivity.",
      color: "text-red-500"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Multiple Formats",
      description: "Process various content types including articles, PDFs, and web pages. Seamless support for all your reading needs.",
      color: "text-indigo-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Processing",
      description: "Your documents are processed with enterprise-grade security. We prioritize your privacy and data protection.",
      color: "text-cyan-500"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Priority Support",
      description: "Get fast, responsive support from our team. We're here to help you make the most of our platform.",
      color: "text-emerald-500"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Fast Processing",
      description: "Get your summaries in seconds with our optimized processing pipeline. No more waiting for results.",
      color: "text-pink-500"
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
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"> Efficient Reading</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Discover how our AI-powered tools can transform your reading experience and save you valuable time.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Free <ChevronRight className="inline-block w-5 h-5 ml-1" />
            </motion.button>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-purple-50 to-transparent opacity-50" />
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
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
              Ready to Transform Your Reading Experience?
            </h2>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already saving hours of reading time with our AI-powered tools.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/pricing')}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              View Pricing <Sparkles className="inline-block w-5 h-5 ml-1" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 