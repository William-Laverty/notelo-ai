import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, BookOpen, Brain, Sparkles, Youtube, FileText, PenTool, BookOpenCheck, ChevronDown, Headphones } from 'lucide-react';

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
  },
  {
    icon: Headphones,
    title: 'Audio Notes',
    description: 'Convert any text content into audio for on-the-go learning and accessibility.',
    color: 'rose'
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
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFeatureClick = (title: string) => {
    if (isMobile) {
      setExpandedFeature(expandedFeature === title ? null : title);
    }
  };

  const FeatureCard = ({ feature }: { feature: typeof features[0] }) => {
    const Icon = feature.icon;
    const isExpanded = expandedFeature === feature.title;

    return (
      <motion.div
        key={feature.title}
        variants={!isMobile ? itemVariants : undefined}
        className={`relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm transition-all border border-gray-200/50 
          ${isMobile ? 'cursor-pointer hover:border-primary/20' : 'hover:shadow-md'}`}
        onClick={() => handleFeatureClick(feature.title)}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 text-${feature.color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate pr-8">
                {feature.title}
              </h3>
              {isMobile && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Description - Always visible on desktop, expandable on mobile */}
          <AnimatePresence>
            {(!isMobile || isExpanded) && (
              <motion.div
                initial={isMobile ? { height: 0, opacity: 0 } : undefined}
                animate={isMobile ? { height: 'auto', opacity: 1 } : undefined}
                exit={isMobile ? { height: 0, opacity: 0 } : undefined}
                className="overflow-hidden"
              >
                <p className="text-base text-gray-600 mt-4 pl-[60px] pr-8">
                  {feature.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <section id={id} className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={isMobile ? false : { opacity: 0 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            Powerful Features for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Smarter Reading
            </span>
          </h2>
          <p className="text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-800">
            Discover how Notelo transforms your reading experience with AI-powered features designed to save time and enhance understanding.
          </p>
        </motion.div>

        {/* Features List/Grid */}
        <motion.div
          variants={!isMobile ? containerVariants : undefined}
          initial={!isMobile ? "hidden" : false}
          whileInView={!isMobile ? "visible" : { opacity: 1 }}
          className={`${
            isMobile 
              ? 'space-y-3 max-w-lg mx-auto' 
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
          }`}
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          whileInView={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={isMobile ? undefined : { delay: 0.5 }}
          className="mt-16 md:mt-24 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">80%</div>
              <div className="text-sm md:text-base text-gray-600">Average Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">125K+</div>
              <div className="text-sm md:text-base text-gray-600">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">98%</div>
              <div className="text-sm md:text-base text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}