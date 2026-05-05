"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Terminal, ChevronDown } from "lucide-react";

export default function NoticesPage() {
  const [viewedIds, setViewedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null); // 展開されている記事のID
  
  const [notices] = useState([
    {
      id: "v1.1-update",
      date: "2026.05.02",
      tag: "Update",
      title: "お知らせ通知機能の改善",
      content: "メインメニューから新着情報がひと目で分かる「通知バッジ」を実装しました。最新のラボ状況を逃さずチェックできます。",
    },
    {
      id: "member-system-launch",
      date: "2026.05.01",
      tag: "System",
      title: "団員番号発行システムの稼働",
      content: "プロファイルページにて、初めてアクセスした順番に基づいた「団員番号」の発行を開始しました。番号は一度発行されると固定され、あなたの研究員としての履歴を証明します。",
    },
    {
      id: "metacog-lab-open",
      date: "2026.04.25",
      tag: "Lab",
      title: "メタ認知トリガー開発部・設立",
      content: "「メタ認知トリガー開発部」が正式に発足しました。日常の違和感をトリガー（きっかけ）に変える研究を共に行いましょう。まずは「認知的脱フュージョン」の各ツールから触れてみてください。",
    }
  ]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("metacog_read_notices") || "[]");
    setViewedIds(saved);

    // メインメニューの通知バッジを消すために最新記事IDをセット
    if (notices.length > 0) {
      localStorage.setItem("last_viewed_notice", notices[0].id);
    }
  }, [notices]);

  // クリックして展開 ＆ 既読にする
  const toggleNotice = (id) => {
    setExpandedId(expandedId === id ? null : id);
    
    if (!viewedIds.includes(id)) {
      const newViewed = [...viewedIds, id];
      setViewedIds(newViewed);
      localStorage.setItem("metacog_read_notices", JSON.stringify(newViewed));
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#4F5D6B] font-sans selection:bg-[#C2B280]/20">
      <div className="max-w-md mx-auto">
        
        {/* BACK TO MENU */}
        <Link
          href="/menu"
          className="text-[10px] tracking-[0.3em] font-bold opacity-40 uppercase flex items-center gap-2 mb-12 hover:opacity-100 transition-all group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Menu
        </Link>

        {/* HEADER: Font matched with Main Menu */}
        <header className="mb-16">
          <div className="flex items-center gap-2 mb-2 opacity-30">
            <div className="h-[1px] w-4 bg-[#4F5D6B]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Official Records</span>
          </div>
          <h1 className="text-xl font-[var(--font-serif)] font-medium tracking-[0.2em] italic text-[#2D363F]">
            News & Updates
          </h1>
        </header>

        {/* NOTICE LIST (Accordion style) */}
        <div className="space-y-4">
          {notices.map((item) => {
            const isRead = viewedIds.includes(item.id);
            const isExpanded = expandedId === item.id;
            
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
                        {item.date}
                      </span>
                      <span className="text-[8px] font-bold px-2 py-0.5 border border-[#4F5D6B]/20 rounded-full opacity-50 uppercase tracking-widest text-[9px]">
                        {item.tag}
                      </span>
                    </div>
                    
                    {/* 未読バッジ（展開されるまで表示） */}
                    {!isRead && (
                      <div className="flex items-center gap-1.5 text-[#C2B280]">
                        <Sparkles size={10} className="animate-pulse" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">New</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <h2 className={`text-[14px] font-bold tracking-tight ${isExpanded ? 'text-[#2D363F]' : 'text-[#4F5D6B]'}`}>
                      {item.title}
                    </h2>
                    <ChevronDown 
                      size={14} 
                      className={`opacity-30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </button>

                {/* 拡張されるコンテンツ部分 */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-1 border-t border-[#4F5D6B]/5">
                    <p className="text-[12px] leading-relaxed opacity-60 font-light mt-2">
                      {item.content}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* DECO FOOTER */}
        <footer className="mt-24 text-center">
          <Terminal size={14} className="mx-auto mb-4 opacity-10" />
          <p className="text-[9px] tracking-[0.5em] uppercase opacity-20 font-mono">
            Log End.
          </p>
        </footer>

      </div>

      {/* Font & Animation styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@1,200;1,400&family=Inter:wght@300;400;700&display=swap');
        
        .font-serif {
          font-family: 'Crimson+Pro', serif;
        }
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}