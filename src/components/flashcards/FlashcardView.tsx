import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw, Brain, Sparkles } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardViewProps {
  flashcards: Flashcard[];
  onRetry?: () => void;
}

export default function FlashcardView({ flashcards, onRetry }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 200);
    } else {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
      }, 200);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    onRetry?.();
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFlipped]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Flashcard {currentIndex + 1} of {flashcards.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {flashcards.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: index === currentIndex ? 1.2 : 1,
                    opacity: 1 
                  }}
                  className={`w-2 h-2 rounded-full border border-white transition-colors duration-300 ${
                    index === currentIndex
                      ? 'bg-blue-600 w-3'
                      : index < currentIndex
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-blue-600 min-w-[3rem] text-right">
              {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
            </span>
          </div>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="relative h-80 px-12">
        {/* Left Navigation Button */}
        <motion.button
          whileHover={{ scale: 1.1, x: -4 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
            currentIndex === 0
              ? 'opacity-0 cursor-not-allowed'
              : 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg hover:shadow-xl hover:text-blue-600 border border-gray-100'
          }`}
        >
          <ChevronLeft className="w-7 h-7" />
        </motion.button>

        {/* Right Navigation Button */}
        <motion.button
          whileHover={{ scale: 1.1, x: 4 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1 && !isFlipped}
          className={`absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
            currentIndex === flashcards.length - 1 && !isFlipped
              ? 'opacity-0 cursor-not-allowed'
              : 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg hover:shadow-xl hover:text-blue-600 border border-gray-100'
          }`}
        >
          <ChevronRight className="w-7 h-7" />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full perspective-1000 cursor-pointer"
            onClick={handleFlip}
          >
            <motion.div
              className="relative w-full h-full transition-all duration-500 transform-style-3d"
              initial={false}
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front (Question) */}
              <div 
                className="absolute w-full h-full backface-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden"
                }}
              >
                <div className="w-full h-full bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-sm font-medium text-blue-600 mb-4"
                  >
                    Question {currentIndex + 1}
                  </motion.div>
                  <motion.p 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-medium text-gray-900 text-center"
                  >
                    {flashcards[currentIndex].front}
                  </motion.p>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-4 text-sm text-gray-400 flex items-center gap-2"
                  >
                    <span>Click to see answer</span>
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      👆
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Back (Answer) */}
              <div 
                className="absolute w-full h-full"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateX(180deg)"
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-100 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-sm font-medium text-blue-600 mb-4"
                  >
                    Answer
                  </motion.div>
                  <motion.p 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-medium text-gray-800 text-center"
                  >
                    {flashcards[currentIndex].back}
                  </motion.p>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-4 text-sm text-gray-400 flex items-center gap-2"
                  >
                    <span>Click to see question</span>
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      👆
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Retry Button */}
      {currentIndex === flashcards.length - 1 && isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium shadow-lg shadow-blue-100 hover:shadow-xl transition-shadow"
          >
            <RotateCw className="w-5 h-5" />
            Start Over
          </motion.button>
        </motion.div>
      )}

      {/* Confetti Effect */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 1,
                repeat: 2,
              }}
            >
              <Sparkles className="w-16 h-16 text-blue-500" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 