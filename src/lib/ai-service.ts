import { GoogleGenerativeAI } from '@google/generative-ai';
import pThrottle from 'p-throttle';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

// Add a simple in-memory cache
const cache = new Map<string, {
  result: string;
  timestamp: number;
}>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CHUNK_LENGTH = 1000; // Reduced chunk size for better quota management

// Adjust rate limiting to be more aligned with Gemini's limits
const throttle = pThrottle({
  limit: 60,    // 60 requests
  interval: 60000  // per minute
});

// Add retry logic with exponential backoff
const retry = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0 || !(error instanceof Error)) throw error;
    
    if (error.message.includes('429')) {
      console.log(`Rate limit hit, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(operation, retries - 1, delay * 2);
    }
    
    throw error;
  }
};

// Helper function to generate cache key
const generateCacheKey = (type: string, content: string): string => {
  const hash = content
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
    .toString(36);
  return `${type}-${hash}`;
};

// Helper function to split text into smaller chunks
function splitTextIntoChunks(text: string, maxChunkLength: number = MAX_CHUNK_LENGTH): string[] {
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

// Fallback summary generation when API quota is exceeded
const generateBasicSummary = (content: string): string => {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const importantSentences = sentences
    .filter(sentence => {
      const lower = sentence.toLowerCase();
      return (
        lower.includes('important') ||
        lower.includes('key') ||
        lower.includes('main') ||
        lower.includes('significant') ||
        lower.includes('essential') ||
        lower.includes('crucial') ||
        sentence.includes('This') ||
        sentence.includes('The')
      );
    })
    .slice(0, 10);

  const summary = `
# 🎯 Overview
${importantSentences.join(' ')}

# 📝 Core Concepts
- ${sentences.slice(0, 3).join('\n- ')}

# 🎓 Key Takeaways
- Focus on the main points
- Review the original content for more details
- Consider trying again later when the API quota resets
`;

  return summary;
};

// Add request tracking
let requestsInLastMinute = 0;
const requestTimes: number[] = [];

const trackRequest = () => {
  const now = Date.now();
  requestTimes.push(now);
  
  // Remove requests older than 1 minute
  const oneMinuteAgo = now - 60000;
  while (requestTimes.length > 0 && requestTimes[0] < oneMinuteAgo) {
    requestTimes.shift();
  }
  
  requestsInLastMinute = requestTimes.length;
  console.log(`Current API usage: ${requestsInLastMinute} requests in the last minute`);
};

// Update the throttled chat completion to use retry logic
const throttledChatCompletion = throttle(async (systemPrompt: string, userContent: string, type: string) => {
  return retry(async () => {
    try {
      // Check cache first
      const cacheKey = generateCacheKey(type, userContent);
      const cachedResult = cache.get(cacheKey);
      
      if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
        console.log('Using cached result for', type);
        return cachedResult.result;
      }

      console.log(`Making API request for ${type}...`);
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          }
        ],
      });
      
      const result = await chat.sendMessage(userContent);
      const response = await result.response;
      const text = response.text();

      // Cache the result
      cache.set(cacheKey, {
        result: text,
        timestamp: Date.now()
      });

      return text;
    } catch (error) {
      console.error('Chat completion error:', error);
      if (error instanceof Error && error.message.includes('429')) {
        throw error; // Let retry logic handle it
      }
      throw error;
    }
  });
});

// Update generateSummary to use request tracking
export const generateSummary = async (content: string): Promise<string> => {
  try {
    if (!content?.trim()) throw new Error('Content is required');

    // Track this request
    trackRequest();

    // If we're approaching the rate limit, add a small delay
    if (requestsInLastMinute > 50) {  // 50 is a safe threshold
      const delay = Math.floor(Math.random() * 1000) + 500;  // Random delay between 500-1500ms
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Split into smaller chunks
    const chunks = splitTextIntoChunks(content);
    let summaryContent = chunks[0]; // Use first chunk for summary

    try {
      const systemPrompt = `Create a comprehensive educational summary with the following detailed structure:

# 🎯 Overview
- Begin with "Today we'll explore [topic]..." and provide context about why this topic matters
- List 3-5 specific learning objectives that will be covered
- Create an engaging introduction that connects to the reader's existing knowledge
- Briefly outline the historical context or background of the topic (if relevant)

# 📝 Core Concepts
- Break down main ideas into clear, digestible sections
- Define any technical terms or jargon in simple language
- Provide multiple concrete examples for each main concept
- Explain the relationships between different concepts
- Include any relevant formulas, principles, or frameworks
- Address common misconceptions or challenges

# 💡 Real-World Applications
- Provide 3-4 detailed real-world examples or case studies
- Explain how professionals use these concepts in their work
- Share relevant industry applications or technological implementations
- Discuss current trends or future developments in this area
- Connect concepts to everyday experiences or familiar scenarios

# 🔍 Deep Dive
- Explore advanced aspects or interesting edge cases
- Discuss any debates or different schools of thought in the field
- Provide additional resources or references for further learning
- Include relevant statistics or research findings
- Highlight any recent developments or breakthroughs

# 🎓 Key Takeaways
- Summarize 5-7 main points learned
- Provide actionable insights or practical tips
- Suggest next steps for applying this knowledge
- Pose thought-provoking questions for reflection
- Connect these learnings to broader themes or future topics

Keep the tone engaging and conversational while maintaining academic rigor. Use analogies and metaphors to explain complex ideas. Aim to create a comprehensive resource that serves both as an introduction and a reference.`;

      const summary = await throttledChatCompletion(
        systemPrompt,
        `Please create a detailed educational summary of the following content: ${summaryContent}`,
        'summary'
      );

      if (!summary) throw new Error('No summary generated');
      return summary;

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          console.log('Rate limit reached, using fallback summary generation');
          return generateBasicSummary(content);
        }
      }
      throw error;
    }

  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error('Rate limit reached. Please try again in a few seconds.');
    }
    throw error instanceof Error ? error : new Error('Failed to generate summary');
  }
};

export const generateQuiz = async (content: string): Promise<QuizQuestion[]> => {
  try {
    if (!content?.trim()) throw new Error('Content is required');

    const chunks = splitTextIntoChunks(content);
    const quizContent = chunks[0];

    const systemPrompt = `You are a quiz generator that MUST follow these rules:
1. Generate exactly 5 multiple-choice questions based on the content
2. Each question must have exactly 4 options
3. Return ONLY valid JSON in this exact format, with no markdown backticks or other formatting:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0
    }
  ]
}
Where correctAnswer is the 0-based index of the correct option.`;

    const quizText = await throttledChatCompletion(
      systemPrompt,
      `Create quiz questions for this content: ${quizContent}`,
      'quiz'
    );
    
    if (!quizText) throw new Error('Invalid response from API');

    // Clean the response to handle potential markdown formatting
    const cleanedText = quizText
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsedQuiz = JSON.parse(cleanedText);
      const questions = parsedQuiz.questions || [];

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid quiz format');
      }

      // Validate the structure of each question
      questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
          throw new Error(`Invalid question format at index ${index}`);
        }
      });

      return questions;
    } catch (parseError) {
      console.error('Quiz parsing error:', parseError);
      throw new Error('Failed to parse quiz response');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error instanceof Error ? error : new Error('Failed to generate quiz');
  }
};

export const generateFlashcards = async (content: string): Promise<Flashcard[]> => {
  try {
    if (!content?.trim()) throw new Error('Content is required');

    const systemPrompt = `You are a flashcard generator that MUST follow these rules:
1. Generate exactly 5 flashcards based on the content
2. Each flashcard must have a front (question/term) and back (answer/definition)
3. Return ONLY valid JSON in this exact format, with no markdown backticks or other formatting:
{
  "flashcards": [
    {
      "front": "Question or term here",
      "back": "Answer or definition here"
    }
  ]
}`;

    const cardsText = await throttledChatCompletion(systemPrompt, `Create flashcards for this content: ${content}`, 'flashcards');

    if (!cardsText) throw new Error('Invalid response from API');

    // Clean the response to handle potential markdown formatting
    const cleanedText = cardsText
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsedCards = JSON.parse(cleanedText);
      const cards = parsedCards.flashcards || [];

      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error('Invalid flashcard format');
      }

      // Validate the structure of each flashcard
      cards.forEach((card, index) => {
        if (!card.front || !card.back || typeof card.front !== 'string' || typeof card.back !== 'string') {
          throw new Error(`Invalid flashcard format at index ${index}`);
        }
      });

      return cards;
    } catch (parseError) {
      console.error('Flashcard parsing error:', parseError);
      throw new Error('Failed to parse flashcard response');
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error instanceof Error ? error : new Error('Failed to generate flashcards');
  }
};

export const generateTitle = async (content: string): Promise<string> => {
  try {
    if (!content?.trim()) throw new Error('Content is required');

    const systemPrompt = "Generate a concise, descriptive title.";
    const title = await throttledChatCompletion(systemPrompt, `Create a title for: ${content.substring(0, 500)}`, 'title');

    if (!title) throw new Error('No title generated');
    return title.trim();

  } catch (error) {
    console.error('Error generating title:', error);
    throw error instanceof Error ? error : new Error('Failed to generate title');
  }
};

export async function transcribeAudio(audioFile: File): Promise<string> {
  throw new Error('Audio transcription is not supported with Gemini API');
}

export async function generateCardDescription(content: string): Promise<string> {
  try {
    const systemPrompt = "You are an expert at creating engaging content descriptions. Write a single captivating sentence (maximum 120 characters) that captures the main point of the content. The description should be clear, informative, and engaging. Return only the description text, without quotes or additional formatting.";
    
    const description = await throttledChatCompletion(
      systemPrompt,
      `Write a brief description for this content:\n\n${content.substring(0, 1000)}`,
      'description'
    );

    if (!description) {
      throw new Error('No description generated');
    }
    return description.trim();
  } catch (error) {
    console.error('Error generating description:', error);
    if (error instanceof Error) {
      throw new Error(`Description generation failed: ${error.message}`);
    }
    throw new Error('Failed to generate description');
  }
}

export const generateDemoSummary = async (content: string): Promise<string> => {
  return generateSummary(content);
};