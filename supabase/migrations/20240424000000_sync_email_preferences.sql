-- Insert missing email preferences for existing users
INSERT INTO email_preferences (id, daily_emails_enabled, welcome_email_sent, created_at, updated_at)
SELECT 
  p.id,
  true as daily_emails_enabled,
  false as welcome_email_sent,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
LEFT JOIN email_preferences e ON e.id = p.id
WHERE e.id IS NULL;

-- Create a logging table for email operations
CREATE TABLE IF NOT EXISTS email_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    operation text NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    status text NOT NULL,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS send_pending_welcome_emails();
DROP FUNCTION IF EXISTS send_all_welcome_emails();
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_document() CASCADE;

-- Function to call Edge Function for sending emails
CREATE OR REPLACE FUNCTION call_edge_function(
  operation text,
  user_id uuid,
  email text,
  full_name text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_ref text := 'weodkcsttesppiumeqnp';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb2RrY3N0dGVzcHBpdW1lcW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2ODEwMDIsImV4cCI6MjA1MjI1NzAwMn0.B76BB40cQVAt4T4llwly2R7JBDy6jrc8ZtDTZ3Ewn74';
  http_response RECORD;
  endpoint text;
BEGIN
  -- Determine which Edge Function to call
  CASE operation
    WHEN 'welcome_email' THEN endpoint := 'send-welcome-email';
    WHEN 'daily_email' THEN endpoint := 'send-daily-email';
    WHEN 'first_document_email' THEN endpoint := 'send-first-document-email';
    ELSE RAISE EXCEPTION 'Unknown operation: %', operation;
  END CASE;

  SELECT status, content::jsonb
  INTO http_response
  FROM net.http_post(
    'https://' || project_ref || '.supabase.co/functions/v1/' || endpoint,
    jsonb_build_object(
      'Authorization', 'Bearer ' || anon_key,
      'Content-Type', 'application/json'
    ),
    jsonb_build_object(
      'userId', user_id,
      'email', email,
      'fullName', full_name
    )
  ) AS t(status int, content text);

  -- Log the attempt
  INSERT INTO email_logs (operation, user_id, email, status, error_message)
  VALUES (
    operation,
    user_id,
    email,
    CASE 
      WHEN http_response.status BETWEEN 200 AND 299 THEN 'success'
      ELSE 'failed'
    END,
    CASE 
      WHEN http_response.status BETWEEN 200 AND 299 THEN NULL
      ELSE 'HTTP Status: ' || http_response.status || ', Response: ' || http_response.content
    END
  );

  RETURN http_response.content::jsonb;
END;
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response jsonb;
BEGIN
  -- Create email preferences
  INSERT INTO public.email_preferences (id, daily_emails_enabled, welcome_email_sent)
  VALUES (NEW.id, true, false);

  -- Send welcome email
  BEGIN
    response := call_edge_function(
      'welcome_email',
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name'
    );

    IF response->>'success' = 'true' THEN
      UPDATE email_preferences
      SET welcome_email_sent = true,
          updated_at = NOW()
      WHERE id = NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send welcome email to new user %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Function to handle new document creation
CREATE OR REPLACE FUNCTION handle_new_document()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  doc_count integer;
  response jsonb;
BEGIN
  -- Check if this is the user's first document
  SELECT COUNT(*) INTO doc_count
  FROM documents
  WHERE user_id = NEW.user_id;

  IF doc_count = 1 THEN  -- This is their first document
    -- Get user details
    SELECT p.id, p.email, p.full_name
    INTO user_record
    FROM profiles p
    WHERE p.id = NEW.user_id;

    -- Send first document email
    BEGIN
      response := call_edge_function(
        'first_document_email',
        user_record.id,
        user_record.email,
        user_record.full_name
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to send first document email to %: %', user_record.email, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_document_created
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_document();

-- Create a view for monitoring email operations
CREATE OR REPLACE VIEW email_operations_summary AS
SELECT 
  operation,
  status,
  COUNT(*) as count,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM email_logs
GROUP BY operation, status
ORDER BY operation, status;

-- Function to retry failed emails
CREATE OR REPLACE FUNCTION retry_failed_emails(operation_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_email RECORD;
  response jsonb;
  retried integer := 0;
  succeeded integer := 0;
BEGIN
  FOR failed_email IN
    SELECT DISTINCT ON (el.user_id) 
      el.user_id,
      p.email,
      p.full_name
    FROM email_logs el
    JOIN profiles p ON p.id = el.user_id
    WHERE el.status = 'failed'
    AND el.operation = operation_type
    ORDER BY el.user_id, el.created_at DESC
  LOOP
    BEGIN
      retried := retried + 1;
      response := call_edge_function(
        operation_type,
        failed_email.user_id,
        failed_email.email,
        failed_email.full_name
      );

      IF response->>'success' = 'true' THEN
        succeeded := succeeded + 1;
        
        -- Update email_preferences if it was a welcome email
        IF operation_type = 'welcome_email' THEN
          UPDATE email_preferences
          SET welcome_email_sent = true,
              updated_at = NOW()
          WHERE id = failed_email.user_id;
        END IF;
      END IF;

      -- Respect rate limits
      PERFORM pg_sleep(0.5);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to retry % for %: %', operation_type, failed_email.email, SQLERRM;
    END;
  END LOOP;

  RETURN format('Retried %s emails, %s succeeded', retried, succeeded);
END;
$$;

-- Create a function to send welcome emails to ALL existing users (one-time use)
CREATE OR REPLACE FUNCTION send_all_welcome_emails()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_ref text := 'weodkcsttesppiumeqnp';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb2RrY3N0dGVzcHBpdW1lcW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2ODEwMDIsImV4cCI6MjA1MjI1NzAwMn0.B76BB40cQVAt4T4llwly2R7JBDy6jrc8ZtDTZ3Ewn74';
  user_record RECORD;
  http_response RECORD;
  response_body jsonb;
  successful_sends integer := 0;
  failed_sends integer := 0;
  max_retries constant integer := 3;
  retry_count integer;
  retry_delay constant float := 1.0; -- 1 second delay between retries
BEGIN
  RAISE NOTICE 'Starting welcome email send process for ALL users...';

  -- Get ALL users
  FOR user_record IN 
    SELECT p.id, p.email, p.full_name
    FROM profiles p
    WHERE p.email IS NOT NULL
    ORDER BY p.created_at DESC  -- Send to newest users first
  LOOP
    BEGIN
      retry_count := 0;
      WHILE retry_count < max_retries LOOP
        BEGIN
          RAISE NOTICE 'Attempting to send welcome email to % (attempt %/%)', 
            user_record.email, retry_count + 1, max_retries;

          -- Call Edge Function to send welcome email
          SELECT status, content::jsonb
          INTO http_response
          FROM net.http_post(
            'https://' || project_ref || '.supabase.co/functions/v1/send-welcome-email',
            jsonb_build_object(
              'Authorization', 'Bearer ' || anon_key,
              'Content-Type', 'application/json'
            ),
            jsonb_build_object(
              'userId', user_record.id,
              'email', user_record.email,
              'fullName', user_record.full_name
            )
          ) AS t(status int, content text);

          -- If we get here, no error was raised
          EXIT WHEN http_response.status BETWEEN 200 AND 299;
          
          -- Handle rate limit (429) specifically
          IF http_response.status = 429 THEN
            RAISE NOTICE 'Rate limit hit, waiting % seconds before retry...', retry_delay * (retry_count + 1);
            PERFORM pg_sleep(retry_delay * (retry_count + 1));  -- Exponential backoff
            retry_count := retry_count + 1;
            CONTINUE WHEN retry_count < max_retries;
          END IF;
          
          -- Non-429 error, exit the retry loop
          EXIT;
        EXCEPTION WHEN OTHERS THEN
          retry_count := retry_count + 1;
          IF retry_count < max_retries THEN
            RAISE NOTICE 'Error on attempt %, retrying in % seconds...', 
              retry_count, retry_delay * retry_count;
            PERFORM pg_sleep(retry_delay * retry_count);
            CONTINUE;
          END IF;
          RAISE;
        END;
      END LOOP;

      -- Log the final attempt
      INSERT INTO email_logs (operation, user_id, email, status, error_message)
      VALUES (
        'welcome_email',
        user_record.id,
        user_record.email,
        CASE 
          WHEN http_response.status BETWEEN 200 AND 299 THEN 'success'
          ELSE 'failed'
        END,
        CASE 
          WHEN http_response.status BETWEEN 200 AND 299 THEN NULL
          ELSE 'HTTP Status: ' || http_response.status || ', Response: ' || http_response.content
        END
      );

      -- Mark as sent if the request was successful
      IF http_response.status BETWEEN 200 AND 299 THEN
        -- Ensure email preferences exist and update welcome_email_sent
        INSERT INTO email_preferences (id, daily_emails_enabled, welcome_email_sent, created_at, updated_at)
        VALUES (user_record.id, true, true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE
        SET welcome_email_sent = true,
            updated_at = NOW();
        
        successful_sends := successful_sends + 1;
        RAISE NOTICE 'Successfully sent welcome email to %', user_record.email;
      ELSE
        failed_sends := failed_sends + 1;
        RAISE WARNING 'Failed to send welcome email to % after % attempts. Status: %, Response: %',
          user_record.email, retry_count, http_response.status, http_response.content;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      -- Log any unexpected errors
      INSERT INTO email_logs (operation, user_id, email, status, error_message)
      VALUES (
        'welcome_email',
        user_record.id,
        user_record.email,
        'error',
        SQLERRM
      );
      
      failed_sends := failed_sends + 1;
      RAISE WARNING 'Error sending welcome email to %: %', user_record.email, SQLERRM;
    END;

    -- Respect Resend's rate limit (2 requests per second)
    PERFORM pg_sleep(0.5);  -- Wait 0.5 seconds between emails
  END LOOP;

  RETURN format('Completed: %s successful sends, %s failed sends', successful_sends, failed_sends);
END;
$$;

-- Create a function to send welcome email to new users (for future use)
CREATE OR REPLACE FUNCTION send_pending_welcome_emails()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_ref text := 'weodkcsttesppiumeqnp';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlb2RrY3N0dGVzcHBpdW1lcW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2ODEwMDIsImV4cCI6MjA1MjI1NzAwMn0.B76BB40cQVAt4T4llwly2R7JBDy6jrc8ZtDTZ3Ewn74';
  user_record RECORD;
  http_response RECORD;
  response_body jsonb;
  successful_sends integer := 0;
  failed_sends integer := 0;
  max_retries constant integer := 3;
  retry_count integer;
  retry_delay constant float := 1.0;
BEGIN
  RAISE NOTICE 'Starting welcome email send process for new users...';

  -- Get users who haven't received welcome email
  FOR user_record IN 
    SELECT p.id, p.email, p.full_name
    FROM profiles p
    JOIN email_preferences e ON e.id = p.id
    WHERE e.welcome_email_sent = false
    AND p.email IS NOT NULL
  LOOP
    BEGIN
      retry_count := 0;
      WHILE retry_count < max_retries LOOP
        BEGIN
          RAISE NOTICE 'Attempting to send welcome email to % (attempt %/%)', 
            user_record.email, retry_count + 1, max_retries;

          -- Call Edge Function to send welcome email
          SELECT status, content::jsonb
          INTO http_response
          FROM net.http_post(
            'https://' || project_ref || '.supabase.co/functions/v1/send-welcome-email',
            jsonb_build_object(
              'Authorization', 'Bearer ' || anon_key,
              'Content-Type', 'application/json'
            ),
            jsonb_build_object(
              'userId', user_record.id,
              'email', user_record.email,
              'fullName', user_record.full_name
            )
          ) AS t(status int, content text);

          -- If we get here, no error was raised
          EXIT WHEN http_response.status BETWEEN 200 AND 299;
          
          -- Handle rate limit (429) specifically
          IF http_response.status = 429 THEN
            RAISE NOTICE 'Rate limit hit, waiting % seconds before retry...', retry_delay * (retry_count + 1);
            PERFORM pg_sleep(retry_delay * (retry_count + 1));  -- Exponential backoff
            retry_count := retry_count + 1;
            CONTINUE WHEN retry_count < max_retries;
          END IF;
          
          -- Non-429 error, exit the retry loop
          EXIT;
        EXCEPTION WHEN OTHERS THEN
          retry_count := retry_count + 1;
          IF retry_count < max_retries THEN
            RAISE NOTICE 'Error on attempt %, retrying in % seconds...', 
              retry_count, retry_delay * retry_count;
            PERFORM pg_sleep(retry_delay * retry_count);
            CONTINUE;
          END IF;
          RAISE;
        END;
      END LOOP;

      -- Log the attempt
      INSERT INTO email_logs (operation, user_id, email, status, error_message)
      VALUES (
        'welcome_email',
        user_record.id,
        user_record.email,
        CASE 
          WHEN http_response.status BETWEEN 200 AND 299 THEN 'success'
          ELSE 'failed'
        END,
        CASE 
          WHEN http_response.status BETWEEN 200 AND 299 THEN NULL
          ELSE 'HTTP Status: ' || http_response.status || ', Response: ' || http_response.content
        END
      );

      -- Only mark as sent if the request was successful
      IF http_response.status BETWEEN 200 AND 299 THEN
        UPDATE email_preferences
        SET welcome_email_sent = true,
            updated_at = NOW()
        WHERE id = user_record.id;
        
        successful_sends := successful_sends + 1;
        RAISE NOTICE 'Successfully sent welcome email to %', user_record.email;
      ELSE
        failed_sends := failed_sends + 1;
        RAISE WARNING 'Failed to send welcome email to % after % attempts. Status: %, Response: %',
          user_record.email, retry_count, http_response.status, http_response.content;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      -- Log any unexpected errors
      INSERT INTO email_logs (operation, user_id, email, status, error_message)
      VALUES (
        'welcome_email',
        user_record.id,
        user_record.email,
        'error',
        SQLERRM
      );
      
      failed_sends := failed_sends + 1;
      RAISE WARNING 'Error sending welcome email to %: %', user_record.email, SQLERRM;
    END;

    -- Respect Resend's rate limit (2 requests per second)
    PERFORM pg_sleep(0.5);  -- Wait 0.5 seconds between emails
  END LOOP;

  RETURN format('Completed: %s successful sends, %s failed sends', successful_sends, failed_sends);
END;
$$; 