import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase-client';
import { generateSummary, generateQuiz, generateTitle, generateCardDescription } from '../../lib/ai-service';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogOut, Search, Upload, FileText, Youtube, Link as LinkIcon, Clock, Calendar, Hash, MoreVertical, ChevronRight, User, Trash2, Timer, TrendingUp, Zap, Target, Award, Sparkles, Book, Share2 } from 'lucide-react';
import ContentViewer from '../content/ContentViewer';
import ProcessingOverlay from '../loading/ProcessingOverlay';
import URLInputDialog from '../url/URLInputDialog';
import ShareStatsOverlay from '../share/ShareStatsOverlay';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Document {
  id: string;
  title: string;
  text_content: string;
  summary?: string;
  created_at: string;
  content_type: 'text' | 'url' | 'youtube';
  user_id: string;
  quiz_questions?: QuizQuestion[];
}

const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

const calculateTimeSaved = (originalText: string, summaryText: string): number => {
  const originalReadingTime = calculateReadingTime(originalText);
  const summaryReadingTime = calculateReadingTime(summaryText);
  return Math.max(0, originalReadingTime - summaryReadingTime);
};

const calculateEfficiencyScore = (originalText: string, summaryText: string): number => {
  const originalWords = originalText.trim().split(/\s+/).length;
  const summaryWords = summaryText.trim().split(/\s+/).length;
  return Math.round((originalWords / (summaryWords || 1)) * 100) / 100;
};

// Helper function to generate quiz questions
const generateQuizQuestions = async (content: string): Promise<QuizQuestion[]> => {
  // This is a placeholder - implement actual quiz generation logic
  return [];
};

const extractMainContent = (doc: HTMLDocument): string => {
  // Try to find the main content in order of preference
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '#content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.post',
    '.article',
    '.blog-post',
  ];

  // Try each selector
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      // Remove unwanted elements from the content
      element.querySelectorAll('script, style, nav, header, footer, iframe, noscript, .ad, .advertisement, .social-share, .comments').forEach((el: Element) => el.remove());
      
      const text = element.textContent?.trim() || '';
      if (text.length >= 100) {
        return text;
      }
    }
  }

  // If no suitable content found with selectors, try paragraphs
  const paragraphs = Array.from(doc.querySelectorAll('p'));
  const contentParagraphs = paragraphs.filter((p: Element) => {
    const text = p.textContent?.trim() || '';
    return text.length >= 40 && !p.closest('nav, header, footer');
  });

  if (contentParagraphs.length > 0) {
    return contentParagraphs.map((p: Element) => p.textContent?.trim()).join('\n\n');
  }

  // If still no content, try the body as last resort
  const bodyText = doc.body.textContent?.trim() || '';
  if (bodyText.length >= 200) {
    return bodyText;
  }

  throw new Error('No meaningful content found. This might not be an article page, or the content might be dynamically loaded.');
};

// Add helper function for time calculations
const formatTimeMetrics = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  
  return {
    minutes: Math.floor(totalMinutes % 60),
    hours: Math.floor(hours % 24),
    days: Math.floor(days % 7),
    weeks
  };
};

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingMinimized, setIsProcessingMinimized] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isShareOverlayOpen, setIsShareOverlayOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setDocuments(data as Document[]);
      }
    } catch (error: any) {
      toast.error('Failed to fetch documents');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error: any) {
      toast.error('Failed to log out');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const toastId = toast.loading('Processing your document...');

    try {
      const reader = new FileReader();
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Error reading file: ' + error.toString(), { id: toastId });
        setIsProcessing(false);
      };

      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          if (!text || text.trim().length === 0) {
            throw new Error('File is empty');
          }
          console.log('File content length:', text.length);
          await processContent(text, file.name, 'text' as const);
        } catch (error: any) {
          console.error('Error processing file content:', error);
          toast.error(`Error processing file: ${error.message}`, { id: toastId });
          setIsProcessing(false);
        }
      };

      reader.readAsText(file);
    } catch (error: any) {
      console.error('Error in handleFileUpload:', error);
      toast.error(`Failed to process document: ${error.message}`, { id: toastId });
      setIsProcessing(false);
    }
  };

  const handleUrlButtonClick = () => {
    setIsUrlDialogOpen(true);
  };

  const handleUrlSubmit = async (url: string) => {
    if (!url) return;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Fetching webpage content...');
    setProcessingProgress(10);

    try {
      let html = '';
      let error: Error | null = null;
      let proxyAttempt = 1;
      const maxAttempts = 3;

      const proxyUrls = [
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
      ];

      for (const proxyUrl of proxyUrls) {
        try {
          setProcessingStatus(`Attempting to fetch content (try ${proxyAttempt}/${maxAttempts})...`);
          const response = await fetch(proxyUrl(url), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          html = await response.text();
          
          // More precise error page detection
          const errorIndicators = [
            'CLOUDFLARE_ERROR_1000S_BOX',
            '404 - Page Not Found',
            'Access to this page has been denied',
            'Please complete the security check to access',
            'Please verify you are a human',
            'captcha',
            'robot verification'
          ];

          const hasErrorIndicators = errorIndicators.some(indicator => 
            html.toLowerCase().includes(indicator.toLowerCase())
          );

          // Only consider it an error page if it has error indicators AND is short
          if (hasErrorIndicators && html.length < 1000) {
            throw new Error('Invalid content received: Error page detected');
          }

          // Check for minimum content length
          if (html.length < 100) {
            throw new Error('Invalid content: Page is too short');
          }
          
          error = null;
          break;
        } catch (e) {
          if (e instanceof Error) {
            error = e;
          } else {
            error = new Error('An unknown error occurred');
          }
          proxyAttempt++;
          if (proxyAttempt <= maxAttempts) {
            setProcessingStatus('Retrying with different proxy...');
            continue;
          }
        }
      }

      if (!html) {
        throw error || new Error('Failed to fetch webpage content. The website might be blocking access.');
      }

      setProcessingStatus('Extracting content...');
      setProcessingProgress(30);
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract content
      const text = extractMainContent(doc);
      
      // More thorough content validation
      if (!text || text.length < 200) {  // Increased minimum length
        throw new Error('Could not find meaningful content. The page might be empty or require authentication.');
      }

      // Additional validation for extracted content
      const contentWords = text.split(/\s+/).length;
      if (contentWords < 50) {  // Ensure we have enough words
        throw new Error('The extracted content is too short to be meaningful. Try a different URL.');
      }
      
      // Clean up the text
      const cleanedText = text
        .replace(/\s+/g, ' ')
        .replace(/\b(Accept|Cookie|Menu|Navigation|Search|Skip to content)\b/gi, '')
        .trim();

      // Get page title with fallbacks
      let title = doc.querySelector('title')?.textContent?.trim() ||
                  doc.querySelector('h1')?.textContent?.trim() ||
                  doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
                  new URL(url).hostname;

      // Clean up title
      title = title
        .replace(/\s*\|\s*.*$/, '')  // Remove site name after |
        .replace(/\s*-\s*.*$/, '')   // Remove site name after -
        .trim();

      setProcessingStatus('Processing content...');
      setProcessingProgress(50);

      await processContent(cleanedText, title, 'url' as const);
      toast.success('URL processed successfully');
    } catch (error: any) {
      console.error('Error processing URL:', error);
      let errorMessage = error.message;
      
      // Make error messages more user-friendly
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Unable to access the webpage. The site might be blocking access or require authentication.';
      } else if (errorMessage.includes('No meaningful content found')) {
        errorMessage = 'Could not find article content. Try using a direct link to an article page.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStatus('');
    }
  };

  const processContent = async (
    content: string,
    originalTitle: string,
    content_type: 'text' | 'url' | 'youtube'
  ) => {
    try {
      // Create document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert([
          {
            title: originalTitle,
            text_content: content,
            content_type: content_type,
            user_id: user?.id,
          }
        ])
        .select()
        .single();

      if (docError) throw docError;
      if (!document) throw new Error('No document returned from insert');

      // Update documents list
      setDocuments(prev => [document, ...(prev || [])]);
      
      // Generate summary
      setProcessingStatus('Generating summary...');
      setProcessingProgress(50);
      
      const summary = await generateSummary(content);
      
      // Update document with summary
      const { error: summaryError } = await supabase
        .from('documents')
        .update({ summary })
        .eq('id', document.id);

      if (summaryError) throw summaryError;

      // Update local state
      setDocuments(prev => prev?.map(doc => 
        doc.id === document.id ? { ...doc, summary } : doc
      ));

      setProcessingProgress(100);
      setProcessingStatus('Processing complete!');

      // Select the new document
      setSelectedDocument(document);
      
    } catch (error: any) {
      console.error('Error processing document:', error);
      toast.error(`Failed to process document: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStatus('');
    }
  };

  const handleGenerateQuiz = async (doc: Document) => {
    const toastId = toast.loading('Generating quiz...');
    try {
      const text = doc.summary || doc.text_content;
      if (!text) throw new Error('No content available');
      
      const quizQuestions = await generateQuiz(text);
      const { error } = await supabase
        .from('documents')
        .update({ quiz_questions: quizQuestions })
        .eq('id', doc.id);
      
      if (error) throw error;
      
      toast.success('Quiz generated successfully', { id: toastId });
      fetchDocuments();
      setSelectedDocument({ ...doc, quiz_questions: quizQuestions });
    } catch (error: any) {
      toast.error(`Failed to generate quiz: ${error.message}`, { id: toastId });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      toast.success('Document deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) as Document[];

  // Calculate time metrics
  const totalTimeSaved = documents.reduce((total, doc) => {
    if (doc.summary) {
      return total + calculateTimeSaved(doc.text_content, doc.summary);
    }
    return total;
  }, 0);

  const timeMetrics = formatTimeMetrics(totalTimeSaved);
  const documentsWithSummary = documents.filter(doc => doc.summary).length;
  const averageTimeSaved = documentsWithSummary > 0 
    ? Math.round(totalTimeSaved / documentsWithSummary) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ProcessingOverlay 
        isVisible={isProcessing}
        status={processingStatus}
        progress={processingProgress}
        isMinimized={isProcessingMinimized}
        onMinimize={() => setIsProcessingMinimized(true)}
        onMaximize={() => setIsProcessingMinimized(false)}
      />
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Brand */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Notelo
              </span>
            </motion.div>

            {/* Enhanced Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 max-w-2xl mx-8"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search your documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-gray-50 focus:bg-white"
                />
              </div>
            </motion.div>

            {/* Navigation Items */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <Link
                to="/account"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Account</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign out</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Time Saved Section */}
        {totalTimeSaved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-emerald-50 rounded-xl p-6 border border-primary/10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Main Time Saved Display */}
                <div className="flex items-center gap-4 flex-1">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20"
                  >
                    <Timer className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-gray-900 mb-1"
                    >
                      Time Saved with Notelo
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-600"
                    >
                      Your productivity boost through AI-powered summaries
                    </motion.p>
                  </div>
                </div>

                {/* Share Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="btn-secondary flex items-center gap-2 text-sm"
                  onClick={() => setIsShareOverlayOpen(true)}
                >
                  Share My Stats
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Time Metrics Grid */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Time */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Timer className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Total Time</span>
                  </div>
                  <div className="space-y-1">
                    {timeMetrics.weeks > 0 && (
                      <p className="text-sm text-gray-600">{timeMetrics.weeks} weeks</p>
                    )}
                    {timeMetrics.days > 0 && (
                      <p className="text-sm text-gray-600">{timeMetrics.days} days</p>
                    )}
                    <p className="text-lg font-bold text-gray-900">
                      {timeMetrics.hours}h {timeMetrics.minutes}m
                    </p>
                    <p className="text-sm text-gray-600">saved using Notelo</p>
                  </div>
                </motion.div>

                {/* Documents Summarized */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Summarized</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{documentsWithSummary} docs</p>
                  <p className="text-sm text-gray-600">processed by Notelo</p>
                </motion.div>

                {/* Average Time Saved */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Average</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{averageTimeSaved} min</p>
                  <p className="text-sm text-gray-600">per document</p>
                </motion.div>

                {/* Efficiency Score */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Efficiency</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {documents.filter(doc => doc.summary).reduce((acc, doc) => 
                      acc + calculateEfficiencyScore(doc.text_content, doc.summary || ''), 
                      0) / (documents.filter(doc => doc.summary).length || 1)}x
                  </p>
                  <p className="text-sm text-gray-600">compression ratio</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Add New Content</h2>
              <p className="text-gray-600">Upload a file or add content from a URL</p>
            </div>
            <div className="flex gap-4">
              <label className={`btn-primary flex items-center gap-2 px-6 py-3 rounded-xl ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="h-5 w-5" />
                <span className="font-medium">Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md,.pdf"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleUrlButtonClick}
                disabled={isProcessing}
                className={`btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <LinkIcon className="h-5 w-5" />
                <span className="font-medium">Add URL</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* URL Input Dialog */}
        <URLInputDialog
          isOpen={isUrlDialogOpen}
          onClose={() => setIsUrlDialogOpen(false)}
          onSubmit={(url) => {
            setIsUrlDialogOpen(false);
            handleUrlSubmit(url);
          }}
          isProcessing={isProcessing}
        />

        {/* Processing Overlay */}
        <ProcessingOverlay
          isVisible={isProcessing}
          status={processingStatus}
          progress={processingProgress}
          onMinimize={() => setIsProcessingMinimized(true)}
          onMaximize={() => setIsProcessingMinimized(false)}
          isMinimized={isProcessingMinimized}
        />

        {/* Enhanced Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDocuments.map((doc: Document, index: number) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-primary/20"
                onClick={(e) => {
                  if (!e.defaultPrevented) {
                    navigate(`/document/${doc.id}`);
                  }
                }}
              >
                <div className="p-6">
                  {/* Document Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: doc.content_type === 'url' 
                            ? 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' 
                            : doc.content_type === 'youtube'
                            ? 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)'
                            : 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)'
                        }}
                      >
                        {doc.content_type === 'url' ? (
                          <LinkIcon className="w-6 h-6 text-white" />
                        ) : doc.content_type === 'youtube' ? (
                          <Youtube className="w-6 h-6 text-white" />
                        ) : (
                          <FileText className="w-6 h-6 text-white" />
                        )}
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Menu Button */}
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === doc.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteDocument(doc.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Document
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="space-y-4">
                    {doc.summary && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          AI Summary
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {doc.summary?.replace(/# 🎯 Overview[\s\n]*/g, '')}
                        </p>
                      </motion.div>
                    )}

                    {/* Document Stats */}
                    <div className="pt-4 border-t grid grid-cols-2 gap-4">
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reading Time</p>
                          <p className="text-sm font-medium text-gray-700">
                            {doc.summary ? calculateReadingTime(doc.summary) : calculateReadingTime(doc.text_content)} min
                          </p>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Book className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Words</p>
                          <p className="text-sm font-medium text-gray-700">
                            {doc.summary ? 
                              doc.summary.trim().split(/\s+/).length.toLocaleString() : 
                              doc.text_content.trim().split(/\s+/).length.toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* View Button */}
                    <motion.div 
                      className="pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.6 }}
                    >
                      <button 
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 text-primary hover:bg-primary/5 transition-colors group"
                      >
                        <span className="font-medium">View Document</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Enhanced Empty State */}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "No documents match your search. Try a different query."
                : "Upload a file or add a URL to get started with Notelo."}
            </p>
            <div className="flex items-center justify-center gap-4">
              <label className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl">
                <Upload className="h-5 w-5" />
                <span className="font-medium">Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleUrlButtonClick}
                className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-xl"
              >
                <LinkIcon className="h-5 w-5" />
                <span className="font-medium">Add URL</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>

      <ShareStatsOverlay
        isOpen={isShareOverlayOpen}
        onClose={() => setIsShareOverlayOpen(false)}
        timeMetrics={timeMetrics}
        documentsCount={documentsWithSummary}
        averageTimeSaved={averageTimeSaved}
        efficiencyScore={
          documents.filter(doc => doc.summary).reduce((acc, doc) => 
            acc + calculateEfficiencyScore(doc.text_content, doc.summary || ''), 
            0) / (documents.filter(doc => doc.summary).length || 1)
        }
      />
    </div>
  );
}
