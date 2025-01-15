import Stripe from 'stripe';
import { handleSubscriptionChange } from './stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function handleStripeWebhook(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    throw new Error('No Stripe signature found');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      import.meta.env.VITE_STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
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