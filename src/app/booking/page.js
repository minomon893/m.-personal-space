"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Zap, 
  Video, 
  Users, 
  AlertCircle, 
  Lock, 
  MessageCircle 
} from "lucide-react";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#E6E1CF] text-[#454D53] font-[var(--font-sans)] tracking-tight">
      
      {/* Floating LINE Button (横長デザインへ修正) */}
      <Link 
        href="/booking/line"
        className="fixed bottom-8 right-8 z-50 bg-[#A9B9A8] text-[#3A4238] shadow-2xl px-6 py-4 rounded-full flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group border border-white/20"
      >
        <MessageCircle size={20} fill="currentColor" className="opacity-80 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold tracking-[0.1em] whitespace-nowrap">
          LINEを追加 / よくある質問
        </span>
      </Link>

      <div className="max-w-4xl mx-auto px-8 py-12 md:py-20">
        
        <header className="w-full flex justify-between items-center mb-16 md:mb-24">
          <Link href="/" className="text-[10px] font-bold opacity-65 uppercase flex items-center gap-2 hover:opacity-100 transition-opacity tracking-[0.2em]">
            <ArrowLeft size={12}/> Back to Home
          </Link>
          <span className="text-[9px] tracking-[0.4em] font-bold opacity-30 uppercase">Booking Menu</span>
        </header>

        <section className="w-full flex flex-col items-center mb-20 text-center">
          <div className="inline-block mb-6 px-3 py-1 bg-[#B5A773]/10 text-[#B5A773] text-[9px] font-bold tracking-[0.3em] uppercase rounded-full">
            Service List
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-[0.2em] mb-10 text-[#3A4238] italic">
            Counseling Menu
          </h1>
          <p className="text-[14px] leading-relaxed opacity-80 max-w-md font-light">
            解決策はあなたの中にあります。<br />
            自己受容を土台に、現実的な行動変容をサポートします。
          </p>
        </section>

        {/* グリッドセクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-20">
          <PlanCard 
            icon={<MessageSquare size={18} />}
            title="テキスト相談 (1往復)"
            price="¥1,000"
            description="LINEのトーク画面でそのままやり取り。まずは気軽に試してみたい方へ。"
            tag="Light"
            href="/booking/text" 
          />

          <PlanCard 
            icon={<Zap size={18} />}
            title="リアルタイムテキスト"
            price="¥3,000 / 60min"
            description="60分間のライブセッション。その場で対話しながら悩みを紐解きます。"
            tag="Real-time"
            href="/booking/realtime" 
          />

          <PlanCard 
            icon={<FileText size={18} />}
            title="行動分析ガイド"
            price="¥5,000"
            description="3,000文字の精密分析。あなた専用の「行動の処方箋」をお渡しします。"
            tag="Strategy"
            href="/booking/guide" 
          />

          <DisabledPlanCard 
            icon={<Video size={18} />} 
            title="Zoom Session" 
            price="¥15,000" 
            tag="準備中" 
          />

          <DisabledPlanCard 
            icon={<Users size={18} />} 
            title="対面セッション" 
            price="¥20,000 / month" 
            tag="準備中" 
          />
        </div>

        {/* EMERGENCY SUPPORT */}
        <section className="w-full flex justify-center mb-28">
          <div className="max-w-sm bg-white/25 backdrop-blur-sm p-6 rounded-[2rem] border border-white/40 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-[#B5A773] mb-3 opacity-90">
              <AlertCircle size={14} />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Emergency Support</span>
            </div>
            <p className="text-[11px] opacity-70 leading-relaxed italic font-light">
              継続プランご契約中の方に限り、<br />LINEでの緊急対応を行っております。
            </p>
          </div>
        </section>

        <footer className="pb-10 text-[9px] tracking-[0.4em] opacity-30 italic text-center uppercase">
          m. personal space &copy; 2026
        </footer>
      </div>
    </div>
  );
}

function PlanCard({ icon, title, price, description, tag, href }) {
  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white/40 border border-white/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full hover:bg-white/70 transition-all duration-500 relative overflow-hidden">
        <div className="flex justify-between items-start mb-10">
          <div className="p-3 bg-[#E6E1CF] rounded-2xl text-[#B5A773] group-hover:bg-[#B5A773] group-hover:text-white transition-colors duration-500 shadow-inner">
            {icon}
          </div>
          <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-[#B5A773]/70 px-3 py-1 rounded-full border border-[#B5A773]/20">
            {tag}
          </span>
        </div>
        
        <div className="flex-grow space-y-4">
          <div className="space-y-1">
            <h3 className="text-[14px] font-bold text-[#3A4238] leading-snug tracking-wider uppercase">{title}</h3>
            <p className="text-[16px] font-medium text-[#B5A773] tracking-tighter italic">{price}</p>
          </div>
          <p className="text-[12px] leading-relaxed opacity-70 font-light">{description}</p>
        </div>
        
        <div className="mt-8 flex items-center text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 group-hover:opacity-100 group-hover:text-[#B5A773] transition-all">
          View Detail <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}

function DisabledPlanCard({ icon, title, price, tag }) {
  return (
    <div className="bg-black/5 border border-white/10 p-8 rounded-[2.5rem] opacity-40 flex flex-col h-full grayscale">
      <div className="flex justify-between items-start mb-10">
        <div className="p-3 bg-gray-200/50 rounded-2xl text-gray-400">
          {icon}
        </div>
        <span className="text-[8px] font-bold tracking-widest uppercase opacity-60 bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1">
          <Lock size={10} /> {tag}
        </span>
      </div>
      <div className="flex-grow space-y-2">
        <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        <p className="text-[15px] font-medium text-gray-400 italic">{price}</p>
        <p className="text-[11px] text-gray-400 italic font-light">現在、新規の受付を停止しています。</p>
      </div>
    </div>
  );
}