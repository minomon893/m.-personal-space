"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PicnicPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const slackFont = { fontFamily: '"Zen Maru Gothic", "Kosugi Maru", "Meiryo", sans-serif' };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. ログインしてなければログインページ（またはルート）へ
      if (!session) {
        router.push("/");
        return;
      }

      // 2. プロフィールがあるか確認
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        // プロフィールがないならセットアップへ
        router.push("/picnic/setup");
      } else {
        // プロフィールがあればセットして表示
        setProfile(data);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="animate-pulse text-[#B5A773] text-sm tracking-widest">LOADING...</div>
      </div>
    );
  }

  return (
    <div style={slackFont} className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* ユーザー情報表示 */}
      <header className="text-center mb-16 space-y-6">
        <h1 className="text-[10px] tracking-[0.6em] text-[#E5E1D8] uppercase font-black">Picnic</h1>
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-[#FAF9F6] rounded-[3rem] shadow-sm flex items-center justify-center overflow-hidden border border-[#F1EFEA]">
            {profile?.icon?.startsWith("http") || profile?.icon?.startsWith("blob:") ? (
              <img src={profile.icon} className="w-full h-full object-cover" alt="icon" />
            ) : (
              <span className="text-4xl">{profile?.icon || "🌸"}</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[#A39C93] font-bold tracking-widest uppercase">{profile?.title}</p>
            <p className="text-xl text-[#70695E] font-bold tracking-tight">{profile?.nickname}</p>
          </div>
        </div>
      </header>

      {/* メニューリンク */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        <Link 
          href="/picnic/talk" 
          className="bg-[#F8FAFC] aspect-square rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#F1F5F9] active:scale-95 shadow-sm border border-[#F1F5F9]"
        >
          <span className="text-3xl">💬</span>
          <span className="text-[11px] font-bold text-[#94A3B8]">トーク</span>
        </Link>
        <Link 
          href="/picnic/otaku" 
          className="bg-[#F0FDF4] aspect-square rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#DCFCE7] active:scale-95 shadow-sm border border-[#DCFCE7]"
        >
          <span className="text-3xl">🔥</span>
          <span className="text-[11px] font-bold text-[#166534]/50">オタク</span>
        </Link>
      </div>

      {/* ログアウトやおまけなど（必要に応じて） */}
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/");
        }}
        className="mt-12 text-[10px] text-[#C1B9AE] tracking-widest hover:text-[#8C8376] transition-colors"
      >
        LOGOUT
      </button>
    </div>
  );
}