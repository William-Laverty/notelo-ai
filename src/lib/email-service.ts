// AI GENERATED - DOES NOT WORK AND PLEASE DONT ASSESS THIS CODE

import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
// Use verified Notelo domain
const FROM_EMAIL = 'william@notelo-ai.com';
const REPLY_TO_EMAIL = 'william@notelo-ai.com';

export interface EmailTemplate {
  subject: string;
  html: string;
}

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

const footerStyle = `
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(107, 114, 128, 0.1);
  text-align: center;
  color: #6B7280;
  font-size: 14px;
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

export const welcomeEmailTemplate = (userName: string): EmailTemplate => ({
  subject: 'Welcome to Notelo AI! 🎉',
  html: `
    <div style="${baseEmailStyle}">
      <div style="${headerStyle}">
        <img src="https://www.notelo-ai.com/logo.png" alt="Notelo AI" style="${logoStyle}" />
        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          Welcome to Notelo AI, ${userName}!
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

      <div style="${footerStyle}">
        <p style="margin: 0 0 8px 0;">Best regards,</p>
        <p style="margin: 0; font-weight: 600; color: #4F46E5;">William</p>
        <p style="margin: 4px 0 0 0; color: #6B7280;">Founder, Notelo AI</p>
      </div>
    </div>
  `
});

export const dailyDigestTemplate = (userName: string, stats: any): EmailTemplate => ({
  subject: 'Your Daily Learning Update 📚',
  html: `
    <div style="${baseEmailStyle}">
      <div style="${headerStyle}">
        <img src="https://www.notelo-ai.com/logo.png" alt="Notelo AI" style="${logoStyle}" />
        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          Hi ${userName}! Here's Your Daily Update
        </h1>
      </div>

      <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 32px 0;">
        Here's a snapshot of your learning progress in the last 24 hours:
      </p>

      <div style="margin: 32px 0;">
        <div style="${statBoxStyle}">
          <div>
            <h3 style="color: #1F2937; font-size: 18px; margin: 0; font-weight: 600;">Documents Studied</h3>
            <p style="color: #6B7280; font-size: 14px; margin: 4px 0 0 0;">In the last 24 hours</p>
          </div>
          <div style="${statNumberStyle}">
            ${stats.documentsStudied || 0}
          </div>
        </div>

        <div style="${statBoxStyle}">
          <div>
            <h3 style="color: #1F2937; font-size: 18px; margin: 0; font-weight: 600;">Time Saved</h3>
            <p style="color: #6B7280; font-size: 14px; margin: 4px 0 0 0;">Using Notelo AI</p>
          </div>
          <div style="${statNumberStyle}">
            ${stats.timeSaved || 0}<span style="font-size: 16px; opacity: 0.8;"> min</span>
          </div>
        </div>

        <div style="${statBoxStyle}">
          <div>
            <h3 style="color: #1F2937; font-size: 18px; margin: 0; font-weight: 600;">Quiz Performance</h3>
            <p style="color: #6B7280; font-size: 14px; margin: 4px 0 0 0;">Average score</p>
          </div>
          <div style="${statNumberStyle}">
            ${stats.quizPerformance || 0}<span style="font-size: 16px; opacity: 0.8;">%</span>
          </div>
        </div>
      </div>

      ${stats.documentsStudied === 0 ? `
        <div style="background: linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid rgba(217, 119, 6, 0.1);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">📝</div>
            <div>
              <h3 style="color: #92400E; font-size: 18px; margin: 0 0 4px 0; font-weight: 600;">Ready to Learn?</h3>
              <p style="color: #92400E; font-size: 14px; margin: 0;">
                Upload your study material and let Notelo AI help you learn more effectively!
              </p>
            </div>
          </div>
        </div>
      ` : `
        <div style="background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid rgba(6, 95, 70, 0.1);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">🎯</div>
            <div>
              <h3 style="color: #065F46; font-size: 18px; margin: 0 0 4px 0; font-weight: 600;">Keep Going!</h3>
              <p style="color: #065F46; font-size: 14px; margin: 0;">
                You're making great progress. Upload more study material to learn even more!
              </p>
            </div>
          </div>
        </div>
      `}

      <div style="text-align: center;">
        <a href="https://www.notelo-ai.com/dashboard" style="${buttonStyle}">
          Continue Learning
        </a>
      </div>

      <div style="${footerStyle}">
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
  `
});

export const firstDocumentEmailTemplate = (userName: string): EmailTemplate => ({
  subject: 'Congratulations on Your First Document! 🎉 Special Offer Inside',
  html: `
    <div style="${baseEmailStyle}">
      <div style="${headerStyle}">
        <img src="https://www.notelo-ai.com/logo.png" alt="Notelo AI" style="${logoStyle}" />
        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          Amazing Work, ${userName}!
        </h1>
      </div>

      <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 32px 0;">
        You've just created your first AI-powered summary with Notelo. This is a huge step towards more efficient learning!
      </p>

      <div style="background: linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%); border-radius: 16px; padding: 24px; margin: 32px 0; border: 1px solid rgba(217, 119, 6, 0.1);">
        <div style="display: flex; align-items: center gap-4">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-center; color: white; font-size: 20px;">🎁</div>
          <div>
            <h3 style="color: #92400E; font-size: 20px; margin: 0 0 4px 0; font-weight: 600;">Special First-Time User Offer</h3>
            <p style="color: #92400E; font-size: 16px; margin: 0;">
              Upgrade to Pro now and save 40% - just $6.99/month!
            </p>
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 32px; margin: 32px 0; border: 1px solid rgba(79, 70, 229, 0.1);">
        <h2 style="color: #1F2937; font-size: 24px; margin: 0 0 24px 0; font-weight: 600;">With Pro, You'll Get:</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-center; color: white; font-size: 20px;">⚡️</div>
            <p style="color: #4B5563; font-size: 16px; margin: 0;">Unlimited AI summaries and quizzes</p>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-center; color: white; font-size: 20px;">🎯</div>
            <p style="color: #4B5563; font-size: 16px; margin: 0;">Priority processing for faster results</p>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-center; color: white; font-size: 20px;">📊</div>
            <p style="color: #4B5563; font-size: 16px; margin: 0;">Advanced learning analytics</p>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://www.notelo-ai.com/upgrade" style="${buttonStyle}">
          Upgrade Now - 40% Off!
        </a>
      </div>

      <div style="${footerStyle}">
        <p style="margin: 0 0 8px 0;">Best regards,</p>
        <p style="margin: 0; font-weight: 600; color: #4F46E5;">William</p>
        <p style="margin: 4px 0 0 0; color: #6B7280;">Founder, Notelo AI</p>
      </div>
    </div>
  `
});

export const dailyReminderTemplate = (userName: string): EmailTemplate => ({
  subject: 'Save Time on Your Studies Today 🚀',
  html: `
    <div style="${baseEmailStyle}">
      <div style="${headerStyle}">
        <img src="https://www.notelo-ai.com/logo.png" alt="Notelo AI" style="${logoStyle}" />
        <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          Ready to Save Time, ${userName}?
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

      <div style="${footerStyle}">
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
  `
});

export async function sendEmail(to: string, template: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
      replyTo: REPLY_TO_EMAIL,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error sending email:', error);
    return { data: null, error };
  }
}

export async function sendWelcomeEmail(user: { email: string; user_metadata?: { full_name?: string } }) {
  const userName = user.user_metadata?.full_name || 'there';
  return sendEmail(user.email, welcomeEmailTemplate(userName));
}

export async function sendDailyDigest(user: { email: string; user_metadata?: { full_name?: string } }, stats: any) {
  const userName = user.user_metadata?.full_name || 'there';
  return sendEmail(user.email, dailyDigestTemplate(userName, stats));
}

export async function sendFirstDocumentEmail(user: { email: string; user_metadata?: { full_name?: string } }) {
  const userName = user.user_metadata?.full_name || 'there';
  return sendEmail(user.email, firstDocumentEmailTemplate(userName));
}

export async function sendDailyReminder(user: { email: string; user_metadata?: { full_name?: string } }) {
  const userName = user.user_metadata?.full_name || 'there';
  return sendEmail(user.email, dailyReminderTemplate(userName));
} 