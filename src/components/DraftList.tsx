import React from 'react';
import { Plus, FileJson, Sparkles, Wand2 } from 'lucide-react';
import { importFromJsonFile } from '../fileUtils';
import AIGenerator from './AIGenerator';
import { useRegimenStore } from '../store';

interface DraftListProps {
  onCreateNew: () => void;
  onSelect: () => void;
}

const DraftList: React.FC<DraftListProps> = ({ onCreateNew, onSelect }) => {
  const { regimens, setRegimens } = useRegimenStore();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importFromJsonFile(file);
        const newRegimens = [...regimens, imported];
        setRegimens(newRegimens);
        // Automatically select the imported regimen might be nice, but we just trigger basic behavior.
        alert('JSONを読み込みました。「一覧」タブから再選択等できますが、今回は新規開始画面として利用します。');
      } catch (err) {
        alert('JSONの読み込みに失敗しました。');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">新しいレジメンを作成する</h2>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          ガイドラインPDFやWeb情報を入力してAIに自動構築させるか、<br />
          まっさらな状態から手作業で作成を始めることができます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: AI Generator */}
        <div className="col-span-1">
          <AIGenerator onSelect={onSelect} />
        </div>

        {/* Right Side: Manual & Import */}
        <div className="col-span-1 space-y-6">
          <div className="card bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all h-full flex flex-col justify-center items-center p-8 text-center group cursor-pointer" onClick={onCreateNew}>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">手動で新規作成</h3>
            <p className="text-sm text-slate-500 mb-6">
              AIを使わず、最初から項目を手入力してレジメンを構築します。
            </p>
            <button className="btn btn-primary w-full max-w-xs py-3">
              空のレジメンを作る
            </button>
          </div>
          
          <div className="card bg-slate-50 border border-slate-200 flex flex-col items-center p-6 text-center">
            <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FileJson size={16} /> 保存済みJSONデータの読み込み
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              以前このアプリから「JSON保存」でダウンロードしたデータ続きから作業できます。
            </p>
            <label className="btn btn-outline cursor-pointer bg-white text-sm py-2 px-6">
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
              ファイルを選択
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DraftList;
