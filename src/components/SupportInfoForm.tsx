import React from 'react';
import { useRegimenStore } from '../store';
import { FileText, Info, AlertOctagon, Play, StopCircle, ArrowDownCircle, AlertCircle, Bookmark } from 'lucide-react';

const SupportInfoForm: React.FC = () => {
  const { currentRegimen, updateSupportInfo } = useRegimenStore();

  if (!currentRegimen) return null;

  const info = currentRegimen.regimen_support_info;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSupportInfo({ [e.target.name]: e.target.value });
  };

  const sections = [
    { id: 'basic_info', label: '1. 基本情報', icon: <Info size={18} />, placeholder: 'レジメンの概要、標準的な投与スケジュールなど' },
    { id: 'indications', label: '2. 適応症', icon: <FileText size={18} />, placeholder: '薬剤ごとの保険適応状況など' },
    { id: 'contraindications', label: '3. 禁忌', icon: <AlertOctagon size={18} />, placeholder: '絶対禁忌、慎重投与など' },
    { id: 'start_criteria', label: '4. 投与開始基準', icon: <Play size={18} />, placeholder: '白血球数、血小板数、肝機能、腎機能などの基準' },
    { id: 'stop_criteria', label: '5. 中止基準', icon: <StopCircle size={18} />, placeholder: '治療を完全に終了する基準' },
    { id: 'dose_reduction', label: '6. 減量基準', icon: <ArrowDownCircle size={18} />, placeholder: '副作用発生時の段階的な減量規定' },
    { id: 'adverse_effects_and_management', label: '7. 副作用と対策', icon: <AlertCircle size={18} />, placeholder: '主な副作用（下痢、しびれ、アレルギー等）と具体的な対処法' },
    { id: 'references', label: '8. 参考資料', icon: <Bookmark size={18} />, placeholder: '引用文献、URLなど' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">補完資料（Word出力用）</h2>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="card bg-white p-6 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold border-b border-slate-100 pb-2">
              {section.icon}
              <label htmlFor={section.id}>{section.label}</label>
            </div>
            <textarea 
              id={section.id}
              name={section.id}
              className="input min-h-[120px] bg-slate-50 border-none focus:bg-white transition-colors"
              placeholder={section.placeholder}
              value={(info as any)[section.id]}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportInfoForm;
