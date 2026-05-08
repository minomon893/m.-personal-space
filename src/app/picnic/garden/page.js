"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function GardenPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const fetchGardenData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profRes } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          
          if (profRes) setProfile(profRes);
        }
      } catch (e) {
        console.error("Garden entry error:", e);
      } finally {
        // ロード画面を少し見せて情緒を出す
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchGardenData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F3] flex items-center justify-center">
        <div className="text-[#B5A773] animate-pulse font-bold text-[10px] tracking-[0.5em] uppercase">
          Entering garden...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] font-[family-name:var(--font-sans)]">
      <div className="max-w-md mx-auto pt-16 px-6 pb-24 animate-in fade-in zoom-in-95 duration-700">
        
        <header className="text-center mb-16">
          <h1 className="text-3xl italic text-[#B5A773] mb-4">M. <span className="font-light">picnic</span></h1>
          
          <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-[#F1EFEA] shadow-sm">
            <div className="w-6 h-6 rounded-full bg-[#F9F8F3] overflow-hidden flex items-center justify-center text-xs border border-[#F1EFEA]">
              {profile?.icon?.startsWith('http') ? (
                <img src={profile.icon} className="w-full h-full object-cover" alt="me" />
              ) : (
                <span className="text-[10px]">{profile?.icon || "🍃"}</span>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#5F6F7A] tracking-wider uppercase">
              {profile ? `Welcome, ${profile.nickname}` : "Guest Mode"}
            </span>
          </div>
        </header>

        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-[#B5A773] tracking-[0.4em] uppercase ml-2 mb-4">Select Space</h2>
          {[
            { title: "ちょこっとーく", desc: "ゆるいつぶやき、誰かの気配。", icon: "💬", path: "/picnic/talk" },
            { title: "オタトーーーーク！！！", desc: "好きを叫ぶ、熱量の社交場。", icon: "🔥", path: "/picnic/otaku" },
            { title: "限定コラム", desc: "ここでしか読めない、内緒の話。", icon: "📖", path: "/picnic/jimmy" }
          ].map((item) => (
            <Link href={item.path} key={item.path} className="block group">
              <div className="bg-white p-6 rounded-[2.2rem] border border-[#F1EFEA] shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 flex items-center gap-6">
                <div className="w-14 h-14 bg-[#F9F8F3] rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#5F6F7A] mb-1 group-hover:text-[#B5A773] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#C1B9AE]">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 text-center flex flex-col gap-8">
          {profile ? (
            <div className="mx-auto max-w-[200px] py-4 px-2 border-t border-[#F1EFEA]">
              <p className="text-[9px] text-[#C1B9AE] mb-2 leading-relaxed">
                今のプロフィールを<br />別の端末でも使いたい時は
              </p>
              <button className="text-[10px] font-bold text-[#B5A773] hover:opacity-70 transition-opacity">
                メールアドレスを紐付ける &rarr;
              </button>
            </div>
          ) : (
            <Link href="/picnic/setup" className="text-[10px] font-bold text-[#B5A773] border border-[#B5A773] px-6 py-3 rounded-full">
              プロフィールを作成する
            </Link>
          )}
          
          <Link href="/picnic" className="text-[10px] tracking-widest text-[#C1B9AE] hover:text-[#B5A773] transition-colors">
            EXIT TO THE ENTRANCE
          </Link>
        </footer>
      </div>
    </div>
  );
}