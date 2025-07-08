// Reddit Conversions API Integration
// This file handles server-side conversion tracking for Reddit Ads

require('dotenv').config();
const fetch = require('node-fetch');

// Reddit Ads API configuration
const REDDIT_ACCOUNT_ID = process.env.REDDIT_ACCOUNT_ID || 'a2_gfgsrrd4ug2t';
const REDDIT_PIXEL_ID = process.env.REDDIT_PIXEL_ID || 'a2_gfgsrrd4ug2t';

// JWT Token for Reddit API authentication
const REDDIT_JWT_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwiZXhwIjo0OTAxMTc5NTI5LjQ5OTExOSwiaWF0IjoxNzQ1NDE5NTI5LjQ5OTExOSwianRpIjoiYjYyZk1MM2NSOFhiVWJVZjFhamtDWG9ieVBZTXh3IiwiY2lkIjoiMVExRU96VFBXbll2ZXJocHR2Z1dzUSIsImxpZCI6InQyXzFuczFwMnA5aTMiLCJhaWQiOiJ0Ml8xbnMxcDJwOWkzIiwibGNhIjoxNzQ1MjQyMjc3MTA2LCJzY3AiOiJlSnlLVmtwTUtVN096eXRMTFNyT3pNOHJWb29GQkFBQV9fOUJGZ2J1IiwiZmxvIjoxMCwibGwiOnRydWV9.QD5lxVCrGdr5seOYLQ7R5ESjZnpZvIwp5HPfH7hYvRTjxpkL75sNLg2bOK_J4QD-fB3RuqXmA1U8veUPIeSmgnXX59vSge9an6lWAfK40U_-s8A8GG6FNrysaeU3I-K4dgsBr6v6foSII-yyQQqj7rqfEnypb2Dl5PKUTddj_Q2wBAGOPzQbIovYGP5-9ppmZV0GLT7sqvngbpnQspoqC27fhBP54SO-fDxPURmMc0qKHeRzciD8LCeDtklTFsUdYNrs0qT5kCA5dRshNKZfHkULErZGE6u4xCjmM6lnUxaVZ4N0a8dj_IL8xN3Au-XOhsYX-VgBx0ZwPduiqbAJ5A';

/**
 * Track a conversion event via Reddit's Conversions API using JWT authentication
 * @param {Object} options - Conversion tracking options
 * @param {string} options.eventType - Type of conversion event (e.g., 'OnboardingComplete')
 * @param {string} options.conversionId - Unique ID for this conversion
 * @param {string} options.email - User email
 * @param {string} options.ipAddress - User IP address
 * @param {string} options.userAgent - User agent string
 * @param {number} options.value - Conversion value (optional)
 * @param {string} options.currency - Currency code (optional)
 */
async function trackRedditConversion(options) {
  try {
    const {
      eventType,
      conversionId,
      email,
      ipAddress,
      userAgent,
      value = 0,
      currency = 'USD'
    } = options;

    if (!REDDIT_JWT_TOKEN || !REDDIT_ACCOUNT_ID || !REDDIT_PIXEL_ID) {
      console.warn('Reddit API credentials not configured');
      return;
    }

    // Prepare event data
    const eventData = {
      event_type: eventType,
      event_time: Math.floor(Date.now() / 1000),
      event_id: conversionId,
      user_data: {
        email_hash: hashEmail(email),
        ip: ipAddress,
        user_agent: userAgent
      },
      custom_data: {
        value,
        currency
      }
    };

    // Send to Reddit's Conversions API with JWT authentication
    const response = await fetch(`https://ads-api.reddit.com/api/v2/accounts/${REDDIT_ACCOUNT_ID}/pixels/${REDDIT_PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REDDIT_JWT_TOKEN}`
      },
      body: JSON.stringify({
        events: [eventData]
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${JSON.stringify(result)}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error tracking Reddit conversion:', error);
    throw error;
  }
}

/**
 * Hash email for Reddit's API requirements (SHA256)
 * @param {string} email - Email to hash
 * @returns {string} - Hashed email
 */
function hashEmail(email) {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex');
}

module.exports = {
  trackRedditConversion
};

/**
 * Example usage:
 * 
 * // For a purchase event
 * trackRedditConversion({
 *   eventType: 'Purchase',
 *   conversionId: 'order_123456',
 *   email: 'user@example.com',
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent'],
 *   value: 59.99,
 *   currency: 'USD'
 * });
 * 
 * // For a signup event
 * trackRedditConversion({
 *   eventType: 'signup',
 *   conversionId: `signup_${userId}_${Date.now()}`,
 *   email: 'user@example.com'
 * });
 */ 