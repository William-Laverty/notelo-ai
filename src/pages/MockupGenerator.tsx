import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Monitor, 
  Phone, 
  Tablet, 
  Laptop, 
  Image as ImageIcon,
  FileText,
  Brain,
  Layout,
  Layers,
  Square,
  Circle,
  Triangle,
  Lightbulb,
  BookOpen,
  Star,
  Share
} from 'lucide-react';
import html2canvas from 'html2canvas';

type Format = 'transparent' | 'gradient' | 'solid';
type MockupType = 'hero' | 'content' | 'summary' | 'flashcards' | 'dashboard';

export default function MockupGenerator() {
  const [format, setFormat] = useState<Format>('gradient');
  const [selectedMockup, setSelectedMockup] = useState<MockupType>('hero');
  
  const mockupRef = useRef<HTMLDivElement>(null);

  const downloadMockup = async () => {
    if (mockupRef.current) {
      const canvas = await html2canvas(mockupRef.current, {
        scale: 2,
        backgroundColor: format === 'transparent' ? null : undefined,
      });
      const link = document.createElement('a');
      link.download = `notelo-${selectedMockup}-${format}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const getBackgroundClass = () => {
    switch (format) {
      case 'transparent':
        return 'bg-transparent';
      case 'gradient':
        return 'bg-gradient-to-br from-violet-100/50 via-white to-blue-100/50';
      case 'solid':
        return 'bg-white';
    }
  };

  const renderMockupContent = () => {
    switch (selectedMockup) {
      case 'hero':
        return (
          <div className="max-w-full mx-auto text-center space-y-8 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-5xl font-bold">
                Learn Smarter,{' '}
                <span className="bg-gradient-to-r from-primary to-violet-500 text-transparent bg-clip-text">
                  Not Harder
                </span>
              </h1>
              <p className="text-xl text-gray-700">
                Transform any digital content into personalized study materials instantly. From lecture videos to research papers, create summaries and flashcards with AI.
              </p>
              <div className="flex justify-center gap-6">
                <button className="px-6 py-3 bg-primary text-white rounded-lg shadow-lg">
                  Get Started
                </button>
                <button className="px-6 py-3 bg-white text-primary border border-primary rounded-lg">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        );

      case 'content':
        return (
          <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">Content Generation</h2>
                  <p className="text-sm text-gray-500">Paste your content or enter a URL to get started</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Summarize
                  </button>
                  <button className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Create Flashcards
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-1 w-1 rounded-full bg-green-500" />
                    Processing content from: research-paper.pdf
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <h3 className="text-lg font-semibold">Abstract</h3>
                    <p className="text-gray-700">
                      Recent advances in artificial intelligence have led to significant improvements in natural language processing capabilities. This paper explores the latest developments in transformer architectures and their applications in real-world scenarios...
                    </p>
                    <h3 className="text-lg font-semibold">Introduction</h3>
                    <p className="text-gray-700">
                      The field of natural language processing has undergone dramatic changes in recent years. With the advent of transformer models and their ability to process long sequences of text...
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Processing Options</h3>
                      <div className="text-sm text-primary">Advanced Settings</div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Summary Length</label>
                        <div className="h-2 bg-primary/20 rounded-full">
                          <div className="h-2 w-2/3 bg-primary rounded-full" />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Brief</span>
                          <span>Detailed</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Focus Areas</label>
                        <div className="flex flex-wrap gap-2">
                          {["Key Points", "Methodology", "Results", "Discussion"].map((area) => (
                            <span key={area} className="px-3 py-1 bg-primary/5 text-primary text-sm rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-violet-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">AI Assistant</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-violet-200 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-700">Would you like me to focus on any specific aspects of the research paper?</p>
                        </div>
                      </div>
                      <div className="pl-8 space-y-2">
                        <button className="block w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-violet-100">
                          Extract key findings and methodology
                        </button>
                        <button className="block w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-violet-100">
                          Generate a comprehensive summary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">Introduction to Machine Learning</h2>
                  <p className="text-sm text-gray-500">From: Stanford CS229 Course Notes</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Export
                  </button>
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                    <Share className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      Key Concepts
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Machine Learning is a field of AI focused on creating systems that learn from data",
                        "Supervised Learning involves training with labeled data to make predictions",
                        "Unsupervised Learning finds patterns in unlabeled data",
                        "Deep Learning uses neural networks with multiple layers for complex tasks"
                      ].map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                          <p className="text-gray-700">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Detailed Summary
                    </h3>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        Machine Learning is a transformative field that enables computers to learn from experience. Unlike traditional programming, where rules are explicitly coded, ML systems discover patterns in data to make decisions and predictions.
                      </p>
                      <p>
                        The field encompasses several key approaches. Supervised learning, the most common, uses labeled data to train models for tasks like classification and regression. Unsupervised learning discovers hidden structures in data, while reinforcement learning enables agents to learn through interaction with an environment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-violet-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-violet-600" />
                      Quick Facts
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Year Coined", value: "1959" },
                        { label: "Key Applications", value: "Computer Vision, NLP" },
                        { label: "Popular Tools", value: "TensorFlow, PyTorch" },
                        { label: "Market Size", value: "$15.7B (2021)" }
                      ].map((fact, i) => (
                        <div key={i} className="space-y-1">
                          <div className="text-sm font-medium text-violet-700">{fact.label}</div>
                          <div className="text-sm text-gray-700">{fact.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Related Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Neural Networks",
                        "Data Mining",
                        "Computer Vision",
                        "Natural Language Processing",
                        "Robotics"
                      ].map((topic, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white text-blue-700 text-sm rounded-full border border-blue-100"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Key Takeaways
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      title: "Data-Driven",
                      description: "ML systems learn patterns from examples rather than following explicit rules"
                    },
                    {
                      title: "Versatile Applications",
                      description: "Used in everything from recommendation systems to autonomous vehicles"
                    },
                    {
                      title: "Continuous Learning",
                      description: "Models can improve over time with more data and fine-tuning"
                    }
                  ].map((takeaway, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="font-medium text-gray-900 mb-1">{takeaway.title}</h4>
                      <p className="text-sm text-gray-600">{takeaway.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'flashcards':
        return (
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">Machine Learning Flashcards</h2>
                  <p className="text-sm text-gray-500">24 cards • Last studied 2 days ago</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Study Mode
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Edit Cards
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative aspect-[4/3] bg-white rounded-xl shadow-lg p-6 flex items-center justify-center border-2 border-primary">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-medium text-gray-900">What is Supervised Learning?</h3>
                      <p className="text-sm text-gray-500">Click to reveal answer</p>
                    </div>
                  </div>
                </div>

                {[
                  {
                    question: "Define Neural Networks",
                    preview: "A computational model inspired by..."
                  },
                  {
                    question: "What is Gradient Descent?",
                    preview: "An optimization algorithm that..."
                  },
                  {
                    question: "Explain Overfitting",
                    preview: "A modeling error that occurs when..."
                  }
                ].map((card, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] bg-white rounded-xl shadow-lg p-6 flex items-center justify-center hover:shadow-xl transition-shadow"
                  >
                    <div className="text-center space-y-3">
                      <h3 className="text-lg font-medium text-gray-900">{card.question}</h3>
                      <p className="text-sm text-gray-500">{card.preview}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Study streak: 5 days</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full">85% Mastery</div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">20 mins today</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">My Learning Dashboard</h2>
                  <p className="text-sm text-gray-500">Welcome back! You have 3 documents in progress</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Import
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    New Document
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <h3 className="text-lg font-medium">Recent Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        title: "Machine Learning Basics",
                        type: "Research Paper",
                        progress: 75,
                        date: "Updated 2h ago",
                        items: "24 flashcards"
                      },
                      {
                        title: "Neural Networks Guide",
                        type: "Tutorial",
                        progress: 40,
                        date: "Updated 1d ago",
                        items: "15 flashcards"
                      },
                      {
                        title: "Data Science Notes",
                        type: "Study Notes",
                        progress: 90,
                        date: "Updated 3d ago",
                        items: "32 flashcards"
                      },
                      {
                        title: "Python Programming",
                        type: "Course Material",
                        progress: 60,
                        date: "Updated 5d ago",
                        items: "18 flashcards"
                      }
                    ].map((doc, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg group hover:bg-gray-100 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.title}</h4>
                              <p className="text-sm text-gray-500">{doc.type}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{doc.items}</span>
                              <span className="text-primary">{doc.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${doc.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">{doc.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Study Stats</h3>
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Weekly Progress</h4>
                        <span className="text-sm text-primary">+15%</span>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {[60, 45, 75, 50, 80, 65, 70].map((height, i) => (
                          <div key={i} className="space-y-1">
                            <div className="h-24 bg-gray-100 rounded-lg relative">
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-primary rounded-lg transition-all"
                                style={{ height: `${height}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-violet-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        {[
                          { text: "Review Machine Learning", count: "24 cards" },
                          { text: "Continue Neural Networks", count: "15 min left" },
                          { text: "Complete Python Quiz", count: "5 questions" }
                        ].map((action, i) => (
                          <button
                            key={i}
                            className="w-full flex items-center justify-between p-2 bg-white rounded-lg hover:bg-violet-100 transition-colors"
                          >
                            <span className="text-sm text-gray-700">{action.text}</span>
                            <span className="text-xs text-violet-600">{action.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Notelo Marketing Assets</h1>
          <p className="text-gray-600">Generate high-quality mockups for different pages and formats</p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Page</label>
              <div className="flex gap-2">
                {[
                  { type: 'hero', icon: <Layout className="w-4 h-4" /> },
                  { type: 'content', icon: <FileText className="w-4 h-4" /> },
                  { type: 'summary', icon: <Brain className="w-4 h-4" /> },
                  { type: 'flashcards', icon: <Layers className="w-4 h-4" /> },
                  { type: 'dashboard', icon: <Monitor className="w-4 h-4" /> },
                ].map(({ type, icon }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMockup(type as MockupType)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      selectedMockup === type
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {icon}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Format</label>
              <div className="flex gap-2">
                {[
                  { type: 'transparent', icon: <Square className="w-4 h-4" /> },
                  { type: 'gradient', icon: <Circle className="w-4 h-4" /> },
                  { type: 'solid', icon: <Triangle className="w-4 h-4" /> },
                ].map(({ type, icon }) => (
                  <button
                    key={type}
                    onClick={() => setFormat(type as Format)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      format === type
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {icon}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={downloadMockup}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Mockup
              </button>

              <div className="h-8 w-px bg-gray-200" />

              <div className="flex items-center gap-2">
                <a
                  href="/logo-dark.svg"
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Logo (Dark)
                </a>
                <a
                  href="/logo-light.svg"
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Logo (Light)
                </a>
                <a
                  href="/logo.svg"
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Logo (Color)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mockup Preview */}
        <div
          ref={mockupRef}
          className={`${getBackgroundClass()} p-12 rounded-2xl transition-colors duration-300`}
        >
          {renderMockupContent()}
        </div>
      </div>
    </div>
  );
} 