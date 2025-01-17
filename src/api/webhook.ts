import Stripe from 'stripe';
import { supabase } from '../lib/supabase-client';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function updateUserSubscription(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  console.log('Processing subscription update for customer:', customerId);
  
  // Get the user profile associated with this Stripe customer
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profileError || !profile) {
    console.error('Error finding user profile:', profileError);
    return;
  }

  console.log('Found user profile:', profile.id);

  // Map Stripe subscription status to our status
  const statusMap: { [key: string]: string } = {
    active: 'active',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    past_due: 'past_due',
    trialing: 'active',
    unpaid: 'past_due',
  };

  // Determine subscription tier from the price ID
  const priceId = subscription.items.data[0]?.price.id;
  let subscriptionTier = 'free';
  
  if (priceId === import.meta.env.VITE_STRIPE_PRICE_ID) {
    subscriptionTier = 'pro';
  } else if (priceId === import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID) {
    subscriptionTier = 'enterprise';
  }

  console.log('Updating subscription:', {
    status: statusMap[subscription.status] || 'free',
    tier: subscriptionTier,
    endDate: new Date(subscription.current_period_end * 1000).toISOString()
  });

  // Update the user's profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: statusMap[subscription.status] || 'free',
      subscription_tier: subscriptionTier,
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating user subscription:', updateError);
    throw updateError;
  }

  console.log('Successfully updated subscription for user:', profile.id);
}

export async function handleStripeWebhook(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    throw new Error('No Stripe signature found');
  }

  try {
    console.log('Constructing Stripe event with signature:', signature);
    const event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      import.meta.env.VITE_STRIPE_WEBHOOK_SECRET
    );

    console.log('Processing Stripe event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await updateUserSubscription(subscription);
        break;
      
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout session:', session.id);
        
        if (session.mode === 'subscription') {
          // Link the Stripe customer ID to the user's profile
          const { error: linkError } = await supabase
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: 'active', // Set initial status
              subscription_tier: 'pro', // Set initial tier
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.client_reference_id);

          if (linkError) {
            console.error('Error linking Stripe customer:', linkError);
            throw linkError;
          }

          console.log('Successfully linked Stripe customer to user:', session.client_reference_id);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 