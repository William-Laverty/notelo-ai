import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, BookOpen, Brain, Sparkles, Youtube, FileText, PenTool, BookOpenCheck } from 'lucide-react';

interface FeaturesProps {
  id?: string;
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Summaries',
    description: 'Get instant, intelligent summaries of any content using advanced AI technology.',
    color: 'blue'
  },
  {
    icon: Clock,
    title: 'Save Time Reading',
    description: 'Reduce reading time by up to 80% while retaining key information.',
    color: 'green'
  },
  {
    icon: Youtube,
    title: 'Multiple Content Types',
    description: 'Process articles, documents, URLs, and soon YouTube videos.',
    color: 'red'
  },
  {
    icon: Sparkles,
    title: 'Smart Insights',
    description: 'Get AI-generated insights, key points, and additional context.',
    color: 'purple'
  },
  {
    icon: PenTool,
    title: 'Interactive Quizzes',
    description: 'Test your understanding with automatically generated quizzes.',
    color: 'amber'
  },
  {
    icon: BookOpenCheck,
    title: 'Smart Flashcards',
    description: 'Reinforce learning with AI-generated flashcards for better retention.',
    color: 'indigo'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Features({ id }: FeaturesProps) {
  return (
    <section id={id} className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Powerful Features for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Smarter Reading
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Discover how Notelo transforms your reading experience with AI-powered features designed to save time and enhance understanding.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">80%</div>
              <div className="text-gray-600">Average Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-gray-600">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}