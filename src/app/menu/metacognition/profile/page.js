"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Star, History, Bookmark, PenLine, Award, Info, X, Rocket } from "lucide-react";
import { supabase } from "../../../../lib/supabase";

export default function ProfilePage() {
  const [favLogs, setFavLogs] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  const [myMemberId, setMyMemberId] = useState("");
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  const RANKS = [
    { threshold: 20, title: "Grand Master", sub: "最高技術顧問", icon: <Award size={36} className="text-[#B4941F]" /> },
    { threshold: 10, title: "Senior Researcher", sub: "上級研究員", icon: <Award size={36} className="text-[#627D98]" /> },
    { threshold: 0, title: "Junior Researcher", sub: "新人研究員", icon: <Award size={36} className="text-[#9FB3C8]" /> },
  ];
  
  const currentRank = RANKS.find(r => myLogs.length >= r.threshold) || RANKS[RANKS.length - 1];

  useEffect(() => {
    const id = localStorage.getItem("my_member_id");
    setMyMemberId(id || ""); // 存在しない場合は空文字

    const fetchProfileData = async () => {
      const { data: all } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (all) {
        // 1. 自分の番号(no)が刻印された投稿だけを抽出
        if (id) {
          setMyLogs(all.filter(log => log.no === id));
        }
        
        // 2. お気に入り
        const savedIds = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
        setFavLogs(all.filter(log => savedIds.includes(log.id)));
      }
    };
    fetchProfileData();
  }, []);

  const handleUnfavorite = (id) => {
    const savedIds = JSON.parse(localStorage.getItem("metacog_favorites") || "[]");
    const newFavs = savedIds.filter(favId => favId !== id);
    localStorage.setItem("metacog_favorites", JSON.stringify(newFavs));
    setFavLogs(prev => prev.filter(log => log.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#334E68] p-6 pb-24 font-sans">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10 text-[11px] font-bold opacity-50 uppercase">
          <Link href="/menu/metacognition" className="flex items-center gap-2 hover:opacity-100 transition-all"><ArrowLeft size={12}/> Back</Link>
          <div className="flex gap-2">
            <Link href="/menu/metacognition" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md text-[#627D98]"><Rocket size={16}/></Link>
            <Link href="/menu/metacognition/logs" className="p-2 bg-white border border-[#BCCCDC] rounded-full hover:shadow-md text-[#627D98]"><History size={16}/></Link>
          </div>
        </div>

        <div className="text-center mb-10 relative">
          <button onClick={() => setIsRankModalOpen(true)} className="absolute right-1/2 translate-x-12 top-0 p-2 text-[#627D98] opacity-30 hover:opacity-100"><Info size={16} /></button>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 border border-[#BCCCDC] shadow-sm relative">
            {currentRank.icon}
          </div>
          <h1 className="text-xl font-bold tracking-[0.15em] text-[#243B53] uppercase">{currentRank.title}</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase mt-1">{currentRank.sub}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-12">
          <StatBox label="User ID" value={myMemberId || "---"} sub="あなたの番号" />
          <StatBox label="Reports" value={myLogs.length} sub="あなたの報告数" />
          <StatBox label="Stocks" value={favLogs.length} sub="保存済み" />
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-[11px] font-bold flex items-center gap-2 text-[#486581] uppercase tracking-wider mb-6 border-b border-[#BCCCDC] pb-2"><PenLine size={14}/> My Submissions</h2>
            <div className="space-y-4">
              {myLogs.length > 0 ? myLogs.map(log => (
                <ProfileCard key={log.id} log={log} type="submission" />
              )) : (
                <p className="text-[11px] opacity-30 text-center py-10 italic">まだ報告がありません。最初の報告をして番号を受け取りましょう。</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold flex items-center gap-2 text-[#486581] uppercase tracking-wider mb-6 border-b border-[#BCCCDC] pb-2"><Bookmark size={14}/> Stocked Reports</h2>
            <div className="space-y-4">
              {favLogs.length > 0 ? favLogs.map(log => (
                <ProfileCard key={log.id} log={log} type="stock" onUnfav={() => handleUnfavorite(log.id)} />
              )) : (
                <p className="text-[11px] opacity-30 text-center py-10">保存されたレポートはありません</p>
              )}
            </div>
          </section>
        </div>

        {isRankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#243B53]/20 backdrop-blur-sm" onClick={() => setIsRankModalOpen(false)}>
            <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsRankModalOpen(false)} className="absolute top-4 right-4 text-[#BCCCDC] hover:text-[#486581]"><X size={20} /></button>
              <div className="text-center mb-8"><h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-2">Development Rank</h2></div>
              <div className="space-y-6">
                {RANKS.slice().reverse().map((r) => (
                  <div key={r.threshold} className={`flex items-center gap-4 ${myLogs.length >= r.threshold ? 'opacity-100' : 'opacity-20'}`}>
                    <div className="text-[10px] font-mono font-bold w-8">{r.threshold}+</div>
                    <div><div className="text-[11px] font-bold text-[#243B53] uppercase">{r.title}</div><div className="text-[8px] font-bold opacity-50">{r.sub}</div></div>
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

function ProfileCard({ log, type, onUnfav }) {
  return (
    <div className="bg-white border border-[#BCCCDC] rounded-2xl p-5 shadow-sm relative">
      <div className="absolute top-5 right-5">
        {type === 'stock' ? (
          <button onClick={onUnfav} className="active:scale-125 transition-transform"><Star size={18} className="fill-[#B4941F] text-[#B4941F]" /></button>
        ) : (
          <div className="opacity-10 text-[#627D98]"><PenLine size={18} /></div>
        )}
      </div>
      <span className="text-[8px] font-mono bg-[#F0F4F8] text-[#627D98] px-2 py-0.5 rounded font-bold uppercase italic">Researcher NO.{log.no}</span>
      <h3 className="text-[14px] font-bold text-[#243B53] mt-2 leading-tight">{log.material}</h3>
      <p className="text-[12px] opacity-70 mt-1 italic">"{log.action}"</p>
    </div>
  );
}