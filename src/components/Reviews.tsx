import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface ReviewsProps {
  id?: string;
}

const reviews = [
  {
    name: "Sarah Johnson",
    role: "Medical Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    content: "Notelo has completely transformed how I study for medical school. The AI summaries are incredibly accurate and save me hours of time.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    content: "The ability to convert technical documentation into concise study materials is invaluable. Best investment in my learning journey.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "Law Student",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    content: "As a law student, I deal with massive amounts of reading. Notelo helps me extract key points and create effective study materials.",
    rating: 5
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

export default function Reviews({ id }: ReviewsProps) {
  return (
    <section id={id} className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            What Our{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Users Say
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of students and professionals who have transformed their learning experience with Notelo
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full mr-4 ring-2 ring-primary/20"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{review.name}</h3>
                  <p className="text-gray-600 text-sm">{review.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic">{review.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}