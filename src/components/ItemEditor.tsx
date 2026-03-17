import React, { useState } from 'react';
import { useRegimenStore } from '../store';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, PlusCircle, MinusCircle } from 'lucide-react';
import { Item, DoseUnit, AdministrationMethod, Comment, CommentType } from '../types';

interface ItemEditorProps {
  courseId: string;
  groupId: string;
  items: Item[];
}

const DOSE_UNITS: DoseUnit[] = ['mg/kg', 'mg/m2', 'mg/body', 'AUC', 'units/m²', 'IU/m²', 'IU/kg', 'mL', '錠', 'カプセル', '瓶', '手入力'];
const METHODS: AdministrationMethod[] = ['経口', '静注', '点滴', '皮下注', '筋注', '髄注'];
const COMMENT_TYPES: CommentType[] = ['前投薬', '時間指定', '注意', '運用', '任意'];

// Grid column template - fits in ~1100px (10 of 12 columns)
// handle | 薬剤名 | 希釈液 | 方法 | 用量 | 単位 | 速度 | 投与日 | delete
const GRID = '18px 2.4fr 0.6fr 64px 80px 68px 80px 110px 28px';

const ItemEditor: React.FC<ItemEditorProps> = ({ courseId, groupId, items = [] }) => {
  const { addItem, deleteItem, updateItem, reorderItems } = useRegimenStore();
  const safe = items || [];
  const [dragged, setDragged] = useState<number | null>(null);

  const upd = (id: string, patch: Partial<Item>) => updateItem(courseId, groupId, id, patch);

  const move = (i: number, dir: 'up' | 'down') => {
    const t = dir === 'up' ? i - 1 : i + 1;
    if (t < 0 || t >= safe.length) return;
    const arr = [...safe];
    [arr[i], arr[t]] = [arr[t], arr[i]];
    reorderItems(courseId, groupId, arr);
  };

  const addComment = (item: Item) => {
    upd(item.item_id, { comments: [...(item.comments || []), { comment_type: '任意', text: '' }] });
  };
  const removeComment = (item: Item, ci: number) => {
    const c = [...(item.comments || [])];
    c.splice(ci, 1);
    upd(item.item_id, { comments: c });
  };
  const updComment = (item: Item, ci: number, patch: Partial<Comment>) => {
    const c = [...(item.comments || [])];
    c[ci] = { ...c[ci], ...patch };
    upd(item.item_id, { comments: c });
  };

  return (
    <div className="w-full">
      {/* Column header */}
      {safe.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: GRID }} className="gap-x-1 mb-1 pl-0.5">
          <div />
          {['薬剤名（商品名）', '希釈液 / 本体', '方法', '用量', '単位', '速度', '投与日 (Day)'].map(l => (
            <div key={l} className="text-[9px] font-bold uppercase text-slate-400 truncate px-0.5">{l}</div>
          ))}
          <div />
        </div>
      )}

      <div className="space-y-1">
        {safe.map((item, index) => (
          <div
            key={item.item_id}
            className={`rounded-lg border ${dragged === index ? 'opacity-40 border-blue-300' : 'border-slate-100 bg-slate-50/70'}`}
            draggable
            onDragStart={e => { e.dataTransfer.setData('text/plain', String(index)); setDragged(index); }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (dragged !== null && dragged !== index) {
                const arr = [...safe];
                const [rm] = arr.splice(dragged, 1);
                arr.splice(index, 0, rm);
                reorderItems(courseId, groupId, arr);
              }
              setDragged(null);
            }}
            onDragEnd={() => setDragged(null)}
          >
            {/* Main row */}
            <div style={{ display: 'grid', gridTemplateColumns: GRID }} className="gap-x-1 items-center px-1 pt-1 pb-0.5">
              {/* handle + arrows */}
              <div className="flex flex-col items-center cursor-grab text-slate-300">
                <button className="leading-none hover:text-blue-400 disabled:opacity-20" onClick={() => move(index, 'up')} disabled={index === 0} title="上へ"><ChevronUp size={10} /></button>
                <GripVertical size={11} />
                <button className="leading-none hover:text-blue-400 disabled:opacity-20" onClick={() => move(index, 'down')} disabled={index === safe.length - 1} title="下へ"><ChevronDown size={10} /></button>
              </div>

              {/* 薬剤名 */}
              <input type="text" className="input text-[11px] h-[26px] w-full"
                value={item.drug_name_display} title={item.drug_name_display}
                onChange={e => upd(item.item_id, { drug_name_display: e.target.value })}
                placeholder="リツキサン（リツキシマブ）" />

              {/* 希釈液 */}
              <input type="text" className="input text-[11px] h-[26px] w-full bg-sky-50/80 border-sky-100"
                value={item.base_solution || ''} title={item.base_solution || ''}
                onChange={e => upd(item.item_id, { base_solution: e.target.value })}
                placeholder="生理食塩液 250mL" />

              {/* 投与方法 */}
              <select className="input text-[10px] h-[26px] w-full px-0.5"
                value={item.administration_method}
                onChange={e => upd(item.item_id, { administration_method: e.target.value as AdministrationMethod })}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {/* 用量 */}
              <input type="text" className="input text-[11px] h-[26px] w-full"
                value={item.dose} title={item.dose}
                onChange={e => upd(item.item_id, { dose: e.target.value })}
                placeholder="375" />

              {/* 単位 */}
              <select className="input text-[10px] h-[26px] w-full px-0"
                value={item.dose_unit}
                onChange={e => upd(item.item_id, { dose_unit: e.target.value as DoseUnit })}>
                {DOSE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>

              {/* 速度 */}
              <input type="text" className="input text-[11px] h-[26px] w-full"
                value={item.infusion_rate || ''} title={item.infusion_rate || ''}
                onChange={e => upd(item.item_id, { infusion_rate: e.target.value })}
                placeholder="90分" />

              {/* 投与日 (Day表記) */}
              <input type="text" className="input text-[11px] h-[26px] w-full"
                value={item.schedule?.excel_display_hint || ''} title={item.schedule?.excel_display_hint || ''}
                onChange={e => upd(item.item_id, { schedule: { ...(item.schedule || { repeat_pattern: '単回', day_start: 1 }), excel_display_hint: e.target.value } })}
                placeholder="Day 1, 8, 15" />

              {/* 削除 */}
              <button className="flex items-center justify-center p-0.5 text-slate-300 hover:text-red-500 rounded hover:bg-red-50"
                onClick={() => deleteItem(courseId, groupId, item.item_id)} title="削除">
                <Trash2 size={12} />
              </button>
            </div>

            {/* Comment rows – multiple allowed */}
            <div className="px-1 pb-1 space-y-0.5 ml-[22px]">
              {(item.comments || []).map((c, ci) => (
                <div key={ci} className="flex items-center gap-1">
                  <select
                    className="text-[9px] border border-slate-100 rounded bg-white px-0.5 h-[20px] text-slate-500 shrink-0 w-[62px]"
                    value={c.comment_type}
                    onChange={e => updComment(item, ci, { comment_type: e.target.value as CommentType })}>
                    {COMMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="text" className="input text-[10px] h-[20px] flex-1 bg-white/70 border-slate-100 text-slate-500"
                    value={c.text}
                    onChange={e => updComment(item, ci, { text: e.target.value })}
                    placeholder={`コメント ${ci + 1}...`} />
                  <button className="text-slate-200 hover:text-red-400 shrink-0" onClick={() => removeComment(item, ci)} title="コメント削除">
                    <MinusCircle size={11} />
                  </button>
                </div>
              ))}
              <button className="text-[9px] text-slate-400 hover:text-blue-500 flex items-center gap-0.5 mt-0.5"
                onClick={() => addComment(item)}>
                <PlusCircle size={10} /> コメント追加
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium mt-2"
        onClick={() => addItem(courseId, groupId)}>
        <Plus size={13} /> 薬剤・手技を追加
      </button>
    </div>
  );
};

export default ItemEditor;
