import { YoutubeTranscript } from 'youtube-transcript';
import * as pdfjsLib from 'pdfjs-dist';

interface TranscriptPart {
  text: string;
  duration: number;
  offset: number;
}

export async function extractContent(url: string, contentType: 'pdf' | 'video' | 'url'): Promise<string> {
  try {
    switch (contentType) {
      case 'video':
        // Extract YouTube video ID
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }
        
        // Get transcript
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return transcript.map((part: TranscriptPart) => part.text).join(' ');

      case 'pdf':
        // Load and parse PDF
        const pdfData = await fetch(url).then(res => res.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .filter((item: any) => typeof item.str === 'string')
            .map((item: any) => item.str)
            .join(' ');
          text += pageText + ' ';
        }
        return text.trim();

      case 'url':
        // For web content, we'll use a more reliable approach
        try {
          // First try with allorigins
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl);
          const html = await response.text();
          
          // Create a temporary element to parse the HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Remove script and style elements
          doc.querySelectorAll('script, style').forEach(el => el.remove());
          
          // Get main content (prioritize article or main content areas)
          const mainContent = doc.querySelector('article, [role="main"], main, .content, #content');
          if (mainContent?.textContent?.trim()) {
            return mainContent.textContent.trim();
          }
          
          // Fallback to body content
          const bodyContent = doc.body.textContent?.trim();
          if (bodyContent) {
            return bodyContent;
          }
        } catch (proxyError) {
          // If allorigins fails, try with another proxy
          const corsAnywhereUrl = `https://cors-anywhere.herokuapp.com/${url}`;
          const response = await fetch(corsAnywhereUrl, {
            headers: {
              'Origin': window.location.origin
            }
          });
          const html = await response.text();
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          doc.querySelectorAll('script, style').forEach(el => el.remove());
          
          const mainContent = doc.querySelector('article, [role="main"], main, .content, #content');
          if (mainContent?.textContent?.trim()) {
            return mainContent.textContent.trim();
          }
          
          return doc.body.textContent?.trim() || '';
        }
        
        throw new Error('Failed to extract content from URL');

      default:
        throw new Error('Unsupported content type');
    }
  } catch (error) {
    console.error('Content extraction error:', error);
    throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 