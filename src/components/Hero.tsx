import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, BookOpen, Brain, Link as LinkIcon, Sparkles, ArrowRight, 
  Clock, Zap, MessageSquare, FileText, PenTool, Youtube, FileUp, 
  Newspaper, Podcast, BookOpenCheck, GraduationCap, Lightbulb,
  BookMarked, ScrollText, Presentation, Blocks, Layers, Rocket,
  Target, Award, Crown, ChevronDown, Star, Pause
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateDemoSummary } from '../lib/ai-service';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// Lazy load TypeAnimation component to reduce initial load time
const TypeAnimation = lazy(() => import('react-type-animation').then(mod => ({ default: mod.TypeAnimation })));

// Define props interface for the Demo component
interface DemoProps {
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  isProcessing: boolean;
  handleUrlSubmit: (e: React.FormEvent) => Promise<void>;
  summary: string | null;
  handleGetStarted: () => void;
}

export default function Hero() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz' | 'cards' | 'audio'>('chat');

  // Use useCallback for event handlers to prevent unnecessary re-renders
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768); 
  }, []);

  const handleScroll = useCallback(() => {
    const position = window.scrollY;
    const maxScroll = window.innerHeight * 0.8;
    const progress = Math.min(position / maxScroll, 1);
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    // Only add scroll listener on non-mobile devices
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, isMobile]);

  // Memoize gradient styles to prevent recalculation on every render
  const gradientStyle = useMemo(() => {
    if (isMobile) return {};
    return {
      opacity: Math.max(0, 1 - scrollProgress * 1.2),
      transform: `scale(${1 + scrollProgress * 0.1}) translateY(${scrollProgress * -5}%)`,
    };
  }, [isMobile, scrollProgress]);

  // Conditionally use animations only for desktop
  const floatingAnimation = useMemo(() => {
    if (isMobile) return {};
    return {
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
  }, [isMobile]);

  const floatingAnimation2 = useMemo(() => {
    if (isMobile) return {};
    return {
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
  }, [isMobile]);

  const floatingAnimation3 = useMemo(() => {
    if (isMobile) return {};
    return {
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
  }, [isMobile]);

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
      // Format URL if needed
      let formattedUrl = url;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      // Use a simple browser-compatible approach to fetch content
      const corsProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(corsProxy);
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL content');
      }
      
      const htmlContent = await response.text();
      
      // Create a simple DOM parser to extract text
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Remove unwanted elements
      const elementsToRemove = ['script', 'style', 'nav', 'header', 'footer'];
      elementsToRemove.forEach(tag => {
        doc.querySelectorAll(tag).forEach(el => el.remove());
      });
      
      // Extract text content from paragraphs and headings
      const paragraphs = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article'));
      let extractedContent = paragraphs
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 10)
        .join('\n\n');
      
      // If no paragraphs found, try to get content from body
      if (!extractedContent || extractedContent.length < 100) {
        extractedContent = doc.body.textContent || '';
      }
      
      // Generate summary from the extracted content
      const result = await generateDemoSummary(extractedContent);
      
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

  // Demo section component
  const Demo: React.FC<DemoProps> = ({ url, setUrl, isProcessing, handleUrlSubmit, summary, handleGetStarted }) => {
    return (
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
    );
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Base gradient background - simplified for mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-violet-50/30" />

      {/* Animated gradient layers - conditionally rendered */}
      {!isMobile ? (
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-out will-change-transform"
          style={gradientStyle}
        >
          {/* Primary gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-primary/20 to-violet-400/30 animate-gradient-slow blur-[100px]" />
          
          {/* Secondary gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-violet-400/20 to-primary/20 mix-blend-soft-light animate-gradient-slow-reverse blur-[80px]" />
          
          {/* Accent gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-transparent to-primary/20 animate-gradient-slow-delay blur-[120px]" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/30 mix-blend-overlay animate-shimmer blur-[60px]" />
        </div>
      ) : (
        // Simplified background for mobile - reduces GPU usage
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-primary/10 to-violet-400/20 blur-[60px]" />
      )}

      {/* Bottom fade-out blur layer - simplified for mobile */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[50vh] pointer-events-none"
        style={isMobile ? {
          background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 1))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8))',
        } : {
          backdropFilter: `blur(${30 + scrollProgress * 40}px)`,
          WebkitBackdropFilter: `blur(${30 + scrollProgress * 40}px)`,
          background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8))',
          transition: 'all 1000ms ease-out',
        }}
      />

      {/* Floating elements - only render on non-mobile */}
      {!isMobile && (
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
      )}

      {/* Main Content Section */}
      <div className={`min-h-screen flex flex-col ${isMobile ? 'pb-8' : ''}`}>
        <main className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-8">
            <div className={`${isMobile ? '' : 'min-h-[100vh]'} lg:min-h-0 grid lg:grid-cols-2 gap-8 sm:gap-8 lg:gap-12 items-center`}>
              {/* Hero Content */}
              <motion.div
                initial={false}
                animate={isMobile ? { opacity: 1 } : { opacity: 1 }}
                className="relative text-center lg:text-left flex flex-col min-h-screen lg:h-auto overflow-y-auto lg:pt-24"
              >
                {/* Main content wrapper with flex to distribute space */}
                <div className="flex-1 flex flex-col">
                  {/* Center section with main content */}
                  <div className="flex-1 flex flex-col">
                    {/* No Early Access Badge - Removed as requested */}

                    {/* Main content - centered on mobile */}
                    <div className="flex-1 flex flex-col">
                      {/* Heading section positioned in the box area */}
                      <div className="pt-24 mt-6 lg:pt-36 lg:mt-0">
                        <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-8 lg:px-0">
                          <motion.h1 
                            className="text-[2.5rem] sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]"
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <motion.span 
                              className="block mb-2"
                              initial={false}
                              animate={{ opacity: 1 }}
                            >
                              Study Smarter,
                            </motion.span>
                            <motion.span 
                              className={`bg-gradient-to-r from-primary via-violet-500 to-primary text-transparent bg-clip-text bg-[length:200%_auto] animate-gradient`}
                              initial={false}
                              animate={{ opacity: 1 }}
                            >
                              Succeed Faster
                            </motion.span>
                          </motion.h1>
                          <motion.p 
                            className="text-base sm:text-lg lg:text-2xl text-gray-700 mx-auto lg:mx-0 max-w-xl leading-relaxed"
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            Turn <span className="font-semibold text-primary">any learning material</span> into personalized summaries, flashcards, and quizzes in seconds. Perfect for students who struggle to focus.
                          </motion.p>
                        </div>
                      </div>

                      {/* Input types badges - MOVE ABOVE the percent section */}
                      {isMobile && (
                        <div className="mt-4 px-4">
                          <p className="w-full text-center text-xs text-gray-500 mb-1">Works with any content:</p>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {[
                              { icon: FileUp, text: 'PDFs', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                              { icon: Youtube, text: 'Videos', color: 'bg-red-50 text-red-700 border-red-100' },
                              { icon: Newspaper, text: 'Articles', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
                            ].map((item, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${item.color}`}
                              >
                                <item.icon className="w-3 h-3" />
                                <span className="text-[10px] font-medium">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Results Stats - Mobile only */}
                      {isMobile && (
                        <motion.div
                          className="mt-3 px-4 py-4 mx-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-primary">75%</p>
                              <p className="text-xs text-gray-600">Study Time Saved</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-violet-600">94%</p>
                              <p className="text-xs text-gray-600">Retention Improved</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Mobile Demo Preview with tabs */}
                      {isMobile && (
                        <motion.div 
                          className="mt-3 mx-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                        >
                          <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                            <div className="p-2 bg-gradient-to-r from-primary/10 to-violet-500/10 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                              </div>
                              <div className="text-[10px] font-medium text-gray-500">Notelo AI</div>
                            </div>
                            
                            {/* Tabs for different content types */}
                            <div className="flex text-[9px] border-b border-gray-100">
                              {[
                                { id: 'chat', name: 'Chat', icon: MessageSquare, active: activeTab === 'chat' },
                                { id: 'quiz', name: 'Quiz', icon: FileText, active: activeTab === 'quiz' },
                                { id: 'cards', name: 'Cards', icon: BookOpenCheck, active: activeTab === 'cards' },
                                { id: 'audio', name: 'Audio', icon: Podcast, active: activeTab === 'audio' }
                              ].map((tab) => (
                                <div 
                                  key={tab.id}
                                  className={`flex-1 flex items-center justify-center gap-0.5 py-1.5 transition-colors cursor-pointer hover:bg-gray-50
                                    ${tab.active ? 'text-primary font-medium border-b-2 border-primary' : 'text-gray-500'}`}
                                  onClick={() => setActiveTab(tab.id as 'chat' | 'quiz' | 'cards' | 'audio')}
                                >
                                  <tab.icon className="w-2.5 h-2.5" />
                                  {tab.name}
                                </div>
                              ))}
                            </div>
                            
                            {/* Chat Tab Content */}
                            {activeTab === 'chat' && (
                              <div className="p-2">
                                <div className="flex items-start space-x-2 mb-2">
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">N</div>
                                  <div className="bg-gray-100 rounded-lg p-1.5 text-[10px] text-gray-800">
                                    How can I help with your biology chapter?
                                  </div>
                                </div>
                                <div className="flex items-start space-x-2 justify-end">
                                  <div className="bg-primary/10 rounded-lg p-1.5 text-[10px] text-gray-800 max-w-[80%]">
                                    Create a summary for Cell Division
                                  </div>
                                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold flex-shrink-0">U</div>
                                </div>
                                <div className="flex items-start space-x-2 mt-2">
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">N</div>
                                  <div className="bg-gray-100 rounded-lg p-1.5 text-[10px] text-gray-800">
                                    <p className="font-medium mb-0.5">✨ Cell Division Summary</p>
                                    <p className="text-[8px] leading-tight">Cell division creates new cells through mitosis (growth) and meiosis (reproduction). Phases include prophase, metaphase, anaphase, and telophase...</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Quiz Tab Content */}
                            {activeTab === 'quiz' && (
                              <div className="p-2">
                                <div className="text-center mb-2">
                                  <p className="font-medium text-[10px] text-gray-700">Cell Division Quiz</p>
                                </div>
                                <div className="bg-gray-50 p-1.5 rounded-lg mb-2">
                                  <p className="text-[10px] font-medium text-gray-700 mb-1">Which phase of mitosis involves the separation of sister chromatids?</p>
                                  <div className="space-y-1">
                                    {['Prophase', 'Metaphase', 'Anaphase', 'Telophase'].map((option, i) => (
                                      <div key={i} className={`flex items-center p-1 rounded-md text-[9px] ${i === 2 ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600 border border-gray-200'}`}>
                                        <div className={`w-3 h-3 rounded-full mr-1 flex items-center justify-center text-white ${i === 2 ? 'bg-green-600' : 'bg-gray-300'}`}>
                                          {i === 2 ? '✓' : ''}
                                        </div>
                                        {option}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-[9px] text-primary">1 of 5 questions</p>
                                </div>
                              </div>
                            )}

                            {/* Flashcards Tab Content */}
                            {activeTab === 'cards' && (
                              <div className="p-2">
                                <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-gray-200 rounded-lg p-2 shadow-sm">
                                  <div className="text-center mb-1 border-b border-gray-200 pb-1">
                                    <p className="font-medium text-[10px] text-gray-700">Flashcard</p>
                                  </div>
                                  <div className="text-center p-1">
                                    <p className="text-[11px] font-medium text-gray-800">What is the purpose of mitosis?</p>
                                  </div>
                                  <div className="border-t border-dashed border-gray-200 mt-1 pt-1">
                                    <p className="text-[9px] text-gray-600">Mitosis is a process of cell division that results in two identical daughter cells for growth, tissue repair, and asexual reproduction.</p>
                                  </div>
                                </div>
                                <div className="flex justify-between mt-2">
                                  <button className="text-[9px] text-gray-500 bg-gray-100 px-2 py-1 rounded">Previous</button>
                                  <div className="text-[9px] text-gray-500">1 of 10</div>
                                  <button className="text-[9px] text-primary bg-primary/10 px-2 py-1 rounded">Next</button>
                                </div>
                              </div>
                            )}

                            {/* Audio Tab Content */}
                            {activeTab === 'audio' && (
                              <div className="p-2">
                                <div className="text-center mb-2">
                                  <p className="font-medium text-[10px] text-gray-700">Audio Summary</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                                    <Podcast className="w-5 h-5 text-primary" />
                                  </div>
                                  <p className="text-[10px] font-medium text-gray-700">Cell Division Explained</p>
                                  <div className="w-full bg-gray-200 h-1 rounded-full mt-2">
                                    <div className="bg-primary h-1 rounded-full w-1/3"></div>
                                  </div>
                                  <div className="flex items-center justify-between w-full mt-1.5">
                                    <p className="text-[8px] text-gray-500">01:15</p>
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <Pause className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    </div>
                                    <p className="text-[8px] text-gray-500">03:42</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="p-1.5 bg-gray-50 border-t border-gray-100 flex justify-center">
                              <button onClick={handleGetStarted} className="text-[10px] text-primary font-medium">Try it yourself →</button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Social Proof Section - Enhanced for mobile */}
                      <motion.div 
                        className="mt-4 sm:mt-8 space-y-3 sm:space-y-6"
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {/* Mobile-only Output Types */}
                        {isMobile ? (
                          <div className="mt-2 space-y-3">
                            {/* Output Types - Enhanced for conversion */}
                            <div className="grid grid-cols-2 gap-2 px-4">
                              {[
                                { 
                                  icon: FileText, 
                                  text: 'Smart Summaries',
                                  color: 'text-blue-600 bg-blue-50 border-blue-100'
                                },
                                { 
                                  icon: MessageSquare, 
                                  text: 'Practice Quizzes',
                                  color: 'text-violet-600 bg-violet-50 border-violet-100'
                                },
                                { 
                                  icon: BookOpenCheck, 
                                  text: 'Flashcards',
                                  color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                },
                                { 
                                  icon: Podcast, 
                                  text: 'Audio Notes',
                                  color: 'text-orange-600 bg-orange-50 border-orange-100'
                                }
                              ].map((item, i) => (
                                <div
                                  key={i}
                                  className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-white shadow-sm border ${item.color.split(' ')[2]}`}
                                >
                                  <div className={`p-1.5 rounded-lg ${item.color.split(' ').slice(0, 2).join(' ')}`}>
                                    <item.icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-medium text-gray-800">{item.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-6 sm:mt-8 space-y-4 lg:hidden">
                            {/* Original desktop version */}
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
                        )}
                      </motion.div>
                    </div>

                    {/* Bottom-aligned CTA Section - Enhanced for conversion */}
                    <motion.div 
                      className="mt-auto pb-8 pt-4 lg:mt-16"
                      initial={false}
                      animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    >
                      {isMobile && (
                        <div className="px-4 mb-2">
                          <div className="flex items-center justify-center gap-2 p-2 bg-violet-50 border border-violet-100 rounded-lg">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <p className="text-xs text-gray-700"><span className="font-semibold">95% of students</span> report better grades</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Student testimonial */}
                      {isMobile && (
                        <div className="px-4 mb-2">
                          <div className="bg-white rounded-lg border border-gray-100 p-2.5 shadow-sm">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">J</div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">Jake M.</p>
                                <p className="text-[10px] text-gray-500">ADHD Student</p>
                              </div>
                              <div className="ml-auto flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-700 italic">
                              "Notelo has been a game-changer for my studies. I went from struggling to focus to earning straight A's this semester!"
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start px-4">
                        <motion.button 
                          onClick={handleGetStarted}
                          className="w-full sm:w-auto bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 transform hover:scale-105 transition-all duration-300 py-3.5 sm:py-5 px-6 sm:px-8 text-base rounded-xl font-semibold text-white shadow-xl shadow-primary/20 flex items-center justify-center gap-2 relative overflow-hidden"
                          initial={false}
                          animate={isMobile ? 
                            { 
                              scale: [1, 1.05, 1],
                              transition: {
                                scale: {
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  duration: 2
                                }
                              }
                            } : { scale: 1 }}
                        >
                          <span className="relative z-10">Get Started Free</span>
                          <ArrowRight className="w-4 h-4 relative z-10" />
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-primary/30 blur-md animate-pulse"></div>
                        </motion.button>
                      </div>
                      
                      {/* Limited time offer badge - Updated to 40% discount */}
                      {isMobile && (
                        <div className="px-4 mt-2">
                          <div className="w-full bg-amber-50 border border-amber-100 rounded-lg p-1.5 flex items-center justify-center gap-1.5">
                            <div className="relative">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            </div>
                            <p className="text-[10px] font-medium text-amber-800">Limited time offer - 40% off discount</p>
                          </div>
                        </div>
                      )}

                      <motion.div 
                        className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500 text-center lg:text-left px-4 flex flex-col gap-1 items-center lg:items-start"
                        initial={false}
                        animate={{ opacity: 1 }}
                      >
                        <p className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-primary" />
                          <span className="text-[10px]">No credit card required • Free to try</span>
                        </p>
                        {isMobile && (
                          <p className="text-[9px] text-gray-400">Join 10,000+ students already using Notelo</p>
                        )}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Demo Section - Only render when visible */}
              <motion.div 
                id="demo-section" 
                className="hidden lg:block scroll-mt-24"
                initial={false}
                animate={{ opacity: 1, x: 0 }}
              >
                <motion.div
                  className="relative mx-auto lg:mx-0 w-full max-w-xl"
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Suspense fallback={<div className="p-8 bg-white rounded-xl border text-center">Loading demo...</div>}>
                    <Demo 
                      url={url}
                      setUrl={setUrl}
                      isProcessing={isProcessing}
                      handleUrlSubmit={handleUrlSubmit}
                      summary={summary}
                      handleGetStarted={handleGetStarted}
                    />
                  </Suspense>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}