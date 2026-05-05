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
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    async function handleVisitorCount() {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `has_counted_home_${today}`;
      const guestIdKey = 'visitor_guest_id';
      const hidePromptKey = `hide_install_prompt_${today}`;

      // --- インストール案内の表示切り替え判定 ---
      const isHidden = localStorage.getItem(hidePromptKey);
      if (!isHidden) {
        setShowInstallPrompt(true);
      }

      try {
        // 1. ブラウザ独自のIDを取得または生成
        let guestId = localStorage.getItem(guestIdKey);
        if (!guestId) {
          guestId = crypto.randomUUID();
          localStorage.setItem(guestIdKey, guestId);
        }

        // 2. 今日まだこのブラウザで送信していない場合のみupsertを実行
        if (!localStorage.getItem(storageKey)) {
          const { data: { user } } = await supabase.auth.getUser();

          const { error: upsertError } = await supabase
            .from('daily_access_logs')
            .upsert(
              { 
                guest_id: guestId, 
                accessed_at: today,
                user_id: user?.id || null 
              },
              { onConflict: 'guest_id, accessed_at' }
            );
          
          // 送信に成功したらフラグを立てる（リロード対策）
          if (!upsertError) {
            localStorage.setItem(storageKey, "true");
          }
        }

        // 3. 今日の日付のレコード数（デバイス数）を取得
        // 日付でeq（一致）させているため、深夜0時に自動で0リセットされます
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

  // 案内を閉じる処理
  const handleClosePrompt = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`hide_install_prompt_${today}`, "true");
    setShowInstallPrompt(false);
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#5F6F7A] flex flex-col items-center font-[var(--font-sans)] relative">

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

      {/* PWA INSTALL PROMPT */}
      {showInstallPrompt && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-xs z-50 animate-bounce">
          <div className="bg-[#5F6F7A] text-white p-4 rounded-2xl shadow-2xl border border-white/20 relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#5F6F7A] rotate-45"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex-shrink-0 flex items-center justify-center text-[#5F6F7A] font-bold shadow-inner">
                m.
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold leading-tight">
                  アプリとしてホーム画面に追加
                </p>
                <p className="text-[9px] opacity-80 mt-1 leading-tight">
                  下の共有ボタン <span className="inline-block border border-white/40 px-1 rounded mx-0.5">
                    <svg className="w-2.5 h-2.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </span> を押して「ホーム画面に追加」
                </p>
              </div>
              <button 
                onClick={handleClosePrompt}
                className="text-white/40 hover:text-white p-1 transition-colors"
                aria-label="案内を閉じる"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}