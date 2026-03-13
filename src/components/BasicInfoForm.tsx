import React from 'react';
import { useRegimenStore } from '../store';

const BasicInfoForm: React.FC = () => {
  const { currentRegimen, updateRegimenCore } = useRegimenStore();

  if (!currentRegimen) return null;

  const core = currentRegimen.regimen_core;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateRegimenCore({ [name]: name === 'interval_days' ? parseInt(value) || 0 : value });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">レジメン基本情報</h2>
      </div>

      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">レジメン名</label>
            <input 
              type="text" 
              name="regimen_name"
              className="input text-lg font-bold" 
              placeholder="例: R-CHOP療法"
              value={core.regimen_name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">癌腫</label>
            <input 
              type="text" 
              name="cancer_type"
              className="input" 
              placeholder="例: 非ホジキンリンパ腫"
              value={core.cancer_type}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">治療目的</label>
            <input 
              type="text" 
              name="treatment_purpose"
              className="input" 
              placeholder="例: 寛解導入"
              value={core.treatment_purpose}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">入院/外来</label>
            <select 
              name="inpatient_outpatient"
              className="input"
              value={core.inpatient_outpatient}
              onChange={handleChange}
            >
              <option value="外来">外来</option>
              <option value="入院">入院</option>
              <option value="どちらでも">どちらでも</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">インターバル（日）</label>
            <input 
              type="number" 
              name="interval_days"
              className="input" 
              min="1" max="365"
              value={core.interval_days}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">参考文献・出典</label>
            <textarea 
              name="reference_sources"
              className="input min-h-[100px]" 
              placeholder="ガイドライン、論文名など"
              value={core.reference_sources}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
