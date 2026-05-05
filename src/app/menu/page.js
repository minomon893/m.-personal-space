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

export default function MenuPage() {
  const [hasNewNotice, setHasNewNotice] = useState(false);
  const LATEST_NOTICE_ID = "v1.1-update";

  useEffect(() => {
    const lastViewed = localStorage.getItem("last_viewed_notice");
    if (lastViewed !== LATEST_NOTICE_ID) {
      setHasNewNotice(true);
    }
  }, []);

  const handleNoticeClick = () => {
    setHasNewNotice(false);
    localStorage.setItem("last_viewed_notice", LATEST_NOTICE_ID);
  };

  return (
    /* 背景色をトップページと同じ #E6E1CF に設定 */
    <div className="min-h-screen bg-[#E6E1CF] p-6 text-[#5F6F7A] font-[var(--font-sans)] transition-colors duration-500">
      <div className="max-w-md mx-auto">

        {/* BACK */}
        <Link
          href="/"
          className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-10 hover:opacity-100 transition-all"
        >
          <ArrowLeft size={12} /> Back to Top
        </Link>

        {/* TITLE */}
        <h1 className="text-xl font-[var(--font-serif)] font-medium tracking-[0.2em] mb-12 text-center italic opacity-80">
          Main Menu
        </h1>

        <div className="space-y-12">

          {/* BASIC */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-4 border-b border-[#5F6F7A]/10 pb-1 uppercase">
              Basic
            </h2>
            <Link href="/menu/notices">
              <button
                onClick={handleNoticeClick}
                className="relative w-full py-5 px-6 bg-white/45 border border-white/40 rounded-2xl hover:bg-white/70 transition-all text-left shadow-sm shadow-black/[0.02]"
              >
                <span className="text-[14px] font-bold block">お知らせ</span>
                <span className="text-[10px] opacity-40 uppercase tracking-wider">News & Updates</span>

                {hasNewNotice && (
                  <span className="absolute top-4 right-6 flex h-2 w-2">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-[#B5A773] opacity-60"></span>
                    <span className="relative h-2 w-2 rounded-full bg-[#B5A773]"></span>
                  </span>
                )}
              </button>
            </Link>
          </section>

          {/* PROBLEM SOLVING */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-4 border-b border-[#5F6F7A]/10 pb-1 uppercase flex items-center gap-2">
              <Sparkles size={10} /> Problem Solving
            </h2>

            <div className="grid gap-3">
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

          {/* SELF UNDERSTANDING */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-4 border-b border-[#5F6F7A]/10 pb-1 uppercase flex items-center gap-2">
              <User size={10} /> Self Understanding
            </h2>

            <div className="grid gap-3">
              <Link href="/menu/profile">
                <MenuButton title="プロフィール帳" subtitle="自分を整理" />
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

          {/* CONTENT */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-4 border-b border-[#5F6F7A]/10 pb-1 uppercase flex items-center gap-2">
              <BookOpen size={10} /> Original Content
            </h2>

            <div className="grid gap-3">
              <Link href="/menu/poem">
                <MenuButton title="Free a poem" subtitle="今日のおまもり" />
              </Link>

              <Link href="/menu/ezine">
                <MenuButton title="Ezine" subtitle="Support / ¥500~" highlight />
              </Link>

              <Link href="/menu/stickers">
                <MenuButton title="LINE Stamp" subtitle="もっちりシリーズ" />
              </Link>
            </div>
          </section>

          {/* LOCKED */}
          <section className="bg-white/20 p-5 rounded-[2rem] border border-white/20">
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-30 mb-4 flex items-center gap-2 uppercase">
              <Lock size={10} /> Members Only
            </h2>
            <p className="text-[11px] font-bold italic opacity-40 tracking-widest">
              Coming Soon...
            </p>
          </section>

        </div>

        <footer className="mt-24 mb-10 text-center opacity-30 text-[9px] tracking-[0.3em] uppercase">
          &copy; 2026 Minori Yofu
        </footer>

      </div>
    </div>
  );
}

/* ===== COMPONENT ===== */

function MenuButton({ title, subtitle, isSmall = false, highlight = false, isDisabled = false, onClick }) {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`w-full ${
        isSmall ? "py-3" : "py-5"
      } px-6 border rounded-2xl transition-all text-left relative overflow-hidden shadow-sm shadow-black/[0.01]
      ${
        isDisabled 
          ? "bg-black/[0.05] border-transparent cursor-not-allowed opacity-40" 
          : highlight
            ? "bg-[#B5A773]/10 border-[#B5A773]/30 hover:bg-white/60 active:scale-[0.98]"
            : "bg-white/45 border-white/40 hover:bg-white/70 active:scale-[0.98]"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <span
            className={`${
              isSmall ? "text-xs" : "text-[14px]"
            } font-bold block`}
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