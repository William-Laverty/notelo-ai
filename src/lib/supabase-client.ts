import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Document {
  id: string;
  title: string;
  content_type: 'pdf' | 'video' | 'url';
  url: string;
  summary?: string;
  transcript?: string;
  quiz_data?: QuizQuestion[];
  progress?: number;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export type Summary = {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
};

export type Quiz = {
  id: string;
  document_id: string;
  questions: {
    question: string;
    options: string[];
    correct_answer: number;
  }[];
  created_at: string;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  score: number;
  answers: Record<string, number>;
  created_at: string;
};

export type AudioTranscription = {
  id: string;
  document_id: string;
  audio_url: string;
  created_at: string;
};

export type UserProgress = {
  id: string;
  document_id: string;
  progress_percentage: number;
  last_accessed: string;
};

export type Database = {
  public: {
    tables: {
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
    };
  };
};