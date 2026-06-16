"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, History, Star, ChevronDown, ChevronUp, 
  User, Rocket, Trash2 
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";

export default function AllLogsPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [displayLogs, setDisplayLogs] = useState([]);
  const [myMemberId, setMyMemberId] = useState("");

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

  const handleDelete = async (id) => {
    if (!confirm("この報告を削除しますか？")) return;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (!error) {
      setDisplayLogs(displayLogs.filter(log => log.id !== id));
    }
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

            return (
              <div key={log.id} className="bg-white border border-[#BCCCDC] rounded-2xl overflow-hidden shadow-sm transition-all">
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
                      {isMyPost && (
                        <button onClick={() => handleDelete(log.id)} className="text-red-400 opacity-40 hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                      )}
                      <button onClick={() => toggleFavorite(log.id)}>
                        <Star size={20} className={favorites.includes(log.id) ? "fill-[#B4941F] text-[#B4941F]" : "text-[#BCCCDC] opacity-30"} />
                      </button>
                    </div>
                  </div>

                  <div className="cursor-pointer space-y-4" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                    <LogLine label="Material" content={log.material} />
                    <LogLine label="Scene" content={log.scene} />
                    {expandedId === log.id && (
                      <div className="space-y-4 pt-4 border-t border-[#F0F4F8] animate-in fade-in slide-in-from-top-1 duration-200">
                        <LogLine label="Action" content={log.action} />
                        <LogLine label="Result" content={log.result} />
                        <LogLine label="Note" content={log.note} />
                      </div>
                    )}
                    <div className="flex justify-center opacity-20 pt-2">
                      {expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
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
      <p className="text-[13px] leading-relaxed text-[#334E68] break-all">{content || "---"}</p>
    </div>
  );
}