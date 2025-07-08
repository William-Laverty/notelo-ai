-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create a function to invoke the Edge Function
CREATE OR REPLACE FUNCTION invoke_send_daily_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_ref text := 'weodkcsttesppiumeqnp';
  -- This is your Supabase anon key from your .env file
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb2RrY3N0dGVzcHBpdW1lcW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2ODEwMDIsImV4cCI6MjA1MjI1NzAwMn0.B76BB40cQVAt4T4llwly2R7JBDy6jrc8ZtDTZ3Ewn74';
BEGIN
  -- Log the start of the function
  RAISE NOTICE 'Starting daily email send at %', now();
  
  PERFORM net.http_post(
    url := 'https://' || project_ref || '.supabase.co/functions/v1/send-daily-emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || anon_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'
  );
  
  -- Log the completion
  RAISE NOTICE 'Completed daily email send at %', now();
END;
$$;

-- Drop existing schedule if it exists
SELECT cron.unschedule('send-daily-emails');

-- Schedule the cron job to run daily at 9 AM UTC
SELECT cron.schedule(
  'send-daily-emails',           -- name of the cron job
  '0 9 * * *',                  -- cron schedule (9 AM UTC daily)
  'SELECT invoke_send_daily_emails()'  -- SQL to execute
); 