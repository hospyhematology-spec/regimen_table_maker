import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Regimen, RegimenCore, RegimenSupportInfo, Course } from '../types';
import { Sparkles, Upload, Globe, FileText, Loader2, Key } from 'lucide-react';
import { extractTextFromPdf, callGeminiAPI, fetchUrlContent } from '../gemini';
import { v4 as uuidv4 } from 'uuid';
import { buildRegimenPrompt } from '../promptBuilder';

interface AIGeneratorProps {
  onSelect: () => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onSelect }) => {
  const { setCurrentRegimen, regimens, setRegimens, currentRegimen } = useRegimenStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
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



    try {
      let extractedText = text ? `【手入力テキスト】\n${text}\n\n` : '';
      
      for (const file of files) {
        extractedText += `【PDF: ${file.name}】\n`;
        const pdfText = await extractTextFromPdf(file);
        extractedText += pdfText + '\n\n';
      }

      setGenStatus('PDFテキスト抽出完了。URL情報を取得中...');
      if (url) {
        const urlText = await fetchUrlContent(url);
        extractedText += `【WebページURL: ${url}】\n${urlText}\n\n`;
      }

      setGenStatus('AIがレジメン生成中... (30秒〜2分かかる場合があります)');
      const regimenName = currentRegimen?.regimen_core?.regimen_name || '';
      const cancerType = currentRegimen?.regimen_core?.cancer_type || '';
      const prompt = buildRegimenPrompt(url, extractedText, regimenName, cancerType);

      const responseText = await callGeminiAPI(apiKey, prompt);
      
      // ── JSONクリーニング: マークダウン記号・JSONブロック外のテキストを除去 ──
      let cleanedText = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // JSON部分だけを抽出（最初の { から最後の } まで）
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.slice(jsonStart, jsonEnd + 1);
      }

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseErr) {
        console.error('JSON parse error. Raw response:', responseText.substring(0, 500));
        throw new Error(`AIの出力をJSONとして解析できませんでした。\n詳細: ${(parseErr as Error).message}\n※ APIキーが正しいか、入力内容が適切かご確認ください。`);
      }

      // ── support_info フィールド正規化 ──────────────────────────────
      // AIがstop_criteria + dose_reductionを返した場合にstop_dose_reductionへ統合
      const si = parsed.regimen_support_info || {};
      if (!si.stop_dose_reduction) {
        const stop = si.stop_criteria || '';
        const dose = si.dose_reduction || '';
        if (stop || dose) {
          si.stop_dose_reduction = [stop, dose].filter(Boolean).join('\n\n');
        } else {
          si.stop_dose_reduction = '';
        }
      }
      // 不要な旧フィールドを削除
      delete si.stop_criteria;
      delete si.dose_reduction;

      const generatedRegimen: Regimen = {
        schema_version: '1.0',
        app_version: '1.0.0',
        regimen_id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        regimen_core: Object.assign({}, parsed.regimen_core, { reference_sources: sources }),
        regimen_support_info: si
      };
      
      // ── normalize helpers ──────────────────────────────────────────
      const normDoseUnit = (v: string): string => {
        if (!v) return '手入力';
        const map: Record<string, string> = {
          'mg/m2': 'mg/m2', 'mg/m²': 'mg/m2', 'mg/m^2': 'mg/m2',
          'mg/kg': 'mg/kg',
          'mg/body': 'mg/body', 'mg': 'mg/body',
          'auc': 'AUC', 'AUC': 'AUC',
          'units/m2': 'units/m²', 'units/m²': 'units/m²',
          'iu/m2': 'IU/m²', 'iu/m²': 'IU/m²', 'IU/m2': 'IU/m²',
          'iu/kg': 'IU/kg', 'IU/kg': 'IU/kg',
          'ml': 'mL', 'mL': 'mL', 'ML': 'mL',
          '錠': '錠', '瓶': '瓶', 'カプセル': 'カプセル',
          '手入力': '手入力',
        };
        return map[v] ?? map[v.toLowerCase()] ?? '手入力';
      };
      const normMethod = (v: string): string => {
        const map: Record<string, string> = {
          '経口': '経口', 'oral': '経口', 'po': '経口',
          '静注': '静注', 'iv': '静注', 'static': '静注', '静脈注射': '静注', '静脈内': '静注',
          '点滴': '点滴', 'drip': '点滴', '点滴静注': '点滴', 'ivdrip': '点滴',
          '皮下注': '皮下注', 'sc': '皮下注', '皮下注射': '皮下注',
          '筋注': '筋注', 'im': '筋注', '筋肉注射': '筋注',
          '髄注': '髄注', 'it': '髄注', '髄腔内': '髄注',
        };
        return map[v] ?? map[v?.toLowerCase()] ?? '点滴';
      };
      const normGroupType = (v: string): string => {
        const allowed = ['前投薬', '抗癌剤', '支持療法', 'フラッシュ', '経口', '補液', 'その他'];
        return allowed.includes(v) ? v : 'その他';
      };
      const normRepeat = (v: string): string => {
        const allowed = ['単回', '連日', '指定日', '毎週', '任意記述'];
        return allowed.includes(v) ? v : '単回';
      };
      const normCommentType = (v: string): string => {
        const allowed = ['前投薬', '時間指定', '注意', '運用', '任意'];
        return allowed.includes(v) ? v : '任意';
      };

      // ── Assign UUIDs + normalize ─────────────────────────────────
      generatedRegimen.regimen_core.courses?.forEach((c: any) => {
        if (!c.course_id) c.course_id = uuidv4();
        c.groups?.forEach((g: any) => {
          if (!g.group_id) g.group_id = uuidv4();
          g.group_type = normGroupType(g.group_type);
          g.items?.forEach((i: any) => {
            if (!i.item_id) i.item_id = uuidv4();
            i.dose_unit = normDoseUnit(String(i.dose_unit ?? ''));
            i.administration_method = normMethod(String(i.administration_method ?? ''));
            i.dose = String(i.dose ?? '');
            if (i.schedule) i.schedule.repeat_pattern = normRepeat(i.schedule.repeat_pattern);
            if (Array.isArray(i.comments)) {
              i.comments = i.comments.map((cm: any) => ({
                comment_type: normCommentType(cm.comment_type),
                text: cm.text ?? '',
              }));
            } else {
              i.comments = [];
            }
          });
        });
      });

      // ── Post-generation validation scan ─────────────────────────
      const warnings: string[] = [];
      generatedRegimen.regimen_core.courses?.forEach((c: any) => {
        c.groups?.forEach((g: any) => {
          g.items?.forEach((i: any) => {
            const name = i.drug_name_display || '(名称不明)';
            if (!i.dose || i.dose === '' || i.dose === '0') warnings.push(`「${name}」: 用量が未入力`);
            if (!i.dose_unit || i.dose_unit === '手入力') warnings.push(`「${name}」: 単位が未確認（手入力）`);
            if (!i.infusion_rate) warnings.push(`「${name}」: 投与速度が未入力`);
            if (!i.schedule?.excel_display_hint) warnings.push(`「${name}」: 投与日(Day)が未入力`);
          });
        });
      });
      setValidationWarnings(warnings);

      setRegimens([...regimens, generatedRegimen]);
      setCurrentRegimen(generatedRegimen);
      setIsGenerating(false);
      setGenStatus('');
      if (warnings.length === 0) {
        alert('生成完了！内容を確認してください。');
      } else {
        alert(`生成完了。${warnings.length}件の要確認項目があります。`)
      }
      onSelect();
    } catch (err: any) {
      console.error(err);
      alert('AI生成に失敗しました: ' + err.message);
      setIsGenerating(false);
      setGenStatus('');
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
            <Loader2 className="animate-spin" /> {genStatus || '解析中...'}
          </>
        ) : (
          <>AIで入力内容からレジメンを構築する</>
        )}
      </button>

      {/* Validation warnings */}
      {validationWarnings.length > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
            ⚠️ 要確認項目（{validationWarnings.length}件）– Step3で手修正してください
          </div>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {validationWarnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                <span className="shrink-0">•</span>{w}
              </li>
            ))}
          </ul>
          <button
            className="text-xs text-amber-500 mt-2 hover:text-amber-700"
            onClick={() => setValidationWarnings([])}
          >
            閉じる
          </button>
        </div>
      )}
      <p className="mt-4 text-[10px] text-slate-400 text-center">
        ※ 実際のPDF内容やURLを入力して正確なAI解析を実行します。（ネット環境が必要です）
      </p>
    </div>
  );
};

export default AIGenerator;
