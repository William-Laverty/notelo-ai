import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Helper function to split text into chunks
function splitTextIntoChunks(text: string, maxChunkLength: number = 4000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export const generateSummary = async (content: string): Promise<string> => {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required');
    }

    // More precise error page detection
    const errorIndicators = [
      'CLOUDFLARE_ERROR_1000S_BOX',
      '404 - Page Not Found',
      'Access to this page has been denied',
      'Please complete the security check to access',
      'Please verify you are a human'
    ];

    const hasErrorIndicators = errorIndicators.some(indicator => 
      content.includes(indicator)
    );

    const isErrorPage = hasErrorIndicators && content.length < 1000;

    if (isErrorPage) {
      throw new Error('Invalid content: Appears to be an error page');
    }

    // Split content into chunks if it's too long
    const chunks = splitTextIntoChunks(content);
    let summaryContent = content;
    
    if (chunks.length > 1) {
      // If content is long, use the first chunk for summary
      summaryContent = chunks[0];
    }

    // Use the OpenAI client for summary generation
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert educator who creates engaging, comprehensive learning experiences. 
Your expertise spans multiple disciplines, allowing you to provide rich context and clear explanations.
Transform complex topics into accessible, interactive lessons that promote deep understanding.
Use clear markdown formatting to create an organized learning journey.

Structure your lesson as follows:

# 🎯 Overview
Begin with "Today we'll explore [topic]..." and outline clear learning objectives
Spark curiosity with an engaging hook or real-world scenario
Set expectations for what students will learn and achieve

# 📝 Core Concepts
- Break down essential ideas using clear, approachable language
- Build understanding progressively from foundational to advanced concepts
- Include memorable examples and analogies
- Check understanding with thoughtful questions throughout

# 💡 Real-World Connections
- Demonstrate practical applications and relevance
- Share case studies or scenarios students can relate to
- Guide students in connecting concepts to their own experiences
- Explore how these ideas solve real problems

# 🔍 Deeper Understanding
- Reveal fascinating insights that expand perspective
- Connect to broader themes and principles
- Challenge common assumptions
- Pose thought-provoking discussion questions
- Suggest areas for further exploration

# 🎓 Key Takeaways
- Reinforce main learning points
- Provide actionable next steps
- Include reflection questions
- Suggest ways to apply new knowledge

Teaching guidelines:
- Maintain an encouraging, enthusiastic tone
- Use clear, conversational language
- Include interactive elements and questions
- Connect ideas to students' existing knowledge
- Focus on understanding over memorization
- Create opportunities for critical thinking
- End with reflection and application challenges

Your goal is to craft an immersive learning experience that makes complex topics accessible and engaging while promoting deep understanding and practical application.`
        },
        {
          role: "user",
          content: `Create a comprehensive summary of the following content. Make it engaging and informative:

          ${summaryContent}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error('No summary generated');
    }

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof Error) {
      throw new Error(`Summary generation failed: ${error.message}`);
    }
    throw new Error('Failed to generate summary');
  }
};

export const generateQuiz = async (content: string): Promise<QuizQuestion[]> => {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a quiz generator. Create 5 multiple-choice questions based on the given content. Each question should have 4 options with only one correct answer. Make the questions test understanding, not just memorization. Return the response in a structured JSON array format without any markdown formatting."
          },
          {
            role: "user",
            content: `Generate a quiz based on this content in the following JSON format, with no markdown or code blocks:
            {
              "quiz": [
                {
                  "question": "Question text here?",
                  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                  "correctAnswer": 0
                }
              ]
            }
            
            Content: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 
        `Failed to generate quiz: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }
    
    const quizText = data.choices[0].message.content;

    // Clean up any potential markdown formatting
    const cleanedText = quizText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    try {
      const parsedQuiz = JSON.parse(cleanedText);
      // Handle both possible response formats
      const questions = parsedQuiz.quiz || (Array.isArray(parsedQuiz) ? parsedQuiz : parsedQuiz.questions);

      if (!Array.isArray(questions)) {
        console.error('Unexpected quiz structure:', parsedQuiz);
        throw new Error('Invalid quiz format: Response is not an array of questions');
      }

      if (questions.length === 0) {
        throw new Error('No questions were generated');
      }

      // Validate quiz structure
      questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
            typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid question format at index ${index}: Missing required fields or invalid values`);
        }
      });

      return questions;
    } catch (parseError) {
      console.error('Failed to parse quiz:', parseError);
      console.error('Raw quiz text:', quizText);
      throw new Error(
        parseError instanceof Error 
          ? `Failed to parse quiz response: ${parseError.message}`
          : 'Failed to parse quiz response'
      );
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    if (error instanceof Error) {
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while generating the quiz');
  }
};

export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (error instanceof Error) {
      throw new Error(`Audio transcription failed: ${error.message}`);
    }
    throw new Error('Failed to transcribe audio');
  }
}

export async function generateTitle(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating engaging, descriptive titles. Create a clear, concise title (maximum 60 characters) that captures the essence of the content. The title should be descriptive and engaging, avoiding URLs or technical terms. Return only the title text, without quotes or additional formatting."
        },
        {
          role: "user",
          content: `Generate a title for this content:\n\n${content.substring(0, 1000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    const title = response.choices[0]?.message?.content?.trim();
    if (!title) {
      throw new Error('No title generated');
    }
    return title;
  } catch (error) {
    console.error('Error generating title:', error);
    if (error instanceof Error) {
      throw new Error(`Title generation failed: ${error.message}`);
    }
    throw new Error('Failed to generate title');
  }
}

export async function generateCardDescription(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating engaging content descriptions. Write a single captivating sentence (maximum 120 characters) that captures the main point of the content. The description should be clear, informative, and engaging. Return only the description text, without quotes or additional formatting."
        },
        {
          role: "user",
          content: `Write a brief description for this content:\n\n${content.substring(0, 1000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 60
    });

    const description = response.choices[0]?.message?.content?.trim();
    if (!description) {
      throw new Error('No description generated');
    }
    return description;
  } catch (error) {
    console.error('Error generating description:', error);
    if (error instanceof Error) {
      throw new Error(`Description generation failed: ${error.message}`);
    }
    throw new Error('Failed to generate description');
  }
}

export const generateFlashcards = async (content: string): Promise<Flashcard[]> => {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a flashcard generator. Create 10 question-answer pairs based on the given content. Each flashcard should have a clear question on the front and a concise, informative answer on the back. Focus on testing understanding of key concepts, definitions, and relationships. Make the questions engaging and the answers clear and memorable."
          },
          {
            role: "user",
            content: `Generate flashcards based on this content in the following JSON format, with no markdown or code blocks:
            {
              "flashcards": [
                {
                  "front": "What is...?",
                  "back": "The answer is..."
                }
              ]
            }
            
            Content: ${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 
        `Failed to generate flashcards: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }
    
    const flashcardsText = data.choices[0].message.content;

    // Clean up any potential markdown formatting
    const cleanedText = flashcardsText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    try {
      const parsedResponse = JSON.parse(cleanedText);
      const flashcards = parsedResponse.flashcards;

      if (!Array.isArray(flashcards)) {
        console.error('Unexpected flashcards structure:', parsedResponse);
        throw new Error('Invalid flashcards format: Response is not an array of flashcards');
      }

      if (flashcards.length === 0) {
        throw new Error('No flashcards were generated');
      }

      // Validate flashcard structure
      flashcards.forEach((f, index) => {
        if (!f.front || !f.back || typeof f.front !== 'string' || typeof f.back !== 'string') {
          throw new Error(`Invalid flashcard format at index ${index}: Missing required fields or invalid values`);
        }
      });

      return flashcards;
    } catch (parseError) {
      console.error('Failed to parse flashcards:', parseError);
      console.error('Raw flashcards text:', flashcardsText);
      throw new Error(
        parseError instanceof Error 
          ? `Failed to parse flashcards response: ${parseError.message}`
          : 'Failed to parse flashcards response'
      );
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    if (error instanceof Error) {
      throw new Error(`Flashcards generation failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while generating the flashcards');
  }
};

export const generateDemoSummary = async (content: string): Promise<string> => {
  try {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required');
    }

    const chunks = splitTextIntoChunks(content);
    let summaryContent = content;
    
    if (chunks.length > 1) {
      summaryContent = chunks[0];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an experienced educator skilled at breaking down complex topics into clear, engaging lessons. 

                    Key responsibilities:
                    - Structure content as if teaching a classroom lesson
                    - Provide clear learning objectives at the start
                    - Break down concepts into digestible sections
                    - Include relevant examples and applications
                    - Use an encouraging, enthusiastic teaching tone
                    - End with key takeaways and potential discussion points

                    Format requirements:
                    - Begin with "Today we'll be exploring [topic]..."
                    - Use natural, conversational language
                    - Include thought-provoking questions throughout
                    - Maintain an educational rather than summarizing tone
                    - Avoid referencing source materials or webpages
                    - Focus on helping students grasp and retain the concepts

                    Your goal is to transform any content into an engaging educational experience that promotes understanding and sparks curiosity.`
        },
        {
          role: "user",
          content: `Create a clear and concise summary of the following content:

          ${summaryContent}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = response.choices[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error('No summary generated');
    }

    return summary;
  } catch (error) {
    console.error('Error generating demo summary:', error);
    if (error instanceof Error) {
      throw new Error(`Demo summary generation failed: ${error.message}`);
    }
    throw new Error('Failed to generate demo summary');
  }
};