-- Add subscription fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;

-- Create an index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add a check constraint to ensure valid subscription status values
ALTER TABLE profiles
ADD CONSTRAINT chk_subscription_status 
CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'incomplete'));

-- Add a check constraint to ensure valid subscription tier values
ALTER TABLE profiles
ADD CONSTRAINT chk_subscription_tier
CHECK (subscription_tier IN ('free', 'pro', 'enterprise')); 