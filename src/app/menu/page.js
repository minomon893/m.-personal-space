"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  User,
  BookOpen,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MenuPage() {
  const [hasNewNotice, setHasNewNotice] = useState(false);

  useEffect(() => {
    // お知らせのチェックのみ残します
    const checkNewNotices = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('id')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const readNotices = JSON.parse(localStorage.getItem("metacog_read_notices") || "[]");
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

          {/* PROBLEM SOLVING */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <Sparkles size={10} /> Problem Solving
            </h2>
            <div className="grid gap-4">
              <Link href="/menu/bot">
                <MenuButton title="やわらかことぼっとくん" subtitle="アサーティブ変換ツール" />
              </Link>
              <Link href="/menu/support">
                <MenuButton title="福祉サービス案内" subtitle="緊急・DV・生活困窮の窓口" />
              </Link>
            </div>
          </section>

          {/* SELF UNDERSTANDING */}
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
              <Link href="/menu/external">
                <MenuButton title="外部ソース" subtitle="MBTI / 適職診断 / 4ぴた / つらチェック / セクシュアリティ診断" />
              </Link>
            </div>
          </section>

          {/* CONTENT */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <BookOpen size={10} /> Original Content
            </h2>
            <div className="grid gap-4">
              <Link href="/menu/poem">
                <MenuButton title="Free a poem" subtitle="今日のおまもり" />
              </Link>
              <Link href="/menu/stickers">
                <MenuButton title="LINE Stamp" subtitle="もっちりとした人シリーズ" />
              </Link>
            </div>
          </section>
        </div>

        <footer className="mt-28 mb-12 text-center text-white/20 text-[9px] tracking-[0.4em] uppercase">
  <Link href="/admin" className="hover:text-white transition-colors">
    &copy; 2026 m.
  </Link> 
  <span> personal space</span>
</footer>
      </div>
    </div>
  );
}

// 判定ロジックが不要になったため、コンポーネントもシンプルにしました
function MenuButton({ title, subtitle, isSmall = false, highlight = false }) {
  return (
    <div className={`w-full ${isSmall ? "py-4" : "py-6"} px-7 border rounded-2xl transition-all duration-300 text-left relative overflow-hidden shadow-sm shadow-black/[0.01] bg-white/60 border-white/40 hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]`}>
      <div className="flex justify-between items-center">
        <div>
          <span className={`${isSmall ? "text-xs" : "text-[15px]"} font-bold block mb-0.5 tracking-wide`}>
            {title}
          </span>
          {subtitle && (
            <span className={`text-[10px] tracking-wide ${highlight ? "text-[#B5A773] font-bold" : "opacity-50"}`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}