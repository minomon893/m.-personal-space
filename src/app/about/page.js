"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Video, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#5F6F7A] flex flex-col items-center font-[var(--font-sans)]">
      
      {/* HEADER */}
      <header className="w-full max-w-md flex justify-between items-center mt-6 mb-16">
        <Link href="/" className="text-[11px] font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-all">
          <ArrowLeft size={14}/> Back to Top
        </Link>
        <span className="text-[10px] tracking-[0.3em] font-bold opacity-30 uppercase">About</span>
      </header>

      <main className="w-full max-w-md mb-20">
        
        {/* CONCEPT SECTION */}
        <section className="text-center space-y-6 mb-24">
          <div className="w-24 h-24 bg-white/40 rounded-full mx-auto flex items-center justify-center border border-white/40 shadow-sm">
            <span className="text-2xl italic text-[#B5A773]">m.</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl tracking-tight font-medium">地味で愛しいソロ生活 in カナダ</h1>
            <p className="text-[10px] tracking-[0.4em] opacity-50 uppercase mt-1">Psychology × Play × Design</p>
          </div>
        </section>

        {/* ROADMAP SECTION (斜め配置) */}
        <section className="space-y-12">
          <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#B5A773] uppercase text-center opacity-60">Roadmap</h2>
          
          <div className="space-y-12">
            <RoadmapItem 
              year="2003/04" 
              text="４人兄弟の３番手として福岡に生まれる。<br />中学生時代のモットーは『自惚れたらおわり』" 
              align="left" 
            />
            <RoadmapItem 
              year="2022/04" 
              text="自分のしたいことが分からず受験が無理過ぎることに気付く。<br />なんやかんやでカナダへ留学。" 
              align="right" 
            />
            <RoadmapItem 
              year="2023/10" 
              text="しっかり鬱を発症。<br />半年休学し、治療の中で自己分析・心理学の面白さに気付く。" 
              align="left" 
            />
            <RoadmapItem 
              year="Recent" 
              text="メンタル心理カウンセラー資格を取得。<br />バイトをクビになり時間ができたのでYoutuberになる。" 
              align="right" 
            />
            <RoadmapItem 
              year="Diagnosis" 
              text="「流石にADHD過ぎる」って思い診察に行ったら、<br />鬱・社交不安・全般性不安と判明。<br />ADHDはグレーゾーン。" 
              align="left" 
            />
          </div>
        </section>

        {/* YOUTUBE SECTION */}
        <section className="space-y-4 mt-24">
          <h2 className="text-[10px] font-bold opacity-50 tracking-[0.2em] uppercase text-center">Watching / YouTube</h2>
          <a 
            href="https://www.youtube.com/@33cjimmy" 
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-6 px-8 bg-white/30 text-[#5F6F7A] rounded-[2.5rem] border border-white/50 shadow-sm flex justify-between items-center hover:bg-white/60 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-[#CC0000] opacity-80">
                <Video size={20} />
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold mb-0.5 opacity-80">@33cjimmy</span>
                <span className="text-[11px] opacity-60">YouTubeで日々の記録を更新中</span>
              </div>
            </div>
            <ExternalLink size={14} className="opacity-30 group-hover:opacity-60 transition-all" />
          </a>
        </section>

      </main>

      <footer className="mt-auto pb-10 text-[9px] tracking-[0.4em] opacity-40 italic">
        m. personal space &copy; 2026
      </footer>

    </div>
  );
}

function RoadmapItem({ year, text, align }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className={`w-[75%] ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <span className="block text-[10px] font-bold text-[#B5A773] uppercase tracking-widest mb-1">
          {year}
        </span>
        <p 
          className="text-[13px] leading-relaxed opacity-90 font-medium"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </div>
  );
}