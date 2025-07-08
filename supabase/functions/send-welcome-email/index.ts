// Supabase Edge Function to send welcome emails to users
// I built this to send welcome emails to users who sign up.
// It worked. But not very well so gave up.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend'

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!resendApiKey) throw new Error('Missing RESEND_API_KEY');
if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
if (!supabaseServiceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Use verified Notelo domain
const FROM_EMAIL = 'william@notelo-ai.com';
const REPLY_TO_EMAIL = 'william@notelo-ai.com';

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

serve(async (req) => {
  try {
    const { userId, email, fullName } = await req.json();

    if (!userId || !email) {
      throw new Error('Missing required user data');
    }

    console.log('Sending welcome email to:', email);

    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Notelo AI! 🎉',
      html: `
        <div style="${baseEmailStyle}">
          <div style="${headerStyle}">
            <img src="https://www.notelo-ai.com/logo.png" alt="Notelo AI" style="${logoStyle}" />
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              Welcome to Notelo AI, ${fullName || 'there'}!
            </h1>
          </div>

          <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 32px 0;">
            We're excited to have you on board! Notelo AI is here to help you learn more effectively and save valuable time while studying.
          </p>

          <div style="background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 32px; margin: 32px 0; border: 1px solid rgba(79, 70, 229, 0.1);">
            <h2 style="color: #1F2937; font-size: 24px; margin: 0 0 24px 0; font-weight: 600;">Getting Started is Easy</h2>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">📄</div>
                <p style="color: #4B5563; font-size: 16px; margin: 0;">Upload your study material (PDF, video, or URL)</p>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">🤖</div>
                <p style="color: #4B5563; font-size: 16px; margin: 0;">Get AI-powered summaries and quizzes</p>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">📈</div>
                <p style="color: #4B5563; font-size: 16px; margin: 0;">Track your progress and improve your learning</p>
              </div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="https://www.notelo-ai.com/dashboard" style="${buttonStyle}">
              Start Learning Now
            </a>
          </div>

          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 32px 0; padding: 24px; background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid rgba(79, 70, 229, 0.1);">
            If you have any questions, just reply to this email - I'm here to help!
          </p>

          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(107, 114, 128, 0.1); text-align: center; color: #6B7280; font-size: 14px;">
            <p style="margin: 0 0 8px 0;">Best regards,</p>
            <p style="margin: 0; font-weight: 600; color: #4F46E5;">William</p>
            <p style="margin: 4px 0 0 0; color: #6B7280;">Founder, Notelo AI</p>
          </div>
        </div>
      `,
      replyTo: REPLY_TO_EMAIL,
    });

    if (emailResult.error) {
      throw emailResult.error;
    }

    console.log('Welcome email sent successfully to:', email);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome email sent successfully',
      email 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 