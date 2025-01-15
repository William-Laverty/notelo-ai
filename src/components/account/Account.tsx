import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Book, Clock, Crown, Edit2, Check, X, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { useAuth } from '../../context/AuthContext';
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
}

export default function Account() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?.id) throw new Error('No user ID found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setProfile(data);
      setEditedName(data?.full_name || '');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                Profile Settings
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile?.plan === 'premium' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {profile?.plan === 'premium' ? 'Premium' : 'Free'} Plan
              </span>
            </div>

            <div className="space-y-6">
              {/* Name Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
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
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(profile?.full_name || '');
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900">{profile?.full_name || 'Not set'}</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Section */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{profile?.email}</p>
              </div>

              {/* Study Preferences */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Preferences</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">Study Hours</span>
                    </div>
                    <p className="text-gray-900">{profile?.study_hours || 'Not set'} hours/week</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Book className="w-5 h-5" />
                      <span className="text-sm font-medium">Content Type</span>
                    </div>
                    <p className="text-gray-900">{profile?.content_preference || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Crown className="w-5 h-5" />
                      <span className="text-sm font-medium">Study Goal</span>
                    </div>
                    <p className="text-gray-900">{profile?.study_goal || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Statistics</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-gray-600 mb-1">Documents Processed</p>
                <p className="text-2xl font-semibold text-gray-900">{profile?.usage_count || 0}</p>
              </div>
              {profile?.plan === 'free' && profile?.usage_count >= 45 && (
                <div className="text-right">
                  <p className="text-amber-600 mb-1">Approaching Limit</p>
                  <p className="text-sm text-gray-600">Upgrade to Premium for unlimited access</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Features Card */}
          {profile?.plan !== 'premium' && (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upgrade to Premium</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-gray-700">Unlimited document processing</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-gray-700">Advanced AI summaries</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-gray-700">Priority support</p>
                </div>
                <button className="mt-6 w-full bg-primary text-white rounded-xl py-3 px-4 font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  Upgrade Now
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 