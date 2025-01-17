import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Shield, Zap, Star, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { verifyPayPalSubscription } from '../api/paypal';
import { toast } from 'react-hot-toast';

const features = [
  {
    icon: Zap,
    title: 'Unlimited Processing',
    description: 'Process as many documents as you need, no restrictions'
  },
  {
    icon: Star,
    title: 'Advanced AI Summaries',
    description: 'Get deeper insights with context-aware AI analysis'
  },
  {
    icon: Clock,
    title: 'Priority Processing',
    description: '2x faster processing speed for all your documents'
  },
  {
    icon: Users,
    title: 'Priority Support',
    description: 'Get help when you need it with dedicated support'
  }
];

const additionalFeatures = [
  'Interactive study quizzes',
  'Custom learning paths',
  'Progress tracking',
  'Early access to new features',
  'Advanced export options',
  'Offline access'
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

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleApprove = async (data: any, actions: any) => {
    try {
      if (!user?.id) {
        toast.error('User not found');
        return;
      }

      console.log('PayPal subscription data:', data);
      
      // Make sure we have a subscription ID
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
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  {additionalFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
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
                
                {/* PayPal Button Container */}
                <PayPalScriptProvider options={{
                  clientId: "AVjmUNw3yof1TfyM4oMqpkqiu73RBxUajjHiqEhGKK1l-IueMWJVhR8Ec_-mswxCykCbP0V-0NukoKHL",
                  vault: true,
                  intent: "subscription",
                  "data-sdk-integration-source": "button-factory"
                }}>
                  <div id="paypal-button-container-P-2YL98489JN785131BM6DWIHQ">
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
                          plan_id: 'P-2YL98489JN785131BM6DWIHQ'
                        });
                      }}
                      onApprove={(data, actions) => {
                        console.log('Subscription approved:', data);
                        return handleApprove(data, actions);
                      }}
                      onCancel={() => {
                        console.log('Subscription cancelled');
                        toast.error('Subscription cancelled');
                      }}
                      onError={(err) => {
                        console.error('PayPal error:', err);
                        toast.error('Something went wrong. Please try again.');
                      }}
                    />
                  </div>
                </PayPalScriptProvider>

                <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
                  <p className="text-amber-800 text-sm">
                    <span className="font-semibold">Special Offer:</span> Get your first month at 50% off when you subscribe today!
                  </p>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                  By subscribing, you agree to our{' '}
                  <a href="/terms" className="text-primary hover:text-primary/80">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 