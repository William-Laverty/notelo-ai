import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { action, text } = await request.json();
    
    switch (action) {
      case 'summary':
        const summary = await generateSummary(text);
        return new Response(JSON.stringify({ result: summary }), {
          headers: { 'Content-Type': 'application/json' }
        });
      
      case 'quiz':
        const quiz = await generateQuiz(text);
        return new Response(JSON.stringify({ result: quiz }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions
async function generateSummary(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that creates concise summaries."
      },
      {
        role: "user",
        content: `Please summarize the following text:\n\n${text}`
      }
    ]
  });

  return response.choices[0].message.content;
}

async function generateQuiz(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Create a multiple choice quiz based on the provided content."
      },
      {
        role: "user",
        content: `Generate 5 multiple choice questions with 4 options each for:\n\n${text}`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || '[]');
} 