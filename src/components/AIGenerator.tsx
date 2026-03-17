import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Regimen, GroupType, AdministrationMethod, DoseUnit, CommentType } from '../types';
import { Sparkles, Upload, Globe, FileText, Loader2 } from 'lucide-react';
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

  const handleGenerate = () => {
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

    // Simulate AI generation delay
    setTimeout(() => {
      const generatedRegimen: Regimen = {
        schema_version: '1.0',
        app_version: '1.0.0',
        regimen_id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        regimen_core: {
          regimen_name: 'AI生成レジメン（サンプル）',
          cancer_type: '胃癌（推測）',
          treatment_purpose: '術後補助化学療法（推測）',
          inpatient_outpatient: '外来',
          interval_days: 21,
          reference_sources: sources || 'AI連携モジュール（デモ）',
          courses: [
            {
              course_id: uuidv4(),
              course_name: 'メインコース（Day1）',
              groups: [
                {
                  group_id: uuidv4(),
                  sort_order: 1,
                  group_no: '1',
                  group_name: '前投薬',
                  group_type: '前投薬' as GroupType,
                  items: [
                    {
                      item_id: uuidv4(),
                      drug_name_display: 'デキサメタゾン注射液',
                      administration_method: '点滴' as AdministrationMethod,
                      dose: '6.6',
                      dose_unit: 'mg/body' as DoseUnit,
                      base_solution: '生食50mL',
                      schedule: { repeat_pattern: '単回', day_start: 1 },
                      comments: [{ comment_type: '時間指定' as CommentType, text: '15分かけて' }]
                    }
                  ]
                },
                {
                  group_id: uuidv4(),
                  sort_order: 2,
                  group_no: '2',
                  group_name: '抗癌剤',
                  group_type: '抗癌剤' as GroupType,
                  items: [
                    {
                      item_id: uuidv4(),
                      drug_name_display: 'パクリタキセル注射液',
                      administration_method: '点滴' as AdministrationMethod,
                      dose: '80',
                      dose_unit: 'mg/m2' as DoseUnit,
                      base_solution: '生食250mL',
                      schedule: { repeat_pattern: '単回', day_start: 1 },
                      comments: [{ comment_type: '時間指定' as CommentType, text: '1時間かけて投与' }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        regimen_support_info: {
          basic_info: basicInfo,
          indications: '', contraindications: '', start_criteria: '', stop_criteria: '', dose_reduction: '', adverse_effects_and_management: '', references: ''
        }
      };
      setRegimens([...regimens, generatedRegimen]);
      setCurrentRegimen(generatedRegimen);
      setIsGenerating(false);
      alert('AIによるレジメンの仮作成が完了しました。\n続けて「基本情報」「コース・施行順」の各画面で内容を確認し、修正してください。');
      onSelect();
    }, 2000);
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
        ※プロトタイプ版ではシミュレーション動作となります。
      </p>
    </div>
  );
};

export default AIGenerator;
