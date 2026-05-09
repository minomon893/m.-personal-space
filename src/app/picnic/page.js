"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function PicnicLandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // 1. セッションがあるか確認（ブラウザのCookie/LocalStorageに保存されている）
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setHasSession(true);
          // 2. プロフィールが作成済みか確認
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setHasProfile(true);
            // プロフィールまであれば、自動でgardenへ（離脱後の再訪対策）
            router.replace("/picnic/garden");
            return;
          }
        }
      } catch (e) {
        console.error("Redirect check failed:", e);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [router, supabase]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F2F0E9] flex items-center justify-center">
        <div className="w-4 h-4 bg-[#B5A773]/20 rounded-full animate-ping"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0E9] font-[family-name:var(--font-sans)] overflow-y-auto flex flex-col items-center p-8 animate-in fade-in duration-700">
      
      {/* ヘッダー */}
      <header className="w-full max-w-md text-center mt-12 mb-16">
        <Link href="/" className="inline-block mb-8 opacity-60 hover:opacity-100 text-xs tracking-widest text-[#5F6F7A]">
          &larr; BACK TO HOME
        </Link>
        <h1 className="text-3xl italic mb-3 text-[#B5A773]">
          M. <span className="font-light">picnic space</span>
        </h1>
        <p className="text-[10px] tracking-[0.2em] opacity-70 uppercase leading-relaxed text-[#5F6F7A]">
          自分の部屋をちょっと飛び出して、<br />
          みんなとゆるく繋がる場所
        </p>
      </header>

      {/* コンセプト説明 */}
      <section className="w-full max-w-sm bg-white/50 rounded-[2.5rem] p-8 border border-white/60 shadow-sm mb-12">
        <p className="text-[13px] leading-loose opacity-90 text-center text-[#5F6F7A]">
          「一人の時間は大切だけど、たまには誰かの気配を感じたい」<br />
          そんな時にふらっと立ち寄れるピクニック広場のような場所です。
        </p>
      </section>

      {/* コンテンツ紹介 */}
      <div className="w-full max-w-sm space-y-6 mb-20 text-[#5F6F7A]">
        <h2 className="text-center text-[11px] font-bold tracking-[0.4em] opacity-40 uppercase mb-8">Contents</h2>
        {[
          { title: "ちょこっとーく", desc: "タイムライン形式のつぶやき場。" },
          { title: "オタトーーーーク！！！", desc: "熱量をさらけ出す趣味の場。" },
          { title: "限定コラム", desc: "ここだけの読み物。" }
        ].map((item, index) => (
          <div key={index} className="flex gap-4 items-start p-4 border-b border-[#B5A773]/20">
            <span className="text-[#B5A773] text-lg font-serif">0{index + 1}</span>
            <div>
              <h3 className="text-sm font-bold mb-1">{item.title}</h3>
              <p className="text-[11px] opacity-70">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 参加ボタンエリア */}
      <div className="w-full max-w-xs text-center pb-12">
        {hasProfile ? (
          <button 
            onClick={() => router.push("/picnic/garden")}
            className="w-full py-5 bg-[#B5A773] text-white rounded-2xl text-[12px] font-bold tracking-[0.2em] shadow-lg shadow-[#B5A773]/30 hover:opacity-90 transition-opacity active:scale-95 transition-transform"
          >
            Gardenへ入る
          </button>
        ) : (
          <button 
            onClick={() => router.push("/picnic/setup")}
            className="w-full py-5 bg-[#B5A773] text-white rounded-2xl text-[12px] font-bold tracking-[0.2em] shadow-lg shadow-[#B5A773]/30 hover:opacity-90 transition-opacity active:scale-95 transition-transform"
          >
            {hasSession ? "プロフィールを完成させる" : "ピクニックに参加する"}
          </button>
        )}
        
        <div className="mt-8 space-y-4">
          <p className="text-[9px] opacity-40 text-[#5F6F7A]">
            ※現在はプレビュー期間中のため無料です。
          </p>
          
          {(hasSession || hasProfile) && (
            <Link 
              href="/picnic/garden" 
              className="block text-[10px] text-[#B5A773] opacity-60 hover:opacity-100 transition-opacity underline underline-offset-4"
            >
              すでに参加中の方はこちら（Gardenへ）
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}