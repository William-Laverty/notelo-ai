import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, Maximize2, Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  isVisible: boolean;
  status: string;
  progress: number;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized: boolean;
}

export default function ProcessingOverlay({ 
  isVisible, 
  status, 
  progress, 
  onMinimize, 
  onMaximize,
  isMinimized 
}: ProcessingOverlayProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        isMinimized ? (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] overflow-hidden"
            style={{ width: 'calc(100% - 2rem)', maxWidth: '600px' }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{status}</p>
                    <motion.div 
                      className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden"
                      layoutId="progress-bar"
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    </motion.div>
                  </div>
                </div>
                <button
                  onClick={onMaximize}
                  className="ml-2 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={onMinimize}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900">Processing Content</h3>
                </div>
                <button
                  onClick={onMinimize}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{status}</p>
              
              <motion.div 
                className="h-2 bg-gray-100 rounded-full overflow-hidden"
                layoutId="progress-bar"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
              </motion.div>
              
              <p className="text-xs text-gray-500 mt-3 italic">
                Tip: You can minimize this window to continue browsing while we process your content.
              </p>
            </motion.div>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
} 