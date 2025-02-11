import { extractContent } from './content-extractor';

async function testUrlExtraction() {
  const testUrls = [
    // News article
    'https://www.theverge.com/2024/3/21/24105974/apple-app-store-eu-changes-developers',
    // Blog post
    'https://medium.com/javascript-scene/composing-software-the-book-f31c77fc3ddc',
    // Documentation
    'https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions',
    // Wikipedia
    'https://en.wikipedia.org/wiki/TypeScript'
  ];

  console.log('Starting URL content extraction tests...\n');

  for (const url of testUrls) {
    console.log(`Testing URL: ${url}`);
    try {
      const content = await extractContent(url, 'url');
      console.log('Success! First 200 characters of extracted content:');
      console.log(content.slice(0, 200) + '...\n');
    } catch (error) {
      console.error(`Failed to extract content from ${url}:`, error, '\n');
    }
  }
}

// Run the tests
testUrlExtraction().catch(console.error); 