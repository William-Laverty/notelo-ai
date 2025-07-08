import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase-client';
import { sendWelcomeEmail } from '../../lib/email-service';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session?.user) {
          throw new Error('No session found');
        }

        console.log('User authenticated:', session.user.id);

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is expected for new users
          console.error('Error checking profile:', profileError);
          throw profileError;
        }

        if (!profile) {
          console.log('Creating new profile for user:', session.user.id);
          
          // Create new profile
          const newProfile = {
            id: session.user.id,
            email: session.user.email,
            created_at: new Date().toISOString(),
            study_hours: 0,
            content_preference: 'text',
            study_goal: 'save_time',
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
            subscription_status: 'free',
            subscription_tier: 'free',
            usage_count: 0
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);

          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw new Error(`Failed to create user profile: ${insertError.message}`);
          }

          // Send welcome email for new users
          if (session.user.email) {
            try {
              console.log('Sending welcome email to:', session.user.email);
              const { data: emailResult, error: emailError } = await sendWelcomeEmail({
                email: session.user.email,
                user_metadata: session.user.user_metadata
              });

              if (emailError) {
                console.error('Welcome email error:', emailError);
                toast.error('Welcome email could not be sent');
              } else {
                console.log('Welcome email sent successfully:', emailResult);
              }
            } catch (error) {
              console.error('Failed to send welcome email:', error);
              toast.error('Welcome email could not be sent');
            }
          }

          console.log('Profile created successfully');
          toast.success('Account created successfully!');
          navigate('/onboarding');
          return;
        }

        console.log('Existing profile found:', profile.id);
        
        // Handle existing user
        if (!profile.onboarding_completed) {
          console.log('Redirecting to onboarding...');
          toast.success('Welcome back! Let\'s complete your setup.');
          navigate('/onboarding');
        } else {
          console.log('Redirecting to dashboard...');
          toast.success('Successfully signed in!');
          navigate('/dashboard');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Sign in failed: ${errorMessage}`);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 rounded-lg bg-white shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
          <p className="text-gray-500">Please wait while we set up your account.</p>
        </div>
      </div>
    </div>
  );
} 
