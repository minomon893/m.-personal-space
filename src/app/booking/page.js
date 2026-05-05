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

// 直接LINEへ飛ばすのではなく、作成した紹介ページ(/booking/line)へ誘導します
const LINE_GUIDE_URL = "/booking/line";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#E6E1CF] p-6 md:p-12 text-[#5F6F7A] relative overflow-x-hidden font-[var(--font-sans)]">
      
      {/* LINE相談ボタン（紹介ページへ誘導） */}
      <Link 
        href={LINE_GUIDE_URL}
        className="fixed bottom-8 right-8 z-40 bg-[#06C755] text-white shadow-2xl p-4 rounded-full flex items-center gap-3 hover:scale-105 transition-all group"
      >
        <MessageCircle size={24} />
        <span className="text-[11px] font-bold tracking-widest uppercase pr-2">LINEで相談・予約</span>
      </Link>

      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <header className="w-full flex justify-between items-center mt-6 mb-12 md:mb-20">
          <Link href="/" className="text-[11px] font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-all">
            <ArrowLeft size={14}/> Back to Home
          </Link>
          <span className="text-[10px] tracking-[0.3em] font-bold opacity-30 uppercase">Booking Menu</span>
        </header>

        <section className="text-center space-y-4 px-4 max-w-2xl mx-auto mb-16">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Counseling Menu</h1>
          <p className="text-[13px] leading-relaxed opacity-70">
            解決策はあなたの中にあります。自己受容を土台に、現実的な行動変容をサポートします。<br />
            詳細の確認や、お申し込みは公式LINEより承っております。
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full mb-16">
          
          {/* 全ての「詳細を見る」の遷移先を /booking/line に統一 */}
          <PlanCard 
            icon={<MessageSquare size={20} />}
            title="テキスト相談 (1往復)"
            price="¥1,200"
            description="ご相談1回＋返信1回。LINEのトーク画面でそのままやり取りが可能です。まずは試してみたい方へ。"
            tag="最安プラン"
            href={LINE_GUIDE_URL}
          />

          <PlanCard 
            icon={<Zap size={20} />}
            title="リアルタイムテキスト"
            price="¥3,000 / 60min"
            description="文章で考えるのが苦手な方へ。LINEでのリアルタイムセッション。その場で悩みを紐解きます。"
            tag="即時性"
            href={LINE_GUIDE_URL}
          />

          <PlanCard 
            icon={<FileText size={20} />}
            title="あなた専用行動ガイド＋似合わせモットー付き(PDF)"
            price="¥5,000"
            description="専用の行動分析ガイドをお渡しします。心理学的な背景に基づいた、あなただけの処方箋です。"
            tag="診断・ガイド"
            href={LINE_GUIDE_URL}
          />

          <DisabledPlanCard icon={<Video size={20} />} title="Zoom セッション (3回)" price="¥15,000" tag="準備中" />
          <DisabledPlanCard icon={<Users size={20} />} title="対面セッション" price="¥20,000 / month" tag="準備中" />

          <section className="bg-white/20 p-8 rounded-[2.5rem] border border-white/30 space-y-4 flex flex-col justify-center opacity-50 italic">
            <div className="flex items-center gap-2 text-[#B5A773]">
              <AlertCircle size={16} />
              <h3 className="text-[11px] font-bold tracking-widest uppercase">Emergency Support</h3>
            </div>
            <p className="text-[12px]">継続プランご契約中の方に限り、LINEでの緊急対応を行っております。</p>
          </section>
        </div>

        <footer className="pb-10 text-[9px] tracking-[0.4em] opacity-40 italic text-center">
          m. personal space &copy; 2026
        </footer>
      </div>
    </div>
  );
}

// 子コンポーネントはそのまま利用
function PlanCard({ icon, title, price, description, tag, href }) {
  return (
    <div className="bg-white/40 border border-white/50 p-7 md:p-8 rounded-[2.5rem] shadow-sm space-y-4 flex flex-col h-full hover:bg-white/60 transition-all group">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-[#E6E1CF] rounded-2xl text-[#B5A773]">{icon}</div>
        <span className="text-[9px] font-bold tracking-widest uppercase opacity-40 bg-[#5F6F7A]/5 px-3 py-1 rounded-full">{tag}</span>
      </div>
      <div className="flex-grow space-y-4">
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold text-[#4A5568]">{title}</h3>
          <p className="text-[16px] font-mono text-[#B5A773]">{price}</p>
        </div>
        <p className="text-[12px] leading-relaxed opacity-70">{description}</p>
      </div>
      <Link 
        href={href}
        className="w-full py-4 mt-4 bg-[#B5A773] text-white rounded-full text-center text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#a39665] transition-all inline-block shadow-sm"
      >
        詳細を見る →
      </Link>
    </div>
  );
}

function DisabledPlanCard({ icon, title, price, tag }) {
  return (
    <div className="bg-black/5 border border-black/5 p-7 md:p-8 rounded-[2.5rem] shadow-sm space-y-4 grayscale opacity-60 flex flex-col h-full">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-gray-200 rounded-2xl text-gray-400">{icon}</div>
        <span className="text-[9px] font-bold tracking-widest uppercase opacity-60 bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1">
          <Lock size={10} /> {tag}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-[15px] font-bold text-gray-400">{title}</h3>
        <p className="text-[16px] font-mono text-gray-400">{price}</p>
      </div>
      <p className="text-[12px] text-gray-400 italic">現在受け付けを停止しています。</p>
    </div>
  );
}