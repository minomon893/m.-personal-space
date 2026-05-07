"use client";

import React, { useState, useEffect } from "react"; // useEffectを追加
import Link from "next/link";
import { 
  ArrowLeft, CheckCircle2, MessageCircle, Clock, Tag, 
  Quote, Sparkles, BookOpen, FileText, ChevronLeft, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase"; // インポートを追加

export default function TextCounselingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]); // ステートに変更
  const [loading, setLoading] = useState(true);

  // --- データの取得 ---
  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("service_tag", "text") // アドミンで "text" と入れたものを取得
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
            1-on-1 Text Counseling
          </div>
          <h1 className="text-2xl font-medium leading-snug text-[#3A4238] tracking-tight mb-8">
            心の整理を、一通のメッセージに.
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-medium border-y border-[#5F6F7A]/20 py-5">
            <span className="flex items-center gap-2"><FileText size={14} className="text-[#B5A773]"/> 最大 5,000文字</span>
            <span className="flex items-center gap-2"><Tag size={14} className="text-[#B5A773]"/> 1往復：¥1,000</span>
            <span className="flex items-center gap-2"><Clock size={14} className="text-[#B5A773]"/> 24時間以内に返信</span>
          </div>
        </header>

        {/* About Section */}
        <section className="mb-12 space-y-5">
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="opacity-60" />
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">About this Service</h2>
          </div>
          <div className="space-y-5 text-[14px] leading-7 font-light">
            <p>リアルタイムの対話では伝えきれない思いや、複雑に絡まった思考。それらを一度、じっくりと文章にしてみませんか？</p>
            <p className="opacity-85 text-[#5F6F7A]">
              あなたが綴る最大5,000文字のメッセージを丁寧に読み解き、心理学的な視点から「今のあなたに必要な気づき」を1通のメッセージに込めてお返しします。一対一の、静かで深い対話の時間です。
            </p>
          </div>
        </section>

        {/* Detail Section */}
        <section className="mb-20">
          <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-[2.5rem] border border-white/60 shadow-sm space-y-6">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 flex items-center gap-2">
              <Sparkles size={16} /> Service Detail
            </h2>
            <ul className="space-y-4">
              {[
                "お悩みや現状の共有（最大5,000文字まで送信可能）",
                "心理学的な知見に基づいた、今のあなたに寄り添う丁寧な返答",
                "相談から通常24時間以内の返信（最大48時間以内）",
                "自分のペースで言葉を紡げる1往復完結スタイル"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] font-light leading-relaxed">
                  <CheckCircle2 size={15} className="text-[#B5A773] shrink-0 mt-0.5 opacity-90" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --- フィードバックセクション (動的) --- */}
        {feedbacks.length > 0 && (
          <section className="mb-28 animate-in fade-in duration-1000">
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
                  <p className="text-[13px] leading-7 italic opacity-85 font-light mb-5 whitespace-pre-wrap text-justify">
                    {feedbacks[currentIndex].content}
                  </p>
                  <div className="text-[9px] font-bold opacity-60 tracking-[0.3em] uppercase">
                    — {feedbacks[currentIndex].attribute}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* ナビゲーションボタン（2件以上ある場合のみ表示） */}
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
              LINEを追加 / よくある質問
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