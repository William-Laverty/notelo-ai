import { motion } from 'framer-motion';
import { BookOpen, Users, Target, Heart, Sparkles, Globe } from 'lucide-react';
import Footer from '../components/layout/Footer';

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'Our mission is to make knowledge more accessible by transforming how people consume and understand content.',
    color: 'blue'
  },
  {
    icon: Sparkles,
    title: 'Innovation First',
    description: 'We continuously push the boundaries of AI technology to deliver the best possible experience.',
    color: 'purple'
  },
  {
    icon: Users,
    title: 'User-Centered',
    description: "Every feature and improvement is designed with our users' needs and feedback in mind.",
    color: 'green'
  },
  {
    icon: Heart,
    title: 'Quality Focused',
    description: 'We maintain the highest standards in our summaries and insights to ensure valuable outcomes.',
    color: 'red'
  }
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=80'
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=80'
  },
  {
    name: 'Emma Wilson',
    role: 'Head of AI',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=80'
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

export default function About() {
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
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Notelo
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              We're on a mission to transform how people read and understand content through the power of AI.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-24"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                Notelo was born from a simple observation: in today's fast-paced world, 
                people are overwhelmed with information but short on time. We believed there 
                had to be a better way to consume and understand content without sacrificing depth or quality.
              </p>
              <p>
                Founded in 2023, we set out to build an AI-powered platform that could transform 
                how people read and learn. Our team of experts in artificial intelligence, natural 
                language processing, and user experience design worked tirelessly to create a solution 
                that could intelligently summarize content while preserving its key insights.
              </p>
              <p>
                Today, Notelo helps thousands of users save time and gain deeper understanding 
                from their reading. But we're just getting started. We continue to innovate and 
                push the boundaries of what's possible with AI-powered content understanding.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-${value.color}-100 flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 text-${value.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            We're a passionate team of experts dedicated to transforming how people consume and understand content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-gray-600">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">30+</div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of the future of content consumption and understanding.
          </p>
          <button className="btn-primary px-8 py-4 rounded-xl text-lg font-medium">
            Get Started Today
          </button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
} 