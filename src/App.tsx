import React, { useState } from 'react';
import { useRegimenStore } from './store';
import { usePersistence } from './usePersistence';
import DraftList from './components/DraftList';
import BasicInfoForm from './components/BasicInfoForm';
import CourseEditor from './components/CourseEditor';
import SupportInfoForm from './components/SupportInfoForm';
import OutputPage from './components/OutputPage';
import { List, FileText, Download } from 'lucide-react';

type Screen = 'list' | 'basic' | 'course' | 'support' | 'output';

const App: React.FC = () => {
  usePersistence();
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const { currentRegimen, createNewRegimen } = useRegimenStore();

  const navigateTo = (screen: Screen) => {
    if (screen !== 'list' && !currentRegimen) {
      alert('レジメンを選択または新規作成してください。');
      return;
    }
    setCurrentScreen(screen);
  };

  const handleCreateNew = () => {
    createNewRegimen();
    setCurrentScreen('basic');
  };

  return (
    <div className="min-h-screen">
      <header className="header glass h-auto py-3 px-4 md:px-6 flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-slate-200 sticky top-0 z-50 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-blue-500 p-2 rounded-lg text-white shadow-sm">
            <FileText size={20} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">抗癌剤レジメン作成</h1>
        </div>
        <nav className="flex flex-nowrap overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 gap-1 md:gap-2 items-center text-sm font-medium">
          <button 
            className={`flex flex-col items-center shrink-0 px-3 md:px-4 py-2 rounded-lg transition-all ${currentScreen === 'list' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => setCurrentScreen('list')}
          >
            <span className="text-[10px] font-black tracking-wider text-blue-500 mb-0.5 opacity-80 text-center">STEP 1</span>
            <span className="flex items-center"><List size={14} className="mr-1" /> 下書き選択</span>
          </button>
          <div className="text-slate-300 hidden md:block shrink-0">›</div>
          <button 
            className={`flex flex-col items-center shrink-0 px-3 md:px-4 py-2 rounded-lg transition-all ${currentScreen === 'basic' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => navigateTo('basic')}
          >
            <span className="text-[10px] font-black tracking-wider text-blue-500 mb-0.5 opacity-80 text-center">STEP 2</span>
            <span>基本情報</span>
          </button>
          <div className="text-slate-300 hidden md:block shrink-0">›</div>
          <button 
            className={`flex flex-col items-center shrink-0 px-3 md:px-4 py-2 rounded-lg transition-all ${currentScreen === 'course' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => navigateTo('course')}
          >
            <span className="text-[10px] font-black tracking-wider text-blue-500 mb-0.5 opacity-80 text-center">STEP 3</span>
            <span>コース・編成</span>
          </button>
          <div className="text-slate-300 hidden md:block shrink-0">›</div>
          <button 
            className={`flex flex-col items-center shrink-0 px-3 md:px-4 py-2 rounded-lg transition-all ${currentScreen === 'support' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => navigateTo('support')}
          >
            <span className="text-[10px] font-black tracking-wider text-blue-500 mb-0.5 opacity-80 text-center">STEP 4</span>
            <span>補完資料</span>
          </button>
          <div className="text-slate-300 hidden md:block shrink-0">›</div>
          <button 
            className={`flex flex-col items-center shrink-0 px-3 md:px-4 py-2 rounded-lg transition-all ${currentScreen === 'output' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => navigateTo('output')}
          >
            <span className="text-[10px] font-black tracking-wider text-blue-500 mb-0.5 opacity-80 text-center">STEP 5</span>
            <span className="flex items-center"><Download size={14} className="mr-1" /> 出力</span>
          </button>
        </nav>
      </header>

      <main className="container">
        {currentScreen === 'list' && (
          <DraftList onCreateNew={handleCreateNew} onSelect={() => setCurrentScreen('basic')} />
        )}
        {currentScreen === 'basic' && currentRegimen && <BasicInfoForm />}
        {currentScreen === 'course' && currentRegimen && <CourseEditor />}
        {currentScreen === 'support' && currentRegimen && <SupportInfoForm />}
        {currentScreen === 'output' && currentRegimen && <OutputPage />}
      </main>
    </div>
  );
};

export default App;
