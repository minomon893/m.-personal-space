"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Terminal, ChevronDown } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function NoticesPage() {
  const [viewedIds, setViewedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotices(data);
      }
    };

    fetchNotices();

    const saved = JSON.parse(localStorage.getItem("metacog_read_notices") || "[]");
    setViewedIds(saved);
  }, []);

  const toggleNotice = (id) => {
    const isExpanding = expandedId !== id;
    setExpandedId(isExpanding ? id : null);
    
    if (isExpanding) {
      // 1. 個別のお知らせの「New」バッジ用
      if (!viewedIds.includes(id)) {
        const newViewed = [...viewedIds, id];
        setViewedIds(newViewed);
        localStorage.setItem("metacog_read_notices", JSON.stringify(newViewed));
      }

      // 2. メニュー画面の通知バッジを消すための処理
      // 開いたお知らせが、リストの中で最も新しいものであれば localStorage を更新
      if (notices.length > 0 && id === notices[0].id) {
        localStorage.setItem("last_viewed_notice", id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#4F5D6B] font-sans selection:bg-[#C2B280]/20">
      <div className="max-w-md mx-auto">
        
        <Link
          href="/menu"
          className="text-[10px] tracking-[0.3em] font-bold opacity-40 uppercase flex items-center gap-2 mb-12 hover:opacity-100 transition-all group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Menu
        </Link>

        <header className="mb-16">
          <div className="flex items-center gap-2 mb-2 opacity-30">
            <div className="h-[1px] w-4 bg-[#4F5D6B]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Official Records</span>
          </div>
          <h1 className="text-xl font-[var(--font-serif)] font-medium tracking-[0.2em] italic text-[#2D363F]">
            News & Updates
          </h1>
        </header>

        <div className="space-y-4">
          {notices.map((item) => {
            const isRead = viewedIds.includes(item.id);
            const isExpanded = expandedId === item.id;
            const displayDate = new Date(item.created_at).toLocaleDateString('ja-JP').replace(/\//g, '.');
            
            return (
              <article 
                key={item.id} 
                className={`relative border rounded-[1.5rem] transition-all duration-300 ${
                  isExpanded ? 'bg-white/60 border-[#4F5D6B]/20' : 'bg-white/30 border-[#4F5D6B]/5 hover:bg-white/45'
                }`}
              >
                <button 
                  onClick={() => toggleNotice(item.id)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono font-medium opacity-30">
                        {displayDate}
                      </span>
                      <span className="text-[8px] font-bold px-2 py-0.5 border border-[#4F5D6B]/20 rounded-full opacity-50 uppercase tracking-widest">
                        {item.tag || "Update"}
                      </span>
                    </div>
                    
                    {!isRead && (
                      <div className="flex items-center gap-1.5 text-[#C2B280]">
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">New</span>
                        <Sparkles size={10} className="animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <h2 className={`text-[13px] font-medium tracking-[0.05em] ${isExpanded ? 'text-[#2D363F]' : 'text-[#4F5D6B] opacity-80'}`}>
                      {item.title}
                    </h2>
                    <ChevronDown 
                      size={14} 
                      className={`opacity-30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </button>

                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-1 border-t border-[#4F5D6B]/5">
                      <p className="text-[12px] leading-[1.8] opacity-70 font-light mt-2 whitespace-pre-wrap tracking-wide">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="mt-24 text-center">
          <Terminal size={14} className="mx-auto mb-4 opacity-10" />
          <p className="text-[9px] tracking-[0.5em] uppercase opacity-20 font-mono">
            Log End.
          </p>
        </footer>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@1,200;1,400&family=Inter:wght@300;400;700&display=swap');
        
        .font-serif {
          font-family: 'Crimson Pro', serif;
        }
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}