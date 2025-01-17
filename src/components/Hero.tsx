import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, BookOpen, Brain, Link as LinkIcon, Sparkles, ArrowRight, 
  Clock, Zap, MessageSquare, FileText, PenTool, Youtube, FileUp, 
  Newspaper, Podcast, BookOpenCheck, GraduationCap, Lightbulb,
  BookMarked, ScrollText, Presentation, Blocks, Layers, Rocket,
  Target, Award, Crown, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateDemoSummary } from '../lib/ai-service';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function Hero() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleScrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const truncateToWords = (text: string, wordLimit: number) => {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    
    const truncated = words.slice(0, wordLimit).join(' ');
    const lastPeriodIndex = truncated.lastIndexOf('.');
    
    if (lastPeriodIndex > truncated.length * 0.7) {
      return truncated.slice(0, lastPeriodIndex + 1);
    }
    
    return truncated + '...';
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await generateDemoSummary(url);
      const cleanResult = result
        .replace(/[#*`]|:\w+:|^Overview|^Title|^Summary|🎯.*?Overview/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      const words = cleanResult.split(/\s+/);
      const visiblePart = words.slice(0, 50).join(' ') + '...';
      setSummary(visiblePart);
    } catch (error) {
      toast.error('Failed to process URL. Please try a different one.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7F9FD] via-white to-violet-100/20" />
      
      {/* Floating elements */}
      <div>
        {/* Top right sparkle */}
        <motion.div 
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0],
            transition: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="absolute top-40 right-8 lg:right-auto lg:top-32 lg:left-[15%]"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-primary/70" />
          </div>
        </motion.div>

        {/* Bottom left book */}
        <motion.div 
          animate={{
            y: [0, 15, 0],
            x: [0, -5, 0],
            rotate: [0, 3, 0],
            transition: {
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }
          }}
          className="absolute left-8 top-[45vh] lg:top-auto lg:bottom-48 lg:left-[25%]"
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary/70" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Section */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="min-h-[100vh] lg:min-h-0 grid lg:grid-cols-2 gap-16 sm:gap-8 lg:gap-12 items-center">
              {/* Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative text-center lg:text-left flex flex-col justify-between lg:block h-[100vh] lg:h-auto pt-32 lg:pt-0"
              >
                <div className="flex flex-col justify-center flex-1 lg:block">
                  <div className="space-y-8 sm:space-y-6 -mt-16 lg:mt-0">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                      <span className="block mb-2 lg:mb-0 lg:inline">Learn Smarter,</span>{' '}
                      <span className="bg-gradient-to-r from-primary to-violet-500 text-transparent bg-clip-text">Not Harder</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-900 mx-auto lg:mx-0 max-w-lg">
                    Create personalized study materials instantly from any digital content using AI-powered summaries, quizzes, flashcards, and podcasts.
                    </p>
                  </div>
                  
                  {/* Content types grid - 3 columns */}
                  <div className="mt-12 sm:mt-8">
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                      <motion.div 
                        className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-start gap-3 sm:gap-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FileUp className="text-primary w-6 h-6" />
                        <span className="text-sm sm:text-base text-text-secondary text-center lg:text-left">PDFs</span>
                      </motion.div>
                      <motion.div 
                        className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-start gap-3 sm:gap-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Youtube className="text-primary w-6 h-6" />
                        <span className="text-sm sm:text-base text-text-secondary text-center lg:text-left">Videos</span>
                      </motion.div>
                      <motion.div 
                        className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-start gap-3 sm:gap-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Newspaper className="text-primary w-6 h-6" />
                        <span className="text-sm sm:text-base text-text-secondary text-center lg:text-left">Articles</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pb-8 lg:pb-0 lg:mt-12">
                  <button 
                    onClick={handleGetStarted}
                    className="w-full lg:w-auto btn-primary bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 transform hover:scale-105 transition-all duration-300 py-5 sm:py-4 px-8 text-base sm:text-lg rounded-xl"
                  >
                    Get Started for Free
                  </button>
                </div>
              </motion.div>

              {/* Demo Section */}
              <div id="demo-section" className="scroll-mt-24">
                <motion.div
                  className="relative mx-auto lg:mx-0 w-full max-w-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-4 sm:p-6">
                      <AnimatePresence mode="wait">
                        {!summary ? (
                          <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="text-center lg:text-left"
                          >
                            <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                              <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="bg-gradient-to-r from-primary to-violet-500 text-transparent bg-clip-text">
                                  Try Our Demo
                                </span>
                              </h2>
                              <div className="ml-auto flex items-center gap-1 bg-violet-100 text-violet-700 px-2 py-1 rounded-full text-[10px] font-medium">
                                <Crown className="w-3 h-3" />
                                Free Trial
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                              Try with any article URL. Create an account to unlock all features.
                            </p>
                            
                            {/* URL Input Form */}
                            <form onSubmit={handleUrlSubmit} className="mb-4">
                              <div className="relative group">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                  <div className="h-4 w-px bg-gray-200"></div>
                                </div>
                                <input
                                  type="url"
                                  placeholder="Enter any article URL..."
                                  value={url}
                                  onChange={(e) => setUrl(e.target.value)}
                                  className="w-full pl-14 pr-3 py-3 text-sm rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-white"
                                  disabled={isProcessing}
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full mt-3 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary/20 text-sm"
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate Summary
                                  </>
                                )}
                              </button>
                            </form>

                            {/* Feature Cards - 2x2 grid on mobile */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              <motion.div 
                                className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors text-center"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-1.5 rounded-lg bg-primary/10 mb-1">
                                  <FileText className="text-primary w-4 h-4" />
                                </div>
                                <h3 className="font-medium text-xs text-gray-900">Smart Summaries</h3>
                              </motion.div>

                              <motion.div 
                                className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors text-center"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-1.5 rounded-lg bg-violet-500/10 mb-1">
                                  <MessageSquare className="text-violet-500 w-4 h-4" />
                                </div>
                                <h3 className="font-medium text-xs text-gray-900">AI Quizzes</h3>
                              </motion.div>

                              <motion.div 
                                className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors text-center"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-1.5 rounded-lg bg-blue-500/10 mb-1">
                                  <BookOpenCheck className="text-blue-500 w-4 h-4" />
                                </div>
                                <h3 className="font-medium text-xs text-gray-900">Flashcards</h3>
                              </motion.div>

                              <motion.div 
                                className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors text-center"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-1.5 rounded-lg bg-green-500/10 mb-1">
                                  <Podcast className="text-green-500 w-4 h-4" />
                                </div>
                                <h3 className="font-medium text-xs text-gray-900">Audio Notes</h3>
                              </motion.div>
                            </div>

                            {/* Premium Banner */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-500 bg-violet-50 py-2 px-3 rounded-lg">
                              <Crown className="w-3 h-3 text-violet-500" />
                              <span>Create an account to unlock all features</span>
                            </div>
                          </motion.div>
                        ) : (
                          // Summary View - Simplified for mobile
                          <motion.div
                            key="summary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center lg:text-left"
                          >
                            <div className="space-y-4">
                              <div className="text-sm text-gray-600 leading-relaxed">
                                {summary}
                              </div>
                              
                              {/* Feature Grid - 2x2 on mobile */}
                              <div className="grid grid-cols-2 gap-2">
                                <motion.div 
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <div className="p-1.5 rounded-lg bg-primary/10 mb-1">
                                    <FileText className="text-primary w-4 h-4" />
                                  </div>
                                  <h3 className="font-medium text-xs text-gray-900">Full Summary</h3>
                                </motion.div>

                                <motion.div 
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <div className="p-1.5 rounded-lg bg-violet-500/10 mb-1">
                                    <MessageSquare className="text-violet-500 w-4 h-4" />
                                  </div>
                                  <h3 className="font-medium text-xs text-gray-900">AI Quizzes</h3>
                                </motion.div>

                                <motion.div 
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <div className="p-1.5 rounded-lg bg-blue-500/10 mb-1">
                                    <BookOpenCheck className="text-blue-500 w-4 h-4" />
                                  </div>
                                  <h3 className="font-medium text-xs text-gray-900">Flashcards</h3>
                                </motion.div>

                                <motion.div 
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <div className="p-1.5 rounded-lg bg-green-500/10 mb-1">
                                    <Rocket className="text-green-500 w-4 h-4" />
                                  </div>
                                  <h3 className="font-medium text-xs text-gray-900">Premium</h3>
                                </motion.div>
                              </div>
                              
                              {/* CTA Section */}
                              <div className="space-y-3">
                                <button
                                  onClick={handleGetStarted}
                                  className="w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary/20 text-sm"
                                >
                                  Get Started Now
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
                                  <Award className="w-3 h-3" />
                                  <span>Try for free - No credit card required</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}