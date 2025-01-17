import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Star, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPayPalSubscription, verifyPayPalSubscription } from '../../api/paypal';
import { toast } from 'react-hot-toast';

interface SpecialOfferProps {
  timeSaved: number;
  onContinueFree: () => void;
}

export default function SpecialOffer({ timeSaved, onContinueFree }: SpecialOfferProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const subscription_id = searchParams.get('subscription_id');
    if (subscription_id && user?.id) {
      verifyPayment(subscription_id);
    }
  }, [searchParams, user]);

  const verifyPayment = async (subscriptionId: string) => {
    const toastId = toast.loading('Verifying your subscription...');
    try {
      if (!user?.id) {
        throw new Error('No user ID found');
      }

      const result = await verifyPayPalSubscription(subscriptionId, user.id);
      if (result.success) {
        toast.success('Subscription activated successfully!', { id: toastId });
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Failed to verify subscription. Please contact support.', { id: toastId });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please contact support.', { id: toastId });
    }
  };

  const handleUpgradeClick = async () => {
    try {
      if (!user?.id) {
        toast.error('Please sign in to upgrade');
        return;
      }

      const toastId = toast.loading('Preparing checkout...');
      
      try {
        const subscription = await createPayPalSubscription();
        if (subscription.links) {
          // Find the approval URL
          const approvalLink = subscription.links.find((link: any) => link.rel === 'approve');
          if (approvalLink) {
            window.location.href = approvalLink.href;
          } else {
            throw new Error('No approval link found');
          }
        } else {
          throw new Error('Invalid PayPal response');
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
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
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

            <div className="flex flex-col items-center space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/payment')}
                className="w-full btn-primary relative overflow-hidden bg-gradient-to-r from-primary via-violet-500 to-primary bg-size-200 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-medium shadow-xl shadow-primary/20 hover:bg-right transition-all duration-500"
              >
                Upgrade Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onContinueFree}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Continue with free plan
              </motion.button>
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