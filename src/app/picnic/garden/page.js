"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function GardenPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysCount, setDaysCount] = useState(0);
  const [decorations, setDecorations] = useState([]);

  const supabase = useMemo(() => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const cleanUrl = rawUrl.trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const cleanKey = rawKey.trim().replace(/['"]+/g, "");
    return createBrowserClient(cleanUrl, cleanKey);
  }, []);

  useEffect(() => {
    // パステルカラーに合わせたデコレーション
    const items = ["🧺", "🥪", "🎈", "🍎", "🥐", "🥤", "🌼", "🌿", "☁️"];
    const randomDecos = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      item: items[Math.floor(Math.random() * items.length)],
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 5}%`,
      rotate: `${Math.random() * 40 - 20}deg`,
      size: Math.random() * 10 + 20 + "px"
    }));
    setDecorations(randomDecos);

    const fetchGardenData = async () => {
      try {
        const savedProfile = localStorage.getItem("picnic_user_profile");
        
        if (savedProfile) {
          const profRes = JSON.parse(savedProfile);
          setProfile(profRes);
          const createdDate = new Date(profRes.updated_at || new Date());
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysCount(diffDays);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profRes } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            
            if (profRes) {
              setProfile(profRes);
            }
          }
        }
      } catch (e) {
        console.error("Garden entry error:", e);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchGardenData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E2F0D9] flex items-center justify-center text-[#94A684]">
        <div className="animate-pulse font-black text-[10px] tracking-[0.5em] uppercase">
          Spreading the blanket...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7EE] bg-gradient-to-b from-[#F0F7EE] to-[#E2F0D9] font-[family-name:var(--font-sans)] relative overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
        body { font-family: 'Zen Maru Gothic', sans-serif; }
        /* ギンガムチェックもパステルに */
        .gingham-yellow { background-color: #ffffff; background-image: radial-gradient(#FFFBEB 50%, transparent 50%), radial-gradient(#FFFBEB 50%, #ffffff 50%); background-size: 30px 30px; background-position: 0 0, 15px 15px; }
        .gingham-blue { background-color: #ffffff; background-image: radial-gradient(#F0F9FF 50%, transparent 50%), radial-gradient(#F0F9FF 50%, #ffffff 50%); background-size: 30px 30px; background-position: 0 0, 15px 15px; }
        .gingham-red { background-color: #ffffff; background-image: radial-gradient(#FFF1F2 50%, transparent 50%), radial-gradient(#FFF1F2 50%, #ffffff 50%); background-size: 30px 30px; background-position: 0 0, 15px 15px; }
      `}</style>

      {decorations.map((deco) => (
        <div 
          key={deco.id}
          className="absolute pointer-events-none opacity-60 animate-bounce"
          style={{ top: deco.top, left: deco.left, transform: `rotate(${deco.rotate})`, fontSize: deco.size, animationDuration: `${Math.random() * 2 + 3}s` }}
        >
          {deco.item}
        </div>
      ))}

      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/" 
          className="px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full text-[10px] tracking-widest text-[#7A8C69] hover:bg-white/60 transition-all flex items-center gap-2 font-black shadow-sm border border-white/50"
        >
          <span>←</span> EXIT
        </Link>
      </div>

      <div className="max-w-md mx-auto pt-20 px-8 pb-24 relative z-10">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl italic text-[#94A684]/80 mb-8 font-light tracking-tighter">
            m. <span className="font-bold">picnic</span> space
          </h1>
        </header>

        {/* Profile Card */}
        <section className="mb-12 animate-in slide-in-from-bottom-4 duration-700">
          {profile ? (
            <div className="bg-white/90 backdrop-blur-sm pt-10 pb-8 px-7 rounded-[4rem] shadow-xl shadow-green-900/5 border border-white flex flex-col items-center text-center gap-5 relative overflow-hidden">
              <div className="w-24 h-24 bg-[#F9FBF9] rounded-[2.8rem] overflow-hidden flex items-center justify-center text-5xl border-2 border-white shadow-inner">
                {/* 修正ポイント: data:image (Base64) を含む場合もimgで表示 */}
                {profile.icon && (profile.icon.startsWith('http') || profile.icon.startsWith('blob:') || profile.icon.startsWith('data:image')) ? (
                  <img src={profile.icon} className="w-full h-full object-cover" alt="icon" />
                ) : (
                  <span>{profile.icon || "🍃"}</span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[9px] font-black bg-[#A8C69F] text-white px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                    {profile.title || "Resident"}
                  </span>
                  <h2 className="text-2xl font-black text-[#5F6F7A] tracking-tight">{profile.nickname}</h2>
                </div>
                <p className="text-[10px] font-black text-[#B5A773] tracking-widest uppercase opacity-60 pt-2">
                  Established — Day {daysCount}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/30 p-6 rounded-[2rem] border border-white/30 text-center">
              <p className="text-[10px] text-[#94A684] font-bold tracking-widest uppercase">Profile Loading...</p>
            </div>
          )}
        </section>

        {/* Space Selection */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4 px-2">
            <span className="text-xl">🧺</span>
            <h2 className="text-[11px] font-black text-[#7A8C69] tracking-[0.3em] uppercase italic">どこにいく？</h2>
          </div>

          {[
            { title: "ちょこっとーく", desc: "ゆるいつぶやき、誰かの気配。", icon: "💬", path: "/picnic/talk", rotate: "rotate-1", theme: "gingham-yellow", iconBg: "bg-amber-50/50" },
            { title: "オタトーーーーク！！！", desc: "好きを叫ぶ、熱量の社交場。", icon: "🔥", path: "/picnic/otaku", rotate: "-rotate-1", theme: "gingham-blue", iconBg: "bg-sky-50/50" },
            { title: "限定コラム", desc: "ここでしか読めない、内緒の話。", icon: "📖", path: "/picnic/jimmy", rotate: "rotate-1", theme: "gingham-red", iconBg: "bg-rose-50/50" }
          ].map((item) => (
            <Link href={item.path} key={item.path} className={`block group transform transition-all duration-300 hover:scale-[1.03] active:scale-95 ${item.rotate}`}>
              <div className={`p-1 rounded-sm shadow-lg shadow-green-900/5 ${item.theme}`}>
                <div className="bg-white/60 backdrop-blur-[2px] p-6 flex items-center gap-5 border border-white/50">
                  <div className={`w-14 h-14 ${item.iconBg} rounded-full flex items-center justify-center text-2xl shadow-inner border border-white flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#5F6F7A] mb-0.5">{item.title}</h3>
                    <p className="text-[10px] text-[#B5A773] font-bold leading-tight">{item.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 text-center">
          <p className="text-[8px] font-black text-[#94A684]/60 tracking-[0.5em] uppercase">
            Enjoy your quiet picnic 🌿
          </p>
        </footer>
      </div>
    </div>
  );
}