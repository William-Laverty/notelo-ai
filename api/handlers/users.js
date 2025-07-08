/**
 * User Event Handlers
 * 
 * Tracks user lifecycle events including registration and onboarding completion.
 * Sends conversion data to Reddit for marketing attribution and analytics.
 */

// User registration handlers with Reddit conversion tracking

import { trackRedditConversion } from '../redditConversions';

/**
 * Handler for user registration completion
 * Called after a user's account is successfully created
 */
export async function handleUserRegistrationComplete(req, res) {
  const { userId, email, conversionId } = req.body;
  
  try {
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Track the signup conversion event in Reddit
    // Use the same conversion ID as client-side for deduplication
    await trackRedditConversion({
      eventType: 'signup',
      conversionId, // This should match the client-side conversion ID format
      email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handler for onboarding completion
 * Called after a user completes the onboarding process
 */
export async function handleOnboardingComplete(req, res) {
  const { userId, email, conversionId } = req.body;
  
  try {
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Track the onboarding completion event in Reddit
    await trackRedditConversion({
      eventType: 'Custom',
      customEventName: 'onboarding_completed',
      conversionId, // This should match the client-side conversion ID
      email,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 