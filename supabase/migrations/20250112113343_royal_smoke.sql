/*
  # Initial Schema Setup for Notelo

  1. New Tables
    - `documents`
      - Stores uploaded documents and their metadata
      - Supports PDF, video, and URL content types
    - `summaries`
      - Stores AI-generated summaries of documents
    - `quizzes`
      - Stores generated quizzes for documents
    - `quiz_attempts`
      - Tracks user quiz attempts and scores
    - `audio_transcriptions`
      - Stores audio versions of documents
    - `user_progress`
      - Tracks user learning progress

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('pdf', 'video', 'url')),
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL,
  answers jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Audio transcriptions table
CREATE TABLE IF NOT EXISTS audio_transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  progress_percentage integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their document summaries"
  ON summaries
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = summaries.document_id
    AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can read their document quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = quizzes.document_id
    AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their quiz attempts"
  ON quiz_attempts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their audio transcriptions"
  ON audio_transcriptions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = audio_transcriptions.document_id
    AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE documents
ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0;

-- Make sure other required columns exist
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS transcript text,
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS quiz_data jsonb;