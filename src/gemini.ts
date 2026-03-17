import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    // Limit to first 100 pages to avoid context length overflow if PDF is huge, but enough for real guidelines
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

export const callGeminiAPI = async (apiKey: string, prompt: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
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
