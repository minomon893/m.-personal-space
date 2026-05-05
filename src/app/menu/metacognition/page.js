"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Rocket, PlusCircle, History, ChevronDown, 
  ChevronUp, Star, Settings, Target, PlayCircle, TrendingUp, FlaskConical, Clock, User 
} from "lucide-react";
import { supabase } from "../../../lib/supabase"; 

export default function MetacognitionPortal() {
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({ material: "", scene: "", action: "", result: "", note: "" });
  const [favorites, setFavorites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [myMemberId, setMyMemberId] = useState("");

  useEffect(() => {
    // 1. ローカルストレージを確認（投稿済みならIDがある）
    const savedId = localStorage.getItem("my_member_id");
    if (savedId) {
      setMyMemberId(savedId);
    }

    // 2. お気に入り情報の取得
    const savedFavs = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
    setFavorites(savedFavs);

    // 3. 最新ログの取得
    const fetchInitial = async () => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(3);
      if (data) setLogs(data);
    };
    fetchInitial();
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

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!formData.material || !formData.action) return;
    
    let currentId = myMemberId;

    // 初めての投稿の場合：団員番号を割り振る
    if (!currentId) {
      try {
        // データベースから「現在何人のユニークな投稿者がいるか」を取得
        const { data: allReports, error: fetchError } = await supabase.from('reports').select('no');
        if (fetchError) throw fetchError;

        const uniqueUsers = new Set(allReports.map(r => r.no)).size;
        // 次の番号を割り当て (例: 001, 002...)
        currentId = (uniqueUsers + 1).toString().padStart(3, '0');
        
        // ブラウザに保存して永続化
        localStorage.setItem("my_member_id", currentId);
        setMyMemberId(currentId);
        
        alert(`初報告ありがとうございます。あなたは団員 No.${currentId} として登録されました。`);
      } catch (err) {
        console.error("ID発行エラー:", err);
        alert("番号の発行に失敗しました。通信環境を確認してください。");
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
      setLogs(prev => [data[0], ...prev].slice(0, 3));
      setFormData({ material: "", scene: "", action: "", result: "", note: "" });
    } else {
      console.error("Error submitting report:", error);
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
            <h2 className="text-[10px] font-bold opacity-50 uppercase flex items-center gap-2">
              <PlusCircle size={10}/> New Report
            </h2>
            <span className={`text-[9px] font-mono font-bold tracking-wider ${myMemberId ? "text-[#486581]" : "opacity-20"}`}>
              REPORTER: {myMemberId ? `NO.${myMemberId}` : "---"}
            </span>
          </div>

          {!myMemberId && (
            <div className="bg-[#D9E2EC]/50 border border-[#BCCCDC] rounded-xl p-3 mb-4 animate-pulse">
              <p className="text-[10px] text-[#486581] font-bold leading-relaxed text-center">
                まだ団員番号がありません。<br/>最初の報告を送信すると、先着順で番号が割り振られます。
              </p>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="bg-white border border-[#BCCCDC] rounded-2xl p-6 shadow-md space-y-5">
            <FormField label="Material" value={formData.material} onChange={(v)=>setFormData({...formData, material:v})} icon={<Settings size={14}/>} placeholder="素材（カメラ、水など）" />
            <FormField label="Scene" value={formData.scene} onChange={(v)=>setFormData({...formData, scene:v})} icon={<Target size={14}/>} placeholder="どんな時に使う？" />
            <FormField label="Action" value={formData.action} onChange={(v)=>setFormData({...formData, action:v})} icon={<PlayCircle size={14}/>} placeholder="操作" isTextarea />
            <FormField label="Result" value={formData.result} onChange={(v)=>setFormData({...formData, result:v})} icon={<TrendingUp size={14}/>} placeholder="変化" />
            <FormField label="Observation" value={formData.note} onChange={(v)=>setFormData({...formData, note:v})} icon={<FlaskConical size={14}/>} placeholder="気づき" />
            <button type="submit" className="w-full py-4 bg-[#486581] text-white rounded-xl font-bold text-sm hover:bg-[#334E68] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
              <Rocket size={16}/> 開発報告を送信する
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-[10px] font-bold opacity-50 mb-3 uppercase flex items-center gap-2 px-2"><Clock size={10}/> Latest Reports</h2>
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-[#BCCCDC] rounded-2xl overflow-hidden shadow-sm transition-all">
              <div className="p-6 relative">
                <button onClick={() => toggleFavorite(log.id)} className="absolute top-6 right-6 z-10 active:scale-125 transition-transform">
                  <Star size={18} className={favorites.includes(log.id) ? "fill-[#B4941F] text-[#B4941F]" : "text-[#BCCCDC] opacity-30"} />
                </button>
                <div className="cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-mono bg-[#F0F4F8] text-[#627D98] px-2 py-0.5 rounded border border-[#D9E2EC] font-bold italic uppercase tracking-tighter">
                      Researcher NO.{log.no}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <LogLine label="Material" content={log.material} />
                    <LogLine label="Scene" content={log.scene} />
                    {expandedId === log.id && (
                      <div className="space-y-4 pt-4 border-t border-[#D9E2EC] animate-in fade-in slide-in-from-top-1 duration-300">
                        <LogLine label="Action" content={log.action} />
                        <LogLine label="Result" content={log.result} />
                        <LogLine label="Observation" content={log.note} />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center opacity-20">{expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                </div>
              </div>
            </div>
          ))}
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
        <textarea value={value} onChange={(e)=>onChange(e.target.value)} rows="2" placeholder={placeholder} className="w-full bg-[#F0F4F8]/50 border border-[#D9E2EC] rounded-lg px-4 py-3 text-[13px] focus:outline-none" /> :
        <input value={value} onChange={(e)=>onChange(e.target.value)} type="text" placeholder={placeholder} className="w-full bg-[#F0F4F8]/50 border border-[#D9E2EC] rounded-lg px-4 py-3 text-[13px] focus:outline-none" />
      }
    </div>
  );
}

function LogLine({ label, content }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2 items-baseline">
      <span className="text-[9px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter">{label}</span>
      <p className="text-[13px] text-[#334E68] leading-relaxed">{content || "---"}</p>
    </div>
  );
}