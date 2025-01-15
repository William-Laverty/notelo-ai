import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BookOpen, Brain, Link as LinkIcon, Sparkles, ArrowRight, Clock, Zap, MessageSquare, FileText, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateSummary } from '../lib/ai-service';
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

  const truncateToWords = (text: string, wordLimit: number) => {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    
    // Find the last complete sentence within the word limit
    const truncated = words.slice(0, wordLimit).join(' ');
    const lastPeriodIndex = truncated.lastIndexOf('.');
    
    if (lastPeriodIndex > truncated.length * 0.7) {
      // If we found a period in the latter part of the truncated text, cut there
      return truncated.slice(0, lastPeriodIndex + 1);
    }
    
    // Otherwise return the word-limited text with ellipsis
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
      const result = await generateSummary(url);
      // Remove all formatting and clean up the text
      const cleanResult = result
        .replace(/[#*`]|:\w+:|^Overview|^Title|^Summary/gmi, '')
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
    <div className="bg-gradient-to-b from-background to-gray-50 py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Learn Smarter, <span className="bg-gradient-to-r from-primary to-violet-500 text-transparent bg-clip-text">Not Harder</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              Transform any article into concise, actionable study material in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleGetStarted}
                className="btn-primary bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 transform hover:scale-105 transition-all duration-300"
              >
                Get Started for Free
              </button>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-white p-8">
                <AnimatePresence mode="wait">
                  {!summary ? (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-violet-500 text-transparent bg-clip-text">
                          Try Our Demo
                        </span>
                      </h2>
                      <form onSubmit={handleUrlSubmit} className="mb-8">
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                            <LinkIcon className="text-gray-400 group-hover:text-primary transition-colors" />
                            <div className="h-4 w-px bg-gray-200"></div>
                          </div>
                          <input
                            type="url"
                            placeholder="Enter any article URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full pl-16 pr-4 py-3.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                            disabled={isProcessing}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full mt-4 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-white font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary/20"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Summary
                            </>
                          )}
                        </button>
                      </form>

                      <div className="grid grid-cols-3 gap-4">
                        <motion.div 
                          className="flex items-center gap-3"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="text-primary w-5 h-5" />
                          </div>
                          <span className="text-sm text-text-secondary">Smart Summaries</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-3"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2 rounded-lg bg-violet-500/10">
                            <Brain className="text-violet-500 w-5 h-5" />
                          </div>
                          <span className="text-sm text-text-secondary">AI-Powered</span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-3"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Sparkles className="text-blue-500 w-5 h-5" />
                          </div>
                          <span className="text-sm text-text-secondary">Instant Results</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative"
                    >
                      <div className="bg-white rounded-xl p-8">
                        <div className="space-y-8">
                          <div className="text-gray-600 leading-relaxed">
                            {summary}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="text-primary w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">Full Summary</h3>
                                <p className="text-sm text-gray-500">Access the complete AI-generated summary</p>
                              </div>
                            </motion.div>

                            <motion.div 
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="p-2 rounded-lg bg-violet-500/10">
                                <MessageSquare className="text-violet-500 w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">Interactive Quizzes</h3>
                                <p className="text-sm text-gray-500">Test your understanding with AI quizzes</p>
                              </div>
                            </motion.div>

                            <motion.div 
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <div className="p-2 rounded-lg bg-blue-500/10">
                                <PenTool className="text-blue-500 w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">Study Notes</h3>
                                <p className="text-sm text-gray-500">Generate detailed study materials</p>
                              </div>
                            </motion.div>

                            <motion.div 
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <div className="p-2 rounded-lg bg-green-500/10">
                                <Zap className="text-green-500 w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">Unlimited Access</h3>
                                <p className="text-sm text-gray-500">Process as many articles as you need</p>
                              </div>
                            </motion.div>
                          </div>
                          
                          <div className="flex flex-col items-center text-center space-y-4 pt-4">
                            <motion.button
                              onClick={handleGetStarted}
                              className="group relative inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 rounded-lg transition-all duration-300 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                            >
                              <span className="relative flex items-center gap-2">
                                Unlock Full Access
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                              </span>
                            </motion.button>
                            
                            <motion.p 
                              className="text-sm text-gray-500"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              Start free, upgrade anytime
                            </motion.p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSummary(null);
                          setUrl('');
                        }}
                        className="mt-6 text-gray-500 hover:text-primary transition-colors flex items-center gap-2 text-sm"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Try another URL
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}