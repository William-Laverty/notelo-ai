-- Add usage_count column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Update existing rows to have a default value of 0
UPDATE profiles 
SET usage_count = 0 
WHERE usage_count IS NULL; 