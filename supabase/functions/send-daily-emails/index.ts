// Supabase Edge Function to send daily emails to users
// I built this to send emails every 24 hours to users who enable it. 
// It worked to an extent but found that it was to costly and also emails always went to spam.


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend'

console.log('Starting email service...');

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Use verified Notelo domain
const FROM_EMAIL = 'william@notelo-ai.com';
const REPLY_TO_EMAIL = 'william@notelo-ai.com';

if (!resendApiKey) throw new Error('Missing RESEND_API_KEY');
if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
if (!supabaseServiceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

console.log('Environment variables loaded');

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const baseEmailStyle = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px;
  background: linear-gradient(145deg, #ffffff 0%, #f7f7ff 100%);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
`;

const headerStyle = `
  text-align: center;
  padding: 32px 0;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  margin: -32px -32px 32px -32px;
  border-radius: 16px 16px 0 0;
  position: relative;
  overflow: hidden;
`;

const logoStyle = `
  width: 140px;
  height: auto;
  margin-bottom: 24px;
  filter: brightness(0) invert(1);
`;

const statBoxStyle = `
  background: linear-gradient(145deg, #ffffff 0%, #f7f7ff 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(79, 70, 229, 0.1);
  transition: transform 0.2s ease;
`;

const statNumberStyle = `
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
`;

const buttonStyle = `
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  margin: 24px 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
`;

// Add batch processing configuration
const BATCH_SIZE = 10; // Process 10 users at a time
const BATCH_DELAY = 1000; // 1 second delay between batches
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function for delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for exponential backoff retry
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Retrying operation in ${delay}ms... (${retries} retries left)`);
    await sleep(delay);
    return withRetry(operation, retries - 1, delay * 2);
  }
}

// Process users in batches
async function processBatch(profiles: any[], startIdx: number) {
  const batch = profiles.slice(startIdx, startIdx + BATCH_SIZE);
  const results = [];

  for (const profile of batch) {
    try {
      console.log(`Processing email for: ${profile.email} (Batch ${Math.floor(startIdx / BATCH_SIZE) + 1})`);
      
      const result = await withRetry(async () => {
        const emailResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: profile.email,
          subject: 'Save Time on Your Studies Today 🚀',
          html: `
            <div style="${baseEmailStyle}">
              <div style="${headerStyle}">
                <img src="https://www.notelo-ai.com/logo.png" alt="Notelo AI" style="${logoStyle}" />
                <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  Ready to Save Time, ${profile.full_name || 'there'}?
                </h1>
              </div>

              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 32px 0;">
                Did you know? Students using Notelo save an average of 5 hours per week on their studies. 
                That's more time for understanding complex topics, preparing for exams, or simply taking a well-deserved break.
              </p>

              <div style="background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 32px; margin: 32px 0; border: 1px solid rgba(79, 70, 229, 0.1);">
                <h2 style="color: #1F2937; font-size: 24px; margin: 0 0 24px 0; font-weight: 600;">Today's Study Tip</h2>
                <div style="display: flex; align-items: start; gap: 16px;">
                  <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-center; color: white; font-size: 20px; flex-shrink: 0;">💡</div>
                  <p style="color: #4B5563; font-size: 16px; margin: 0; flex-grow: 1;">
                    Upload your lecture notes or textbook chapters to Notelo for instant summaries and quizzes. 
                    Our AI will help you identify key concepts and test your understanding.
                  </p>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://www.notelo-ai.com/dashboard" style="${buttonStyle}">
                  Start Learning Now
                </a>
              </div>

              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(107, 114, 128, 0.1); text-align: center; color: #6B7280; font-size: 14px;">
                <p style="margin: 0 0 8px 0;">Best regards,</p>
                <p style="margin: 0; font-weight: 600; color: #4F46E5;">William</p>
                <p style="margin: 4px 0 0 0; color: #6B7280;">Founder, Notelo AI</p>
                <p style="margin-top: 24px; font-size: 12px;">
                  <a href="https://www.notelo-ai.com/settings" style="color: #6B7280; text-decoration: underline;">
                    Manage email preferences
                  </a>
                </p>
              </div>
            </div>
          `,
          replyTo: REPLY_TO_EMAIL,
        });

        if (emailResult.error) throw emailResult.error;

        // Update last_daily_email_sent
        await supabase
          .from('email_preferences')
          .update({ last_daily_email_sent: new Date().toISOString() })
          .eq('id', profile.id);

        return profile.email;
      });

      results.push(result);
      console.log(`Successfully processed email for: ${profile.email}`);
    } catch (error) {
      console.error(`Error processing email for ${profile.email}:`, error);
      results.push(null);
    }

    // Small delay between individual emails in the batch
    await sleep(100);
  }

  return results;
}

serve(async (req) => {
  try {
    console.log('Starting daily email function with config:', {
      supabaseUrl,
      resendApiKey: !!resendApiKey,
      fromEmail: FROM_EMAIL
    });

    // Get eligible users
    const { data: users, error: usersError } = await supabase
      .from('email_preferences')
      .select('id, last_daily_email_sent')
      .eq('daily_emails_enabled', true)
      .or(
        'last_daily_email_sent.is.null,last_daily_email_sent.lt.' +
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

    if (usersError) throw usersError;

    if (!users?.length) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No eligible users found',
        emailsSent: [],
        totalAttempted: 0,
        totalSuccessful: 0 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', users.map(u => u.id));

    if (profilesError) throw profilesError;
    if (!profiles?.length) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No profiles found for eligible users',
        emailsSent: [],
        totalAttempted: 0,
        totalSuccessful: 0 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Process in batches
    const allResults = [];
    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(profiles.length / BATCH_SIZE)}`);
      const batchResults = await processBatch(profiles, i);
      allResults.push(...batchResults);
      
      // Delay between batches
      if (i + BATCH_SIZE < profiles.length) {
        await sleep(BATCH_DELAY);
      }
    }

    const successfulEmails = allResults.filter(Boolean);
    console.log('Email sending completed:', {
      totalAttempted: profiles.length,
      totalSuccessful: successfulEmails.length
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent: successfulEmails,
      totalAttempted: profiles.length,
      totalSuccessful: successfulEmails.length 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 