import React, { useState, useRef, useEffect } from 'react';
import { useRegimenStore } from '../store';
import { FileText, Info, AlertOctagon, Play, StopCircle, ArrowDownCircle, AlertCircle, Bookmark, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

interface SupportInfoFormProps {
  onNext?: () => void;
}

const SupportInfoForm: React.FC<SupportInfoFormProps> = ({ onNext }) => {
  const { currentRegimen, updateSupportInfo } = useRegimenStore();
  const [openSection, setOpenSection] = useState<string>('basic_info');

  if (!currentRegimen) return null;

  const info = currentRegimen.regimen_support_info;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSupportInfo({ [e.target.name]: e.target.value });
    // auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
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

      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} className="card bg-white overflow-hidden transition-all duration-300 shadow-sm border border-slate-200">
              <button
                className={`w-full flex items-center justify-between p-4 ${isOpen ? 'bg-blue-50/50 border-b border-blue-100' : 'hover:bg-slate-50'}`}
                onClick={() => setOpenSection(isOpen ? '' : section.id)}
              >
                <div className="flex items-center gap-3 text-blue-800 font-bold">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    {section.icon}
                  </div>
                  <span>{section.label}</span>
                </div>
                <div className="text-slate-400">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              
              {isOpen && (
                <div className="p-4 bg-slate-50/50">
                  <textarea 
                    id={section.id}
                    name={section.id}
                    ref={adjustTextareaHeight}
                    className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-y text-slate-700 leading-relaxed"
                    placeholder={section.placeholder}
                    value={(info as any)[section.id]}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {onNext && (
        <div className="flex justify-end pt-4">
          <button 
            className="btn btn-primary flex items-center gap-2 px-8 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            onClick={onNext}
          >
            次へ進む (STEP 5 出力) <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SupportInfoForm;
