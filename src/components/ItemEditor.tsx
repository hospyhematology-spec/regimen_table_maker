import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Item, DoseUnit, AdministrationMethod } from '../types';

interface ItemEditorProps {
  courseId: string;
  groupId: string;
  items: Item[];
}

const ItemEditor: React.FC<ItemEditorProps> = ({ courseId, groupId, items = [] }) => {
  const { addItem, deleteItem, updateItem, reorderItems } = useRegimenStore();
  const safeItems = items || [];
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleUpdate = (itemId: string, updates: Partial<Item>) => {
    updateItem(courseId, groupId, itemId, updates);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= safeItems.length) return;
    const newItems = [...safeItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    reorderItems(courseId, groupId, newItems);
  };

  const doseUnits: DoseUnit[] = ['mg/kg', 'mg/m2', 'mg/body', 'AUC', 'units/m²', 'IU/m²', 'IU/kg', '手入力'];
  const methods: AdministrationMethod[] = ['経口', '静注', '点滴', '皮下注', '筋注', '髄注'];

  return (
    <div className="space-y-4">
      {safeItems.map((item, index) => (
        <div 
          key={item.item_id} 
          className={`flex flex-col gap-2 p-3 bg-slate-50/50 rounded-lg border border-slate-100 ${draggedItemIndex === index ? 'opacity-50' : ''}`}
          draggable
          onDragStart={(e) => {
            if (e.dataTransfer) {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', index.toString());
            }
            setDraggedItemIndex(index);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedItemIndex !== null && draggedItemIndex !== index) {
              const newItems = [...safeItems];
              const [removed] = newItems.splice(draggedItemIndex, 1);
              newItems.splice(index, 0, removed);
              reorderItems(courseId, groupId, newItems);
            }
            setDraggedItemIndex(null);
          }}
          onDragEnd={() => setDraggedItemIndex(null)}
        >
          {/* Top Row: Name / Method / Dose / Speed / Day */}
          <div className="flex items-end gap-2 overflow-x-auto pb-1">
            <div className="cursor-grab text-slate-400 mb-2 shrink-0">
              <GripVertical size={16} />
            </div>

            <div className="flex flex-col w-48 shrink-0">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">薬剤名 (一般名・商品名)</label>
            <input 
              type="text"
              className="input text-sm"
              value={item.drug_name_display}
              onChange={(e) => handleUpdate(item.item_id, { drug_name_display: e.target.value })}
              placeholder="リツキシマブ (リツキサン)"
            />
            </div>

            <div className="flex flex-col w-24 shrink-0">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">投与方法</label>
              <select 
                className="input text-xs h-[34px]"
                value={item.administration_method}
                onChange={(e) => handleUpdate(item.item_id, { administration_method: e.target.value as any })}
              >
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex flex-col w-36 shrink-0">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">用量</label>
              <div className="flex gap-1 h-[34px]">
                <input 
                  type="text"
                  className="input text-xs flex-1 w-full min-w-0"
                  value={item.dose}
                  onChange={(e) => handleUpdate(item.item_id, { dose: e.target.value })}
                  placeholder="375"
                />
                <select 
                  className="input text-[10px] w-[50%] px-1 min-w-0"
                  value={item.dose_unit}
                  onChange={(e) => handleUpdate(item.item_id, { dose_unit: e.target.value as any })}
                >
                  {doseUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col w-20 shrink-0">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">速度</label>
              <input 
                type="text"
                className="input text-xs h-[34px]"
                value={item.infusion_rate || ''}
                onChange={(e) => handleUpdate(item.item_id, { infusion_rate: e.target.value })}
                placeholder="例: 90分"
              />
            </div>

            <div className="flex flex-col w-32 shrink-0">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">投与日 (Day)</label>
              <input 
                type="text"
                className="input text-xs h-[34px]"
                value={item.schedule?.excel_display_hint || ''}
                onChange={(e) => handleUpdate(item.item_id, { 
                  schedule: { ...(item.schedule || { repeat_pattern: '単回', day_start: 1 }), excel_display_hint: e.target.value } 
                })}
                placeholder="Day 1, 8, 15"
              />
            </div>

            <div className="flex flex-col items-center gap-0.5 mb-1 shrink-0">
              <button 
                className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30 rounded hover:bg-slate-200"
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                title="上に移動"
              >
                <ChevronUp size={14} />
              </button>
              <button 
                className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30 rounded hover:bg-slate-200"
                onClick={() => handleMove(index, 'down')}
                disabled={index === safeItems.length - 1}
                title="下に移動"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex items-end mb-1 shrink-0 ml-1">
              <button 
                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                onClick={() => deleteItem(courseId, groupId, item.item_id)}
                title="削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Row: Base Solution / Comments */}
          <div className="flex items-center gap-2 pl-6">
             <input 
                type="text"
                className="input text-[11px] bg-white w-40 h-[28px] py-1"
                value={item.base_solution || ''}
                onChange={(e) => handleUpdate(item.item_id, { base_solution: e.target.value })}
                placeholder="希釈液 (例: 生食500mL)"
              />
              <input 
                type="text"
                className="input text-[11px] bg-white flex-1 h-[28px] py-1"
                value={item.comments?.[0]?.text || ''}
                onChange={(e) => handleUpdate(item.item_id, { 
                  comments: [{ comment_type: '任意', text: e.target.value }] 
                })}
                placeholder="コメント / 注意事項..."
              />
          </div>
        </div>
      ))}

      <button 
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
        onClick={() => addItem(courseId, groupId)}
      >
        <Plus size={14} /> 薬剤・手技を追加
      </button>
    </div>
  );
};

export default ItemEditor;
