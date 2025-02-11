import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, BookOpen, Brain, Link as LinkIcon, Sparkles, ArrowRight, 
  Clock, Zap, MessageSquare, FileText, PenTool, Youtube, FileUp, 
  Newspaper, Podcast, BookOpenCheck, GraduationCap, Lightbulb,
  BookMarked, ScrollText, Presentation, Blocks, Layers, Rocket,
  Target, Award, Crown, ChevronDown, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateDemoSummary } from '../lib/ai-service';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { TypeAnimation } from 'react-type-animation';

export default function Hero() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      const maxScroll = window.innerHeight * 0.8;
      const progress = Math.min(position / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate gradient opacity and transform based on scroll (disabled on mobile)
  const gradientStyle = isMobile ? {} : {
    opacity: Math.max(0, 1 - scrollProgress * 1.2),
    transform: `scale(${1 + scrollProgress * 0.1}) translateY(${scrollProgress * -5}%)`,
  };

  // Animation variants based on device type
  const floatingAnimation = isMobile ? {} : {
    y: [0, -15, 0],
    x: [0, 10, 0],
    rotate: [0, 5, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const floatingAnimation2 = isMobile ? {} : {
    y: [0, 15, 0],
    x: [0, -5, 0],
    rotate: [0, -5, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 2
    }
  };

  const floatingAnimation3 = isMobile ? {} : {
    y: [0, -10, 0],
    x: [0, 5, 0],
    rotate: [0, 3, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1
    }
  };

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
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-violet-50/30" />

      {/* Animated gradient layers - conditionally animated */}
      <div 
        className={`absolute inset-0 ${!isMobile ? 'transition-all duration-1000 ease-out will-change-transform' : ''}`}
        style={gradientStyle}
      >
        {/* Primary gradient layer */}
        <div className={`absolute inset-0 bg-gradient-to-br from-violet-500/30 via-primary/20 to-violet-400/30 ${!isMobile ? 'animate-gradient-slow' : ''} blur-[100px]`} />
        
        {/* Secondary gradient layer */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-violet-400/20 to-primary/20 mix-blend-soft-light ${!isMobile ? 'animate-gradient-slow-reverse' : ''} blur-[80px]`} />
        
        {/* Accent gradient layer */}
        <div className={`absolute inset-0 bg-gradient-to-r from-violet-500/20 via-transparent to-primary/20 ${!isMobile ? 'animate-gradient-slow-delay' : ''} blur-[120px]`} />
        
        {/* Shimmer effect */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-white/5 to-white/30 mix-blend-overlay ${!isMobile ? 'animate-shimmer' : ''} blur-[60px]`} />
      </div>

      {/* Bottom fade-out blur layer - simplified on mobile */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[50vh] pointer-events-none"
        style={isMobile ? {
          background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 1))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } : {
          background: `linear-gradient(to bottom, 
            transparent,
            rgba(255, 255, 255, ${scrollProgress * 0.3}) 20%,
            rgba(255, 255, 255, ${scrollProgress * 0.6}) 40%,
            rgba(255, 255, 255, ${scrollProgress * 0.9}) 60%,
            rgba(255, 255, 255, 1) 100%
          )`,
          backdropFilter: `blur(${20 + scrollProgress * 30}px)`,
          WebkitBackdropFilter: `blur(${20 + scrollProgress * 30}px)`,
          transition: 'all 1000ms ease-out',
        }}
      />

      {/* Extra blur layer - simplified on mobile */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[30vh] pointer-events-none"
        style={isMobile ? {
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8))',
        } : {
          backdropFilter: `blur(${30 + scrollProgress * 40}px)`,
          WebkitBackdropFilter: `blur(${30 + scrollProgress * 40}px)`,
          background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8))',
          transition: 'all 1000ms ease-out',
        }}
      />

      {/* Floating elements - conditionally animated */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={floatingAnimation}
          className="absolute top-40 right-8 lg:right-auto lg:top-32 lg:left-[15%]"
        >
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(99,102,241,0.1)] flex items-center justify-center">
            <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
          </div>
        </motion.div>

        <motion.div 
          animate={floatingAnimation2}
          className="absolute left-8 top-[45vh] lg:top-auto lg:bottom-48 lg:left-[25%]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(99,102,241,0.1)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
        </motion.div>

        <motion.div 
          animate={floatingAnimation3}
          className="absolute right-12 bottom-32 lg:right-[20%] lg:top-[60%]"
        >
          <div className="w-8 h-8 rounded-lg bg-white/30 backdrop-blur-sm border border-white/40 shadow-[0_8px_32px_rgba(99,102,241,0.1)] flex items-center justify-center">
            <Brain className="w-4 h-4 text-violet-500" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Section */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
            <div className="min-h-[100vh] lg:min-h-0 grid lg:grid-cols-2 gap-16 sm:gap-8 lg:gap-12 items-center">
              {/* Hero Content */}
              <motion.div
                initial={false}
                animate={isMobile ? { opacity: 1 } : { opacity: 1 }}
                className="relative text-center lg:text-left flex flex-col h-screen lg:h-auto"
              >
                {/* Main content wrapper with flex to distribute space */}
                <div className="flex-1 flex flex-col h-full">
                  {/* Center section with main content */}
                  <div className="flex-1 flex flex-col">
                    {/* Early Access Badge */}
                    <motion.div
                      initial={false}
                      animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      className="pt-28 lg:pt-0 lg:mb-8"
                    >
                      <motion.div 
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-violet-100 text-violet-800 text-xs sm:text-sm font-medium"
                        initial={false}
                        animate={isMobile ? { opacity: 1 } : { scale: 1 }}
                      >
                        <motion.div
                          initial={false}
                          animate={isMobile ? { opacity: 1 } : { rotate: 0, opacity: 1 }}
                        >
                          <Crown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                        </motion.div>
                        <motion.span
                          initial={false}
                          animate={isMobile ? { opacity: 1 } : { opacity: 1 }}
                        >
                          Early Access - 40% Off
                        </motion.span>
                        <div className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-violet-500 ${!isMobile ? 'animate-pulse' : ''}`}></div>
                      </motion.div>
                    </motion.div>

                    {/* Main content - centered on mobile */}
                    <div className="flex-1 flex flex-col">
                      {/* Heading section positioned in the box area */}
                      <div className="mt-8 lg:mt-0">
                        <div className="space-y-6 sm:space-y-6 lg:space-y-8 px-4 sm:px-8 lg:px-0">
                          <motion.h1 
                            className="text-[2rem] sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight"
                            initial={false}
                            animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          >
                            <motion.span 
                              className="block mb-2"
                              initial={false}
                              animate={{ opacity: 1 }}
                            >
                              Transform Your
                            </motion.span>
                            <motion.span 
                              className={`bg-gradient-to-r from-primary via-violet-500 to-primary text-transparent bg-clip-text bg-[length:200%_auto] ${!isMobile ? 'animate-gradient' : ''}`}
                              initial={false}
                              animate={{ opacity: 1 }}
                            >
                              Study Experience
                            </motion.span>
                          </motion.h1>
                          <motion.p 
                            className="text-base sm:text-lg lg:text-2xl text-gray-700 mx-auto lg:mx-0 max-w-xl leading-relaxed"
                            initial={false}
                            animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          >
                            Create <span className="font-semibold text-primary">personalized study materials</span> from any content in seconds. Perfect for students who want to study smarter, not harder.
                          </motion.p>
                        </div>
                      </div>

                      {/* Social Proof Section */}
                      <motion.div 
                        className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
                        initial={false}
                        animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      >
                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 items-center">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex -space-x-1.5 sm:-space-x-2">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-100 to-primary/10 border-2 border-white flex items-center justify-center">
                                  <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                </div>
                              ))}
                            </div>
                            <span><span className="font-semibold">48+ students</span> joined today</span>
                          </div>
                        </div>

                        {/* Mobile-only Input/Output Types - Always visible on mobile */}
                        <div className="mt-6 sm:mt-8 space-y-4 lg:hidden">
                          {/* Input Types */}
                          <div className="flex flex-wrap justify-center gap-2">
                            {[
                              { icon: FileUp, text: 'PDFs' },
                              { icon: Youtube, text: 'Videos' },
                              { icon: Newspaper, text: 'Articles' }
                            ].map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100"
                              >
                                <item.icon className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-xs text-gray-600">{item.text}</span>
                              </div>
                            ))}
                          </div>

                          {/* Output Types */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { 
                                icon: FileText, 
                                text: 'Smart Summaries',
                                color: 'text-blue-600'
                              },
                              { 
                                icon: MessageSquare, 
                                text: 'Practice Quizzes',
                                color: 'text-violet-600'
                              },
                              { 
                                icon: BookOpenCheck, 
                                text: 'Flashcards',
                                color: 'text-emerald-600'
                              },
                              { 
                                icon: Podcast, 
                                text: 'Audio Notes',
                                color: 'text-orange-600'
                              }
                            ].map((item, i) => (
                              <div
                                key={i}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/50 border border-gray-100"
                              >
                                <div className={`p-2 rounded-lg bg-white shadow-sm ${item.color}`}>
                                  <item.icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-800">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Bottom-aligned CTA Section */}
                    <motion.div 
                      className="mt-auto pb-8 pt-4 lg:mt-16"
                      initial={false}
                      animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <motion.button 
                          onClick={handleGetStarted}
                          className="w-full sm:w-auto btn-primary bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 transform hover:scale-105 transition-all duration-300 py-4 sm:py-5 px-6 sm:px-8 text-base sm:text-lg rounded-xl font-semibold text-white shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                          initial={false}
                          animate={isMobile ? { opacity: 1 } : { scale: 1 }}
                        >
                          Get Started Free
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                      </div>
                      <motion.p 
                        className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 text-center lg:text-left"
                        initial={false}
                        animate={{ opacity: 1 }}
                      >
                        No credit card required • Cancel anytime
                      </motion.p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Demo Section - Always visible on desktop */}
              <motion.div 
                id="demo-section" 
                className="hidden lg:block scroll-mt-24"
                initial={false}
                animate={isMobile ? { opacity: 1 } : { opacity: 1, x: 0 }}
              >
                <motion.div
                  className="relative mx-auto lg:mx-0 w-full max-w-xl"
                  initial={false}
                  animate={isMobile ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                >
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-4 sm:p-6">
                      {/* Header - Always visible */}
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
                          </motion.div>
                        ) : (
                          <motion.div
                            key="summary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center lg:text-left"
                          >
                            <div className="space-y-4">
                              <div className="text-sm text-gray-600 leading-relaxed relative">
                                <div className="mb-4">{summary}</div>
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
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

                      {/* Feature Cards - Always visible */}
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        {[
                          { 
                            icon: FileText, 
                            title: 'Smart Summaries',
                            color: 'bg-blue-50 text-blue-600'
                          },
                          { 
                            icon: MessageSquare, 
                            title: 'Practice Quizzes',
                            color: 'bg-violet-50 text-violet-600'
                          },
                          { 
                            icon: BookOpenCheck, 
                            title: 'Flashcards',
                            color: 'bg-emerald-50 text-emerald-600'
                          },
                          { 
                            icon: Podcast, 
                            title: 'Audio Notes',
                            color: 'bg-orange-50 text-orange-600'
                          }
                        ].map((item, i) => (
                          <div
                            key={i}
                            className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg ${item.color} text-center`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}