"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, History, Star, ChevronDown, ChevronUp, 
  User, Rocket, Pencil, Trash2, Check, X 
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";

export default function AllLogsPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [displayLogs, setDisplayLogs] = useState([]);
  const [myMemberId, setMyMemberId] = useState("");
  
  // 編集用ステート
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ material: "", scene: "", action: "", result: "", note: "" });

  const fetchData = async () => {
    const savedId = localStorage.getItem("my_member_id") || "";
    setMyMemberId(savedId);

    const savedFavs = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
    setFavorites(savedFavs);
    
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (data) setDisplayLogs(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFavorite = (id) => {
    const savedFavs = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
    let newFavs;
    if (savedFavs.includes(id)) {
      newFavs = savedFavs.filter(favId => favId !== id);
    } else {
      newFavs = [...savedFavs, id];
    }
    setFavorites(newFavs);
    localStorage.setItem("metacog_favorites", JSON.stringify(newFavs));
  };

  // 削除機能
  const handleDelete = async (id) => {
    if (!confirm("この報告を削除しますか？")) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) {
      setDisplayLogs(displayLogs.filter(log => log.id !== id));
    }
  };

  // 編集開始
  const startEdit = (log) => {
    setEditingId(log.id);
    setEditForm({ 
      material: log.material, 
      scene: log.scene, 
      action: log.action, 
      result: log.result, 
      note: log.note 
    });
    setExpandedId(log.id); // 編集時は展開する
  };

  // 編集保存
  const handleUpdate = async (id) => {
    // 1. まずステートを先行して更新（楽観的UI更新）
    // これにより、保存ボタンを押した瞬間に画面が書き換わります
    const updatedLogs = displayLogs.map((log) => 
      log.id === id ? { ...log, ...editForm } : log
    );
    setDisplayLogs(updatedLogs);
    setEditingId(null);

    // 2. 背後でSupabaseを更新
    const { error } = await supabase.from('reports').update(editForm).eq('id', id);
    
    if (error) {
      alert("更新に失敗しました。");
      // 失敗した場合はデータを再取得して元に戻す
      fetchData();
    }
    // 成功した場合は fetchData() を呼ばなくても既に state が新しいので即時反映されます
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#334E68] p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/menu/metacognition" className="text-[11px] font-bold opacity-50 flex items-center gap-2 uppercase hover:opacity-100 transition-all"><ArrowLeft size={12}/> Back</Link>
          <div className="flex gap-2">
            <Link href="/menu/metacognition" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md text-[#627D98]"><Rocket size={16}/></Link>
            <Link href="/menu/metacognition/profile" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md text-[#627D98]"><User size={16}/></Link>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-xl font-bold text-[#243B53] flex items-center gap-3"><History className="text-[#627D98]"/> All Logs</h1>
          <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">ラボ全体の報告記録</p>
        </div>

        <div className="space-y-6">
          {displayLogs.length > 0 ? displayLogs.map((log) => {
            const isMyPost = myMemberId && log.no === myMemberId;
            const isEditing = editingId === log.id;

            return (
              <div key={log.id} className={`bg-white border border-[#BCCCDC] rounded-2xl overflow-hidden shadow-sm transition-all ${isEditing ? "ring-2 ring-[#627D98]" : ""}`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Researcher</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm font-bold ${isMyPost ? "bg-[#486581] text-white" : "bg-[#243B53] text-white"}`}>
                          NO.{log.no}
                        </span>
                        {isMyPost && <span className="text-[8px] font-bold text-[#627D98] uppercase tracking-widest opacity-60">(Me)</span>}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {isMyPost && !isEditing && (
                        <div className="flex gap-2 mr-2">
                          <button onClick={() => startEdit(log)} className="text-[#627D98] opacity-40 hover:opacity-100 transition-all"><Pencil size={16}/></button>
                          <button onClick={() => handleDelete(log.id)} className="text-red-400 opacity-40 hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                        </div>
                      )}
                      {!isEditing && (
                        <button onClick={() => toggleFavorite(log.id)}>
                          <Star size={20} className={favorites.includes(log.id) ? "fill-[#B4941F] text-[#B4941F]" : "text-[#BCCCDC] opacity-30"} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4" onClick={() => !isEditing && setExpandedId(expandedId === log.id ? null : log.id)}>
                    {isEditing ? (
                      /* 編集フォーム表示 */
                      <div className="space-y-4 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
                        <EditField label="Material" value={editForm.material} onChange={(v) => setEditForm({...editForm, material: v})} />
                        <EditField label="Scene" value={editForm.scene} onChange={(v) => setEditForm({...editForm, scene: v})} />
                        <EditField label="Action" value={editForm.action} onChange={(v) => setEditForm({...editForm, action: v})} isTextarea />
                        <EditField label="Result" value={editForm.result} onChange={(v) => setEditForm({...editForm, result: v})} />
                        <EditField label="Note" value={editForm.note} onChange={(v) => setEditForm({...editForm, note: v})} />
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => handleUpdate(log.id)} className="flex-1 bg-[#486581] text-white py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2"><Check size={14}/> Save</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 bg-[#F0F4F8] text-[#627D98] py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2"><X size={14}/> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      /* 通常表示 */
                      <>
                        <LogLine label="Material" content={log.material} />
                        <LogLine label="Scene" content={log.scene} />
                        {expandedId === log.id && (
                          <div className="space-y-4 pt-4 border-t border-[#D9E2EC] animate-in fade-in slide-in-from-top-1">
                            <LogLine label="Action" content={log.action} />
                            <LogLine label="Result" content={log.result} />
                            <LogLine label="Note" content={log.note} />
                          </div>
                        )}
                        <div className="mt-4 flex justify-center opacity-20">{expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <p className="text-center py-20 text-[11px] opacity-30 uppercase font-bold tracking-widest">No reports yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LogLine({ label, content }) {
  return (
    <div className="grid grid-cols-[85px_1fr] gap-3 items-baseline">
      <span className="text-[9px] font-bold text-[#627D98] opacity-50 uppercase">{label}</span>
      <p className="text-[13px] leading-relaxed text-[#334E68]">{content || "---"}</p>
    </div>
  );
}

function EditField({ label, value, onChange, isTextarea = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase ml-1">{label}</span>
      {isTextarea ? (
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#F0F4F8] border border-[#BCCCDC] rounded-lg p-2 text-[13px] outline-none focus:border-[#627D98]"
          rows={3}
        />
      ) : (
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#F0F4F8] border border-[#BCCCDC] rounded-lg p-2 text-[13px] outline-none focus:border-[#627D98]"
        />
      )}
    </div>
  );
}