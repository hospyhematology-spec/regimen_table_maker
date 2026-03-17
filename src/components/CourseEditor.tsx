import React, { useState, useEffect } from 'react';
import { useRegimenStore } from '../store';
import { Plus, ChevronRight, Trash2, Copy, GripVertical, Printer } from 'lucide-react';
import GroupEditor from './GroupEditor';

interface CourseEditorProps {
  onNext?: () => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ onNext }) => {
  const { currentRegimen, addCourse, cloneCourse, deleteCourse, updateCourse } = useRegimenStore();
  const courses = currentRegimen?.regimen_core?.courses || [];
  const [activeCourseId, setActiveCourseId] = useState<string | null>(
    courses[0]?.course_id || null
  );

  useEffect(() => {
    const activeExists = courses.some(c => c.course_id === activeCourseId);
    if (!activeExists && courses.length > 0) {
      setActiveCourseId(courses[0].course_id);
    }
  }, [courses, activeCourseId]);

  if (!currentRegimen) return null;

  const activeCourse = courses.find(c => c.course_id === activeCourseId) || courses[0];
  const core = currentRegimen.regimen_core;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print CSS - injected inline so it's always available */}
      <style>{`
        @media print {
          body > div > header,
          .no-print { display: none !important; }
          body > div > main { padding: 0 !important; max-width: 100% !important; }
          .print-region { page-break-inside: avoid; }
          .card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          input, select { border: none !important; box-shadow: none !important; background: transparent !important; }
        }
      `}</style>

      <div className="flex gap-3 w-full">
        {/* Sidebar: Course List – narrow */}
        <div className="w-[220px] shrink-0 space-y-2 no-print">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-700 text-sm">コース一覧</h3>
            <button className="p-1 hover:bg-blue-50 text-blue-600 rounded" onClick={addCourse} title="コース追加">
              <Plus size={16} />
            </button>
          </div>

          {courses.map((course) => (
            <div
              key={course.course_id}
              className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer border transition-all text-sm ${
                activeCourseId === course.course_id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 hover:border-blue-400'
              }`}
              onClick={() => setActiveCourseId(course.course_id)}
            >
              <span className="font-medium truncate text-sm">{course.course_name}</span>
              <div className="flex gap-1 shrink-0">
                <button
                  className={`p-1 rounded ${activeCourseId === course.course_id ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-blue-500'}`}
                  onClick={e => { e.stopPropagation(); cloneCourse(course.course_id); }}
                  title="複製"
                ><Copy size={14} /></button>
                <button
                  className={`p-1 rounded ${activeCourseId === course.course_id ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-red-500'}`}
                  onClick={e => { e.stopPropagation(); deleteCourse(course.course_id); }}
                  title="削除"
                ><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs italic">コースを追加</div>
          )}
        </div>

        {/* Main: Active Course Content – takes remaining full width */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Print header (only shown in print) */}
          <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold">{core.regimen_name}</h1>
            <p className="text-sm text-gray-600">{core.cancer_type} / {core.treatment_purpose} / {core.interval_days}日サイクル</p>
          </div>

          {activeCourse ? (
            <>
              {/* Top bar: course name + PDF print button */}
              <div className="flex items-center justify-between gap-4 card bg-white border-l-4 border-l-blue-600 py-3 px-4 no-print">
                <input
                  type="text"
                  className="text-lg font-bold bg-transparent border-none focus:ring-0 flex-1"
                  value={activeCourse.course_name}
                  onChange={e => updateCourse(activeCourse.course_id, { course_name: e.target.value })}
                  placeholder="コース名を入力..."
                />
                <button
                  className="btn btn-outline flex items-center gap-2 text-sm shrink-0 border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={handlePrint}
                  title="このStep3画面をPDF/印刷"
                >
                  <Printer size={16} /> PDF印刷
                </button>
              </div>

              {/* Print: course name */}
              <div className="hidden print:block font-bold text-base mb-2">{activeCourse.course_name}</div>

              <div className="print-region">
                <GroupEditor courseId={activeCourse.course_id} groups={activeCourse.groups} />
              </div>
            </>
          ) : (
            <div className="card h-[400px] flex items-center justify-center text-slate-400">
              左側のリストからコースを選択してください
            </div>
          )}

          {onNext && (
            <div className="flex justify-end pt-4 border-t border-slate-200 mt-6 no-print">
              <button
                className="btn btn-primary flex items-center gap-2 px-8 py-3 text-lg font-bold shadow-lg"
                onClick={onNext}
              >
                次へ進む (STEP 4) <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseEditor;
