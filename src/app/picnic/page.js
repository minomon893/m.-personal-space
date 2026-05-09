"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function PicnicLandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setHasSession(true);
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();
          if (profile) {
            setHasProfile(true);
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
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center">
        <div className="w-4 h-4 bg-[#A8C69F] rounded-full animate-ping"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#5F6F7A] pb-32 animate-in fade-in duration-1000 overflow-x-hidden selection:bg-[#A8C69F]/20">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        body { font-family: 'Zen Maru Gothic', sans-serif; letter-spacing: 0.05em; }
        .bg-dot {
          background-image: radial-gradient(#DDE6D9 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .shiori-line {
          background-image: repeating-linear-gradient(transparent, transparent 31px, #E8EEE5 31px, #E8EEE5 32px);
          line-height: 32px;
        }
      `}</style>

      {/* フローティング参加ボタン */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
        <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-[#A8C69F]/20 pointer-events-auto animate-bounce-slow">
          <p className="text-[10px] font-black text-[#A8C69F] tracking-tighter">月額 500円 で参加</p>
        </div>
        <button 
          onClick={() => router.push(hasProfile ? "/picnic/garden" : "/picnic/setup")}
          className="pointer-events-auto px-10 py-5 bg-[#A8C69F] text-white rounded-full text-xs font-black tracking-[0.3em] shadow-[0_10px_30px_rgba(168,198,159,0.4)] hover:translate-y-[-4px] active:translate-y-[2px] transition-all flex items-center gap-3"
        >
          {hasProfile ? "GARDENへ入る" : "ピクニックに参加"}
          <span className="text-lg">🧺</span>
        </button>
      </div>

      {/* 装飾 */}
      <div className="fixed top-0 left-0 w-full h-full bg-dot -z-10 opacity-50"></div>

      <header className="max-w-3xl mx-auto pt-24 pb-20 px-8 text-center">
        <Link href="/" className="inline-block mb-16 text-[9px] font-black tracking-[0.3em] text-[#A8C69F] hover:opacity-60 transition-opacity border-b border-[#A8C69F] pb-1">
          BACK TO PORTFOLIO
        </Link>
        
        <div className="relative inline-block mb-8">
          <h1 className="font-pop text-[#A8C69F] text-3xl sm:text-4xl tracking-[0.2em] uppercase">
            M. picnic
          </h1>
          <div className="absolute -right-12 -top-6 rotate-[15deg] bg-[#B5A773] text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-sm">
            GUIDE
          </div>
        </div>
        
        <p className="text-[11px] font-bold tracking-[0.2em] leading-relaxed opacity-70">
          ここは、あなたの日常に「余白」を届けるための場所。
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-8 space-y-24">
        
        {/* コンセプト */}
        <section className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-[#A8C69F]/20 rounded-full"></div>
          <h2 className="text-[10px] font-black tracking-[0.5em] text-[#A8C69F] uppercase mb-6">Concept</h2>
          <p className="text-[13px] leading-[2.2] font-bold opacity-80">
            一人の時間は好きだけど、世界のどこかに誰かがいる安心感がほしい。<br />
            SNSの喧騒から離れて、芝生の上に座り込むような心地よさを目指しています。<br />
            あなたの好きなもの、今の気持ち、静かに置いていってください。
          </p>
        </section>

        {/* ルール・使い方 */}
        <section className="space-y-10">
          <h2 className="text-[10px] font-black tracking-[0.5em] text-[#A8C69F] uppercase border-b border-[#E8EEE5] pb-4">Guide & Rule</h2>
          
          <div className="space-y-12">
            <div className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#F0F7EE] flex items-center justify-center text-xs">01</span>
                <h3 className="text-sm font-black tracking-wider">言葉を置く（文字数）</h3>
              </div>
              <p className="text-[12px] leading-loose opacity-70 pl-12">
                投稿は最大 <strong className="text-[#5F6F7A]">200文字</strong> まで。<br />
                長すぎず短すぎず、今の空気感をそのままパッキングしてください。<br />
                画像は1枚まで、あなたの視界を共有できます。
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#F0F7EE] flex items-center justify-center text-xs">02</span>
                <h3 className="text-sm font-black tracking-wider">お気に入り（🌼）</h3>
              </div>
              <p className="text-[12px] leading-loose opacity-70 pl-12">
                心に響いた投稿には「お花（🌼）」を贈ることができます。<br />
                お気に入りに登録した投稿は、マイページでいつでも読み返せます。<br />
                いいね！よりも少しだけ、大切に持ち帰るイメージです。
              </p>
            </div>

            <div className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#F0F7EE] flex items-center justify-center text-xs">03</span>
                <h3 className="text-sm font-black tracking-wider">マナーと通報</h3>
              </div>
              <p className="text-[12px] leading-loose opacity-70 pl-12">
                誰かのピクニックを邪魔しないために。不快な投稿や攻撃的な表現を見かけた場合は、投稿のメニューから「通報」を行ってください。<br />
                管理者が確認し、必要に応じて非表示や利用制限の対応を行います。<br />
                ここは優しい人たちのための、静かな広場です。
              </p>
            </div>
          </div>
        </section>

        {/* 料金システム */}
        <section className="bg-white rounded-[3rem] p-10 border border-[#A8C69F]/10 shadow-sm">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-[#A8C69F] uppercase">System</h2>
            <div className="py-4">
              <span className="text-3xl font-black text-[#5F6F7A]">¥500</span>
              <span className="text-[10px] font-bold opacity-60 ml-2">/ month</span>
            </div>
            <p className="text-[11px] leading-[1.8] opacity-60 px-4">
              この場所を維持し、広告のない静かな環境を守るための運営費として頂戴しています。<br />
              一ヶ月単位でいつでも解約が可能です。
            </p>
          </div>
        </section>

        {/* ログイン済みユーザーへの案内 */}
        {(hasSession || hasProfile) && (
          <div className="text-center pt-8">
            <Link 
              href="/picnic/garden" 
              className="text-[10px] font-black text-[#A8C69F] hover:text-[#94A684] transition-colors underline underline-offset-8 decoration-1"
            >
              すでに参加中の方はこちらから広場へ
            </Link>
          </div>
        )}

      </main>

      <footer className="mt-40 mb-20 text-center opacity-30">
        <p className="text-[9px] font-black tracking-[0.6em] uppercase mb-2">Pack your love in a basket</p>
        <p className="text-[8px] font-bold">© 2026 M. Picnic Project</p>
      </footer>

      {/* アニメーション用追加スタイル */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}