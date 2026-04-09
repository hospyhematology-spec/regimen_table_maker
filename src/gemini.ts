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
  // モデル優先順位: 2.0-flash（安定）→ 1.5-flash（フォールバック）
  const MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  const MAX_RETRIES = 2;
  const RETRY_DELAY_MS = 4000;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 16000,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }

      const errText = await response.text();

      // 503/429 → リトライ or 次モデルへ
      if (response.status === 503 || response.status === 429) {
        if (attempt < MAX_RETRIES) {
          console.warn(`[${model}] ${response.status} (試行${attempt}/${MAX_RETRIES}) – ${RETRY_DELAY_MS/1000}秒後にリトライ...`);
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
          continue;
        }
        // このモデルは断念して次のモデルへ
        console.warn(`[${model}] ${response.status} – 次のモデルに切り替えます`);
        break;
      }

      // 認証・権限エラーは即座に中断
      if (response.status === 401 || response.status === 403) {
        throw new Error(`APIキーが無効または権限がありません（${response.status}）。\nAPI Keyを再確認してください。`);
      }
      if (response.status === 400) {
        throw new Error(`APIリクエストエラー（400）。\n詳細: ${errText.substring(0, 200)}`);
      }

      console.warn(`[${model}] Error ${response.status} – 次のモデルに切り替えます`);
      break; // 次モデルへ
    }
  }

  throw new Error('Gemini APIが混雑しています。\n数分待ってから再度お試しください。\n（全モデルで503/429エラーが発生しています）');
};


