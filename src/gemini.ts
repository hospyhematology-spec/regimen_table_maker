import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    const maxPages = Math.min(pdf.numPages, 100);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => (item as any).str);
      text += strings.join(' ') + '\n';
    }
    return text;
  } catch (err) {
    console.error('PDF extraction error:', err);
    throw new Error('PDFのテキスト抽出に失敗しました。');
  }
};

/**
 * Fetch URL content via CORS proxy and extract readable text.
 * Falls back gracefully if the proxy is unavailable.
 */
export const fetchUrlContent = async (url: string): Promise<string> => {
  if (!url) return '';
  // Multiple CORS proxies to try in order
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];
  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const html = await res.text();
      // Strip HTML tags and compress whitespace
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .substring(0, 30000); // Cap at 30k chars to avoid prompt overflowu
      return text;
    } catch {
      // try next proxy
    }
  }
  return `（URL取得失敗: ${url} – AIの学習知識で補完）`;
};

export const callGeminiAPI = async (apiKey: string, prompt: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,     // Low temp = more deterministic / accurate
        maxOutputTokens: 16000,
      }
    })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error: ${response.status} ${err}`);
  }
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
