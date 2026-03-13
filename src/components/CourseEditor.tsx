import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Plus, ChevronRight, ChevronDown, Trash2, Copy, GripVertical, Settings2 } from 'lucide-react';
import GroupEditor from './GroupEditor';

const CourseEditor: React.FC = () => {
  const { currentRegimen, addCourse, cloneCourse, deleteCourse, updateCourse } = useRegimenStore();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(
    currentRegimen?.regimen_core.courses[0]?.course_id || null
  );

  if (!currentRegimen) return null;

  const courses = currentRegimen.regimen_core.courses;
  const activeCourse = courses.find(c => c.course_id === activeCourseId);

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Sidebar: Course List */}
      <div className="col-span-3 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700">コース一覧</h3>
          <button 
            className="p-1 hover:bg-blue-50 text-blue-600 rounded" 
            onClick={addCourse}
            title="コース追加"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="space-y-2">
          {courses.map((course) => (
            <div 
              key={course.course_id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${
                activeCourseId === course.course_id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-slate-200 hover:border-blue-400'
              }`}
              onClick={() => setActiveCourseId(course.course_id)}
            >
              <span className="font-medium truncate">{course.course_name}</span>
              <div className="flex gap-1">
                <button 
                  className={`p-1 rounded hover:bg-white/20 ${activeCourseId === course.course_id ? 'text-white' : 'text-slate-400'}`}
                  onClick={(e) => { e.stopPropagation(); cloneCourse(course.course_id); }}
                >
                  <Copy size={14} />
                </button>
                <button 
                  className={`p-1 rounded hover:bg-white/20 ${activeCourseId === course.course_id ? 'text-white' : 'text-slate-400'}`}
                  onClick={(e) => { e.stopPropagation(); deleteCourse(course.course_id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              コースを追加してください
            </div>
          )}
        </div>
      </div>

      {/* Main: Active Course Content */}
      <div className="col-span-9 space-y-6">
        {activeCourse ? (
          <>
            <div className="card bg-white border-l-4 border-l-blue-600">
              <div className="flex items-center gap-4">
                <input 
                  type="text"
                  className="text-xl font-bold bg-transparent border-none focus:ring-0 w-full"
                  value={activeCourse.course_name}
                  onChange={(e) => updateCourse(activeCourse.course_id, { course_name: e.target.value })}
                  placeholder="コース名を入力..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <GroupEditor courseId={activeCourse.course_id} groups={activeCourse.groups} />
            </div>
          </>
        ) : (
          <div className="card h-[400px] flex items-center justify-center text-slate-400">
            左側のリストからコースを選択してください
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
