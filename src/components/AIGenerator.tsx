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

      const prompt = `
あなたは日本の抗がん剤専門医療AIアシスタントです。以下の提供情報（PDF抽出テキスト・URL・手入力）を最優先で参照し、さらに日本国内の添付文書・薬事承認情報・保険適用ルールの知識を活用して、正確な抗癌剤レジメン（治療計画）をJSONで生成してください。

【絶対ルール】
1. 提供データ優先順位: [1]PDF抽出テキスト → [2]URL情報 → [3]手入力 → [4]知識補完（日本の添付文書・ガイドライン）
2. 疾患名・薬剤名は提供データから正確に引用。捏造・類似薬への置換は禁止。
3. 薬剤名は「一般名（商品名）」形式（例: ポラツズマブベドチン（ポライビー）、リツキシマブ（リツキサン））。
4. dose=数値のみ（単位なし）、単位はdose_unitへ（例: dose=375, dose_unit=mg/m2）。
5. 点滴製剤の希釈液は抗がん剤と別の独立したitem行として必ず追加すること。
   例) item①リツキシマブ → item②生理食塩液250mL（dose=250, dose_unit=mL, administration_method=点滴）
6. infusion_rateは必ず記載（PDFから抽出し、なければ日本添付文書の標準を補完）:
   主な標準例: リツキシマブ初回4時間以上/2回目以降90分 / パクリタキセル3時間 / カルボプラチン1時間 / シクロホスファミド30分 / ドキソルビシン静注 / ポラツズマブベドチン90分（初回）以降30分短縮可 / オビヌツズマブ初回日1は25mg/h→後半50mg/h・2回目以降100mg/hから開始
7. excel_display_hintに必ず投与日を記載（例: Day 1, Day 1・8・15, Day 1-5）。
8. groupsは実際の投与順に並べる: 前投薬 → フラッシュ → 本体抗がん剤 → 後フラッシュ → 支持療法。
9. 日本保険診療準拠の投与量・投与方法・コース間隔を正確に記載すること。
10. regimen_support_info全項目を日本の添付文書・ガイドライン（JSCO・日本血液学会・NCCN日本版等）に基づき詳細記載。
11. 出力は純粋なJSONのみ。マークダウン記号・説明文は一切含めないこと。

[入力情報]
URL参照: ${url}
${extractedText}

[出力JSONスキーマ（厳守）]
{
  "regimen_core": {
    "regimen_name": "正式レジメン名（例: Pola-BR療法、R-CHOP療法）",
    "cancer_type": "日本保険病名準拠の疾患名（例: びまん性大細胞型B細胞リンパ腫）",
    "treatment_purpose": "治療目的（例: 再発難治、一次治療、寛解導入）",
    "inpatient_outpatient": "入院 または 外来",
    "interval_days": 21,
    "reference_sources": "添付文書・ガイドライン名・論文",
    "courses": [
      {
        "course_id": "生成UUID",
        "course_name": "本コース",
        "groups": [
          {
            "group_id": "生成UUID",
            "sort_order": 1,
            "group_no": "1",
            "group_name": "グループ名（例: 前投薬、リツキシマブ、CHOP本体）",
            "group_type": "前投薬 または 抗癌剤 または 支持療法 または フラッシュ または 経口 または 補液 または その他",
            "items": [
              {
                "item_id": "生成UUID",
                "drug_name_display": "一般名（商品名）形式。希釈液も独立item（例: 生理食塩液250mL）",
                "administration_method": "経口 または 静注 または 点滴 または 皮下注 または 筋注 または 髄注",
                "dose": "数値のみ",
                "dose_unit": "mg/kg または mg/m2 または mg/body または AUC または mL または 錠 または カプセル または 瓶 または 手入力",
                "infusion_rate": "投与時間（例: 30分、90分、3時間、全開滴下）必須記載",
                "schedule": {
                  "repeat_pattern": "単回 または 連日 または 指定日 または 毎週",
                  "day_start": 1,
                  "excel_display_hint": "投与日（例: Day 1, Day 1・8・15, Day 1-5）"
                },
                "comments": [{
                  "comment_type": "前投薬 または 時間指定 または 注意 または 運用 または 任意",
                  "text": "注意事項・補足（例: アレルギー反応出現時は速度を落とすか中止）"
                }]
              }
            ]
          }
        ]
      }
    ]
  },
  "regimen_support_info": {
    "basic_info": "レジメン概要・エビデンス（試験名・主要論文・奏効率等）",
    "indications": "日本国内承認の保険適用適応症（添付文書準拠）",
    "contraindications": "禁忌事項（日本添付文書準拠: 過敏症・妊娠・重篤な臓器障害等）",
    "start_criteria": "投与開始基準（PS・血液検査値・臓器機能など定量的基準）",
    "stop_criteria": "投与中止・延期基準（CTCAEグレードや具体的な閾値）",
    "dose_reduction": "減量・休薬基準（グレードと対応する投与量の変更方法）",
    "adverse_effects_and_management": "主な副作用と対処法（発生頻度・グレード・具体的な対処を含む）",
    "references": "参考文献（日本の添付文書・JSCO・日本血液学会ガイドライン・主要論文）"
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
