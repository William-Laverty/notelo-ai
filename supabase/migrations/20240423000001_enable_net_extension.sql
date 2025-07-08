-- Create required schemas
CREATE SCHEMA IF NOT EXISTS net;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE SCHEMA IF NOT EXISTS cron;

-- Enable the extensions for making HTTP requests and cron jobs
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA net;
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA cron;

-- Grant usage permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA cron TO postgres, anon, authenticated, service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA cron TO postgres, anon, authenticated, service_role; 