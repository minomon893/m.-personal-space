"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Rocket, PlusCircle, History, ChevronDown, 
  ChevronUp, Star, Settings, Target, PlayCircle, TrendingUp, FlaskConical, Clock, User,
  Trash2, Check, RefreshCw, Users, Sparkles, BookOpen
} from "lucide-react";
import { supabase } from "../../../lib/supabase"; 

export default function MetacognitionPortal() {
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({ material: "", scene: "", action: "", result: "", note: "" });
  const [favorites, setFavorites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [myMemberId, setMyMemberId] = useState("");
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
      setIsSubmitted(true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("この報告を削除しますか？")) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) fetchInitial();
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#334E68] font-sans p-6 pb-20">
      <div className="max-w-md mx-auto">
        {/* ナビゲーション */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/menu" className="text-[11px] font-bold opacity-50 flex items-center gap-2 uppercase tracking-widest hover:opacity-100 transition-all">
            <ArrowLeft size={12}/> Back
          </Link>
          <div className="flex gap-2">
            <Link href="/menu/metacognition/logs" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md transition-all text-[#627D98] text-[10px] font-bold">
              <History size={14} /> <span>みんなの報告</span>
            </Link>
            <Link href="/menu/metacognition/profile" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md transition-all text-[#627D98] text-[10px] font-bold">
              <User size={14} /> <span>自分の報告</span>
            </Link>
          </div>
        </div>

        {/* ヘッダー */}
        <div className="flex flex-col items-center gap-2 mb-10 text-center">
          <Rocket size={24} className="text-[#627D98]" />
          <h1 className="text-lg font-bold tracking-[0.2em] uppercase italic text-[#243B53]">Metacognition Lab</h1>
          <p className="text-[9px] font-bold opacity-40 tracking-[0.3em]">メタ認知トリガー開発部</p>
        </div>

        {/* 活動内容解説 */}
        <section className="mb-10">
          <div className="bg-white border-2 border-[#D9E2EC] rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={60} className="text-[#486581]" />
            </div>
            
            <h3 className="text-[13px] font-extrabold mb-4 flex items-center gap-2 text-[#243B53]">
              <BookOpen size={16} className="text-[#486581]" /> ラボの活動内容
            </h3>
            
            <div className="space-y-4 text-[12px] text-[#486581] leading-relaxed">
              <p>
                <strong>「メタ認知」</strong>とは、思考や感情にのまれそうな自分を「もう一人の自分」が空から客観的に眺めるスキルのことである。
              </p>
              <p>
                当ラボではメタ認知に必要不可欠な、不安や怒りと適切な距離を置く心理技術<strong>「脱フュージョン」</strong>をトレーニングする。
              </p>
              
              <div className="bg-[#F0F4F8] rounded-2xl p-4 border border-[#BCCCDC]/50">
                <p className="font-bold text-[11px] mb-2 text-[#243B53]">具体的なトレーニング例：</p>
                <ul className="space-y-3 text-[11px] border-t border-[#BCCCDC]/50 pt-3">
                  <li className="flex flex-col gap-1">
                    <span className="font-bold text-[#243B53]">【例1：不安がいっぱいになった時】</span>
                    <span>「脳内のラジオ」のつまみを回すイメージを持ち、不安な声を小さく絞る。</span>
                  </li>
                  <li className="flex flex-col gap-1">
                    <span className="font-bold text-[#243B53]">【例2：イライラが止まらない時】</span>
                    <span>空に浮かぶ雲にその気持ちを乗せて、流れていくのをただ眺める。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* フォーム */}
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
                <FormField label="Material" value={formData.material} onChange={(v)=>setFormData({...formData, material:v})} icon={<Settings size={14}/>} placeholder="素材（例：ラジオ、雲、つまみ）" />
                <FormField label="Scene" value={formData.scene} onChange={(v)=>setFormData({...formData, scene:v})} icon={<Target size={14}/>} placeholder="どんな状況・感情で？（例：不安、焦り）" />
                <FormField label="Action" value={formData.action} onChange={(v)=>setFormData({...formData, action:v})} icon={<PlayCircle size={14}/>} placeholder="どう操作する？（例：音量を下げる、見送る）" isTextarea />
                <FormField label="Result" value={formData.result} onChange={(v)=>setFormData({...formData, result:v})} icon={<TrendingUp size={14}/>} placeholder="気持ちはどう変わった？" />
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
                <h3 className="font-bold text-[#243B53] mb-2">報告完了！</h3>
                <p className="text-[11px] opacity-60 mb-8">保存完了！</p>
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

        {/* 最近のログリスト */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold opacity-50 mb-3 uppercase flex items-center gap-2 px-2"><Clock size={10}/> Latest Reports</h2>
          {logs.map((log) => {
            const isMyPost = myMemberId && log.no === myMemberId;
            return (
              <div key={log.id} className="bg-white border border-[#BCCCDC] rounded-2xl overflow-hidden shadow-sm transition-all">
                <div className="p-6 relative">
                  <div className="absolute top-6 right-6 flex gap-3 z-10">
                    {isMyPost && (
                      <button onClick={() => handleDelete(log.id)} className="text-red-400 opacity-30 hover:opacity-100 transition-all"><Trash2 size={15}/></button>
                    )}
                    <button onClick={() => toggleFavorite(log.id)}>
                      <Star size={18} className={favorites.includes(log.id) ? "fill-[#B4941F] text-[#B4941F]" : "text-[#BCCCDC] opacity-30"} />
                    </button>
                  </div>

                  <div className="cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold italic uppercase tracking-tighter ${isMyPost ? "bg-[#486581] text-white border-[#486581]" : "bg-[#F0F4F8] text-[#627D98] border-[#D9E2EC]"}`}>
                        Researcher NO.{log.no} {isMyPost && "(Me)"}
                      </span>
                    </div>

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

function LogLine({ label, content }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 items-baseline">
      <span className="text-[9px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter">{label}</span>
      <p className="text-[13px] text-[#334E68] leading-relaxed">{content || "---"}</p>
    </div>
  );
}