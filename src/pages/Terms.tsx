import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Mail } from 'lucide-react';
import Footer from '../components/layout/Footer';

const sections = [
  {
    title: '1. Terms of Use',
    content: `By accessing and using Notelo's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of our services constitutes agreement to such modifications.`
  },
  {
    title: '2. User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.`
  },
  {
    title: '3. Service Usage',
    content: `Our services are provided "as is" and "as available." While we strive to maintain high availability, we do not guarantee uninterrupted access to our services. We reserve the right to modify, suspend, or discontinue any part of our services at any time.`
  },
  {
    title: '4. Content Guidelines',
    content: `You retain ownership of any content you upload to our platform. However, by using our services, you grant us a worldwide, non-exclusive license to use, store, and process your content for the purpose of providing our services.`
  },
  {
    title: '5. Privacy & Data Protection',
    content: `We take your privacy seriously and handle your data in accordance with our Privacy Policy. We implement appropriate technical and organizational measures to protect your personal information.`
  },
  {
    title: '6. Intellectual Property',
    content: `All intellectual property rights in our services, including but not limited to software, designs, and content, are owned by or licensed to Notelo. You may not copy, modify, distribute, or create derivative works without our explicit permission.`
  },
  {
    title: '7. Limitation of Liability',
    content: `To the maximum extent permitted by law, Notelo shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.`
  },
  {
    title: '8. Termination',
    content: `We reserve the right to terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including breach of these Terms of Service.`
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

export default function Terms() {
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
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Terms of{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Service
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Please read these terms carefully before using Notelo's services.
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

        {/* Terms Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {sections.map((section) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Our Terms?</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about these terms, please contact us.
          </p>
          <a
            href="mailto:legal@notelo.com"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>legal@notelo.com</span>
          </a>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
} 