"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export default function BingoEditor({ favorites, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [cells, setCells] = useState(Array(9).fill(""));

  const updateCell = (i, val) => {
    const next = [...cells];
    next[i] = val;
    setCells(next);
  };

  const handleFavoriteClick = (text) => {
    const emptyIdx = cells.findIndex((c, i) => c === "" && i !== 4);
    if (emptyIdx !== -1) updateCell(emptyIdx, text);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white p-8 flex flex-col items-center overflow-y-auto">
      <button onClick={onClose} className="self-start mb-8 text-stone-400"><ChevronLeft size={24} /></button>
      
      <div className="w-full max-w-sm space-y-10">
        <input 
          placeholder="日々ンゴの名前"
          className="w-full bg-transparent border-b border-stone-200 py-3 text-lg font-light focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-2 aspect-square bg-stone-50 p-2">
          {cells.map((text, i) => (
            <div key={i} className="bg-white border border-stone-100 p-1 flex items-center justify-center">
              {i === 4 ? (
                <span className="text-[8px] text-stone-300 text-center">日々ンゴを見る<br/>(固定)</span>
              ) : (
                <textarea 
                  className="w-full h-full text-[10px] resize-none focus:outline-none text-center bg-transparent"
                  value={text}
                  onChange={(e) => updateCell(i, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-[10px] tracking-widest text-stone-400 uppercase">お気に入りパレット</p>
          <div className="flex flex-wrap gap-2">
            {favorites.map(f => (
              <button 
                key={f.id} 
                onClick={() => handleFavoriteClick(f.text)}
                className="px-3 py-1 bg-stone-50 border border-stone-200 text-[10px] text-stone-500 rounded-sm hover:border-stone-400 transition-all"
              >
                {f.text}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onSave({ title, grid: cells })}
          className="w-full py-4 bg-stone-800 text-white text-[10px] tracking-[0.3em] uppercase shadow-lg"
        >
          この日々を保存する
        </button>
      </div>
    </div>
  );
}