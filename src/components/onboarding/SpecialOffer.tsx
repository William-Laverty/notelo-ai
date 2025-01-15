import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../context/AuthContext';
import { createCheckoutSession } from '../../api/stripe';
import { toast } from 'react-hot-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SpecialOfferProps {
  timeSaved: number;
  onContinueFree: () => void;
}

export default function SpecialOffer({ timeSaved, onContinueFree }: SpecialOfferProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgradeClick = async () => {
    try {
      if (!user?.id) {
        toast.error('Please sign in to upgrade');
        return;
      }

      const toastId = toast.loading('Preparing checkout...');
      
      try {
        const { sessionId } = await createCheckoutSession(user.id);
        const stripe = await stripePromise;
        
        if (!stripe) {
          throw new Error('Failed to initialize Stripe');
        }

        const { error } = await stripe.redirectToCheckout({ sessionId });
        
        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to start checkout. Please try again.', { id: toastId });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8">
          <div className="flex items-center justify-center gap-3 text-primary font-semibold mb-4">
            <Timer className="w-5 h-5" />
            <span>Special New User Offer</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            You Could Save {Math.round(timeSaved)} Hours Every Month!
          </h2>
          <p className="text-center text-gray-600 max-w-lg mx-auto">
            Upgrade to Pro now and unlock advanced AI summaries, priority processing, and interactive quizzes.
            Start saving more time today!
          </p>
        </div>

        <div className="p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50">
              <Star className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="font-semibold text-gray-900">40% Off Pro Plan</h3>
                <p className="text-gray-600">Limited time offer for new users</p>
              </div>
              <div className="ml-auto">
                <div className="text-2xl font-bold text-gray-900">$5.99</div>
                <div className="text-sm text-gray-500 line-through">$9.99</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onContinueFree}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Continue with Free
              </button>
              <button
                onClick={handleUpgradeClick}
                className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              30-day money-back guarantee. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 