import { YoutubeTranscript } from 'youtube-transcript';
import * as pdfjsLib from 'pdfjs-dist';
import pThrottle from 'p-throttle';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

// Enhanced error handling for content extraction with user-friendly messages
const handleExtractionError = (error: any, url: string): Error => {
  const errorMessage = (error?.message || '').toLowerCase();
  
  // Network/CORS errors
  if (errorMessage.includes('cors') || errorMessage.includes('blocked') || 
      errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
    return new Error(`Unable to access the webpage. The site might be blocking automated requests or there could be a network issue. Try copying the content manually or using a different URL.`);
  }
  
  // Content not found errors
  if (errorMessage.includes('no content found') || errorMessage.includes('too short') ||
      errorMessage.includes('no meaningful content')) {
    return new Error(`Could not find article content on this page. This might be a homepage, login page, or the content is dynamically loaded. Try using a direct link to an article or blog post.`);
  }
  
  // Authentication/access errors
  if (errorMessage.includes('401') || errorMessage.includes('403') || 
      errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return new Error(`This content requires authentication or is not publicly accessible. Please try a different URL or copy the content manually.`);
  }
  
  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('502') || 
      errorMessage.includes('503') || errorMessage.includes('server error')) {
    return new Error(`The website is experiencing server issues. Please try again later or use a different source.`);
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('took too long')) {
    return new Error(`The request took too long to complete. The website might be slow or overloaded. Please try again.`);
  }
  
  // Default error message
  return new Error(`Unable to extract content from this webpage. This could be due to the website's security settings, dynamic content loading, or other technical restrictions. Try copying the content manually.`);
};

async function extractUrlContent(url: string): Promise<string> {
  try {
    // Try with allorigins first
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    if (!html || html.trim().length === 0) {
      throw new Error('No content found - empty response');
    }
    
    // Create a DOM using DOMParser (browser-compatible)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove unwanted elements
    doc.querySelectorAll('script, style, nav, header, footer, .navigation, .menu, .sidebar, iframe').forEach((el: Element) => el.remove());

    // Initialize content array
    const contentParts: string[] = [];

    // Get the title
    const title = doc.querySelector('h1')?.textContent?.trim();
    if (title) {
      contentParts.push(title);
    }

    // Get all paragraphs and lists within main content areas
    const contentElements = doc.querySelectorAll('main p, main li, article p, article li, [role="main"] p, [role="main"] li, .content p, .content li');
    contentElements.forEach((element: Element) => {
      const text = element.textContent?.trim();
      if (text && text.length > 20) { // Only include substantial paragraphs
        contentParts.push(text);
      }
    });

    // If no content found in main areas, try getting content from all paragraphs
    if (contentParts.length <= 1) {
      const allParagraphs = doc.querySelectorAll('p');
      allParagraphs.forEach((p: Element) => {
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

    // Check if we have meaningful content
    if (!content || content.length < 100) {
      throw new Error('No meaningful content found - content too short');
    }

    return content;

  } catch (error) {
    console.error('Primary extraction failed:', error);
    
    // Try alternative proxy if first one fails
    try {
      const altProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(altProxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      if (!html || html.trim().length === 0) {
        throw new Error('No content found - empty response from alternative proxy');
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove unwanted elements
      doc.querySelectorAll('script, style, nav, header, footer').forEach((el: Element) => el.remove());
      
      // Get text content from body
      const content = doc.body.textContent?.trim();
      
      if (!content || content.length < 100) {
        throw new Error('No meaningful content found - content too short');
      }
      
      return content;
    } catch (altError) {
      console.error('Alternative extraction also failed:', altError);
      // Throw the most informative error
      throw handleExtractionError(error, url);
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
          throw new Error('Invalid YouTube URL - please check the URL format');
        }

        // Fetch video metadata
        const videoInfoUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        try {
          const response = await fetch(videoInfoUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch video metadata: ${response.status}`);
          }
          const videoInfo = await response.json();
          metadata = `Title: ${videoInfo.title}\nAuthor: ${videoInfo.author_name}\nSource: ${url}\n\n`;
        } catch (error) {
          console.warn('Failed to fetch video metadata:', error);
          metadata = `Source: ${url}\n\n`;
        }
        
        // Get transcript with timestamps
        try {
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
        } catch (transcriptError) {
          throw new Error('Unable to extract transcript from this video. The video might not have captions available, be private, or restricted in your region.');
        }
        break;
      }

      case 'pdf': {
        try {
          // Load and parse PDF with metadata
          const pdfData = await fetch(url).then(res => {
            if (!res.ok) {
              throw new Error(`Failed to download PDF: ${res.status} ${res.statusText}`);
            }
            return res.arrayBuffer();
          });
          
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
          
          if (!extractedContent || extractedContent.length < 200) {
            throw new Error('PDF appears to be empty or contains only images/scanned content that cannot be extracted as text');
          }
        } catch (pdfError) {
          if (pdfError instanceof Error) {
            if (pdfError.message.includes('Invalid PDF')) {
              throw new Error('The file is not a valid PDF or is corrupted. Please try a different file.');
            } else if (pdfError.message.includes('password') || pdfError.message.includes('encrypted')) {
              throw new Error('This PDF is password-protected or encrypted. Please provide an unprotected version.');
            } else if (pdfError.message.includes('download')) {
              throw new Error('Unable to download the PDF file. Check the URL and try again.');
            }
          }
          throw new Error(`Failed to extract content from PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
        }
        break;
      }

      case 'url': {
        try {
          extractedContent = await extractUrlContent(url);
        } catch (urlError) {
          // The extractUrlContent function already handles user-friendly errors
          throw urlError;
        }
        break;
      }

      default:
        throw new Error('Unsupported content type. Please use a valid PDF, YouTube URL, or webpage URL.');
    }

    // Clean up the extracted content
    extractedContent = extractedContent
      .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n')    // Replace multiple newlines with double newline
      .replace(/\[object Object\]/g, '') // Remove [object Object] artifacts
      .trim();

    // Final check for content quality
    if (extractedContent.length < 100) {
      throw new Error('Extracted content is too short - the source might not contain substantial text content');
    }

    return extractedContent;

  } catch (error) {
    console.error('Content extraction error:', error);
    
    // If it's already a user-friendly error, re-throw it
    if (error instanceof Error && (
      error.message.includes('Unable to') || 
      error.message.includes('Could not find') ||
      error.message.includes('requires authentication') ||
      error.message.includes('Invalid YouTube URL') ||
      error.message.includes('password-protected')
    )) {
      throw error;
    }
    
    // For other errors, provide a generic user-friendly message
    throw handleExtractionError(error, url);
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

    if (!summary) throw new Error('AI service returned empty response');
    return summary;

  } catch (error) {
    console.error('Error generating summary:', error);
    
    // Provide user-friendly error messages for common API issues
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        throw new Error('🔄 Our AI service is experiencing high demand. Please try again in a few minutes.');
      }
      
      if (errorMessage.includes('503') || errorMessage.includes('server') || errorMessage.includes('unavailable') ||
          errorMessage.includes('overload') || errorMessage.includes('busy')) {
        throw new Error('🔧 The AI service is temporarily busy. Please try again in a moment.');
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        throw new Error('🌐 Connection issue with the AI service. Please check your internet connection and try again.');
      }
      
      if (errorMessage.includes('empty response')) {
        throw new Error('🤖 The AI service returned an empty response. Please try again.');
      }
    }
    
    throw new Error('🤖 Unable to generate summary at this time. Please try again or contact support if the issue persists.');
  }
};