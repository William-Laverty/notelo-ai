/**
 * Contact Form Handler
 * 
 * Processes contact form submissions from the website.
 * Saves messages to the database and tracks conversions via Reddit API.
 */

// Contact form submission handler with Reddit conversion tracking

import { supabase } from '../../lib/supabase-client';
import { trackRedditConversion } from '../redditConversions';

/**
 * Handler for contact form submissions
 */
export async function handleContactFormSubmission(req, res) {
  const { name, email, subject, message, conversionId } = req.body;
  
  try {
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Insert message into database
    const { error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          subject,
          message
        }
      ]);
      
    if (error) {
      console.error('Error saving contact message:', error);
      return res.status(500).json({ error: 'Failed to save message' });
    }
    
    // Track contact form submission in Reddit
    await trackRedditConversion({
      eventType: 'Custom',
      customEventName: 'contact_form_submitted',
      conversionId, // This should match the client-side conversion ID
      email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 