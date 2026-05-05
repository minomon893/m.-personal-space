"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Clock, Tag, Quote, Sparkles, BookOpen, Zap, Calendar } from "lucide-react";

export default function LiveSessionPage() {
  const LINE_URL = "https://line.me/R/ti/p/@あなたのID";

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-6 md:p-12 text-[#5F6F7A] font-[var(--font-sans)] leading-relaxed">
      <div className="max-w-3xl mx-auto">
        <nav className="mb-12">
          <Link href="/booking" className="text-[11px] font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-opacity">
            <ArrowLeft size={14}/> Back to Menu
          </Link>
        </nav>

        <header className="mb-16 space-y-6">
          <div className="inline-block px-3 py-1 bg-[#B5A773]/10 text-[#B5A773] text-[10px] font-bold tracking-widest uppercase rounded-full">
            Real-time Live Session
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[#4A5568]">
            1時間、あなたと深く向き合う対話を。
          </h1>
          <div className="flex flex-wrap gap-6 text-[13px] font-bold opacity-70 border-y border-[#5F6F7A]/10 py-4">
            <span className="flex items-center gap-2"><Clock size={16} className="text-[#B5A773]"/> セッション：60分</span>
            <span className="flex items-center gap-2"><Tag size={16} className="text-[#B5A773]"/> 料金：¥3,000</span>
            <span className="flex items-center gap-2"><Zap size={16} className="text-[#B5A773]"/> 事前インテーク（1,500文字）</span>
          </div>
        </header>

        <section className="mb-20 space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-[#B5A773]" />
            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-50">Live Chat Session</h2>
          </div>
          <div className="space-y-4 text-[15px] leading-loose opacity-80">
            <p>チャットの良さは、その場ですぐに言語化し、反応が返ってくる<strong>「ライブ感」</strong>にあります。</p>
            <p>LINE上で1時間じっくりとリアルタイムに対話します。事前に最大1,500文字の状況説明を送っていただくことで、当日は最初から深い分析や解決策の模索に時間を使うことが可能です。言葉を交わしながら、一緒に思考を整理しましょう。</p>
          </div>
        </section>

        <section className="mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-sm space-y-8">
            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-50 flex items-center gap-2">
              <Sparkles size={18} /> Session Flow
            </h2>
            <ul className="space-y-6">
              {[
                "LINEで日程調整を行い、セッション時間を確保",
                "事前インテーク：当日前までに現状のまとめ（最大1,500文字）を送信",
                "60分間のリアルタイム・テキストセッション",
                "対話を通じた思考の整理、行動指針のクリア化"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-[14px]">
                  <CheckCircle2 size={18} className="text-[#B5A773] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ユーザーの声 */}
        <section className="mb-24">
          <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase mb-10 opacity-50 text-center">User Feedback</h2>
          <div className="grid gap-6">
            <div className="bg-white/20 p-8 rounded-[2.5rem] border border-white/30 relative">
              <Quote size={40} className="absolute top-4 left-4 opacity-5 text-[#B5A773]" />
              <p className="text-[14px] leading-relaxed mb-4 relative z-10">
                「事前に状況を詳しく送っておけたので、1時間という時間以上に濃い相談ができました。文字としてやり取りが残るため、セッション後に読み返すだけでも自分の考えがまとまっていくのを感じました。」
              </p>
              <div className="text-[11px] font-bold opacity-40">— 20代 ユーザー</div>
            </div>
          </div>
        </section>

        <div className="sticky bottom-6 md:bottom-12 bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[3rem] border border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Live Chat</p>
            <p className="text-[16px] font-bold text-[#4A5568]">¥3,000 / 60min Session</p>
          </div>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto px-10 py-5 bg-[#06C755] text-white rounded-full flex items-center justify-center gap-3 text-[13px] font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
            <Calendar size={20} /> LINEで日程を相談する
          </a>
        </div>
      </div>
    </div>
  );
}