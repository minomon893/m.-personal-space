"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  User,
  Lock,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MenuPage() {
  const [hasNewNotice, setHasNewNotice] = useState(false);

  useEffect(() => {
    const checkNewNotices = async () => {
      // 最新のお知らせ一覧のIDを取得
      const { data, error } = await supabase
        .from('notices')
        .select('id')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // NoticesPage側で管理している既読リストを取得
        const readNotices = JSON.parse(localStorage.getItem("metacog_read_notices") || "[]");
        
        // 取得したお知らせの中に、既読リストに含まれていないIDが1つでもあればバッジを表示
        const hasUnread = data.some(notice => !readNotices.includes(notice.id));
        setHasNewNotice(hasUnread);
      }
    };

    checkNewNotices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D0D9DF] via-[#E6E1CF] via-[#F2EBD4] to-[#2C3E50] p-6 text-[#5F6F7A] font-[var(--font-sans)] transition-colors duration-500">
      <div className="max-w-md mx-auto">

        {/* BACK */}
        <Link
          href="/"
          className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-12 hover:opacity-100 transition-all hover:-translate-x-1"
        >
          <ArrowLeft size={12} /> Back to Top
        </Link>

        {/* TITLE */}
        <h1 className="text-2xl font-[var(--font-serif)] font-medium tracking-[0.35em] mb-16 text-center italic opacity-90">
          Main Menu
        </h1>

        <div className="space-y-14">

          {/* BASIC (Morning area) */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase">
              Basic
            </h2>
            <Link href="/menu/notices">
              <button
                className="relative w-full py-6 px-7 bg-white/60 border border-white/40 rounded-2xl hover:bg-white/80 transition-all text-left shadow-sm shadow-black/[0.02]"
              >
                <span className="text-[15px] font-bold block mb-0.5">お知らせ</span>
                <span className="text-[10px] opacity-40 uppercase tracking-wider">News & Updates</span>

                {hasNewNotice && (
                  <span className="absolute top-6 right-8 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-[#B5A773] opacity-60"></span>
                    <span className="relative h-2.5 w-2.5 rounded-full bg-[#B5A773]"></span>
                  </span>
                )}
              </button>
            </Link>
          </section>

          {/* PROBLEM SOLVING (Mid-day area) */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <Sparkles size={10} /> Problem Solving
            </h2>

            <div className="grid gap-4">
              <Link href="/menu/bot">
                <MenuButton title="やわらかことぼっとくん" subtitle="アサーティブ変換ツール" />
              </Link>
              <Link href="/menu/metacognition">
                <MenuButton title="メタ認知トリガー開発部" subtitle="交流型脱フュージョントレーニング" />
              </Link>
              <Link href="/menu/support">
                <MenuButton title="福祉サービス案内" subtitle="緊急・DV・生活困窮の窓口" />
              </Link>
            </div>
          </section>

          {/* SELF UNDERSTANDING (Afternoon area) */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <User size={10} /> Self Understanding
            </h2>

            <div className="grid gap-4">
              <Link href="/menu/profile">
                <MenuButton title="プロフィール帳" subtitle="自分を整理" />
              </Link>
              <Link href="/menu/bingo">
                <MenuButton title="日々ンゴ" subtitle="感覚を観測する" />
              </Link>
              <Link href="/menu/nottodolist">
                <MenuButton title="Not to do list" subtitle="違和感を記録する" />
              </Link>
              <MenuButton title="RPGカード" subtitle="特性の可視化" isDisabled />
              <MenuButton title="恋愛タイプ診断" subtitle="Relationship Dynamics" isDisabled />
              <Link href="/menu/external">
                <MenuButton 
                  title="外部ソース" 
                  subtitle="MBTI / 適職診断 / 4ぴた / つらチェック / セクシュアリティ診断" 
                />
              </Link>
            </div>
          </section>

          {/* CONTENT (Evening area) */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <BookOpen size={10} /> Original Content
            </h2>

            <div className="grid gap-4">
              {/* セクションの一番上に配置した「中庸大冒険」ボタン（app/menu/cardsに対応するパス） */}
              <Link href="/menu/cards">
                <MenuButton title="中庸大冒険" subtitle="中庸選択トレーニング" />
              </Link>
              
              <Link href="/menu/poem">
                <MenuButton title="Free a poem" subtitle="今日のおまもり" />
              </Link>
              <Link href="/menu/ezine">
                <MenuButton title="Ezine" subtitle="Support / ¥500~" highlight />
              </Link>
              <Link href="/menu/stickers">
                <MenuButton title="LINE Stamp" subtitle="もっちりとした人シリーズ" />
              </Link>
            </div>
          </section>

          {/* LOCKED (Night area) */}
          <section className="bg-white/10 p-6 rounded-[2.5rem] border border-white/20 text-center shadow-inner backdrop-blur-sm">
            <h2 className="text-[10px] tracking-[0.2em] font-bold text-white/50 mb-4 flex justify-center items-center gap-2 uppercase">
              <Lock size={10} /> Members Only
            </h2>
            <p className="text-[11px] font-bold italic text-white/30 tracking-widest">
              Coming Soon...
            </p>
          </section>

        </div>

        <footer className="mt-28 mb-12 text-center text-white/20 text-[9px] tracking-[0.4em] uppercase">
          &copy; 2026 m. personal space
        </footer>

      </div>
    </div>
  );
}

function MenuButton({ title, subtitle, isSmall = false, highlight = false, isDisabled = false, onClick }) {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`w-full ${
        isSmall ? "py-4" : "py-6"
      } px-7 border rounded-2xl transition-all text-left relative overflow-hidden shadow-sm
      ${
        isDisabled 
          ? "bg-black/5 border-transparent cursor-not-allowed opacity-40" 
          : "bg-white/60 border-white/40 hover:bg-white/80 active:scale-[0.98]"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <span
            className={`${
              isSmall ? "text-xs" : "text-[15px]"
            } font-bold block mb-0.5`}
          >
            {title}
          </span>

          {subtitle && (
            <span
              className={`text-[10px] tracking-wide ${
                highlight ? "text-[#B5A773]" : "opacity-50"
              } `}
            >
              {subtitle}
            </span>
          )}
        </div>
        
        {isDisabled && (
          <div className="flex flex-col items-end">
            <Lock size={12} className="opacity-40 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Coming Soon</span>
          </div>
        )}
      </div>
    </button>
  );
}