import React from 'react';
import { useRegimenStore } from '../store';
import { FileSpreadsheet, FileText, FileJson, CheckCircle2, ChevronRight } from 'lucide-react';
import { generateExcel, generateWord } from '../exportUtils';
import { exportToJsonFile } from '../fileUtils';

const OutputPage: React.FC = () => {
  const { currentRegimen } = useRegimenStore();

  if (!currentRegimen) return null;

  const core = currentRegimen.regimen_core;
  
  // Basic validation
  const validationItems = [
    { label: 'レジメン名', ok: !!core.regimen_name },
    { label: '癌腫', ok: !!core.cancer_type },
    { label: 'コース設定', ok: core.courses.length > 0 },
    { label: '投与日(Day)設定', ok: core.courses.every(c => c.groups.every(g => g.items.every(i => !!i.schedule.excel_display_hint))) },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">出力と保存</h2>
        <p className="text-slate-500">作成したレジメンをファイルとして出力します。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="card hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center p-8 border-t-4 border-t-green-500"
          onClick={() => generateExcel(currentRegimen)}
        >
          <div className="p-4 bg-green-50 rounded-full text-green-600 mb-4">
            <FileSpreadsheet size={40} />
          </div>
          <h3 className="font-bold text-lg mb-2">Excel出力</h3>
          <p className="text-xs text-slate-400">レジメン表 (1コース1シート)</p>
          <div className="mt-auto pt-4 text-green-600 flex items-center gap-1 font-medium">
            ダウンロード <ChevronRight size={16} />
          </div>
        </div>

        <div 
          className="card hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center p-8 border-t-4 border-t-blue-500"
          onClick={() => generateWord(currentRegimen)}
        >
          <div className="p-4 bg-blue-50 rounded-full text-blue-600 mb-4">
            <FileText size={40} />
          </div>
          <h3 className="font-bold text-lg mb-2">Word出力</h3>
          <p className="text-xs text-slate-400">補完資料 (ガイドライン準拠)</p>
          <div className="mt-auto pt-4 text-blue-600 flex items-center gap-1 font-medium">
            ダウンロード <ChevronRight size={16} />
          </div>
        </div>

        <div 
          className="card hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center p-8 border-t-4 border-t-orange-500"
          onClick={() => exportToJsonFile(currentRegimen)}
        >
          <div className="p-4 bg-orange-50 rounded-full text-orange-600 mb-4">
            <FileJson size={40} />
          </div>
          <h3 className="font-bold text-lg mb-2">JSON保存</h3>
          <p className="text-xs text-slate-400">バックアップ・再編集用</p>
          <div className="mt-auto pt-4 text-orange-600 flex items-center gap-1 font-medium">
            保存する <ChevronRight size={16} />
          </div>
        </div>
      </div>

      <div className="card bg-slate-50 border-none">
        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-slate-400" /> 入力情報の確認
        </h4>
        <div className="space-y-3">
          {validationItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-slate-600">{item.label}</span>
              {item.ok ? (
                <span className="text-success font-bold">完了</span>
              ) : (
                <span className="text-danger font-bold">未入力</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutputPage;
