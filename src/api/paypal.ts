import { supabase } from '../lib/supabase-client';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = import.meta.env.VITE_PAYPAL_CLIENT_SECRET;
const SUBSCRIPTION_PLAN_ID = import.meta.env.VITE_PAYPAL_PLAN_ID;

interface PayPalSubscriptionResponse {
  id: string;
  status: string;
  plan_id: string;
  start_time: string;
  subscriber: {
    email_address: string;
    payer_id: string;
  };
}

async function getAccessToken() {
  try {
    console.log('Getting PayPal access token...');
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials are not properly configured');
    }

    // Create base64 encoded auth string
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);

    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayPal token error response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.error_description || data.message || 'Failed to get PayPal access token');
    }

    console.log('Successfully got PayPal access token');
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

export async function createPayPalSubscription() {
  try {
    // Return the subscription plan ID and let the PayPal Buttons component handle the rest
    return {
      planId: SUBSCRIPTION_PLAN_ID,
      clientId: PAYPAL_CLIENT_ID
    };
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    throw error;
  }
}

export async function verifyPayPalSubscription(subscriptionId: string, userId: string) {
  try {
    // Update user's profile with subscription info
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_tier: 'pro',
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        paypal_subscription_id: subscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error verifying PayPal subscription:', error);
    throw error;
  }
}

export async function cancelPayPalSubscription(subscriptionId: string) {
  try {
    console.log('Starting subscription cancellation for ID:', subscriptionId);
    
    // 1. Try to cancel with PayPal first
    try {
      console.log('Attempting to cancel subscription with PayPal...');
      const accessToken = await getAccessToken();

      const paypalResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "reason": "Not satisfied with the service"
        })
      });

      // PayPal returns 204 No Content on success
      if (paypalResponse.status === 204) {
        console.log('Successfully cancelled subscription with PayPal');
      } else {
        // Try to get error details if available
        try {
          const errorData = await paypalResponse.json();
          console.error('PayPal cancellation error:', errorData);
        } catch {
          console.error('PayPal cancellation failed with status:', paypalResponse.status);
        }
      }
    } catch (paypalError) {
      console.error('Error with PayPal cancellation:', paypalError);
    }

    // 2. Update our database regardless of PayPal response
    console.log('Updating subscription in database...');
    
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('paypal_subscription_id', subscriptionId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Update with valid subscription status
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled', // Changed from 'expired' to 'canceled' to match DB constraint
        subscription_tier: 'free',
        subscription_end_date: new Date().toISOString(),
        paypal_subscription_id: null
      })
      .eq('paypal_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription in database:', error);
      throw error;
    }

    console.log('Successfully updated subscription in database');
    return { success: true };

  } catch (error) {
    console.error('Error cancelling PayPal subscription:', error);
    throw error;
  }
} 