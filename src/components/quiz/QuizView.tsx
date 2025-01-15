import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Trophy, Brain, ChevronRight, Star, Target, Zap } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizViewProps {
  questions: QuizQuestion[];
  onRetry?: () => void;
}

export default function QuizView({ questions, onRetry }: QuizViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastSelectedAnswer, setLastSelectedAnswer] = useState<number | null>(null);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;

    setLastSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Delay moving to next question to show feedback
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setLastSelectedAnswer(null);
      }
    }, 1000);
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setShowFeedback(false);
    setLastSelectedAnswer(null);
    onRetry?.();
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const feedback = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!';
    const feedbackIcon = percentage >= 80 ? Star : percentage >= 60 ? Target : Brain;
    const FeedbackIcon = feedbackIcon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Results Header */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4"
          >
            <FeedbackIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-center mb-2">{feedback}</h2>
          <p className="text-center text-white/80">You scored {score} out of {questions.length}</p>
        </div>

        {/* Score Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Score</span>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-violet-600"
            >
              {percentage}%
            </motion.span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedAnswers[index] === question.correctAnswer
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {selectedAnswers[index] === question.correctAnswer ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </div>
                <p className="font-medium text-gray-900">{question.question}</p>
              </div>
              <div className="space-y-2 ml-11">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg text-sm ${
                      optionIndex === question.correctAnswer
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : selectedAnswers[index] === optionIndex
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Retry Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRetry}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg shadow-purple-200 flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Progress Bar and Question Counter */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            <span className="font-medium">Question {currentQuestion + 1} of {questions.length}</span>
          </div>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question and Options */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-medium text-gray-900">
              {questions[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`relative w-full p-4 rounded-xl text-left transition-all ${
                    showFeedback
                      ? index === questions[currentQuestion].correctAnswer
                        ? 'bg-green-50 text-green-700 border-2 border-green-500'
                        : index === lastSelectedAnswer
                        ? 'bg-red-50 text-red-700 border-2 border-red-500'
                        : 'bg-gray-50 text-gray-500'
                      : selectedAnswers[currentQuestion] === index
                      ? 'bg-violet-50 text-violet-700 border-2 border-violet-500'
                      : 'bg-gray-50 hover:bg-violet-50 text-gray-700 hover:text-violet-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      showFeedback
                        ? index === questions[currentQuestion].correctAnswer
                          ? 'bg-green-100'
                          : index === lastSelectedAnswer
                          ? 'bg-red-100'
                          : 'bg-gray-200'
                        : selectedAnswers[currentQuestion] === index
                        ? 'bg-violet-100'
                        : 'bg-gray-200'
                    }`}>
                      {showFeedback ? (
                        index === questions[currentQuestion].correctAnswer ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : index === lastSelectedAnswer ? (
                          <X className="w-5 h-5 text-red-600" />
                        ) : (
                          <span className="text-gray-600">{String.fromCharCode(65 + index)}</span>
                        )
                      ) : (
                        <span className={selectedAnswers[currentQuestion] === index ? 'text-violet-600' : 'text-gray-600'}>
                          {String.fromCharCode(65 + index)}
                        </span>
                      )}
                    </div>
                    {option}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Show Results Button */}
      {currentQuestion === questions.length - 1 && selectedAnswers[currentQuestion] !== undefined && !showFeedback && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gray-50 border-t border-gray-100"
        >
          <button
            onClick={handleShowResults}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg shadow-purple-200 flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
          >
            <Trophy className="w-5 h-5" />
            Show Results
          </button>
        </motion.div>
      )}
    </motion.div>
  );
} 