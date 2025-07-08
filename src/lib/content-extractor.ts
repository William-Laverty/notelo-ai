import { YoutubeTranscript } from 'youtube-transcript';
import * as pdfjsLib from 'pdfjs-dist';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import pThrottle from 'p-throttle';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Rate limit to 5 requests per minute
const throttle = pThrottle({
  limit: 5,
  interval: 60000
});

// Throttled Gemini chat completion
const throttledChatCompletion = throttle(async (systemPrompt: string, userContent: string) => {
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
  return response.text();
});

interface TranscriptPart {
  text: string;
  duration: number;
  offset: number;
}

interface ExtractedContent {
  title?: string;
  author?: string;
  date?: string;
  text: string;
  url: string;
}

interface PDFMetadata {
  info?: {
    Title?: string;
    Author?: string;
    CreationDate?: string;
    [key: string]: any;
  };
  metadata?: any;
}

async function extractUrlContent(url: string): Promise<string> {
  try {
    // Try with allorigins first
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const html = await response.text();
    
    // Create a DOM using jsdom
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Remove unwanted elements
    doc.querySelectorAll('script, style, nav, header, footer, .navigation, .menu, .sidebar, iframe').forEach(el => el.remove());

    // Initialize content array
    const contentParts: string[] = [];

    // Get the title
    const title = doc.querySelector('h1')?.textContent?.trim();
    if (title) {
      contentParts.push(title);
    }

    // Get all paragraphs and lists within main content areas
    const contentElements = doc.querySelectorAll('main p, main li, article p, article li, [role="main"] p, [role="main"] li, .content p, .content li');
    contentElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 20) { // Only include substantial paragraphs
        contentParts.push(text);
      }
    });

    // If no content found in main areas, try getting content from all paragraphs
    if (contentParts.length <= 1) {
      const allParagraphs = doc.querySelectorAll('p');
      allParagraphs.forEach(p => {
        const text = p.textContent?.trim();
        if (text && text.length > 20) {
          contentParts.push(text);
        }
      });
    }

    // If still no content, get all text from body
    if (contentParts.length <= 1) {
      const bodyText = doc.body.textContent?.trim();
      if (bodyText) {
        contentParts.push(bodyText);
      }
    }

    // Join all parts with proper spacing
    const content = contentParts
      .join('\n\n')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (!content) {
      throw new Error('No content found');
    }

    return content;

  } catch (error) {
    // Try alternative proxy if first one fails
    try {
      const altProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(altProxyUrl);
      const html = await response.text();
      
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      
      // Remove unwanted elements
      doc.querySelectorAll('script, style, nav, header, footer').forEach(el => el.remove());
      
      // Get text content from body
      const content = doc.body.textContent?.trim();
      
      if (!content) {
        throw new Error('No content found');
      }
      
      return content;
    } catch (altError) {
      throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

function extractMetadata(doc: Document, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (!element) continue;

    const content = element.getAttribute('content') || 
                   element.getAttribute('datetime') || 
                   element.textContent;
    
    if (content?.trim()) {
      return content.trim();
    }
  }
  return undefined;
}

function extractStructuredText(element: Element): string {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as Element;

  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'noscript', 'iframe',
    'nav', 'header', 'footer',
    '.ad', '.ads', '.advertisement',
    '.social-share', '.share-buttons',
    '.related-articles', '.recommended',
    '.newsletter', '.subscription',
    '.comments', '.comment-section',
    '[class*="sidebar"]', '[id*="sidebar"]',
    '[class*="menu"]', '[id*="menu"]',
    '[role="complementary"]'
  ];
  
  clone.querySelectorAll(unwantedSelectors.join(', ')).forEach(el => el.remove());

  // Function to get text content of an element while preserving some structure
  function getStructuredText(node: Element): string {
    const tagName = node.tagName.toLowerCase();
    
    // Skip empty nodes
    if (!node.textContent?.trim()) {
      return '';
    }

    // Handle different types of elements
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return `\n# ${node.textContent.trim()}\n`;
      case 'p':
        return `\n${node.textContent.trim()}\n`;
      case 'br':
        return '\n';
      case 'li':
        return `• ${node.textContent.trim()}\n`;
      case 'blockquote':
        return `\n> ${node.textContent.trim()}\n`;
      case 'pre':
      case 'code':
        return `\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n`;
      default:
        // For other elements, just get their text content
        return node.textContent.trim();
    }
  }

  // Process all child nodes and build the text content
  const textParts: string[] = [];
  clone.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote, pre, code').forEach(node => {
    const text = getStructuredText(node);
    if (text) {
      textParts.push(text);
    }
  });

  // Join all parts and clean up
  return textParts
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .trim();
}

function calculateTextScore(element: Element): number {
  const text = element.textContent || '';
  const words = text.split(/\s+/);
  
  // Base score on text characteristics
  let score = 0;
  
  // Length score (0-0.3)
  score += Math.min(words.length / 100, 0.3);
  
  // Density score (0-0.2)
  const density = words.length / (element.innerHTML?.length || 1);
  score += Math.min(density * 10, 0.2);
  
  // Link ratio penalty (0-0.2)
  const links = element.getElementsByTagName('a');
  const linkText = Array.from(links).reduce((acc, link) => acc + (link.textContent?.length || 0), 0);
  const linkRatio = linkText / (text.length || 1);
  score -= Math.min(linkRatio, 0.2);
  
  // Semantic bonus (0-0.2)
  const semanticTags = ['p', 'article', 'section', 'main', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (semanticTags.includes(element.tagName.toLowerCase())) {
    score += 0.2;
  }
  
  // Content class/id bonus (0-0.1)
  const identifier = (element.className + ' ' + element.id).toLowerCase();
  if (identifier.match(/article|content|text|body|post|entry/)) {
    score += 0.1;
  }
  
  return Math.max(0, Math.min(1, score));
}

function formatContent(metadata: Record<string, string | undefined>, content: string): string {
  const parts: string[] = [];

  // Add metadata
  if (metadata.title) {
    parts.push(`Title: ${metadata.title}`);
  }
  if (metadata.author) {
    parts.push(`Author: ${metadata.author}`);
  }
  if (metadata.date) {
    const date = new Date(metadata.date);
    parts.push(`Date: ${!isNaN(date.getTime()) ? date.toLocaleDateString() : metadata.date}`);
  }
  if (metadata.description) {
    parts.push(`Description: ${metadata.description}`);
  }
  parts.push(`Source: ${metadata.url}`);

  // Add main content
  parts.push('\n' + content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
  );

  return parts.join('\n');
}

export async function extractContent(url: string, contentType: 'pdf' | 'video' | 'url'): Promise<string> {
  try {
    let extractedContent = '';
    let metadata = '';

    switch (contentType) {
      case 'video': {
        // Extract YouTube video ID and metadata
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }

        // Fetch video metadata
        const videoInfoUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        try {
          const response = await fetch(videoInfoUrl);
          const videoInfo = await response.json();
          metadata = `Title: ${videoInfo.title}\nAuthor: ${videoInfo.author_name}\nSource: ${url}\n\n`;
        } catch (error) {
          console.warn('Failed to fetch video metadata:', error);
        }
        
        // Get transcript with timestamps
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const formattedTranscript = transcript
          .map((part: TranscriptPart) => {
            const timestamp = Math.floor(part.offset / 1000);
            const minutes = Math.floor(timestamp / 60);
            const seconds = timestamp % 60;
            return `[${minutes}:${seconds.toString().padStart(2, '0')}] ${part.text}`;
          })
          .join('\n');

        extractedContent = metadata + formattedTranscript;
        break;
      }

      case 'pdf': {
        // Load and parse PDF with metadata
        const pdfData = await fetch(url).then(res => res.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        
        // Extract PDF metadata
        const metadata = await pdf.getMetadata().catch(() => ({} as PDFMetadata));
        if (metadata?.info) {
          const info = metadata.info as PDFMetadata['info'];
          const metadataStr = [
            info?.Title && `Title: ${info.Title}`,
            info?.Author && `Author: ${info.Author}`,
            info?.CreationDate && `Date: ${info.CreationDate}`,
            `Source: ${url}`
          ].filter(Boolean).join('\n');
          extractedContent = metadataStr + '\n\n';
        }

        // Extract text content with page numbers
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          
          // Process each text item with its position
          const pageItems = content.items
            .filter((item: any) => typeof item.str === 'string' && item.str.trim())
            .map((item: any) => ({
              text: item.str,
              x: Math.round(item.transform[4]),
              y: Math.round(item.transform[5])
            }))
            .sort((a: any, b: any) => b.y - a.y || a.x - b.x) // Sort by vertical position, then horizontal
            .map((item: any) => item.text);

          // Join items and add page marker
          text += `\n[Page ${i}]\n${pageItems.join(' ')}\n`;
        }
        extractedContent += text.trim();
        break;
      }

      case 'url': {
        extractedContent = await extractUrlContent(url);
        break;
      }

      default:
        throw new Error('Unsupported content type');
    }

    // Clean up the extracted content
    extractedContent = extractedContent
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n')    // Replace multiple newlines with double newline
      .replace(/\[object Object\]/g, '') // Remove [object Object] artifacts
      .trim();

    // If content is too short, it might indicate extraction failed
    if (extractedContent.length < 100) {
      throw new Error('Extracted content is too short - extraction may have failed');
    }

    return extractedContent;

  } catch (error) {
    console.error('Content extraction error:', error);
    throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to split text into chunks
function splitTextIntoChunks(text: string, maxChunkLength: number = 30000): string[] {
  // First, split by double newlines to preserve paragraph structure
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the limit, start a new chunk
    if ((currentChunk + '\n\n' + paragraph).length > maxChunkLength && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export const generateSummary = async (content: string): Promise<string> => {
  try {
    if (!content?.trim()) throw new Error('Content is required');

    // Generate a comprehensive summary in one pass
    const systemPrompt = `You are an expert content analyzer and educator. Create a comprehensive summary that:
1. Captures the main topic and key points
2. Preserves specific details, quotes, and data
3. Maintains technical accuracy
4. Explains complex concepts clearly
5. Highlights practical applications

Structure the summary as follows:

# 📝 Main Points
- Key findings and arguments
- Important facts and data
- Significant quotes

# 💡 Analysis
- Core concepts explained
- Technical details clarified
- Relationships between ideas

# 🎓 Implications
- Practical applications
- Real-world relevance
- Key takeaways

Use clear, precise language and maintain the specificity of the original content.`;

    const summary = await throttledChatCompletion(
      systemPrompt,
      `Analyze and summarize this content, focusing on extracting and preserving specific details: \n\n${content}`
    );

    if (!summary) throw new Error('No summary generated');
    return summary;

  } catch (error) {
    console.error('Error generating summary:', error);
    throw error instanceof Error ? error : new Error('Failed to generate summary');
  }
};