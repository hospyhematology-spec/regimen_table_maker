import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Regimen, RegimenCore, RegimenSupportInfo, Course } from '../types';
import { Sparkles, Upload, Globe, FileText, Loader2, Key } from 'lucide-react';
import { extractTextFromPdf, callGeminiAPI } from '../gemini';
import { v4 as uuidv4 } from 'uuid';

interface AIGeneratorProps {
  onSelect: () => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onSelect }) => {
  const { setCurrentRegimen, regimens, setRegimens } = useRegimenStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  // ハードコードされた固定のAPI Key
  const apiKey = 'AIzaSyD50aoZC0Le6yUvUmmZ_GCE91gQrN4V_aU';

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('Gemini API Keyが設定されていません。');
      return;
    }
    
    if (files.length === 0 && !url && !text) {
      alert('PDFファイル、URL、テキストのいずれかを入力してください。');
      return;
    }

    setIsGenerating(true);

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

      const prompt = `
以下の情報は抗癌剤のガイドラインや添付文書です。これを読み取り、正確なレジメン（治療計画）を構成し、JSON形式で出力してください。血液がんや固形がんなど、書かれている病名や薬剤名を最優先で正確に抽出してください。PDFの内容にない薬剤は絶対に出力しないでください。

[入力情報]
URL参照: ${url}
${extractedText}

[出力JSONスキーマ（厳守・余計なマークダウンや説明は不要で純粋なJSONのみ出力）]
{
  "regimen_core": {
    "regimen_name": "...",
    "cancer_type": "...",
    "treatment_purpose": "...",
    "inpatient_outpatient": "入院 / 外来",
    "interval_days": 21,
    "reference_sources": "...",
    "courses": [
      {
        "course_id": "必須（任意のUUID文字列）",
        "course_name": "コース名",
        "groups": [
          {
            "group_id": "必須",
            "sort_order": 1,
            "group_no": "1",
            "group_name": "前投薬など",
            "group_type": "前投薬 / 抗癌剤 / 支持療法 / 補液 / その他",
            "items": [
              {
                "item_id": "必須",
                "drug_name_display": "薬剤名",
                "administration_method": "経口 / 静注 / 点滴 / 皮下注など",
                "dose": "数字のみ",
                "dose_unit": "mg/m2 / mg/body / mg/kg / AUCなど",
                "base_solution": "溶解液など",
                "schedule": { "repeat_pattern": "単回", "day_start": 1 },
                "comments": [{ "comment_type": "時間指定", "text": "〜分かけて" }]
              }
            ]
          }
        ]
      }
    ]
  },
  "regimen_support_info": {
    "basic_info": "...",
    "indications": "適応",
    "contraindications": "禁忌",
    "start_criteria": "開始基準",
    "stop_criteria": "中止基準",
    "dose_reduction": "減量・休薬基準",
    "adverse_effects_and_management": "副作用"
  }
}
`;

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
