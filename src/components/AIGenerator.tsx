import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Regimen, RegimenCore, RegimenSupportInfo, Course } from '../types';
import { Sparkles, Upload, Globe, FileText, Loader2, Key } from 'lucide-react';
import { extractTextFromPdf, callGeminiAPI } from '../gemini';
import { v4 as uuidv4 } from 'uuid';
import { buildRegimenPrompt } from '../promptBuilder';

interface AIGeneratorProps {
  onSelect: () => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onSelect }) => {
  const { setCurrentRegimen, regimens, setRegimens, currentRegimen } = useRegimenStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Gemini API Keyを入力してください。');
      return;
    }
    
    if (files.length === 0 && !url && !text) {
      alert('PDFファイル、URL、テキストのいずれかを入力してください。');
      return;
    }

    setIsGenerating(true);
    localStorage.setItem('gemini_api_key', apiKey);

    const fileNames = files.map(f => f.name).join(', ');
    const sources = [
      fileNames ? `PDF: ${fileNames}` : '',
      url ? `URL: ${url}` : '',
      text ? `手入力: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}` : ''
    ].filter(Boolean).join(' / ');

    const basicInfo = `【AIによって生成された情報です。適宜修正してください。】\n\n入力元データ:\n${
      files.length > 0 ? `・ファイル: ${fileNames}\n` : ''
    }${url ? `・Web: ${url}\n` : ''}${text ? `・手入力テキスト: あり\n\n${text}` : ''}`;

    try {
      let extractedText = text ? `【手入力テキスト】\n${text}\n\n` : '';
      
      for (const file of files) {
        extractedText += `【PDF: ${file.name}】\n`;
        const pdfText = await extractTextFromPdf(file);
        extractedText += pdfText + '\n\n';
      }

      // Pass Step1 inputs so AI uses them for emetogenic risk, multi-course, etc.
      const regimenName = currentRegimen?.regimen_core?.regimen_name || '';
      const cancerType = currentRegimen?.regimen_core?.cancer_type || '';
      const prompt = buildRegimenPrompt(url, extractedText, regimenName, cancerType);

      const responseText = await callGeminiAPI(apiKey, prompt);
      const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

      const generatedRegimen: Regimen = {
        schema_version: '1.0',
        app_version: '1.0.0',
        regimen_id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        regimen_core: Object.assign({}, parsed.regimen_core, { reference_sources: sources }),
        regimen_support_info: Object.assign({}, parsed.regimen_support_info, { basic_info: basicInfo + '\n' + (parsed.regimen_support_info?.basic_info || '') })
      };
      
      // Assign UUIDs if missing
      generatedRegimen.regimen_core.courses?.forEach((c: any) => {
        if (!c.course_id) c.course_id = uuidv4();
        c.groups?.forEach((g: any) => {
          if (!g.group_id) g.group_id = uuidv4();
          g.items?.forEach((i: any) => {
            if (!i.item_id) i.item_id = uuidv4();
          });
        });
      });

      setRegimens([...regimens, generatedRegimen]);
      setCurrentRegimen(generatedRegimen);
      setIsGenerating(false);
      alert('AIによるレジメンの生成が完了しました！内容を確認してください。');
      onSelect();
    } catch (err: any) {
      console.error(err);
      alert('AI生成に失敗しました: ' + err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-2 mb-6 text-blue-800 font-bold">
        <Sparkles size={20} className="text-yellow-500 fill-yellow-500" />
        <h3>AIレジメン自動生成</h3>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-yellow-800 font-bold">
              <Key size={18} />
              <span className="text-sm">Gemini API Key (必須)</span>
            </div>
            {apiKey && (
              <button 
                className="text-xs text-yellow-700 underline hover:text-yellow-600"
                onClick={() => {
                  setApiKey('');
                  localStorage.removeItem('gemini_api_key');
                }}
              >
                クリア(削除)
              </button>
            )}
          </div>
          <input 
            type="password" 
            className="input text-sm" 
            placeholder="AI処理に必須（API Keyを入力）"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="text-[10px] text-yellow-700 mt-1 leading-relaxed">
            <p className="font-bold border-b border-yellow-200 pb-1 mb-1">【セキュリティについて】</p>
            <ul className="list-disc pl-3">
              <li>入力したAPI Keyは、お使いの<b>ブラウザ内部（お使いのPCのみ）</b>に保存されます。</li>
              <li>当アプリの開発者や他の利用者にKeyが漏れることは<b>絶対にありません</b>。</li>
              <li>データはご自身のPCから直接、Googleのサーバー（Gemini API）のみ送信されます。</li>
              <li>使い終わったら右上の「クリア(削除)」からKeyを安全に消去できます。</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
            <Upload size={18} />
            <span className="text-sm">1. プロトコルやガイドラインのPDFを選択（複数可）</span>
          </div>
          <input 
            type="file" 
            accept=".pdf" 
            multiple
            className="input text-sm p-3 border-dashed border-2 cursor-pointer
                       file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                       file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          {files.length > 0 && (
            <div className="text-xs text-slate-500 font-medium">
              選択中のファイル: {files.map(f => f.name).join(', ')}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
            <Globe size={18} />
            <span className="text-sm">2. ガイドライン等のWebページのURL</span>
          </div>
          <input 
            type="url" 
            className="input text-base" 
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
            <FileText size={18} />
            <span className="text-sm">3. レジメンの手入力テキスト（補足情報など）</span>
          </div>
          <textarea 
            className="input min-h-[100px] text-sm" 
            placeholder="例: パクリタキセル 80mg/m2 day1,8,15..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>

      <button 
        className="btn btn-primary w-full py-4 text-lg shadow-lg disabled:opacity-50"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" /> 解析中...
          </>
        ) : (
          <>AIで入力内容からレジメンを構築する</>
        )}
      </button>
      <p className="mt-4 text-[10px] text-slate-400 text-center">
        ※ 実際のPDF内容やURLを入力して正確なAI解析を実行します。（ネット環境が必要です）
      </p>
    </div>
  );
};

export default AIGenerator;
