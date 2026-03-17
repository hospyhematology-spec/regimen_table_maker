import React from 'react';
import { Plus, Trash2, Copy, FileJson, Clock } from 'lucide-react';
import { importFromJsonFile } from '../fileUtils';
import { v4 as uuidv4 } from 'uuid';
import AIGenerator from './AIGenerator';
import { useRegimenStore } from '../store';

interface DraftListProps {
  onCreateNew: () => void;
  onSelect: () => void;
}

const DraftList: React.FC<DraftListProps> = ({ onCreateNew, onSelect }) => {
  const { regimens, setCurrentRegimen, setRegimens } = useRegimenStore();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importFromJsonFile(file);
        const newRegimens = [...regimens, imported];
        setRegimens(newRegimens);
      } catch (err) {
        alert('JSONの読み込みに失敗しました。');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('この下書きを削除しますか？')) {
      const newRegimens = regimens.filter((r: any) => r.regimen_id !== id);
      setRegimens(newRegimens);
      const { deleteRegimenFromDB } = await import('../db');
      await deleteRegimenFromDB(id);
    }
  };

  const handleClone = (regimen: any) => {
    const cloned = {
      ...JSON.parse(JSON.stringify(regimen)),
      regimen_id: uuidv4(),
      regimen_core: {
        ...regimen.regimen_core,
        regimen_name: `${regimen.regimen_core.regimen_name} (コピー)`
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setRegimens([...regimens, cloned]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">下書き一覧</h2>
        <div className="flex gap-3">
          <label className="btn btn-outline cursor-pointer">
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            <FileJson size={18} /> JSON読込
          </label>
          <button className="btn btn-primary" onClick={onCreateNew}>
            <Plus size={18} /> 新規作成
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-slate-700">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">i</span>
          アプリの使い方
        </h3>
        <p className="text-sm mb-4 leading-relaxed">
          このアプリは、レジメンデータをExcelや独自形式の辞書などに手作業で起こす手間を削減するために作られました。<br/>
          以下のいずれかの方法で作業をスタートしてください：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-blue-700 mb-2">A: AIに自動生成させる（おすすめ）</h4>
            <p className="text-xs text-slate-600">右側のパネルからPDFやURLを入力し、「AIで構築」ボタンを押してください。<br/>自動で仮のレジメン骨格が作成され、STEP2へと進みます。</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-blue-700 mb-2">B: ゼロから手動で作成する</h4>
            <p className="text-xs text-slate-600">右上の「新規作成」ボタンを押してください。空のひな形が作成され、STEP2へと進みます。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regimens.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                <p className="mb-2">まだ保存されたデータ（下書き）はありません。</p>
                <p className="text-sm">上の「新規作成」ボタン、または右側の「AI自動生成」から始めてください。</p>
              </div>
            ) : (
              [...regimens].sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((regimen: any) => (
                <div 
                  key={regimen.regimen_id} 
                  className="card hover:border-blue-400 cursor-pointer transition-colors group"
                  onClick={() => {
                    setCurrentRegimen(regimen);
                    onSelect();
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">
                      {regimen.regimen_core.regimen_name || '名称未設定'}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500"
                        onClick={(e) => { e.stopPropagation(); handleClone(regimen); }}
                        title="複製"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-red-50 rounded text-red-500"
                        onClick={(e) => { e.stopPropagation(); handleDelete(regimen.regimen_id); }}
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {regimen.regimen_core.cancer_type || '癌腫未設定'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-4">
                      <Clock size={14} />
                      <span>更新: {new Date(regimen.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="col-span-4">
          <AIGenerator onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
};

export default DraftList;
