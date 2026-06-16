"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, User, Star, History, Bookmark, PenLine, 
  Award, Info, X, Rocket, Trash2, Pencil, Check, 
  Settings, Target, PlayCircle, TrendingUp, FlaskConical,
  ChevronDown, ChevronUp
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";

export default function ProfilePage() {
  const [favLogs, setFavLogs] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  const [myMemberId, setMyMemberId] = useState("");
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [maxReportCount, setMaxReportCount] = useState(0);

  // 編集用ステート
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ 
    material: "", scene: "", action: "", result: "", note: "" 
  });

  const RANKS = [
    { threshold: 20, title: "Grand Master", sub: "最高技術顧問", icon: <Award size={36} className="text-[#B4941F]" /> },
    { threshold: 10, title: "Senior Researcher", sub: "上級研究員", icon: <Award size={36} className="text-[#627D98]" /> },
    { threshold: 0, title: "Junior Researcher", sub: "新人研究員", icon: <Award size={36} className="text-[#9FB3C8]" /> },
  ];
  
  const currentRank = RANKS.find(r => maxReportCount >= r.threshold) || RANKS[RANKS.length - 1];

  const fetchProfileData = async () => {
    const id = localStorage.getItem("my_member_id");
    const { data: all } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    
    if (all) {
      let currentLogs = [];
      if (id) {
        currentLogs = all.filter(log => log.no === id);
        setMyLogs(currentLogs);

        const savedStats = JSON.parse(localStorage.getItem("metacog_achievements") || "{}");
        const prevMax = savedStats.maxCount || 0;
        const newMax = Math.max(prevMax, currentLogs.length);
        
        setMaxReportCount(newMax);
        localStorage.setItem("metacog_achievements", JSON.stringify({ ...savedStats, maxCount: newMax }));
      }
      const savedIds = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
      setFavLogs(all.filter(log => savedIds.includes(log.id)));
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("my_member_id");
    setMyMemberId(id || "");
    
    const savedStats = JSON.parse(localStorage.getItem("metacog_achievements") || "{}");
    if (savedStats.maxCount) {
      setMaxReportCount(savedStats.maxCount);
    }

    fetchProfileData();
  }, []);

  const handleUnfavorite = (id) => {
    const savedIds = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
    const newFavs = savedIds.filter(favId => favId !== id);
    localStorage.setItem("metacog_favorites", JSON.stringify(newFavs));
    setFavLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleDelete = async (id) => {
    if (!confirm("この報告を削除しますか？")) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) fetchProfileData();
  };

  const startEdit = (e, log) => {
    e.stopPropagation(); // 親のタップ（展開）を防ぐ
    setEditingId(log.id);
    setEditForm({ 
      material: log.material || "", 
      scene: log.scene || "", 
      action: log.action || "", 
      result: log.result || "", 
      note: log.note || "" 
    });
  };

  const handleUpdate = async (id) => {
    const updateLocalState = (prev) => 
      prev.map(log => log.id === id ? { ...log, ...editForm } : log);
    
    setMyLogs(updateLocalState);
    setFavLogs(updateLocalState);
    setEditingId(null);

    const { error } = await supabase.from('reports').update(editForm).eq('id', id);
    
    if (error) {
      alert("更新に失敗しました。");
      fetchProfileData();
    } else {
      // データベースの書き込み成功後、最新状態を再取得して同期を完全なものにする
      fetchProfileData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#334E68] p-6 pb-24 font-sans selection:bg-[#BCCCDC]/30">
      <div className="max-w-md mx-auto">
        {/* ヘッダーナビゲーション */}
        <div className="flex justify-between items-center mb-10 text-[11px] font-bold opacity-50 uppercase">
          <Link href="/menu/metacognition" className="flex items-center gap-2 hover:opacity-100 transition-all">
            <ArrowLeft size={12}/> Back
          </Link>
          <div className="flex gap-2">
            <Link href="/menu/metacognition" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md text-[#627D98] transition">
              <Rocket size={16}/>
            </Link>
            <Link href="/menu/metacognition/logs" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md text-[#627D98] transition">
              <History size={16}/>
            </Link>
          </div>
        </div>

        {/* ランクインフォ */}
        <div className="text-center mb-10 relative">
          <button onClick={() => setIsRankModalOpen(true)} className="absolute right-1/2 translate-x-12 top-0 p-2 text-[#627D98] opacity-40 hover:opacity-100 transition">
            <Info size={16} />
          </button>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 border border-[#BCCCDC] shadow-sm relative">
            {currentRank.icon}
          </div>
          <h1 className="text-xl font-bold tracking-[0.15em] text-[#243B53] uppercase">{currentRank.title}</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase mt-1">{currentRank.sub}</p>
        </div>

        {/* スタッツボックス */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          <StatBox label="User ID" value={myMemberId || "---"} sub="あなたの番号" />
          <StatBox label="Reports" value={myLogs.length} sub="現在の報告数" />
          <StatBox label="Stocks" value={favLogs.length} sub="保存済み" />
        </div>

        {/* メインコンテンツ */}
        <div className="space-y-12">
          {/* 自分の投稿 */}
          <section>
            <h2 className="text-[11px] font-bold flex items-center gap-2 text-[#486581] uppercase tracking-wider mb-6 border-b border-[#BCCCDC] pb-2">
              <PenLine size={14}/> My Submissions
            </h2>
            <div className="space-y-4">
              {myLogs.length > 0 ? myLogs.map(log => (
                <ProfileCard 
                  key={log.id} 
                  log={log} 
                  type="submission" 
                  isEditing={editingId === log.id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onEdit={(e) => startEdit(e, log)}
                  onDelete={(e) => handleDelete(log.id)}
                  onSave={() => handleUpdate(log.id)}
                  onCancel={() => setEditingId(null)}
                />
              )) : (
                <div className="text-center py-10 space-y-2">
                  <p className="text-[11px] opacity-30 italic text-[#486581]">まだ報告がありません。</p>
                </div>
              )}
            </div>
          </section>

          {/* ストックしたレポート */}
          <section>
            <h2 className="text-[11px] font-bold flex items-center gap-2 text-[#486581] uppercase tracking-wider mb-6 border-b border-[#BCCCDC] pb-2">
              <Bookmark size={14}/> Stocked Reports
            </h2>
            <div className="space-y-4">
              {favLogs.length > 0 ? favLogs.map(log => (
                <ProfileCard 
                  key={log.id} 
                  log={log} 
                  type="stock" 
                  onUnfav={(e) => handleUnfavorite(log.id)} 
                />
              )) : (
                <p className="text-[11px] opacity-30 text-center py-10 italic">保存されたレポートはありません</p>
              )}
            </div>
          </section>
        </div>

        {/* ランク詳細モーダル */}
        {isRankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#243B53]/20 backdrop-blur-sm" onClick={() => setIsRankModalOpen(false)}>
            <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsRankModalOpen(false)} className="absolute top-4 right-4 text-[#BCCCDC] hover:text-[#486581] transition">
                <X size={20} />
              </button>
              <div className="text-center mb-8">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-2">Development Rank</h2>
              </div>
              <div className="space-y-6">
                {RANKS.slice().reverse().map((r) => (
                  <div key={r.threshold} className={`flex items-center gap-4 transition-opacity duration-300 ${maxReportCount >= r.threshold ? 'opacity-100' : 'opacity-25'}`}>
                    <div className="text-[10px] font-mono font-bold w-8">{r.threshold}+</div>
                    <div>
                      <div className="text-[11px] font-bold text-[#243B53] uppercase">{r.title}</div>
                      <div className="text-[8px] font-bold opacity-50">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-white border border-[#BCCCDC] rounded-2xl p-4 text-center shadow-sm">
      <div className="text-[8px] font-bold opacity-40 uppercase mb-1">{label}</div>
      <div className="text-xl font-mono font-bold text-[#243B53]">{value}</div>
      <div className="text-[8px] font-bold opacity-40">{sub}</div>
    </div>
  );
}

function ProfileCard({ log, type, onUnfav, isEditing, editForm, setEditForm, onEdit, onDelete, onSave, onCancel }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (!isEditing) setIsExpanded(!isExpanded);
  };

  return (
    <div 
      onClick={handleToggle}
      className={`bg-white border border-[#BCCCDC] rounded-2xl p-5 shadow-sm relative transition-all duration-200 cursor-pointer hover:border-[#9FB3C8] select-none ${isEditing ? "ring-2 ring-[#627D98] border-transparent" : ""}`}
    >
      {/* 操作ボタンエリア */}
      <div className="absolute top-5 right-5 flex gap-2 z-20">
        {type === 'stock' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onUnfav(e); }} 
            className="active:scale-125 transition-transform p-1 hover:bg-[#F0F4F8] rounded-lg"
          >
            <Star size={18} className="fill-[#B4941F] text-[#B4941F]" />
          </button>
        ) : isEditing ? (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="text-[#486581] p-1.5 hover:bg-[#F0F4F8] rounded-lg transition">
              <Check size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onCancel(); }} className="text-[#BCCCDC] p-1.5 hover:bg-[#F0F4F8] rounded-lg transition">
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={(e) => onEdit(e)} className="text-[#627D98] opacity-30 hover:opacity-100 p-1.5 hover:bg-[#F0F4F8] rounded-lg transition">
              <Pencil size={15} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(e); }} className="text-red-400 opacity-30 hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
      
      {/* カードヘッダー */}
      <div className="flex items-center gap-2 mb-4 pr-16">
        <span className="text-[8px] font-mono bg-[#F0F4F8] text-[#627D98] px-2 py-0.5 rounded font-bold uppercase italic inline-block">
          Researcher NO.{log.no}
        </span>
        {!isEditing && (
          <div className="opacity-40 text-[#627D98]">
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        )}
      </div>
      
      {/* カードボディ */}
      {isEditing ? (
        <div className="space-y-3" onClick={e => e.stopPropagation()}>
          <EditField label="Material" value={editForm.material} onChange={(v)=>setEditForm({...editForm, material:v})} />
          <EditField label="Scene" value={editForm.scene} onChange={(v)=>setEditForm({...editForm, scene:v})} />
          <EditField label="Action" value={editForm.action} onChange={(v)=>setEditForm({...editForm, action:v})} isTextarea />
          <EditField label="Result" value={editForm.result} onChange={(v)=>setEditForm({...editForm, result:v})} />
          <EditField label="Bug Reporting" value={editForm.note} onChange={(v)=>setEditForm({...editForm, note:v})} />
        </div>
      ) : (
        <div className="space-y-3">
          <LogLine icon={<Settings size={10}/>} label="Material" content={log.material} />
          <LogLine icon={<Target size={10}/>} label="Scene" content={log.scene} />
          
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-[#F0F4F8] animate-in fade-in slide-in-from-top-1 duration-200">
              <PlayCircle size={10}/> <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter">Action</span>
              <p className="text-[12px] text-[#334E68] leading-tight font-medium break-all pl-5">{log.action || "---"}</p>
              
              <TrendingUp size={10}/> <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter">Result</span>
              <p className="text-[12px] text-[#334E68] leading-tight font-medium break-all pl-5">{log.result || "---"}</p>
              
              {log.note && (
                <>
                  <FlaskConical size={10}/> <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter">Bug Reporting</span>
                  <p className="text-[12px] text-[#334E68] leading-tight font-medium break-all pl-5">{log.note}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EditField({ label, value, onChange, isTextarea = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase ml-1">{label}</span>
      {isTextarea ? 
        <textarea value={value} onChange={(e)=>onChange(e.target.value)} rows="2" className="w-full bg-[#F0F4F8] border border-[#BCCCDC] rounded-lg p-2 text-[12px] text-[#334E68] outline-none focus:border-[#627D98] resize-none" /> :
        <input type="text" value={value} onChange={(e)=>onChange(e.target.value)} className="w-full bg-[#F0F4F8] border border-[#BCCCDC] rounded-lg p-2 text-[12px] text-[#334E68] outline-none focus:border-[#627D98]" />
      }
    </div>
  );
}

function LogLine({ icon, label, content }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 items-baseline">
      <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter flex items-center gap-1">{icon} {label}</span>
      <p className="text-[12px] text-[#334E68] leading-tight font-medium break-all">{content || "---"}</p>
    </div>
  );
}