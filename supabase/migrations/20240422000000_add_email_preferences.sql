-- Create email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    welcome_email_sent boolean DEFAULT false,
    daily_emails_enabled boolean DEFAULT true,
    last_daily_email_sent timestamptz,
    email_frequency interval DEFAULT '1 day'::interval,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own preferences
CREATE POLICY "Users can read own email preferences"
    ON email_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Create policy to allow users to update their own preferences
CREATE POLICY "Users can update own email preferences"
    ON email_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Create function to automatically create email preferences on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.email_preferences (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_email_preferences_updated_at
    BEFORE UPDATE ON email_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 