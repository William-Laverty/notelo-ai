import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase-client';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Add global type declaration for Reddit conversion tracking
declare global {
  interface Window {
    trackRedditConversion?: (event: string, email?: string, conversionId?: string) => void;
  }
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && window.location.hash.includes('access_token')) {
        navigate('/dashboard');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('No user data returned after signup');
    }

    // Create profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          created_at: new Date().toISOString(),
          study_hours: 0,
          content_preference: 'text',
          study_goal: 'save_time',
          onboarding_completed: false,
          updated_at: new Date().toISOString(),
          subscription_status: 'free',
          subscription_tier: 'free',
          usage_count: 0
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error('Failed to create user profile');
    }

    // Track signup completion with Facebook Pixel
    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        console.log('Tracking Facebook Pixel CompleteRegistration event...');
        
        // Track with additional parameters
        (window as any).fbq('track', 'CompleteRegistration', {
          status: true,
          registration_method: 'email',
          user_type: 'free',
        });
        
        console.log('Facebook Pixel CompleteRegistration event tracked successfully');
      } else {
        console.warn('Facebook Pixel not available for tracking');
      }
    } catch (error) {
      console.error('Facebook Pixel tracking error:', error);
    }

    // Track signup completion with Reddit conversion
    try {
      if (typeof window !== 'undefined' && window.trackRedditConversion) {
        console.log('Tracking Reddit conversion event...');
        
        // Generate a unique conversion ID with user ID for better tracking
        const signupConversionId = `signup_${authData.user.id}_${Date.now()}`;
        window.trackRedditConversion('signup', email, signupConversionId);
        
        console.log('Reddit conversion event tracked successfully with ID:', signupConversionId);
      } else {
        console.warn('Reddit conversion not available for tracking');
      }
    } catch (error) {
      console.error('Reddit conversion tracking error:', error);
    }

    return authData;
  };

  const signInWithGoogle = async () => {
    // Use production URL if not in development
    const redirectUrl = 'https://notelo.ai/dashboard';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}