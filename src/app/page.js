"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    async function handleVisitorCount() {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `has_counted_home_${today}`;

      try {
        // 1. ログインユーザーを取得
        const { data: { user } } = await supabase.auth.getUser();

        // 2. ログイン中 かつ 今日まだこのブラウザでカウントを記録していない場合
        if (user && !localStorage.getItem(storageKey)) {
          await supabase
            .from('daily_access_logs')
            .upsert(
              { user_id: user.id, accessed_at: today },
              { onConflict: 'user_id, accessed_at' }
            );
          
          // 今日はもう記録したことを保存
          localStorage.setItem(storageKey, "true");
        }

        // 3. 今日の日付のユニークユーザー合計数を取得
        const { count, error } = await supabase
          .from('daily_access_logs')
          .select('*', { count: 'exact', head: true })
          .eq('accessed_at', today);

        if (!error && count !== null) {
          setVisitorCount(count);
        }
      } catch (err) {
        console.error("Counter Error:", err);
      }
    }

    handleVisitorCount();
  }, []);

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#5F6F7A] flex flex-col items-center font-[var(--font-sans)]">

      {/* HEADER */}
      <header className="w-full max-w-md text-center mt-12 mb-24">
        <div className="inline-block px-4 py-1.5 bg-white/40 rounded-full text-[9px] tracking-[0.25em] mb-6 border border-white/30 shadow-sm">
          TODAY'S VISITOR: <span className="font-bold ml-1 text-[#B5A773]">{visitorCount}</span>
        </div>

        <h1 className="text-4xl italic mb-3">
          m. <span className="text-[#B5A773] font-light">personal space</span>
        </h1>

        <p className="text-[10px] tracking-[0.4em] opacity-60 uppercase">
          地味で愛しいソロ生活
        </p>
      </header>

      {/* MAIN */}
      <main className="w-full max-w-xs space-y-4 mb-24">
        <Link href="/menu" className="block">
          <button className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-white/40 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all">
            <div className="text-left">
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase">Main Menu</span>
              <span className="text-[13px] opacity-80">メインメニュー / 無料ツール</span>
            </div>
            <span className="opacity-30">→</span>
          </button>
        </Link>

        <Link href="/booking" className="block">
          <button className="w-full py-7 px-8 bg-[#5F6F7A] text-[#F2F0E9] rounded-[2.5rem] shadow-md flex justify-between items-center hover:bg-[#52606A] hover:-translate-y-[1px] transition-all">
            <div className="text-left">
              <span className="block text-xs font-bold opacity-60 mb-1 uppercase">Counseling</span>
              <span className="text-[13px]">カウンセリング予約</span>
            </div>
            <span className="opacity-60">→</span>
          </button>
        </Link>

        <Link href="/diary" className="block">
          <button className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-white/40 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all">
            <div className="text-left">
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase">Diary</span>
              <span className="text-[13px] opacity-80">日々の記録 / 日記</span>
            </div>
            <span className="opacity-30">→</span>
          </button>
        </Link>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-sm space-y-12 border-t border-[#B5A773]/30 pt-14 pb-12">
        <nav className="flex justify-center gap-16 text-[10px] font-bold tracking-[0.2em] opacity-60">
          <Link href="/about" className="hover:text-[#B5A773] transition-colors">作者情報</Link>
          <Link href="/terms" className="hover:text-[#B5A773] transition-colors">利用規約</Link>
        </nav>

        <div className="bg-white/20 p-5 rounded-3xl border border-white/20 text-center">
          <p className="text-[10px] opacity-70 leading-relaxed">
            NOTICE / 通院中の方は主治医の許可を得てください
          </p>
        </div>

        <div className="text-center text-[9px] tracking-[0.4em] opacity-30 italic">
          &copy; 2026 m. personal space
        </div>
      </footer>
    </div>
  );
}