"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  // ガイドのスライド番号 (0: テキスト, 1: 画像)
  const [currentSlide, setCurrentSlide] = useState(0);
  // 加入状態によってリンク先を変えるためのステート（初期値は紹介ページ）
  const [picnicPath, setPicnicPath] = useState("/picnic");

  // クライアントコンポーネント内でSupabaseを初期化
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function handleVisitorCount() {
      // 日本時間の今日の日付 (YYYY-MM-DD)
      const today = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Tokyo",
      })
        .format(new Date())
        .replace(/\//g, "-");

      const storageKey = `has_counted_home_${today}`;
      const guestIdKey = "visitor_guest_id";
      const hidePromptKey = `hide_install_prompt_${today}`;

      // インストールプロンプトの表示制御
      if (!localStorage.getItem(hidePromptKey)) {
        setShowInstallPrompt(true);
      }

      try {
        // 1. デバイス固有の guest_id を取得または生成
        let guestId = localStorage.getItem(guestIdKey);
        if (!guestId) {
          guestId = Math.random().toString(36).substring(2, 15);
          localStorage.setItem(guestIdKey, guestId);
        }

        // 2. 今日まだカウントされていなければDBに登録
        if (!localStorage.getItem(storageKey)) {
          // ログインしている場合は user_id を取得
          const {
            data: { user },
          } = await supabase.auth.getUser();

          const { error: upsertError } = await supabase
            .from("daily_access_logs")
            .upsert(
              { 
                guest_id: guestId, 
                accessed_at: today, 
                user_id: user?.id || null // ログインしてればID、してなければnull
              },
              { onConflict: "guest_id, accessed_at" }
            );
          
          if (!upsertError) {
            localStorage.setItem(storageKey, "true");
          }
        }

        // 3. 今日の全訪問者数（デバイス数）を取得
        const { count, error } = await supabase
          .from("daily_access_logs")
          .select("*", { count: "exact", head: true })
          .eq("accessed_at", today);

        if (!error && count !== null) {
          setVisitorCount(count);
        }

        // --- 追加：ピクニック加入状態のチェック ---
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();
          
          if (profile) {
            setPicnicPath("/picnic/garden");
          }
        }
        // ------------------------------------

      } catch (err) {
        console.error("Counter Error:", err);
      }
    }
    handleVisitorCount();
  }, [supabase]);

  const handleClosePrompt = () => {
    const today = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    })
      .format(new Date())
      .replace(/\//g, "-");
    localStorage.setItem(`hide_install_prompt_${today}`, "true");
    setShowInstallPrompt(false);
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#5F6F7A] flex flex-col items-center font-[var(--font-sans)] relative">
      {/* GUIDE BUTTON */}
      <div className="absolute top-6 right-6 z-40">
        <button
          onClick={() => {
            setIsGuideOpen(true);
            setCurrentSlide(0); // 開くときは最初のスライド
          }}
          className="w-10 h-10 rounded-full bg-white/30 border border-white/40 flex items-center justify-center text-[#5F6F7A] hover:bg-white/60 hover:scale-105 transition-all shadow-sm group"
        >
          <svg
            className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </button>
      </div>

      {/* GUIDE MODAL */}
      {/* GUIDE MODAL */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#5F6F7A]/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="bg-[#F2F0E9] w-full max-w-sm max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-white relative flex flex-col transition-all duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* スライド切り替えボタン（左）：2枚目の時だけ表示 */}
            {currentSlide === 1 && (
              <button 
                onClick={() => setCurrentSlide(0)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/60 rounded-full hover:bg-white transition-all shadow-sm animate-in fade-in slide-in-from-right-2"
              >
                <ChevronLeft size={24} className="text-[#5F6F7A]" />
              </button>
            )}

            {/* スライド切り替えボタン（右）：1枚目の時だけ表示 */}
            {currentSlide === 0 && (
              <button 
                onClick={() => setCurrentSlide(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/60 rounded-full hover:bg-white transition-all shadow-sm animate-in fade-in slide-in-from-left-2"
              >
                <ChevronRight size={24} className="text-[#5F6F7A]" />
              </button>
            )}

            <div className="flex-1 overflow-y-auto p-8">
              {currentSlide === 0 ? (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-lg italic text-[#B5A773] mb-2 tracking-widest text-center">Guide</h2>
                  <p className="text-[11px] text-center mb-6 opacity-70">
                    ここはあなたが、あなたの本音を大切に扱うための<br />
                    パーソナルスペースです。
                  </p>

                  <div className="space-y-6 text-[12px] leading-relaxed text-[#5F6F7A]">
                    <section>
                      <p className="font-bold text-[#B5A773] mb-1">Concept</p>
                      <p className="opacity-90">
                        「自己受容 × 行動変容 ＝ 自己実現」をテーマに、自分のペースで自分を深めるための空間です。
                      </p>
                    </section>

                    <section className="space-y-3">
                      <p className="font-bold text-[#B5A773] mb-1">Tools</p>
                      <div className="space-y-2">
                        <p>
                          ● <b>Main Menu</b>：思考を整えるワークや診断、生きづらさ解消のための読み物などが揃っています。
                        </p>
                        <p>
                          ● <b>Counseling</b>：プロの手を借りて自分を深堀したくなった際は、カウンセリングの予約も可能です。
                        </p>
                        <p>
                          ● <b>Diary</b>：今日の自分を%で記録。心の波を可視化し、自分との対話を深めます。
                        </p>
                      </div>
                    </section>

                    <section>
                      <p className="font-bold text-[#B5A773] mb-1">Privacy & Data</p>
                      <div className="opacity-90 text-[11px] space-y-2 leading-relaxed">
                        <p>
                          大切な記録はあなたのデバイス内に保存されます。ブラウザの自動削除からデータを守るため<b>「ホーム画面に追加」</b>しての使用を推奨しています。
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-full">
                  <img 
                    src="/images/mpersonal.png" 
                    alt="Manual" 
                    className="w-full h-auto rounded-2xl shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="p-8 pt-0">
              {/* インジケーター：クリックでも切り替え可能に */}
              <div className="flex justify-center gap-2 mb-6">
                <button 
                  onClick={() => setCurrentSlide(0)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === 0 ? "bg-[#B5A773] w-6" : "bg-[#B5A773]/20 w-1.5"}`} 
                />
                <button 
                  onClick={() => setCurrentSlide(1)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === 1 ? "bg-[#B5A773] w-6" : "bg-[#B5A773]/20 w-1.5"}`} 
                />
              </div>

              <button
                onClick={() => setIsGuideOpen(false)}
                className="w-full py-4 bg-[#5F6F7A] text-white rounded-2xl text-[11px] font-bold tracking-[0.3em] hover:bg-[#4a5761] transition-colors shadow-lg shadow-[#5F6F7A]/20"
              >
                トップに戻る
              </button>
            </div>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsGuideOpen(false)}></div>
        </div>
      )}

      {/* HEADER */}
      <header className="w-full max-w-md text-center mt-12 mb-24">
        <div className="inline-block px-4 py-1.5 bg-white/40 rounded-full text-[9px] tracking-[0.25em] mb-6 border border-white/30 shadow-sm">
          TODAY&apos;S VISITOR: <span className="font-bold ml-1 text-[#B5A773]">{visitorCount}</span>
        </div>
        <h1 className="text-4xl italic mb-3">
          m. <span className="text-[#B5A773] font-light">personal space</span>
        </h1>
        <p className="text-[10px] tracking-[0.4em] opacity-60 uppercase">地味で愛しいソロ生活</p>
      </header>

      {/* MAIN */}
      <main className="w-full max-w-xs space-y-4 mb-24 relative z-10">
        <Link href="/menu" className="block group">
          <div className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-white/40 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all cursor-pointer">
            <div className="text-left flex-1">
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase tracking-wider">Main Menu</span>
              <span className="text-[13px] opacity-80">メインメニュー / Ezine</span>
            </div>
            <span className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </Link>

        <Link href="/booking" className="block group">
          <div className="w-full py-7 px-8 bg-[#5F6F7A] text-[#F2F0E9] rounded-[2.5rem] shadow-md flex justify-between items-center hover:bg-[#52606A] hover:-translate-y-[1px] transition-all cursor-pointer">
            <div className="text-left flex-1">
              <span className="block text-xs font-bold opacity-60 mb-1 uppercase tracking-wider">Counseling</span>
              <span className="text-[13px]">カウンセリング予約</span>
            </div>
            <span className="opacity-60 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </Link>

        <Link href="/diary" className="block group pb-2">
          <div className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-white/40 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all cursor-pointer">
            <div className="text-left flex-1">
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase tracking-wider">Diary</span>
              <span className="text-[13px] opacity-80">コンディション記録 / 日記</span>
            </div>
            <span className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </Link>

        {/* 振り分けを適用したピクニックボタン */}
        <Link href={picnicPath} className="block pt-4 group">
          <div className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-[#B5A773]/30 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all cursor-pointer">
            <div className="text-left flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="block text-xs font-bold text-[#B5A773] uppercase tracking-wider">M. picnic space</span>
                <span className="text-[8px] bg-[#B5A773]/10 text-[#B5A773] px-1.5 py-0.5 rounded tracking-tighter font-bold">MEMBERSHIP</span>
              </div>
              <span className="text-[13px] opacity-80 italic">みんなとゆるく繋がる広場</span>
            </div>
            <span className="text-[#B5A773] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
          <p className="text-[9px] text-center mt-3 opacity-40 tracking-[0.1em]">
            ※こちらはメンバーシップ限定の空間です
          </p>
        </Link>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-sm space-y-12 border-t border-[#B5A773]/30 pt-14 pb-12">
        <nav className="flex justify-center gap-10 text-[10px] font-bold tracking-[0.2em] opacity-60">
          <Link href="/about" className="hover:text-[#B5A773] transition-colors">
            作者情報
          </Link>
          <Link href="/contact" className="hover:text-[#B5A773] transition-colors">
            お問い合わせ
          </Link>
          <Link href="/terms" className="hover:text-[#B5A773] transition-colors">
            利用規約
          </Link>
        </nav>
        <div className="bg-white/20 p-5 rounded-3xl border border-white/20 text-center">
          <p className="text-[10px] opacity-70 leading-relaxed">
            NOTICE / 通院中の方は主治医の許可を得てください
          </p>
        </div>
        <div className="text-center text-[9px] tracking-[0.4em] opacity-30 italic flex justify-center items-center gap-1">
          &copy; 2026{" "}
          <Link
            href="/admin"
            className="hover:opacity-100 hover:text-[#B5A773] cursor-default transition-all"
          >
            m.
          </Link>{" "}
          personal space
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
                  共有ボタンから「ホーム画面に追加」
                </p>
              </div>
              <button onClick={handleClosePrompt} className="text-white/40 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}