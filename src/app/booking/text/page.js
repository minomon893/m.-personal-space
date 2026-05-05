"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Clock, Tag, Quote, Sparkles, BookOpen, FileText } from "lucide-react";

export default function TextCounselingPage() {
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
            1-on-1 Text Counseling
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[#4A5568]">
            心の整理を、一通のメッセージに。
          </h1>
          <div className="flex flex-wrap gap-6 text-[13px] font-bold opacity-70 border-y border-[#5F6F7A]/10 py-4">
            <span className="flex items-center gap-2"><FileText size={16} className="text-[#B5A773]"/> 最大 5,000文字</span>
            <span className="flex items-center gap-2"><Tag size={16} className="text-[#B5A773]"/> 1往復：¥1,200</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-[#B5A773]"/> 24時間以内に返信</span>
          </div>
        </header>

        <section className="mb-20 space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-[#B5A773]" />
            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-50">About this Service</h2>
          </div>
          <div className="space-y-4 text-[15px] leading-loose opacity-80">
            <p>リアルタイムの対話では伝えきれない思いや、複雑に絡まった思考。それらを一度、じっくりと文章にしてみませんか？</p>
            <p>このサービスでは、あなたが綴る最大5,000文字のメッセージを丁寧に読み解き、心理学的な視点から「今のあなたに必要な気づき」を1通のメッセージに込めてお返しします。一対一の、静かで深い対話の時間です。</p>
          </div>
        </section>

        <section className="mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-sm space-y-8">
            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-50 flex items-center gap-2">
              <Sparkles size={18} /> Service Detail
            </h2>
            <ul className="space-y-6">
              {[
                "お悩みや現状の共有（最大5,000文字まで送信可能）",
                "心理学的な知見に基づいた、今のあなたに寄り添う丁寧な返答",
                "相談から通常24時間以内の返信（最大48時間以内）",
                "自分のペースで言葉を紡げる1往復完結スタイル"
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
                「自分のペースで文章を整えて送れるので、焦らずに済みました。頂いたお返事は何度も読み返せるし、その度に新しい発見があります。1,200円でこの安心感はとても心強いです。」
              </p>
              <div className="text-[11px] font-bold opacity-40">— 20代 ユーザー</div>
            </div>
          </div>
        </section>

        <div className="sticky bottom-6 md:bottom-12 bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[3rem] border border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Text Consultation</p>
            <p className="text-[16px] font-bold text-[#4A5568]">¥1,200 / 1やり取り</p>
          </div>
          <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto px-10 py-5 bg-[#06C755] text-white rounded-full flex items-center justify-center gap-3 text-[13px] font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
            <MessageCircle size={20} /> LINEで相談を送る
          </a>
        </div>
      </div>
    </div>
  );
}