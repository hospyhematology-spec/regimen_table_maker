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
      <header className="header glass">
        <div className="flex items-center gap-2 mr-8">
          <FileText className="text-blue-600" />
          <h1 className="text-xl font-bold">抗癌剤レジメン作成</h1>
        </div>
        <nav className="flex gap-4">
          <button 
            className={`nav-link ${currentScreen === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('list')}
          >
            <List size={18} className="inline mr-1" /> 下書き一覧
          </button>
          <button 
            className={`nav-link ${currentScreen === 'basic' ? 'active' : ''}`}
            onClick={() => navigateTo('basic')}
          >
            基本情報
          </button>
          <button 
            className={`nav-link ${currentScreen === 'course' ? 'active' : ''}`}
            onClick={() => navigateTo('course')}
          >
            コース・施行順
          </button>
          <button 
            className={`nav-link ${currentScreen === 'support' ? 'active' : ''}`}
            onClick={() => navigateTo('support')}
          >
            補完資料
          </button>
          <button 
            className={`nav-link ${currentScreen === 'output' ? 'active' : ''}`}
            onClick={() => navigateTo('output')}
          >
            <Download size={18} className="inline mr-1" /> 出力
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
