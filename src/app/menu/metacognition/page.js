"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Rocket, PlusCircle, History, ChevronDown, 
  ChevronUp, Star, Settings, Target, PlayCircle, TrendingUp, FlaskConical, Clock, User,
  Pencil, Trash2, Check, X, RefreshCw, Users
} from "lucide-react";
// 正しいパス: ../../../lib/supabase
import { supabase } from "../../../lib/supabase"; 

export default function MetacognitionPortal() {
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({ material: "", scene: "", action: "", result: "", note: "" });
  const [favorites, setFavorites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [myMemberId, setMyMemberId] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ material: "", scene: "", action: "", result: "", note: "" });

  // 送信状態管理
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fetchInitial = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(3);
    if (data) setLogs(data);
  };

  useEffect(() => {
    const savedId = localStorage.getItem("my_member_id");
    if (savedId) setMyMemberId(savedId);

    const savedFavs = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
    setFavorites(savedFavs);

    fetchInitial();
  }, []);

  const toggleFavorite = (id) => {
    const savedFavs = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
    let newFavs = savedFavs.includes(id) ? savedFavs.filter(favId => favId !== id) : [...savedFavs, id];
    setFavorites(newFavs);
    localStorage.setItem("metacog_favorites", JSON.stringify(newFavs));
  };

  const incrementTotalCreated = () => {
    const currentCount = parseInt(localStorage.getItem("total_created_count") || "0");
    localStorage.setItem("total_created_count", (currentCount + 1).toString());
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    // note以外が空ならリターン
    if (!formData.material || !formData.scene || !formData.action || !formData.result) return;
    
    let currentId = myMemberId;

    if (!currentId) {
      try {
        const { data: allReports } = await supabase.from('reports').select('no');
        const uniqueUsers = new Set(allReports?.map(r => r.no)).size;
        currentId = (uniqueUsers + 1).toString().padStart(3, '0');
        localStorage.setItem("my_member_id", currentId);
        setMyMemberId(currentId);
        alert(`初報告ありがとうございます。あなたは団員 No.${currentId} として登録されました。`);
      } catch (err) {
        return;
      }
    }

    const newEntry = { 
      no: currentId, 
      material: formData.material, 
      scene: formData.scene, 
      action: formData.action, 
      result: formData.result, 
      note: formData.note 
    };

    const { data, error } = await supabase.from('reports').insert([newEntry]).select();
    if (!error && data) {
      incrementTotalCreated();
      setLogs(prev => [data[0], ...prev].slice(0, 3));
      setFormData({ material: "", scene: "", action: "", result: "", note: "" });
      setIsSubmitted(true); // 送信完了状態にする
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("この報告を削除しますか？")) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) fetchInitial();
  };

  const startEdit = (log) => {
    setEditingId(log.id);
    setEditForm({ material: log.material, scene: log.scene, action: log.action, result: log.result, note: log.note });
    setExpandedId(log.id);
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase.from('reports').update(editForm).eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchInitial();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#334E68] font-sans p-6 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-8">
          <Link href="/menu" className="text-[11px] font-bold opacity-50 flex items-center gap-2 uppercase tracking-widest hover:opacity-100 transition-all">
            <ArrowLeft size={12}/> Back
          </Link>
          <div className="flex gap-2">
            <Link href="/menu/metacognition/logs" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md transition-all text-[#627D98]"><History size={16} /></Link>
            <Link href="/menu/metacognition/profile" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md transition-all text-[#627D98]"><User size={16} /></Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mb-10 text-center">
          <Rocket size={24} className="text-[#627D98]" />
          <h1 className="text-lg font-bold tracking-[0.2em] uppercase italic text-[#243B53]">Metacognition Lab</h1>
          <p className="text-[9px] font-bold opacity-40 tracking-[0.3em]">メタ認知トリガー開発部</p>
        </div>

        <section className="mb-12">
          <div className="flex justify-between items-end mb-3 px-2">
            <h2 className="text-[10px] font-bold opacity-50 uppercase flex items-center gap-2"><PlusCircle size={10}/> New Report</h2>
            <span className={`text-[9px] font-mono font-bold tracking-wider ${myMemberId ? "text-[#486581]" : "opacity-20"}`}>
              REPORTER: {myMemberId ? `NO.${myMemberId}` : "---"}
            </span>
          </div>
          
          <div className="bg-white border border-[#BCCCDC] rounded-2xl p-6 shadow-md">
            {!isSubmitted ? (
              <form onSubmit={handleReportSubmit} className="space-y-5 animate-in fade-in duration-500">
                <FormField label="Material" value={formData.material} onChange={(v)=>setFormData({...formData, material:v})} icon={<Settings size={14}/>} placeholder="素材" />
                <FormField label="Scene" value={formData.scene} onChange={(v)=>setFormData({...formData, scene:v})} icon={<Target size={14}/>} placeholder="状況" />
                <FormField label="Action" value={formData.action} onChange={(v)=>setFormData({...formData, action:v})} icon={<PlayCircle size={14}/>} placeholder="操作" isTextarea />
                <FormField label="Result" value={formData.result} onChange={(v)=>setFormData({...formData, result:v})} icon={<TrendingUp size={14}/>} placeholder="変化" />
                <FormField label="Bug Reporting (Optional)" value={formData.note} onChange={(v)=>setFormData({...formData, note:v})} icon={<FlaskConical size={14}/>} placeholder="バグ報告（任意）" />
                <button type="submit" className="w-full py-4 bg-[#486581] text-white rounded-xl font-bold text-sm hover:bg-[#334E68] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                  <Rocket size={16}/> 開発報告を送信する
                </button>
              </form>
            ) : (
              <div className="py-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h3 className="font-bold text-[#243B53] mb-2">報告の送信が完了しました</h3>
                <p className="text-[11px] opacity-60 mb-8">データが正常にアーカイブされました</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="w-full py-3 bg-[#486581] text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-[#334E68] transition-all"
                  >
                    <RefreshCw size={14}/> 続けて報告する
                  </button>
                  <Link 
                    href="/menu/metacognition/logs"
                    className="w-full py-3 bg-[#F0F4F8] text-[#627D98] border border-[#D9E2EC] rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-[#D9E2EC] transition-all"
                  >
                    <Users size={14}/> みんなの報告を見る
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-bold opacity-50 mb-3 uppercase flex items-center gap-2 px-2"><Clock size={10}/> Latest Reports</h2>
          {logs.map((log) => {
            const isMyPost = myMemberId && log.no === myMemberId;
            const isEditing = editingId === log.id;

            return (
              <div key={log.id} className={`bg-white border border-[#BCCCDC] rounded-2xl overflow-hidden shadow-sm transition-all ${isEditing ? "ring-2 ring-[#627D98]" : ""}`}>
                <div className="p-6 relative">
                  <div className="absolute top-6 right-6 flex gap-3 z-10">
                    {isMyPost && !isEditing && (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(log)} className="text-[#627D98] opacity-30 hover:opacity-100 transition-all"><Pencil size={15}/></button>
                        <button onClick={() => handleDelete(log.id)} className="text-red-400 opacity-30 hover:opacity-100 transition-all"><Trash2 size={15}/></button>
                      </div>
                    )}
                    {!isEditing && (
                      <button onClick={() => toggleFavorite(log.id)}>
                        <Star size={18} className={favorites.includes(log.id) ? "fill-[#B4941F] text-[#B4941F]" : "text-[#BCCCDC] opacity-30"} />
                      </button>
                    )}
                  </div>

                  <div className="cursor-pointer" onClick={() => !isEditing && setExpandedId(expandedId === log.id ? null : log.id)}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold italic uppercase tracking-tighter ${isMyPost ? "bg-[#486581] text-white border-[#486581]" : "bg-[#F0F4F8] text-[#627D98] border-[#D9E2EC]"}`}>
                        Researcher NO.{log.no} {isMyPost && "(Me)"}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4 animate-in fade-in" onClick={(e)=>e.stopPropagation()}>
                        <EditField label="Material" value={editForm.material} onChange={(v)=>setEditForm({...editForm, material:v})} />
                        <EditField label="Scene" value={editForm.scene} onChange={(v)=>setEditForm({...editForm, scene:v})} />
                        <EditField label="Action" value={editForm.action} onChange={(v)=>setEditForm({...editForm, action:v})} isTextarea />
                        <EditField label="Result" value={editForm.result} onChange={(v)=>setEditForm({...editForm, result:v})} />
                        <EditField label="Bug Reporting" value={editForm.note} onChange={(v)=>setEditForm({...editForm, note:v})} />
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => handleUpdate(log.id)} className="flex-1 bg-[#486581] text-white py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2"><Check size={14}/> Save</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 bg-[#F0F4F8] text-[#627D98] py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2"><X size={14}/> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <LogLine label="Material" content={log.material} />
                        <LogLine label="Scene" content={log.scene} />
                        {expandedId === log.id && (
                          <div className="space-y-4 pt-4 border-t border-[#D9E2EC] animate-in fade-in slide-in-from-top-1 duration-300">
                            <LogLine label="Action" content={log.action} />
                            <LogLine label="Result" content={log.result} />
                            <LogLine label="Bug Reporting" content={log.note} />
                          </div>
                        )}
                        <div className="mt-4 flex justify-center opacity-20">{expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function FormField({ icon, label, placeholder, value, onChange, isTextarea = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[#627D98] flex items-center gap-2 ml-1 uppercase">{icon} {label}</label>
      {isTextarea ? 
        <textarea value={value} onChange={(e)=>onChange(e.target.value)} rows="2" placeholder={placeholder} className="w-full bg-[#F0F4F8]/50 border border-[#D9E2EC] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#627D98]" /> :
        <input value={value} onChange={(e)=>onChange(e.target.value)} type="text" placeholder={placeholder} className="w-full bg-[#F0F4F8]/50 border border-[#D9E2EC] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#627D98]" />
      }
    </div>
  );
}

function EditField({ label, value, onChange, isTextarea = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase ml-1">{label}</span>
      {isTextarea ? 
        <textarea value={value} onChange={(e)=>onChange(e.target.value)} rows="3" className="w-full bg-[#F0F4F8] border border-[#BCCCDC] rounded-lg p-2 text-[13px] outline-none focus:border-[#627D98]" /> :
        <input type="text" value={value} onChange={(e)=>onChange(e.target.value)} className="w-full bg-[#F0F4F8] border border-[#BCCCDC] rounded-lg p-2 text-[13px] outline-none focus:border-[#627D98]" />
      }
    </div>
  );
}

function LogLine({ label, content }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 items-baseline">
      <span className="text-[9px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter">{label}</span>
      <p className="text-[13px] text-[#334E68] leading-relaxed">{content || "---"}</p>
    </div>
  );
}