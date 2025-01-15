import Stripe from 'stripe';
import { supabase } from '../lib/supabase-client';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function createCheckoutSession(userId: string) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: import.meta.env.VITE_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/onboarding`,
      client_reference_id: userId,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: undefined, // Will be set by Supabase Auth
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Get metadata from the subscription
  const metadata = subscription.metadata || {};
  const userId = metadata.userId;
  if (!userId) return;

  // Update the user's profile with their subscription status
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: subscription.customer as string,
      subscription_status: subscription.status,
      subscription_tier: 'pro',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
} 