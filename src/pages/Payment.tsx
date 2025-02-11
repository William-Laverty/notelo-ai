import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Shield, Zap, Star, Clock, Users, BookOpen, FileText, BrainCircuit, Headphones, ScrollText, Sparkles, Target, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { verifyPayPalSubscription } from '../api/paypal';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase-client';

const features = [
  {
    icon: BrainCircuit,
    title: 'Interactive AI Quizzes',
    description: 'Personalized quizzes generated from your study materials'
  },
  {
    icon: FileText,
    title: 'Advanced PDF Support',
    description: 'Process and analyze any PDF document with smart annotations'
  },
  {
    icon: ScrollText,
    title: 'Smart Flashcards',
    description: 'AI-generated flashcards from your notes and documents'
  },
  {
    icon: Headphones,
    title: 'Audio Notes',
    description: 'Convert your notes to audio for on-the-go learning'
  }
];

const guarantees = [
  {
    title: '30-Day Money Back',
    description: 'Try Notelo Pro risk-free. Not satisfied? Get a full refund.'
  },
  {
    title: 'Secure Payments',
    description: 'Your payment information is always protected.'
  },
  {
    title: 'Cancel Anytime',
    description: 'No long-term contracts. Cancel your subscription whenever you want.'
  }
];

// PayPal Button wrapper component for better loading handling
function PayPalButtonWrapper({ planId = 'P-2YL98489JN785131BM6DWIHQ' }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Retry loading if failed
  useEffect(() => {
    if (isRejected && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isRejected, retryCount]);

  const handleApprove = async (data: any, actions: any) => {
    try {
      if (!user?.id) {
        toast.error('User not found');
        return;
      }

      console.log('PayPal subscription data:', data);
      
      if (!data.subscriptionID) {
        toast.error('No subscription ID received');
        return;
      }

      const result = await verifyPayPalSubscription(data.subscriptionID, user.id);
      
      if (result.success) {
        toast.success('Subscription activated successfully!');
        navigate('/account', { replace: true });
      } else {
        toast.error('Failed to verify subscription');
      }
    } catch (error: any) {
      console.error('Error during subscription verification:', error);
      toast.error(error.message || 'Failed to verify subscription. Please contact support.');
    }
  };

  if (isPending) {
    return (
      <div className="w-full py-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Loading PayPal...</p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="w-full py-8 flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 text-center">
          <p className="font-medium">Failed to load PayPal</p>
          <p className="text-sm text-gray-600 mt-2">
            {retryCount < 3 ? 'Retrying...' : 'Please refresh the page or try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        shape: 'pill',
        color: 'blue',
        layout: 'vertical',
        label: 'subscribe'
      }}
      createSubscription={(data, actions) => {
        console.log('Creating subscription...');
        return actions.subscription.create({
          plan_id: planId
        });
      }}
      onApprove={handleApprove}
      onCancel={() => {
        console.log('Subscription cancelled');
        toast.error('Subscription cancelled');
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        toast.error('Something went wrong. Please try again.');
      }}
    />
  );
}

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoValid, setIsPromoValid] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePromoSubmit = () => {
    if (promoCode.toUpperCase() === 'STUDYSMART') {
      setIsPromoValid(true);
      toast.success('Promo code applied successfully!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary/5 to-gray-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Plan Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 md:p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notelo Pro</h1>
                    <p className="text-gray-600">Unlock your full learning potential</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900">$5.99</div>
                    <div className="text-gray-500">per month</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, rgba(236, 252, 243, 0.5), rgba(236, 252, 243, 0.8))',
                    boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)'
                  }}
                >
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(45deg, rgba(52, 211, 153, 0.3), rgba(147, 197, 253, 0.3))',
                      filter: 'blur(20px)',
                      zIndex: -1
                    }}
                  />
                  
                  <div className="flex items-center gap-4">
                    {/* Profile picture with gradient border */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(45deg, #818cf8, #6366f1)',
                          transform: 'scale(1.05)',
                          filter: 'blur(2px)'
                        }}
                      />
                      <img
                        src="https://media.licdn.com/dms/image/v2/D5603AQECz38Hxb5AfA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1723335041427?e=1742428800&v=beta&t=TrY51I1SfpjYwl_IHticpHGkPBwFnSbxg8evMi7hEbY"
                        alt="William"
                        className="w-16 h-16 rounded-full border-2 border-white relative z-10 object-cover"
                      />
                    </div>

                    {/* Personalized message */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Hey I'm Will! 👋</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        I'm the solo developer behind Notelo Pro and I'm excited to have you onboard! 
                        I've been working on this for a while now and would love to have your support.
                        By subscribing to Notelo Pro, you'll be helping me to build better features for Notelo.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Guarantees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6 md:p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-green-100/50 to-transparent rounded-full -translate-y-32 -translate-x-32 blur-3xl"></div>
              
              <div className="relative">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Our Guarantees
                </h2>
                <div className="space-y-6">
                  {guarantees.map((guarantee, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{guarantee.title}</h3>
                        <p className="text-sm text-gray-600">{guarantee.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Payment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 sticky top-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
              
              <div className="relative">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Purchase</h2>

                {/* Order Summary */}
                <div className="mb-8 p-4 rounded-xl bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Notelo Pro (Monthly)</span>
                      <span className="text-gray-900">$9.99</span>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <span>New User Discount (40% off)</span>
                      <span>-$4.00</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-900">Total (per month)</span>
                        <span className="text-2xl text-primary">$5.99</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="mb-8">
                  {!showPromoInput ? (
                    <button
                      onClick={() => setShowPromoInput(true)}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Have a promo code?
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter promo code"
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={handlePromoSubmit}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setShowPromoInput(false);
                          setPromoCode('');
                          setIsPromoValid(false);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* What You're Getting */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What You're Getting</h3>
                  <div className="space-y-4">
                    {/* Primary Features */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BrainCircuit className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium">Interactive AI Quizzes</span>
                          <p className="text-sm text-gray-600">Test your knowledge with smart quizzes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium">Advanced PDF Support</span>
                          <p className="text-sm text-gray-600">Process any PDF with smart annotations</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ScrollText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium">Smart Flashcards</span>
                          <p className="text-sm text-gray-600">AI-generated study cards</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium">Audio Notes</span>
                          <p className="text-sm text-gray-600">Learn on the go with audio conversion</p>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-4"></div>

                    {/* Additional Features */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-600">Unlimited Processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-600">Priority Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-600">2x Processing Speed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-600">Cloud Storage</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Your payment is secured by PayPal's encryption</span>
                </div>
                
                {/* PayPal Button Container */}
                <PayPalScriptProvider options={{
                  clientId: "AVjmUNw3yof1TfyM4oMqpkqiu73RBxUajjHiqEhGKK1l-IueMWJVhR8Ec_-mswxCykCbP0V-0NukoKHL",
                  vault: true,
                  intent: "subscription",
                  "data-sdk-integration-source": "button-factory"
                }}>
                  {isPromoValid ? (
                    <div key="promo-button" className="transition-opacity">
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-green-700">Promo code "STUDYSMART" applied!</span>
                        </div>
                      </div>
                      <PayPalButtonWrapper planId="P-1EU83413SC4417051M6NBFTQ" />
                    </div>
                  ) : (
                    <div key="regular-button">
                      <PayPalButtonWrapper planId="P-2YL98489JN785131BM6DWIHQ" />
                    </div>
                  )}
                </PayPalScriptProvider>

                {/* Money-back Guarantee */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    30-day money-back guarantee. Cancel anytime.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 