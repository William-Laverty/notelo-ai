import { motion } from 'framer-motion';
import { Check, Zap, Star, Award } from 'lucide-react';
import Footer from '../components/layout/Footer';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying out Notelo',
    icon: Zap,
    color: 'blue',
    features: [
      'Up to 10 documents per month',
      'Basic AI summaries',
      'Standard processing speed',
      'Basic document management',
      'Email support'
    ]
  },
  {
    name: 'Pro',
    price: '9.99',
    description: 'Best for individual professionals',
    icon: Star,
    color: 'amber',
    popular: true,
    features: [
      'Unlimited documents',
      'Advanced AI summaries',
      'Priority processing',
      'Advanced document organization',
      'Interactive quizzes',
      'Priority support',
      'API access'
    ]
  },
  {
    name: 'Enterprise',
    price: '49.99',
    description: 'For teams and organizations',
    icon: Award,
    color: 'purple',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Custom AI models'
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Simple, Transparent{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your needs. All plans include our core features.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Pricing Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className={`relative bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border ${
                  plan.popular ? 'border-primary' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-${plan.color}-100 flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-600">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-24 bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards and PayPal.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer custom plans?</h3>
              <p className="text-gray-600">Yes, contact us for custom enterprise solutions.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Try Notelo free for 14 days. No credit card required.
          </p>
          <button className="btn-primary px-8 py-4 rounded-xl text-lg font-medium">
            Start Free Trial
          </button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
} 