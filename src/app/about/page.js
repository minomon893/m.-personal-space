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
          <ArrowLeft size={14}/> Back to Home
        </Link>
        <span className="text-[10px] tracking-[0.3em] font-bold opacity-30 uppercase">About</span>
      </header>

      <main className="w-full max-w-md space-y-16 mb-20">
        
        {/* CONCEPT SECTION */}
        <section className="text-center space-y-6">
          <div className="w-24 h-24 bg-white/40 rounded-full mx-auto flex items-center justify-center border border-white/40 shadow-sm">
            <span className="text-2xl italic text-[#B5A773]">m.</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl tracking-tight font-medium">地味で愛しいソロ生活 in カナダ</h1>
            <p className="text-[10px] tracking-[0.4em] opacity-50 uppercase mt-1">Psychology × Play × Design</p>
          </div>
        </section>

        {/* PHILOSOPHY SECTION */}
        <section className="space-y-8">
          <div className="bg-white/45 p-8 rounded-[2.5rem] border border-white/40 shadow-sm space-y-6">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#B5A773] uppercase border-b border-[#B5A773]/20 pb-2 inline-block">Philosophy</h2>
            <div className="space-y-5 text-[13px] leading-relaxed opacity-90">
              <p className="text-[14px] font-bold tracking-wider text-[#4A5568]">
                「答えは、あなたの中にある」
              </p>
              <p>
                カウンセリングにおいて私が最も大切にしているのは、解決策はクライアント自身が既に持っているということ。その自己理解を深めるお手伝いをすることが私の役割です。<br /><br />
                深い自己理解にはまず<span className="font-bold underline decoration-[#B5A773]/40 decoration-2">「自己受容」</span>が欠かせません。そのままの自分に価値があると思える土台があってこそ、人は真の変化へと一歩を踏み出せます。
              </p>
              <p className="border-l-2 border-[#B5A773]/30 pl-4">
                自己理解には時間がかかりますが、日々の問題は絶えず追いかけてきます。だからこそ、即効性のある<span className="font-bold">「行動変容」</span>の技術にも力を入れています。
              </p>
              <p>
                「全ての成長は楽しくあるべき」という信念のもと、飽きずに取り組める自己理解ツールの開発とデザインを活動の主題にしています。
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Tag text="ABA" />
              <Tag text="ACT" />
              <Tag text="Narrative Therapy" />
              <Tag text="Psychoanalysis" />
              <Tag text="ADHD"/> 
              <Tag text="ASD"/> 
              <Tag text="Anxiety"/>
              <Tag text="Depression"/>
            </div>
          </div>
        </section>

        {/* YOUTUBE SECTION */}
        <section className="space-y-4">
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

function Tag({ text }) {
  return (
    <div className="inline-flex items-center bg-white/30 border border-white/50 px-3 py-1.5 rounded-full shadow-xs">
      <span className="text-[10px] font-medium opacity-80 whitespace-nowrap">{text}</span>
    </div>
  );
}