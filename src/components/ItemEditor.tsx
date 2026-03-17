import React from 'react';
import { useRegimenStore } from '../store';
import { Plus, Trash2 } from 'lucide-react';
import { Item, DoseUnit, AdministrationMethod } from '../types';

interface ItemEditorProps {
  courseId: string;
  groupId: string;
  items: Item[];
}

const ItemEditor: React.FC<ItemEditorProps> = ({ courseId, groupId, items = [] }) => {
  const { addItem, deleteItem, updateItem } = useRegimenStore();
  const safeItems = items || [];

  const handleUpdate = (itemId: string, updates: Partial<Item>) => {
    updateItem(courseId, groupId, itemId, updates);
  };

  const doseUnits: DoseUnit[] = ['mg/kg', 'mg/m2', 'mg/body', 'AUC', 'units/m²', 'IU/m²', 'IU/kg', '手入力'];
  const methods: AdministrationMethod[] = ['経口', '静注', '点滴', '皮下注', '筋注', '髄注'];

  return (
    <div className="space-y-4">
      {safeItems.map((item) => (
        <div key={item.item_id} className="grid grid-cols-12 gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-100 relative group/item">
          <div className="col-span-4">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">薬剤名 (一般名・商品名)</label>
            <input 
              type="text"
              className="input text-sm"
              value={item.drug_name_display}
              onChange={(e) => handleUpdate(item.item_id, { drug_name_display: e.target.value })}
              placeholder="リツキシマブ (リツキサン)"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">投与方法</label>
            <select 
              className="input text-sm"
              value={item.administration_method}
              onChange={(e) => handleUpdate(item.item_id, { administration_method: e.target.value as any })}
            >
              {methods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">用量</label>
            <div className="flex gap-1">
              <input 
                type="text"
                className="input text-sm flex-1"
                value={item.dose}
                onChange={(e) => handleUpdate(item.item_id, { dose: e.target.value })}
                placeholder="375"
              />
              <select 
                className="input text-xs w-20 px-1"
                value={item.dose_unit}
                onChange={(e) => handleUpdate(item.item_id, { dose_unit: e.target.value as any })}
              >
                {doseUnits.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="col-span-3">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">投与日 (Day)</label>
            <input 
              type="text"
              className="input text-sm"
              value={item.schedule?.excel_display_hint || ''}
              onChange={(e) => handleUpdate(item.item_id, { 
                schedule: { ...(item.schedule || { repeat_pattern: '単回', day_start: 1 }), excel_display_hint: e.target.value } 
              })}
              placeholder="Day 1, 8, 15"
            />
          </div>

          <div className="col-span-1 flex items-end justify-center">
            <button 
              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              onClick={() => deleteItem(courseId, groupId, item.item_id)}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="col-span-12 grid grid-cols-3 gap-3">
             <input 
                type="text"
                className="input text-xs bg-white/50"
                value={item.base_solution || ''}
                onChange={(e) => handleUpdate(item.item_id, { base_solution: e.target.value })}
                placeholder="希釈液 (例: 生食500mL)"
              />
              <input 
                type="text"
                className="input text-xs bg-white/50"
                value={item.infusion_rate || ''}
                onChange={(e) => handleUpdate(item.item_id, { infusion_rate: e.target.value })}
                placeholder="速度 (例: 90分)"
              />
              <input 
                type="text"
                className="input text-xs bg-white/50"
                value={item.comments?.[0]?.text || ''}
                onChange={(e) => handleUpdate(item.item_id, { 
                  comments: [{ comment_type: '任意', text: e.target.value }] 
                })}
                placeholder="コメント"
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
