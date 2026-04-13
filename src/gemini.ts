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
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 5000; // 5秒待ってリトライ

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 8192,
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }

    const errText = await response.text();
    let errJson;
    try {
      errJson = JSON.parse(errText);
    } catch {
      errJson = null;
    }
    const realErrorMessage = errJson?.error?.message || errText.substring(0, 300);

    // 503 または 429（ただしQuota Exceeded等でない一時的なもの）はリトライ
    if ((response.status === 503 || (response.status === 429 && !realErrorMessage.includes('quota'))) && attempt < MAX_RETRIES) {
      console.warn(`API ${response.status} エラー (試行 ${attempt}/${MAX_RETRIES})。${RETRY_DELAY_MS/1000}秒後にリトライします...\n詳細: ${realErrorMessage}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      continue;
    }

    // 原因の詳細に応じてエラーを出力
    if (response.status === 429) {
      throw new Error(`APIリクエスト制限（${response.status}）。\n現在お使いのネットワーク（IPアドレス）からのアクセス制限、または無料枠の上限に達した可能性があります。\nGoogleからのメッセージ: ${realErrorMessage}`);
    }
    if (response.status === 503) {
      throw new Error(`Geminiサーバーが混雑・過負荷です（${response.status}）。\nGoogle側のサーバーが多忙のためリクエストが拒否されました。\nGoogleからのメッセージ: ${realErrorMessage}`);
    }
    if (response.status === 400) {
      throw new Error(`リクエストエラー（${response.status}）。\n入力したPDFデータ等が大きすぎる（トークン上限）、もしくは内容が不正です。\nGoogleからのメッセージ: ${realErrorMessage}`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`APIキーが無効または権限がありません（${response.status}）。\nGoogleからのメッセージ: ${realErrorMessage}`);
    }
    
    throw new Error(`API Error: HTTPステータス ${response.status}\n詳細: ${realErrorMessage}`);
  }

  throw new Error('Gemini APIとの通信が規定回数タイムアウト・失敗しました。ネットワーク状況を確認してください。');
};

export const callOpenAIAPI = async (apiKey: string, prompt: string): Promise<string> => {
  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API Error: ${response.status}\n${err.substring(0, 300)}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
};

export const callAnthropicAPI = async (apiKey: string, prompt: string): Promise<string> => {
  const url = 'https://api.anthropic.com/v1/messages';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt + "\n\n必ずJSON形式の文字列だけを返してください。周囲にマークダウンのバッククォートなどはつけないでください。" }],
      temperature: 0.1
    })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API Error: ${response.status}\n${err.substring(0, 300)}`);
  }
  const data = await response.json();
  return data.content[0].text;
};
