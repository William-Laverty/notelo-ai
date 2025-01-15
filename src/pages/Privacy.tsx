import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Mail, Eye, Database, Key, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Footer from '../components/layout/Footer';

interface Section {
  title: string;
  icon: LucideIcon;
  color: string;
  content: string;
}

const sections: Section[] = [
  {
    title: '1. Information We Collect',
    icon: Eye,
    color: 'blue',
    content: `We collect information that you provide directly to us, including:
    • Account information (name, email, password)
    • Content you upload for processing
    • Usage data and interaction with our services
    • Technical data (IP address, browser type, device information)`
  },
  {
    title: '2. How We Use Your Information',
    icon: Database,
    color: 'purple',
    content: `We use your information to:
    • Provide and improve our services
    • Process and analyze your content
    • Communicate with you about our services
    • Ensure security and prevent fraud
    • Comply with legal obligations`
  },
  {
    title: '3. Data Security',
    icon: Lock,
    color: 'green',
    content: `We implement appropriate technical and organizational measures to protect your personal information, including:
    • Encryption of data in transit and at rest
    • Regular security assessments
    • Access controls and authentication
    • Secure data storage practices`
  },
  {
    title: '4. Data Sharing',
    icon: UserCheck,
    color: 'amber',
    content: `We do not sell your personal information. We may share your information with:
    • Service providers who assist in our operations
    • Legal authorities when required by law
    • Business partners with your consent
    • Third parties in the event of a business transaction`
  },
  {
    title: '5. Your Rights',
    icon: Key,
    color: 'red',
    content: `You have the right to:
    • Access your personal information
    • Correct inaccurate data
    • Request deletion of your data
    • Object to processing
    • Export your data
    • Withdraw consent`
  },
  {
    title: '6. Data Retention',
    icon: Database,
    color: 'indigo',
    content: `We retain your information for as long as necessary to:
    • Provide our services
    • Comply with legal obligations
    • Resolve disputes
    • Enforce our agreements`
  },
  {
    title: "7. Children's Privacy",
    icon: Shield,
    color: 'pink',
    content: `Our services are not intended for children under 13. We do not knowingly collect or maintain information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete it.`
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

export default function Privacy() {
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-8">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Privacy{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Policy
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              We take your privacy seriously. Learn how we collect, use, and protect your information.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-gray-600">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Privacy Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.title}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-12 h-12 rounded-xl bg-${section.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 text-${section.color}-600`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Questions?</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about our privacy practices, please contact our Data Protection Officer.
          </p>
          <a
            href="mailto:privacy@notelo.com"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>privacy@notelo.com</span>
          </a>
        </motion.div>

        {/* Cookie Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>
            This site uses cookies to provide you with a better user experience. 
            By continuing to use our site, you agree to our use of cookies.
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
} 