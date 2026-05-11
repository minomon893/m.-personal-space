"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, CheckCircle2, Tag, Quote, Sparkles, BookOpen, FileText, Clock,
  MessageCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase"; // インポートを追加

export default function BehaviorGuidePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]); // 動的データ用
  const [loading, setLoading] = useState(true);

  // --- Supabaseからデータを取得 ---
  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("service_tag", "guide") // アドミンで "guide" と入れたものを取得
        .order("created_at", { ascending: false });

      if (!error && data) {
        setFeedbacks(data);
      }
      setLoading(false);
    };

    fetchFeedbacks();
  }, []);

  const nextFeedback = () => {
    if (feedbacks.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
  };
  
  const prevFeedback = () => {
    if (feedbacks.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] text-[#454D53] font-[var(--font-sans)] tracking-tight">
      <div className="max-w-xl mx-auto px-8 py-12 md:py-20">
        
        <nav className="mb-12">
          <Link href="/booking" className="text-[10px] font-bold opacity-65 uppercase flex items-center gap-2 hover:opacity-100 transition-opacity tracking-[0.2em]">
            <ArrowLeft size={12}/> Back to Menu
          </Link>
        </nav>

        <header className="mb-16">
          <div className="inline-block mb-5 px-3 py-1 bg-[#B5A773]/15 text-[#B5A773] text-[9px] font-bold tracking-[0.2em] uppercase rounded-full">
            ABA Behavior Analysis Guide
          </div>
          <h1 className="text-2xl font-medium leading-snug text-[#3A4238] tracking-tight mb-8">
            「意志」に頼らず、「仕組み」で動く.
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-medium border-y border-[#5F6F7A]/20 py-5">
            <span className="flex items-center gap-2"><FileText size={14} className="text-[#B5A773]"/> インテーク：最大 3,000文字</span>
            <span className="flex items-center gap-2"><Tag size={14} className="text-[#B5A773]"/> 料金：¥5,000</span>
            <span className="flex items-center gap-2"><Clock size={14} className="text-[#B5A773]"/> 納期：3〜5日</span>
          </div>
        </header>

        <section className="mb-12 space-y-5">
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="opacity-60" />
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">Behavioral Strategy</h2>
          </div>
          <div className="space-y-5 text-[14px] leading-7 font-light">
            <p>このサービスは<strong>「応用行動分析学（ABA）」</strong>に基づき、あなたが「変えたい」と願う特定の行動をハックします。</p>
            <p className="opacity-85 text-[#5F6F7A]">
              最大3,000文字のインテークで状況を精密に分析し、無理なく動ける「行動の随伴性（ルール）」を再設計します。あなたの性格や生活習慣に合わせた「行動の処方箋」と、お守りとなる「似合わせモットー」を提供します。
            </p>
          </div>
        </section>

        {/* What you get section */}
        <section className="mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-[2.5rem] border border-white/60 shadow-sm space-y-6">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 flex items-center gap-2">
              <Sparkles size={16} /> What you get
            </h2>
            <ul className="space-y-4">
              {[
                "3,000文字のデータに基づく「行動の三項随伴性（ABC）」分析",
                "特定の課題にフォーカスした、具体的で実践的な行動変容ガイド",
                "日常で意識を切り替えるための「似合わせモットー（独自フレーズ）」",
                "実践をサポートする専用ワークシート（PDF）"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] font-light leading-relaxed">
                  <CheckCircle2 size={15} className="text-[#B5A773] shrink-0 mt-0.5 opacity-90" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --- ユーザーフィードバック・スライダー (動的) --- */}
        {!loading && feedbacks.length > 0 && (
          <section className="mb-28 animate-in fade-in duration-700">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-8 opacity-60 text-center">User Feedback</h2>
            <div className="relative group max-w-sm mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={feedbacks[currentIndex].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-white/30 p-8 rounded-[2rem] border border-white/40 relative text-center"
                >
                  <Quote size={18} className="mx-auto mb-5 opacity-20 text-[#B5A773]" />
                  <p className="text-[13px] leading-7 italic opacity-85 font-light mb-5 whitespace-pre-wrap">
                    「{feedbacks[currentIndex].content}」
                  </p>
                  <div className="text-[9px] font-bold opacity-60 tracking-[0.3em] uppercase">
                    — {feedbacks[currentIndex].attribute}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 2件以上ある場合にスライドナビを表示 */}
              {feedbacks.length > 1 && (
                <div className="flex justify-center items-center gap-6 mt-6">
                  <button onClick={prevFeedback} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-2">
                    {feedbacks.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? "w-4 bg-[#B5A773]" : "w-1 bg-[#B5A773]/30"}`} 
                      />
                    ))}
                  </div>
                  <button onClick={nextFeedback} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Sticky Action Bar */}
        <div className="sticky bottom-8 flex justify-center z-50">
          <Link 
            href="/booking/line" 
            className="group flex items-center gap-3 bg-[#A9B9A8] text-[#3A4238] px-8 py-4 rounded-full shadow-2xl hover:bg-[#3A4238] hover:text-white transition-all duration-500 scale-95 hover:scale-100 border border-white/20"
          >
            <MessageCircle size={20} fill="currentColor" className="opacity-80 group-hover:text-[#A9B9A8] transition-colors" />
            <span className="text-[12px] font-bold tracking-wider whitespace-nowrap">
              よくある質問
            </span>
          </Link>
        </div>

        <footer className="mt-20 pb-10 text-[9px] tracking-[0.4em] opacity-40 italic text-center uppercase">
          m. personal space &copy; 2026
        </footer>
      </div>
    </div>
  );
}