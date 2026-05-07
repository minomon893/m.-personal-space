"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function HomePage() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    async function handleVisitorCount() {
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

      if (!localStorage.getItem(hidePromptKey)) {
        setShowInstallPrompt(true);
      }

      try {
        let guestId = localStorage.getItem(guestIdKey);
        if (!guestId) {
          guestId = Math.random().toString(36).substring(2, 15);
          localStorage.setItem(guestIdKey, guestId);
        }

        if (!localStorage.getItem(storageKey)) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const { error: upsertError } = await supabase
            .from("daily_access_logs")
            .upsert(
              { guest_id: guestId, accessed_at: today, user_id: user?.id || null },
              { onConflict: "guest_id, accessed_at" }
            );
          if (!upsertError) localStorage.setItem(storageKey, "true");
        }

        const { count, error } = await supabase
          .from("daily_access_logs")
          .select("*", { count: "exact", head: true })
          .eq("accessed_at", today);

        if (!error && count !== null) setVisitorCount(count);
      } catch (err) {
        console.error("Counter Error:", err);
      }
    }
    handleVisitorCount();
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
      <div className="absolute top-6 right-6 z-40">
        <button
          onClick={() => setIsGuideOpen(true)}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#5F6F7A]/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="bg-[#F2F0E9] w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-8 shadow-2xl border border-white relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg italic text-[#B5A773] mb-6 tracking-widest text-center">Guide</h2>

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
                    ● <b>Main Menu</b>：思考を整えるワークや診断、そして専門的に深掘りした「Ezine」が揃っています。
                  </p>
                  <p>
                    ● <b>Counseling</b>：もっと深く、マンツーマンで向き合いたい時に。
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
                    大切な記録はあなたのデバイス内に保存されます。
                    ブラウザの自動削除からデータを守り、オフラインでもスムーズに利用できるよう
                    <b>「ホーム画面に追加」</b>しての使用を推奨しています。
                  </p>
                  <p>
                    アイコンからすぐに起動できるため、日々の習慣化にも最適です。
                    Diaryの記録は、手動でのバックアップや引き継ぎにも対応しています。
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <p className="font-bold text-[#B5A773] mb-1 tracking-wider">M. picnic space</p>
                <p className="opacity-90 mb-2">
                  自分の部屋をちょっと飛び出して、みんなとゆるく繋がる応援メンバーシップです。
                </p>
                <div className="space-y-2 pl-2 border-l-2 border-[#B5A773]/30">
                  <p>
                    <b>ちょこっとーく</b>：心おきなくつぶやいて、リアクションで温かく繋がる場所。
                  </p>
                  <p>
                    <b>オタトーーーーク！！！</b>
                    ：写真なし・返信1回。余計な気を遣わずに好きなことを語り合えます。
                  </p>
                  <p>
                    <b>コラム</b>：管理人個人の日記に近い、ここだけの内緒の話やこっそりした気づき。
                  </p>
                </div>
                <Link href="/subscription" className="block pt-2">
                  <button className="w-full py-2.5 bg-[#B5A773] text-white rounded-xl text-[10px] font-bold tracking-[0.1em] hover:opacity-90 transition-opacity shadow-sm">
                    M. picnic space に加入する
                  </button>
                </Link>
              </section>
            </div>

            <button
              onClick={() => setIsGuideOpen(false)}
              className="mt-8 w-full py-4 bg-[#5F6F7A] text-white rounded-2xl text-[11px] font-bold tracking-[0.3em] hover:bg-[#4a5761] transition-colors shadow-lg shadow-[#5F6F7A]/20"
            >
              トップに戻る
            </button>
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
      <main className="w-full max-w-xs space-y-4 mb-24">
        <Link href="/menu" className="block text-left">
          <button className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-white/40 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all">
            <div>
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase">Main Menu</span>
              <span className="text-[13px] opacity-80">メインメニュー / Ezine</span>
            </div>
            <span className="opacity-30">→</span>
          </button>
        </Link>

        <Link href="/booking" className="block text-left">
          <button className="w-full py-7 px-8 bg-[#5F6F7A] text-[#F2F0E9] rounded-[2.5rem] shadow-md flex justify-between items-center hover:bg-[#52606A] hover:-translate-y-[1px] transition-all">
            <div>
              <span className="block text-xs font-bold opacity-60 mb-1 uppercase">Counseling</span>
              <span className="text-[13px]">カウンセリング予約</span>
            </div>
            <span className="opacity-60">→</span>
          </button>
        </Link>

        <Link href="/diary" className="block text-left">
          <button className="w-full py-7 px-8 bg-white/45 rounded-[2.5rem] border border-white/40 shadow-sm flex justify-between items-center hover:bg-white/70 hover:-translate-y-[1px] transition-all">
            <div>
              <span className="block text-xs font-bold text-[#B5A773] mb-1 uppercase">Diary</span>
              <span className="text-[13px] opacity-80">コンディション記録 / 日記</span>
            </div>
            <span className="opacity-30">→</span>
          </button>
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