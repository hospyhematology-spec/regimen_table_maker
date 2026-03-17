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

  const doseUnits: DoseUnit[] = ['mg/kg', 'mg/m2', 'mg/body', 'AUC', 'units/m²', 'IU/m²', 'IU/kg', 'mL', '錠', 'カプセル', '瓶', '手入力'];
  const methods: AdministrationMethod[] = ['経口', '静注', '点滴', '皮下注', '筋注', '髄注'];

  return (
    <div className="w-full overflow-x-auto">
      {/* Header row */}
      {safeItems.length > 0 && (
        <div className="flex items-center gap-2 mb-1 pl-6 min-w-[900px]">
          <div className="w-[220px] shrink-0 text-[10px] uppercase font-bold text-slate-400">薬剤名（商品名）</div>
          <div className="w-[180px] shrink-0 text-[10px] uppercase font-bold text-slate-400">希釈液 / 本体</div>
          <div className="w-[80px] shrink-0 text-[10px] uppercase font-bold text-slate-400">投与方法</div>
          <div className="w-[120px] shrink-0 text-[10px] uppercase font-bold text-slate-400">用量</div>
          <div className="w-[100px] shrink-0 text-[10px] uppercase font-bold text-slate-400">速度</div>
          <div className="w-[120px] shrink-0 text-[10px] uppercase font-bold text-slate-400">投与日(Day)</div>
          <div className="flex-1 text-[10px] uppercase font-bold text-slate-400">コメント</div>
        </div>
      )}

      <div className="space-y-2 min-w-[900px]">
        {safeItems.map((item, index) => (
          <div
            key={item.item_id}
            className={`flex items-center gap-2 p-2 bg-slate-50/80 rounded-lg border border-slate-100 ${draggedItemIndex === index ? 'opacity-50' : ''}`}
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
            {/* Drag handle + order buttons */}
            <div className="flex flex-col items-center shrink-0 gap-0">
              <div className="cursor-grab text-slate-300 hover:text-slate-500">
                <GripVertical size={14} />
              </div>
              <button
                className="p-0.5 text-slate-300 hover:text-blue-500 disabled:opacity-20"
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                title="上に移動"
              >
                <ChevronUp size={12} />
              </button>
              <button
                className="p-0.5 text-slate-300 hover:text-blue-500 disabled:opacity-20"
                onClick={() => handleMove(index, 'down')}
                disabled={index === safeItems.length - 1}
                title="下に移動"
              >
                <ChevronDown size={12} />
              </button>
            </div>

            {/* 薬剤名 */}
            <div className="w-[220px] shrink-0">
              <input
                type="text"
                className="input text-xs h-[32px] w-full"
                value={item.drug_name_display}
                onChange={(e) => handleUpdate(item.item_id, { drug_name_display: e.target.value })}
                placeholder="リツキシマブ（リツキサン）"
              />
            </div>

            {/* 希釈液 */}
            <div className="w-[180px] shrink-0">
              <input
                type="text"
                className="input text-xs h-[32px] w-full bg-blue-50/50 border-blue-100"
                value={item.base_solution || ''}
                onChange={(e) => handleUpdate(item.item_id, { base_solution: e.target.value })}
                placeholder="生理食塩液 250mL"
              />
            </div>

            {/* 投与方法 */}
            <div className="w-[80px] shrink-0">
              <select
                className="input text-xs h-[32px] w-full px-1"
                value={item.administration_method}
                onChange={(e) => handleUpdate(item.item_id, { administration_method: e.target.value as any })}
              >
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* 用量 */}
            <div className="w-[120px] shrink-0 flex gap-1">
              <input
                type="text"
                className="input text-xs h-[32px] flex-1 min-w-0"
                value={item.dose}
                onChange={(e) => handleUpdate(item.item_id, { dose: e.target.value })}
                placeholder="375"
              />
              <select
                className="input text-[10px] h-[32px] w-[50px] px-0.5 min-w-0"
                value={item.dose_unit}
                onChange={(e) => handleUpdate(item.item_id, { dose_unit: e.target.value as any })}
              >
                {doseUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            {/* 速度 */}
            <div className="w-[100px] shrink-0">
              <input
                type="text"
                className="input text-xs h-[32px] w-full"
                value={item.infusion_rate || ''}
                onChange={(e) => handleUpdate(item.item_id, { infusion_rate: e.target.value })}
                placeholder="90分"
              />
            </div>

            {/* 投与日 */}
            <div className="w-[120px] shrink-0">
              <input
                type="text"
                className="input text-xs h-[32px] w-full"
                value={item.schedule?.excel_display_hint || ''}
                onChange={(e) => handleUpdate(item.item_id, {
                  schedule: { ...(item.schedule || { repeat_pattern: '単回', day_start: 1 }), excel_display_hint: e.target.value }
                })}
                placeholder="Day 1, 8, 15"
              />
            </div>

            {/* コメント */}
            <div className="flex-1 min-w-[80px]">
              <input
                type="text"
                className="input text-[11px] h-[32px] w-full bg-white/50"
                value={item.comments?.[0]?.text || ''}
                onChange={(e) => handleUpdate(item.item_id, {
                  comments: [{ comment_type: '任意', text: e.target.value }]
                })}
                placeholder="コメント / 注意事項..."
              />
            </div>

            {/* 削除 */}
            <div className="shrink-0">
              <button
                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                onClick={() => deleteItem(courseId, groupId, item.item_id)}
                title="削除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium mt-3"
        onClick={() => addItem(courseId, groupId)}
      >
        <Plus size={14} /> 薬剤・手技を追加
      </button>
    </div>
  );
};

export default ItemEditor;
