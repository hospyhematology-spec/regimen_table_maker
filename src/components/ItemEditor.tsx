import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Item, DoseUnit, AdministrationMethod } from '../types';

interface ItemEditorProps {
  courseId: string;
  groupId: string;
  items: Item[];
}

const doseUnits: DoseUnit[] = ['mg/kg', 'mg/m2', 'mg/body', 'AUC', 'units/m²', 'IU/m²', 'IU/kg', 'mL', '錠', 'カプセル', '瓶', '手入力'];
const methods: AdministrationMethod[] = ['経口', '静注', '点滴', '皮下注', '筋注', '髄注'];

// Tiny field title labels above each cell (column header role)
const COL_LABELS = ['薬剤名（商品名）', '希釈液 / 本体', '方法', '用量', '単位', '速度', '投与日'];

const ItemEditor: React.FC<ItemEditorProps> = ({ courseId, groupId, items = [] }) => {
  const { addItem, deleteItem, updateItem, reorderItems } = useRegimenStore();
  const safeItems = items || [];
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const upd = (id: string, patch: Partial<Item>) => updateItem(courseId, groupId, id, patch);

  const move = (i: number, dir: 'up' | 'down') => {
    const t = dir === 'up' ? i - 1 : i + 1;
    if (t < 0 || t >= safeItems.length) return;
    const arr = [...safeItems];
    [arr[i], arr[t]] = [arr[t], arr[i]];
    reorderItems(courseId, groupId, arr);
  };

  return (
    <div className="w-full">
      {/* Column header row */}
      {safeItems.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 0.75fr 70px 90px 70px 90px 90px 56px' }}
          className="gap-x-1 mb-1 pl-1">
          <div />
          {COL_LABELS.map(l => (
            <div key={l} className="text-[9px] uppercase font-bold text-slate-400 truncate px-1">{l}</div>
          ))}
          <div />
        </div>
      )}

      <div className="space-y-1">
        {safeItems.map((item, index) => (
          <div
            key={item.item_id}
            className={`rounded-lg border transition-colors ${draggedIdx === index ? 'opacity-40' : 'border-slate-100 bg-slate-50/60'}`}
            draggable
            onDragStart={e => { e.dataTransfer.setData('text/plain', String(index)); setDraggedIdx(index); }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (draggedIdx !== null && draggedIdx !== index) {
                const arr = [...safeItems];
                const [rm] = arr.splice(draggedIdx, 1);
                arr.splice(index, 0, rm);
                reorderItems(courseId, groupId, arr);
              }
              setDraggedIdx(null);
            }}
            onDragEnd={() => setDraggedIdx(null)}
          >
            {/* Main row */}
            <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 0.75fr 70px 90px 70px 90px 90px 56px' }}
              className="gap-x-1 items-center px-1 pt-1">

              {/* drag handle */}
              <div className="cursor-grab text-slate-300 hover:text-slate-500 flex flex-col items-center">
                <button className="p-0 text-slate-300 hover:text-blue-400 disabled:opacity-20 leading-none" onClick={() => move(index, 'up')} disabled={index === 0} title="上へ"><ChevronUp size={11} /></button>
                <GripVertical size={12} className="my-0" />
                <button className="p-0 text-slate-300 hover:text-blue-400 disabled:opacity-20 leading-none" onClick={() => move(index, 'down')} disabled={index === safeItems.length - 1} title="下へ"><ChevronDown size={11} /></button>
              </div>

              {/* 薬剤名 */}
              <input
                type="text"
                className="input text-[11px] h-[28px] w-full"
                value={item.drug_name_display}
                title={item.drug_name_display}
                onChange={e => upd(item.item_id, { drug_name_display: e.target.value })}
                placeholder="リツキサン（リツキシマブ）"
              />

              {/* 希釈液 */}
              <input
                type="text"
                className="input text-[11px] h-[28px] w-full bg-blue-50/60 border-blue-100"
                value={item.base_solution || ''}
                title={item.base_solution || ''}
                onChange={e => upd(item.item_id, { base_solution: e.target.value })}
                placeholder="生理食塩液 250mL"
              />

              {/* 投与方法 */}
              <select
                className="input text-[11px] h-[28px] w-full px-1"
                value={item.administration_method}
                onChange={e => upd(item.item_id, { administration_method: e.target.value as AdministrationMethod })}
              >
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {/* 用量 */}
              <input
                type="text"
                className="input text-[11px] h-[28px] w-full"
                value={item.dose}
                title={item.dose}
                onChange={e => upd(item.item_id, { dose: e.target.value })}
                placeholder="375"
              />

              {/* 単位 */}
              <select
                className="input text-[10px] h-[28px] w-full px-0.5"
                value={item.dose_unit}
                onChange={e => upd(item.item_id, { dose_unit: e.target.value as DoseUnit })}
              >
                {doseUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>

              {/* 速度 */}
              <input
                type="text"
                className="input text-[11px] h-[28px] w-full"
                value={item.infusion_rate || ''}
                title={item.infusion_rate || ''}
                onChange={e => upd(item.item_id, { infusion_rate: e.target.value })}
                placeholder="90分"
              />

              {/* 投与日 */}
              <input
                type="text"
                className="input text-[11px] h-[28px] w-full"
                value={item.schedule?.excel_display_hint || ''}
                title={item.schedule?.excel_display_hint || ''}
                onChange={e => upd(item.item_id, {
                  schedule: { ...(item.schedule || { repeat_pattern: '単回', day_start: 1 }), excel_display_hint: e.target.value }
                })}
                placeholder="Day 1, 8, 15"
              />

              {/* 削除 */}
              <div className="flex items-center justify-center">
                <button
                  className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50"
                  onClick={() => deleteItem(courseId, groupId, item.item_id)}
                  title="削除"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Comment row (separate line - acceptable) */}
            <div className="px-1 pb-1 mt-0.5 pl-[24px]">
              <input
                type="text"
                className="input text-[10px] h-[22px] w-full bg-white/70 border-slate-100 text-slate-500"
                value={item.comments?.[0]?.text || ''}
                onChange={e => upd(item.item_id, { comments: [{ comment_type: '任意', text: e.target.value }] })}
                placeholder="コメント / 注意事項..."
              />
            </div>
          </div>
        ))}
      </div>

      <button
        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium mt-2"
        onClick={() => addItem(courseId, groupId)}
      >
        <Plus size={13} /> 薬剤・手技を追加
      </button>
    </div>
  );
};

export default ItemEditor;
