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
      <div className="min-h-screen bg-[#F0F7EE] flex items-center justify-center">
        <div className="w-6 h-6 bg-[#A8C69F] rounded-full animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7EE] text-[#5F6F7A] pb-24 animate-in fade-in duration-1000 overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        body { font-family: 'Zen Maru Gothic', sans-serif; }
        
        .gingham-bg {
          background-image: radial-gradient(rgba(168, 198, 159, 0.2) 20%, transparent 20%), radial-gradient(rgba(168, 198, 159, 0.2) 20%, transparent 20%);
          background-size: 30px 30px;
          background-position: 0 0, 15px 15px;
        }

        .title-shadow {
          text-shadow: 3px 3px 0px #ffffff, 6px 6px 0px rgba(168, 198, 159, 0.2);
        }
      `}</style>

      {/* 装飾用のふわふわした丸 */}
      <div className="fixed -top-20 -left-20 w-64 h-64 bg-white/40 rounded-full blur-3xl -z-10"></div>
      <div className="fixed top-1/3 -right-20 w-80 h-80 bg-[#A8C69F]/10 rounded-full blur-3xl -z-10"></div>

      {/* ヘッダー */}
      <header className="w-full max-w-2xl mx-auto text-center pt-20 pb-16 px-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 bg-white/50 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] text-[#94A684] hover:bg-white transition-all border border-white">
          <span>←</span> BACK TO HOME
        </Link>
        
        <div className="relative inline-block mb-6">
          <h1 className="font-pop text-[#A8C69F] text-4xl sm:text-5xl tracking-widest title-shadow uppercase">
            M. picnic
          </h1>
          <div className="absolute -right-8 -top-4 rotate-12 bg-[#B5A773] text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-sm">
            OPEN!
          </div>
        </div>
        
        <p className="text-[12px] font-bold tracking-[0.3em] opacity-80 uppercase leading-relaxed text-[#5F6F7A] mt-4">
          自分の部屋をちょっと飛び出して、<br />
          みんなとゆるく繋がる場所
        </p>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-xl mx-auto px-8 space-y-12">
        
        {/* コンセプト説明 */}
        <section className="bg-white rounded-[4rem] p-12 shadow-xl shadow-green-900/5 border border-white gingham-bg relative overflow-hidden">
          <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white text-center">
            <span className="text-3xl mb-4 block">🧺</span>
            <p className="text-[15px] leading-loose font-bold text-[#5F6F7A]">
              「一人の時間は大切だけど、<br className="hidden sm:block" />
              たまには誰かの気配を感じたい」<br />
              そんな時にふらっと立ち寄れる<br />
              ピクニック広場のような場所です。
            </p>
          </div>
        </section>

        {/* コンテンツ紹介 */}
        <section className="space-y-6">
          <h2 className="text-center font-pop text-[#A8C69F] text-lg tracking-[0.4em] mb-10">CONTENTS</h2>
          
          <div className="grid gap-6">
            {[
              { id: "01", title: "ちょこっとーく", desc: "何気ない日常を、ゆるく共有する広場。", icon: "🍃" },
              { id: "02", title: "オタトーーーーク！！！", desc: "限界オタクの愛を叫ぶ、熱量高めの場所。", icon: "🔥" },
              { id: "03", title: "限定コラム", desc: "ここだけでこっそり読める、秘密の読み物。", icon: "📖" }
            ].map((item) => (
              <div key={item.id} className="group bg-white/60 hover:bg-white rounded-[3rem] p-8 flex items-center gap-6 border border-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#F0F7EE] rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-[#A8C69F] tracking-tighter">{item.id}</span>
                    <h3 className="text-sm font-black text-[#5F6F7A] tracking-wider">{item.title}</h3>
                  </div>
                  <p className="text-[11px] font-bold opacity-60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 参加ボタンエリア */}
        <section className="pt-12 text-center">
          <div className="bg-white rounded-[5rem] p-12 shadow-2xl shadow-green-900/10 border-b-[10px] border-[#E2F0D9] gingham-bg">
            <div className="max-w-xs mx-auto space-y-8">
              {hasProfile ? (
                <button 
                  onClick={() => router.push("/picnic/garden")}
                  className="w-full py-6 bg-[#A8C69F] text-white rounded-full text-sm font-black tracking-[0.4em] shadow-lg shadow-[#A8C69F]/30 hover:scale-105 active:scale-95 transition-all"
                >
                  GARDENへ入る
                </button>
              ) : (
                <button 
                  onClick={() => router.push("/picnic/setup")}
                  className="w-full py-6 bg-[#A8C69F] text-white rounded-full text-sm font-black tracking-[0.4em] shadow-lg shadow-[#A8C69F]/30 hover:scale-105 active:scale-95 transition-all"
                >
                  {hasSession ? "プロフィールを完成させる" : "ピクニックに参加する"}
                </button>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#B5A773] tracking-widest uppercase opacity-60">
                  Free Preview Period Now
                </p>
                
                {(hasSession || hasProfile) && (
                  <Link 
                    href="/picnic/garden" 
                    className="inline-block text-[10px] font-black text-[#A8C69F] hover:text-[#94A684] transition-colors underline underline-offset-8 decoration-2"
                  >
                    すでに参加中の方はこちら
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-32 text-center opacity-40">
        <p className="text-[10px] font-black tracking-[0.5em] uppercase">Pack your love in a basket 🥪</p>
      </footer>
    </div>
  );
}