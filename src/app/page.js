"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [streakDays, setStreakDays] = useState(1);
  const [totalVisits, setTotalVisits] = useState(1);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  // ガイドのスライド番号 (0: テキスト, 1: 画像)
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // お知らせの未読状態管理ステート
  const [hasNewNotice, setHasNewNotice] = useState(false);

  useEffect(() => {
    // --- 1. 日本時間の今日の日付 (YYYY-MM-DD) を取得 ---
    const today = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    })
      .format(new Date())
      .replace(/\//g, "-");

    const hidePromptKey = `hide_install_prompt_${today}`;

    // インストールプロンプトの表示制御
    if (!localStorage.getItem(hidePromptKey)) {
      setShowInstallPrompt(true);
    }

    // --- 2. 個人アクセスデータ（連続日数 & 通算訪問数）の記録処理 ---
    const lastVisitDate = localStorage.getItem("user_last_visit_date");
    const currentStreak = parseInt(localStorage.getItem("user_visit_streak") || "0", 10);
    const currentTotal = parseInt(localStorage.getItem("user_total_visits") || "0", 10);

    if (!lastVisitDate) {
      // 初回訪問時
      setStreakDays(1);
      setTotalVisits(1);
      localStorage.setItem("user_last_visit_date", today);
      localStorage.setItem("user_visit_streak", "1");
      localStorage.setItem("user_total_visits", "1");
    } else if (lastVisitDate !== today) {
      // 日付が変わってからの訪問時
      const lastDate = new Date(lastVisitDate);
      const currentDate = new Date(today);
      const diffTime = currentDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = 1;
      if (diffDays === 1) {
        // 昨日訪れていれば連続日数を+1
        newStreak = currentStreak + 1;
      } else {
        // 2日以上あいていればリセットして1日目に
        newStreak = 1;
      }

      const newTotal = currentTotal + 1;

      setStreakDays(newStreak);
      setTotalVisits(newTotal);

      localStorage.setItem("user_last_visit_date", today);
      localStorage.setItem("user_visit_streak", newStreak.toString());
      localStorage.setItem("user_total_visits", newTotal.toString());
    } else {
      // 今日すでに訪問済みの場合（値を表示のみセット）
      setStreakDays(currentStreak || 1);
      setTotalVisits(currentTotal || 1);
    }
  }, []);

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
      <div className="absolute top-6 right-6 z-40 hidden">
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
      {isGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#5F6F7A]/20 backdrop-blur-sm animate-in fade-in duration-300 hidden">
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
      <header className="w-full max-w-md text-center mt-12 mb-12">
        {/* 個人記録バッジ（連続訪問数 & 通算訪問数） */}
        <div className="inline-block px-4 py-1.5 bg-white/40 rounded-full text-[9px] tracking-[0.2em] mb-6 border border-white/30 shadow-sm">
          STREAK: <span className="font-bold text-[#B5A773] mr-1">🔥 {streakDays}日目</span>
        </div>
        <h1 className="text-4xl italic mb-3">
          m. <span className="text-[#B5A773] font-light">personal space</span>
        </h1>
        <p className="text-[10px] tracking-[0.4em] opacity-60 uppercase">自分の本音を大切にするためのスペースです。</p>
      </header>

      {/* MAIN */}
      <main className="w-full max-w-xs space-y-4 mb-12 relative z-10">
        {/* 1番上：お知らせ（未読状態：枠線を強調） */}
        <Link href="/menu/notices" className="block group">
          <div className={`relative w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all cursor-pointer ${hasNewNotice ? "border-[#B5A773] shadow-[0_0_10px_rgba(181,167,115,0.3)]" : "border-white/40"}`}>
            <div className="text-left flex-1">
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase tracking-wider">News</span>
              <span className="text-[13px] opacity-80">お知らせ</span>
            </div>
            <span className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all mr-1">→</span>
          </div>
        </Link>

        {/* 2番目：コンディション記録（くすみブルー仕様、クリック可能） */}
        <Link href="/diary" className="block group pb-2">
          <div className="w-full py-7 px-8 bg-[#5F6F7A] text-[#F2F0E9] rounded-[2.5rem] shadow-md flex justify-between items-center hover:bg-[#4a5761] hover:-translate-y-[1px] transition-all cursor-pointer">
            <div className="text-left flex-1">
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase tracking-wider">Diary</span>
              <span className="text-[13px] opacity-90">コンディション記録</span>
            </div>
            <span className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
        </Link>

        {/* 3番目：メインメニュー */}
        <Link href="/menu" className="block group">
          <div className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-white/40 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all cursor-pointer">
            <div className="text-left flex-1">
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase tracking-wider">Main Menu</span>
              <span className="text-[13px] opacity-80">メインメニュー</span>
            </div>
            <span className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
          </div>
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