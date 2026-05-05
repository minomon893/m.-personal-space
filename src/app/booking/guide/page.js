"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Clock, Tag, Quote, Sparkles, BookOpen, FileText, Zap } from "lucide-react";

export default function BehaviorGuidePage() {
  // ご提示いただいたLINE URLに差し替え
  const LINE_URL = "https://line.me/R/ti/p/@263yimnl?oat_content=url&ts=05051014";

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
            ABA Behavior Analysis Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-[#4A5568]">
            「意志」に頼らず、「仕組み」で動く。
          </h1>
          <div className="flex flex-wrap gap-6 text-[13px] font-bold opacity-70 border-y border-[#5F6F7A]/10 py-4">
            <span className="flex items-center gap-2"><FileText size={16} className="text-[#B5A773]"/> インテーク：最大 3,000文字</span>
            <span className="flex items-center gap-2"><Tag size={16} className="text-[#B5A773]"/> 料金：¥5,000</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-[#B5A773]"/> 納期：3〜5日</span>
          </div>
        </header>

        <section className="mb-20 space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-[#B5A773]" />
            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-50">Behavioral Strategy</h2>
          </div>
          <div className="space-y-4 text-[15px] leading-loose opacity-80">
            <p>このサービスは<strong>「応用行動分析学（ABA）」</strong>に基づき、あなたが「変えたい」と願う特定の行動をハックします。</p>
            <p>最大3,000文字のインテークで状況を精密に分析し、無理なく動ける「行動の随伴性（ルール）」を再設計します。あなたの性格や生活習慣に合わせた<strong>「行動の処方箋」</strong>と、お守りとなる<strong>「似合わせモットー（独自フレーズ）」</strong>を提供します。</p>
          </div>
        </section>

        <section className="mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-sm space-y-8">
            <h2 className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-50 flex items-center gap-2">
              <Sparkles size={18} /> What you get
            </h2>
            <ul className="space-y-6">
              {[
                "3,000文字のデータに基づく「行動の三項随伴性（ABC）」分析",
                "特定の課題にフォーカスした、具体的で実践的な行動変容ガイド",
                "日常で意識を切り替えるための「似合わせモットー（独自フレーズ）」",
                "実践をサポートする専用ワークシート（PDF）"
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
                「根性論ではなく『環境をどう整えるか』という視点が新鮮でした。自分に馴染む言葉でモットーを作ってもらえたので、迷った時の指針になっています。送られてきたワークシートも具体的で助かりました。」
              </p>
              <div className="text-[11px] font-bold opacity-40">— 30代 ユーザー</div>
            </div>
          </div>
        </section>

        {/* LINEボタン */}
        <div className="sticky bottom-6 md:bottom-12 bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[3rem] border border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Behavior Guide</p>
            <p className="text-[16px] font-bold text-[#4A5568]">¥5,000 / ガイド作成</p>
          </div>
          <a 
            href={LINE_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full md:w-auto px-10 py-5 bg-[#06C755] text-white rounded-full flex items-center justify-center gap-3 text-[13px] font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            <MessageCircle size={20} /> LINEで申し込む
          </a>
        </div>
      </div>
    </div>
  );
}