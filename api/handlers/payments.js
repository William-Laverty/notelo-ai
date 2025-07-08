/**
 * Payment Confirmation Handler
 * 
 * Processes PayPal subscription confirmations and updates user accounts.
 * Updates database with subscription status and tracks purchase conversions.
 */

// PayPal payment confirmation handler with Reddit conversion tracking

import { supabase } from '../../lib/supabase-client';
import { trackRedditConversion } from '../redditConversions';

/**
 * Handler for PayPal subscription confirmation
 * This is called when a user successfully subscribes via PayPal
 */
export async function handlePayPalSubscriptionConfirmation(req, res) {
  const { subscriptionId, userId, userEmail } = req.body;
  
  try {
    if (!subscriptionId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Update subscription in database
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_id: subscriptionId,
        subscription_status: 'active',
        subscription_tier: 'pro',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }
    
    // Track conversion in Reddit - both server-side and client-side using the same ID
    if (userEmail) {
      // Use the same conversion ID as client-side for deduplication
      const conversionId = subscriptionId;
      
      await trackRedditConversion({
        eventType: 'Purchase',
        conversionId,
        email: userEmail,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        value: 5.99,
        currency: 'USD'
      });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling PayPal confirmation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 