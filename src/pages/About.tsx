import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Brain, Clock, Code, School, Rocket, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Leveraging cutting-edge AI to transform how students understand and retain information.',
    color: 'purple'
  },
  {
    icon: Clock,
    title: 'Time-Saving',
    description: 'Built to help students focus on understanding concepts rather than just processing information.',
    color: 'blue'
  },
  {
    icon: Code,
    title: 'Solo-Built',
    description: 'Developed independently with a focus on solving real student problems through technology.',
    color: 'green'
  },
  {
    icon: School,
    title: 'Student-First',
    description: 'Created by a student, for students, with real understanding of academic challenges.',
    color: 'red'
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
  const navigate = useNavigate();
  return (
    <>
      {/* Hero Section */}
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              The Story Behind{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Notelo
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              A student's journey to revolutionize learning through AI technology
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-sm border border-gray-200 p-8 mb-24"
        >
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Vision</h2>
            <p className="text-xl text-gray-600 mb-8">
              My goal is to make Notelo the go-to learning companion for students worldwide. I believe that with the right tools, 
              anyone can master complex subjects and achieve their academic goals. By combining AI technology with a deep 
              understanding of student needs, I'm working to make that vision a reality.
            </p>
          </div>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-24"
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-6 mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 rounded-full blur-lg opacity-70"></div>
                <img
                  src="https://media.licdn.com/dms/image/v2/D5603AQECz38Hxb5AfA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1723335041427?e=1742428800&v=beta&t=TrY51I1SfpjYwl_IHticpHGkPBwFnSbxg8evMi7hEbY"
                  alt="William Laverty"
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100 p-2 relative"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">William Laverty</h2>
                <p className="text-gray-600">Founder & Developer</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-6 h-6 text-blue-600" />
                </div>
                <div className="prose prose-lg text-gray-600">
                  <p>
                    Hey! I'm William, a college student and indie developer who created Notelo out of personal necessity. 
                    During my studies, I found myself struggling to find effective tools that could help me study more efficiently. 
                    The existing solutions weren't quite cutting it – they either oversimplified content or were too time-consuming to use.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="prose prose-lg text-gray-600">
                  <p>
                    That's when I decided to build Notelo. As a student myself, I understood firsthand the challenges of balancing 
                    coursework, understanding complex topics, and managing time effectively. I wanted to create something that could 
                    transform any type of content – whether it's lecture videos, research papers, or textbook chapters – into 
                    clear, actionable study materials.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-green-600" />
                </div>
                <div className="prose prose-lg text-gray-600">
                  <p>
                    Working solo on Notelo has been both challenging and rewarding. Every feature is built with students in mind, 
                    focusing on what really matters: understanding concepts deeply and retaining information effectively. I'm 
                    constantly improving Notelo based on feedback from fellow students and users, making it better every day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Join Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Me on This Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience a new way of learning that's designed by a student who understands your challenges.
          </p>
          <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors" onClick={() => navigate('/signup')}>
            Try Notelo Today
          </button>
        </motion.div>
      </div>
    </>
  );
} 