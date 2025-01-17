import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  Zap, 
  Crown, 
  Clock, 
  FileText, 
  Brain,
  Shield,
  Sparkles,
  MessageCircle,
  RefreshCw,
  History,
  Book,
  Target,
  Edit2,
  Check,
  X,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase-client';
import { toast } from 'react-hot-toast';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  study_hours?: number;
  content_preference?: string;
  study_goal?: string;
  plan: 'free' | 'premium';
  usage_count: number;
  subscription_status: string;
  subscription_tier: string;
  subscription_end_date: string;
  paypal_subscription_id?: string;
  updated_at?: string;
}

export default function Account() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const premiumFeatures = [
    {
      icon: Zap,
      title: "Unlimited Summaries",
      description: "Generate as many document summaries as you need"
    },
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "Access our most sophisticated AI models for deeper insights"
    },
    {
      icon: Clock,
      title: "Priority Processing",
      description: "Get your summaries faster with priority queue access"
    },
    {
      icon: FileText,
      title: "Longer Documents",
      description: "Process documents of any length without restrictions"
    },
    {
      icon: History,
      title: "Summary History",
      description: "Access and review all your past summaries"
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Advanced encryption and data protection"
    },
    {
      icon: MessageCircle,
      title: "Priority Support",
      description: "Get help when you need it with dedicated support"
    },
    {
      icon: RefreshCw,
      title: "Regular Updates",
      description: "Early access to new features and improvements"
    }
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?.id) throw new Error('No user ID found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        data.usage_count = typeof data.usage_count === 'number' ? data.usage_count : 0;
        setProfile(data);
        setEditedName(data.full_name || '');
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateName = async () => {
    try {
      if (!user?.id) throw new Error('No user ID found');
      
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editedName })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, full_name: editedName } : null);
      setIsEditing(false);
      toast.success('Name updated successfully');
    } catch (error: any) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="Enter your name"
                      />
                      <button
                        onClick={handleUpdateName}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(profile?.full_name || '');
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-500">{profile?.full_name || 'Add your name'}</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Study Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border border-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Hours</p>
                  <p className="text-lg font-semibold text-gray-900">{profile?.study_hours || 0} hours/week</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border border-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Book className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Content Type</p>
                  <p className="text-lg font-semibold text-gray-900">{profile?.content_preference || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border border-primary/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Goal</p>
                  <p className="text-lg font-semibold text-gray-900">{profile?.study_goal || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Statistics</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 mb-1">Documents Generated</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {profile?.usage_count || 0}
                    {(!profile?.subscription_status || profile?.subscription_status !== 'active') && (
                      <span className="text-gray-500 text-lg font-normal">/3</span>
                    )}
                  </p>
                </div>
                {profile?.subscription_status === 'active' && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Unlimited
                  </div>
                )}
              </div>

              {(!profile?.subscription_status || profile?.subscription_status !== 'active') && (
                <>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                        (profile?.usage_count || 0) >= 3 
                          ? 'bg-red-500' 
                          : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(((profile?.usage_count || 0) / 3) * 100, 100)}%` }}
                    />
                  </div>

                  {(profile?.usage_count || 0) >= 3 ? (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-red-600 text-sm font-medium">Limit reached</p>
                      <button 
                        onClick={() => navigate('/payment')}
                        className="text-primary hover:text-primary/90 text-sm font-medium flex items-center gap-1"
                      >
                        Upgrade for unlimited access
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (profile?.usage_count || 0) >= 2 ? (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-amber-600 text-sm font-medium">Almost at limit</p>
                      <button 
                        onClick={() => navigate('/payment')}
                        className="text-primary hover:text-primary/90 text-sm font-medium flex items-center gap-1"
                      >
                        Upgrade now
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Generated</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-xl p-5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Account Status</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {profile?.subscription_status === 'active' ? 'Premium' : 'Free'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        {(!profile?.subscription_status || profile?.subscription_status !== 'active') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-violet-500/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">Premium Features</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/payment')}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  Upgrade Now
                </motion.button>
              </div>
              <p className="mt-2 text-gray-600">
                Unlock all premium features and take your productivity to the next level
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {premiumFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gradient-to-br hover:from-primary/5 hover:to-violet-500/5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Special Offer</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  $5.99<span className="text-lg text-gray-500 font-normal">/month</span>
                </p>
                <p className="text-gray-500 text-sm">
                  30-day money-back guarantee. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 