// Contact page
// If users have issues they can leave a message that populates in DB. Haven't read them yet.

import { motion } from 'framer-motion';
import { Mail, MessageSquare, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase-client';

/**
 * Global window interface extension for Reddit conversion tracking
 */
declare global {
  interface Window {
    trackRedditConversion?: (event: string, email?: string, conversionId?: string) => void;
  }
}

/**
 * Contact methods displayed in the contact information section
 */
const contactMethods = [
  {
    title: 'William Laverty',
    description: 'Solo Entrepreneur',
    photo: 'https://media.licdn.com/dms/image/v2/D5603AQECz38Hxb5AfA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1723335041427?e=1742428800&v=beta&t=TrY51I1SfpjYwl_IHticpHGkPBwFnSbxg8evMi7hEbY',
    color: 'purple'
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'Send me an email anytime',
    contact: 'contact@notelo.com',
    color: 'blue'
  }
];

/**
 * Contact page component with message form and developer information
 * Stores messages in database and tracks conversions for analytics
 */
export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Handles form input changes and clears error states
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  /**
   * Submits contact form, saves to database, and tracks conversions
   * Handles both client-side and server-side conversion tracking
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Generate a unique conversion ID for this contact submission
      const conversionId = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Insert message into Supabase directly from client
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);

      if (error) {
        throw error;
      }

      // Track Reddit conversion client-side
      if (window.trackRedditConversion) {
        window.trackRedditConversion('contact_form_submitted', formData.email, conversionId);
        console.log('Reddit conversion tracked for contact form with ID:', conversionId);
      }
      
      // Also send to server for server-side tracking with the same conversion ID
      try {
        await fetch('/api/contact/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            conversionId
          }),
        });
      } catch (serverError) {
        // If server-side tracking fails, we still have client-side tracking
        console.warn('Server-side conversion tracking failed:', serverError);
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error submitting message:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error?.message || 'There was an error sending your message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero section with page title and personal greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border-b border-gray-200 pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Get in{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Touch
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Have questions? I'd love to hear from you. Send me a message and I'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left column - contact information and social links */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
            <div className="space-y-6">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center`}>
                      {'photo' in method ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 rounded-full blur-lg opacity-70"></div>
                          <img
                            src={method.photo}
                            alt={method.title}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 p-0.5 relative z-10 object-cover"
                          />
                        </div>
                      ) : Icon ? (
                        <div className={`w-12 h-12 rounded-xl bg-${method.color}-100 flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-${method.color}-600`} />
                        </div>
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{method.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                      {'photo' in method ? (
                        <button
                          onClick={() => navigate('/about')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm group"
                        >
                          Learn more about me
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      ) : (
                        <p className="text-primary font-medium">{method.contact}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Social media links and external profiles */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Me</h3>
              <div className="flex gap-4">
                <a
                  href="https://github.com/William-Laverty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/william-laverty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right column - contact form with validation and success states */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send me a Message</h2>
            {submitStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600 mb-6">Thank you for reaching out. I'll get back to you soon.</p>
                <button
                  onClick={() => setSubmitStatus('idle')}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="How can I help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                    placeholder="Your message..."
                  />
                </div>
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errorMessage}
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-3 rounded-xl font-medium hover:from-primary/90 hover:to-primary/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
} 