/**
 * Onboarding Completion Handler
 * 
 * Tracks when users complete the onboarding process.
 * Sends conversion events to Reddit for marketing attribution.
 */

const { trackRedditConversion } = require('../redditConversions');

/**
 * Handle onboarding completion tracking for Reddit conversions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function handleOnboardingComplete(req, res) {
  try {
    const { userId, email, conversionId } = req.body;
    
    if (!userId || !email || !conversionId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get IP and user agent for tracking
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Track the Reddit conversion server-side
    await trackRedditConversion({
      eventType: 'OnboardingComplete',
      conversionId,
      email,
      ipAddress,
      userAgent,
      value: 0,
      currency: 'USD'
    });

    console.log(`Server-side Reddit conversion tracked for onboarding completion: ${conversionId}`);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking onboarding completion:', error);
    res.status(500).json({ error: 'Failed to track onboarding completion' });
  }
}

module.exports = {
  handleOnboardingComplete
}; 