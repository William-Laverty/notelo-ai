import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, Clock, TrendingUp, Lock, Eye, EyeOff, Trash2, Ban, Crown, DollarSign, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  is_subscribed: boolean;
  documents_count: number;
  total_time_saved: number;
}

interface AdminStats {
  totalUsers: number;
  totalDocuments: number;
  totalTimeSaved: number;
  activeUsers: number;
  premiumUsers: number;
  conversionRate: number;
  monthlyRecurringRevenue: number;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDocuments: 0,
    totalTimeSaved: 0,
    activeUsers: 0,
    premiumUsers: 0,
    conversionRate: 0,
    monthlyRecurringRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPasscode, setShowPasscode] = useState(false);

  const ADMIN_PASSCODE = '439126';

  const handleAuthentication = () => {
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      toast.success('Welcome, Admin!');
    } else {
      toast.error('Invalid passcode');
    }
  };

  useEffect(() => {
    const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
    if (isAdminAuth) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get document counts for each user
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const { count } = await supabase
            .from('documents')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id);

          return {
            ...user,
            documents_count: count || 0,
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Get premium users
      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('is_subscribed', true);

      // Get total documents
      const { count: totalDocuments } = await supabase
        .from('documents')
        .select('*', { count: 'exact' });

      // Get active users (logged in within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .gt('last_sign_in_at', sevenDaysAgo.toISOString());

      // Calculate total time saved
      const { data: documents } = await supabase
        .from('documents')
        .select('text_content, summary');

      const totalTimeSaved = documents?.reduce((total, doc) => {
        if (doc.summary) {
          const originalWords = doc.text_content.trim().split(/\s+/).length;
          const summaryWords = doc.summary.trim().split(/\s+/).length;
          const timeSaved = Math.max(2, Math.ceil((originalWords - summaryWords) / 200));
          return total + timeSaved;
        }
        return total;
      }, 0) || 0;

      // Calculate conversion rate and MRR
      const conversionRate = ((premiumUsers || 0) / (totalUsers || 1)) * 100;
      const monthlyRecurringRevenue = (premiumUsers || 0) * 5.99; // $5.99 per premium user

      setStats({
        totalUsers: totalUsers || 0,
        totalDocuments: totalDocuments || 0,
        totalTimeSaved,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0,
        conversionRate,
        monthlyRecurringRevenue,
      });
    } catch (error) {
      toast.error('Failed to fetch stats');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;

        toast.success('User deleted successfully');
        fetchUsers();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleBanUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_banned: true })
          .eq('id', userId);

        if (error) throw error;

        toast.success('User banned successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to ban user');
      }
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
          <div className="relative mb-4">
            <input
              type={showPasscode ? 'text' : 'password'}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none pr-10"
            />
            <button
              onClick={() => setShowPasscode(!showPasscode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={handleAuthentication}
            className="w-full bg-primary text-white py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Access Admin Panel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-600">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <span className="font-medium text-gray-600">Premium Users</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.premiumUsers}</p>
              <p className="text-sm text-gray-500">{stats.conversionRate.toFixed(1)}% conversion</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-600">Monthly Revenue</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">${stats.monthlyRecurringRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">${(stats.monthlyRecurringRevenue * 12).toFixed(2)} / year</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-600">Active Users</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-medium text-gray-600">Total Documents</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
              <span className="font-medium text-gray-600">Time Saved</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTimeSaved} min</p>
              <p className="text-sm text-gray-500">{Math.round(stats.totalTimeSaved / 60)} hours total</p>
            </div>
          </motion.div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.documents_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_subscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_subscribed ? 'Pro' : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Ban User"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 