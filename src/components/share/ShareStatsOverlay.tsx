import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, Facebook, Linkedin, Instagram, Download, Share2, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';

interface TimeMetrics {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
}

interface ShareStatsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  timeMetrics: TimeMetrics;
  documentsCount: number;
  averageTimeSaved: number;
  efficiencyScore: number;
}

export default function ShareStatsOverlay({
  isOpen,
  onClose,
  timeMetrics,
  documentsCount,
  averageTimeSaved,
  efficiencyScore
}: ShareStatsOverlayProps) {
  const statsPreviewRef = useRef<HTMLDivElement>(null);

  const generateShareText = () => {
    let text = `🚀 My Notelo Stats:\n\n`;
    text += `📚 ${documentsCount} documents summarized\n`;
    text += `⏱️ ${timeMetrics.hours}h ${timeMetrics.minutes}m saved\n`;
    text += `⚡ ${efficiencyScore.toFixed(2)}x faster reading\n\n`;
    text += `Try Notelo today! #ProductivityBoost #AI`;
    return text;
  };

  const handleShare = (platform: string) => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent('https://notelo-ai.com'); 

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${encodeURIComponent('My Notelo Stats')}&summary=${text}`,
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateShareText());
    toast.success('Stats copied to clipboard!');
  };

  const downloadImage = async () => {
    if (!statsPreviewRef.current) return;

    try {
      // Show loading toast
      const loadingToast = toast.loading('Generating image...');

      // Configure html2canvas
      const canvas = await html2canvas(statsPreviewRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png', 1.0);
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'notelo-stats.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success toast
      toast.success('Image downloaded successfully!', {
        id: loadingToast
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Share Your Stats</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="p-6 bg-gradient-to-br from-primary/5 to-violet-50">
              <div 
                ref={statsPreviewRef}
                className="bg-white rounded-xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Notelo Journey</h3>
                    <p className="text-sm text-gray-600">Share your productivity gains</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Time Saved</p>
                    <p className="text-lg font-bold text-gray-900">
                      {timeMetrics.hours}h {timeMetrics.minutes}m
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Documents</p>
                    <p className="text-lg font-bold text-gray-900">{documentsCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Average Time</p>
                    <p className="text-lg font-bold text-gray-900">{averageTimeSaved} min</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Efficiency</p>
                    <p className="text-lg font-bold text-gray-900">{efficiencyScore.toFixed(2)}x</p>
                  </div>
                </div>
                <div className="pt-4 text-center">
                  <p className="text-sm text-gray-500">Generated with Notelo AI</p>
                  <p className="text-xs text-gray-400">notelo-ai.com</p>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span className="font-medium">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2]/20 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="font-medium">LinkedIn</span>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  <span className="font-medium">Copy Text</span>
                </button>
                <button
                  onClick={downloadImage}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Download Image</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 