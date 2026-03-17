import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Group } from '../types';
import ItemEditor from './ItemEditor';

interface GroupEditorProps {
  courseId: string;
  groups: Group[];
}

const GroupEditor: React.FC<GroupEditorProps> = ({ courseId, groups = [] }) => {
  const { addGroup, deleteGroup, updateGroup, reorderGroups } = useRegimenStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const safeGroups = groups || [];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newGroups = [...safeGroups].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGroups.length) return;

    const temp = newGroups[index];
    newGroups[index] = newGroups[targetIndex];
    newGroups[targetIndex] = temp;

    // Update sort_order for all
    const updated = newGroups.map((g, i) => ({ ...g, sort_order: i }));
    reorderGroups(courseId, updated);
  };

  return (
    <div className="space-y-6">
      {[...safeGroups].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((group, index) => (
        <div 
          key={group.group_id} 
          className={`card p-0 overflow-hidden border-slate-200 ${draggedIndex === index ? 'opacity-50' : ''}`}
          draggable
          onDragStart={(e) => {
            // Needed for Firefox
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', index.toString());
            }
            setDraggedIndex(index);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedIndex !== null && draggedIndex !== index) {
              const newGroups = [...safeGroups].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
              const [removed] = newGroups.splice(draggedIndex, 1);
              newGroups.splice(index, 0, removed);
              const updated = newGroups.map((g, i) => ({ ...g, sort_order: i }));
              reorderGroups(courseId, updated);
            }
            setDraggedIndex(null);
          }}
          onDragEnd={() => setDraggedIndex(null)}
        >
          <div className="bg-slate-50 border-bottom border-slate-200 p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="cursor-grab text-slate-400">
                <GripVertical size={18} />
              </div>
              <span className="bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                G{index + 1}
              </span>
              <input 
                type="text"
                className="bg-transparent font-bold text-slate-700 border-none focus:ring-0 p-0"
                value={group.group_name}
                onChange={(e) => updateGroup(courseId, group.group_id, { group_name: e.target.value })}
                placeholder="グループ名 (例: 前投薬)"
              />
              <select 
                className="text-xs bg-white border border-slate-200 rounded px-1 py-0.5"
                value={group.group_type}
                onChange={(e) => updateGroup(courseId, group.group_id, { group_type: e.target.value as any })}
              >
                <option value="前投薬">前投薬</option>
                <option value="抗癌剤">抗癌剤</option>
                <option value="支持療法">支持療法</option>
                <option value="フラッシュ">フラッシュ</option>
                <option value="経口">経口</option>
                <option value="補液">補液</option>
                <option value="その他">その他</option>
              </select>
            </div>
            
            <div className="flex gap-1">
              <button 
                className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30"
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                title="上に移動"
              >
                <ChevronUp size={16} />
              </button>
              <button 
                className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30"
                onClick={() => handleMove(index, 'down')}
                disabled={index === safeGroups.length - 1}
                title="下に移動"
              >
                <ChevronDown size={16} />
              </button>
              <button 
                className="text-slate-400 hover:text-red-500 p-1"
                onClick={() => deleteGroup(courseId, group.group_id)}
                title="削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <ItemEditor courseId={courseId} groupId={group.group_id} items={group.items || []} />
          </div>
        </div>
      ))}

      <button 
        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
        onClick={() => addGroup(courseId)}
      >
        <Plus size={20} /> グループを追加
      </button>
    </div>
  );
};

export default GroupEditor;
