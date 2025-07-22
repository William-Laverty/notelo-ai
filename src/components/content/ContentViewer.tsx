import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Hash, FileText, BarChart2, Book, Share2, Headphones, Brain, Sparkles, Timer, Layers } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase-client';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import QuizView from '../quiz/QuizView';
import FlashcardView from '../flashcards/FlashcardView';
import { generateQuiz, generateFlashcards, type Flashcard } from '../../lib/ai-service';
import UpgradeDialog from '../upgrade/UpgradeDialog';

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
  quiz_questions?: QuizQuestion[];
  flashcards?: Flashcard[];
}

const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

const calculateStats = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length - 1;
  const paragraphs = text.split(/\n\s*\n/).length;
  const avgWordsPerSentence = Math.round(words / (sentences || 1));
  
  return {
    words,
    sentences,
    paragraphs,
    avgWordsPerSentence,
    readingTime: calculateReadingTime(text),
    characters: text.length
  };
};

const calculateTimeSaved = (originalText: string, summaryText: string): number => {
  const originalReadingTime = calculateReadingTime(originalText);
  const summaryReadingTime = calculateReadingTime(summaryText);
  const timeSaved = Math.max(0, originalReadingTime - summaryReadingTime);
  // Ensure a minimum of 2 minutes saved
  return Math.max(2, timeSaved);
};

export default function ContentViewer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'podcast' | 'flashcards'>('summary');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Document not found');
        
        setDocument(data);
      } catch (error: any) {
        console.error('Error fetching document:', error);
        toast.error('Failed to load document');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleGenerateQuiz = async () => {
    if (!document) return;
    
    try {
      setIsGeneratingQuiz(true);
      const text = document.summary || document.text_content;
      const quizQuestions = await generateQuiz(text);
      
      // Try to update the document with quiz questions
      const { error } = await supabase
        .from('documents')
        .update({ quiz_questions: quizQuestions })
        .eq('id', document.id);

      if (error) {
        // If the error is about the missing column, just update the local state
        if (error.code === 'PGRST204') {
          setDocument(prev => prev ? { ...prev, quiz_questions: quizQuestions } : null);
          toast.success('Quiz generated successfully! (Note: Quiz will not persist between sessions)');
          return;
        }
        throw error;
      }

      // Update local state
      setDocument(prev => prev ? { ...prev, quiz_questions: quizQuestions } : null);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!document) return;
    
    try {
      setIsGeneratingFlashcards(true);
      const text = document.summary || document.text_content;
      const flashcards = await generateFlashcards(text);
      
      // Try to update the document with flashcards
      const { error } = await supabase
        .from('documents')
        .update({ flashcards })
        .eq('id', document.id);

      if (error) {
        // If the error is about the missing column, just update the local state
        if (error.code === 'PGRST204') {
          setDocument(prev => prev ? { ...prev, flashcards } : null);
          toast.success('Flashcards generated successfully! (Note: Flashcards will not persist between sessions)');
          return;
        }
        throw error;
      }

      // Update local state
      setDocument(prev => prev ? { ...prev, flashcards } : null);
      toast.success('Flashcards generated successfully!');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleTabClick = (tab: 'summary' | 'quiz' | 'podcast' | 'flashcards') => {
    // Allow summary tab for all users
    if (tab === 'summary') {
      setActiveTab(tab);
      return;
    }

    // Check if user has pro access
    if (!profile?.subscription_status || profile?.subscription_status !== 'active') {
      setIsUpgradeDialogOpen(true);
      return;
    }

    setActiveTab(tab);
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return document?.summary ? (
          <motion.div 
            key="summary"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="prose max-w-none text-gray-600">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
                  li: ({ children }) => <li className="mb-2">{children}</li>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-md font-medium mb-2">{children}</h3>,
                }}
              >
                {document.summary}
              </ReactMarkdown>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-summary"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No summary available</h3>
            <p className="text-gray-500">The summary for this document is being generated.</p>
          </motion.div>
        );

      case 'quiz':
        if (!document?.summary) return null;
        return (
          <motion.div
            key="quiz"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Test Your Understanding</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm">
              {!document.quiz_questions ? (
                <div className="p-12 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to test your knowledge?</h3>
                  <p className="text-gray-500 mb-6">Generate a quiz to reinforce your learning.</p>
                  <button 
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Generate Quiz
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <QuizView 
                  questions={document.quiz_questions} 
                  onRetry={handleGenerateQuiz}
                />
              )}
            </div>
          </motion.div>
        );

      case 'podcast':
        return (
          <motion.div
            key="podcast"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon!</h3>
            <p className="text-gray-500">
              We're working on an exciting feature to convert your documents into podcasts.
              <br />Stay tuned for updates!
            </p>
          </motion.div>
        );

      case 'flashcards':
        if (!document?.summary) return null;
        return (
          <motion.div
            key="flashcards"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Study with Flashcards</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm">
              {!document.flashcards ? (
                <div className="p-12 text-center">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to study with flashcards?</h3>
                  <p className="text-gray-500 mb-6">Generate flashcards to help you memorize key concepts.</p>
                  <button 
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {isGeneratingFlashcards ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Generating Flashcards...
                      </>
                    ) : (
                      <>
                        <Layers className="w-5 h-5" />
                        Generate Flashcards
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <FlashcardView 
                  flashcards={document.flashcards} 
                  onRetry={handleGenerateFlashcards}
                />
              )}
            </div>
          </motion.div>
        );
    }
  };

  if (loading || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = document.summary ? calculateStats(document.summary) : calculateStats(document.text_content);
  const timeSaved = document.summary ? calculateTimeSaved(document.text_content, document.summary) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Document Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{document.title}</h1>
          
          {/* Time Saved Banner */}
          {document.summary && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Time Saved with Notelo</h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-green-600"
                  >
                    You saved <span className="font-bold">{timeSaved} minutes</span> by reading this summary instead of the full content
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reading Time</p>
                <p className="font-semibold text-gray-900">{stats.readingTime} min</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Book className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Words</p>
                <p className="font-semibold text-gray-900">{stats.words.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Characters</p>
                <p className="font-semibold text-gray-900">{stats.characters.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paragraphs</p>
                <p className="font-semibold text-gray-900">{stats.paragraphs}</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Words/Sentence</p>
                <p className="font-semibold text-gray-900">{stats.avgWordsPerSentence}</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-semibold text-gray-900">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {(['summary', 'quiz', 'flashcards', 'podcast'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab === 'summary' && <FileText className="w-4 h-4" />}
                {tab === 'quiz' && <Brain className="w-4 h-4" />}
                {tab === 'flashcards' && <Layers className="w-4 h-4" />}
                {tab === 'podcast' && <Headphones className="w-4 h-4" />}
                <span className="capitalize">{tab}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>

        {/* Upgrade Dialog */}
        <UpgradeDialog 
          isOpen={isUpgradeDialogOpen} 
          onClose={() => setIsUpgradeDialogOpen(false)} 
        />
      </main>
    </div>
  );
} 