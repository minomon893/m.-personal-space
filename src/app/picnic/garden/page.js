"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GardenPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysCount, setDaysCount] = useState(0);
  const [decorations, setDecorations] = useState([]);
  const [statusInput, setStatusInput] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const supabase = useMemo(() => {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(rawUrl, rawKey);
  }, []);

  // 画像URL生成の共通ロジック
  const getFullImageUrl = useCallback((path) => {
    if (!path) return null;
    // すでにフルURL、または絵文字、データURIの場合はそのまま返す
    if (path.startsWith('http') || path.startsWith('data:') || path.length < 5) return path;
    
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, "");
    // パスからバケット名が重複しないようクリーンアップ
    const cleanPath = path.replace(/^talkimage\//, "");
    return `${supabaseUrl}/storage/v1/object/public/talkimage/${cleanPath}`;
  }, []);

  const calcDays = useCallback((dateStr) => {
    const createdDate = new Date(dateStr || new Date());
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    setDaysCount(diffDays);
  }, []);

  useEffect(() => {
    // 装飾アイテムの初期化
    const items = ["🧺", "🥪", "🎈", "🍎", "🥐", "🥤", "🌼", "🌿", "☁️"];
    setDecorations(Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      item: items[Math.floor(Math.random() * items.length)],
      top: `${Math.random() * 85 + 5}%`,
      left: `${Math.random() * 90 + 5}%`,
      rotate: `${Math.random() * 60 - 30}deg`,
      size: Math.random() * 15 + 20 + "px"
    })));

    // 初回レンダリング時にキャッシュから即座に表示（UX向上）
    const saved = localStorage.getItem("picnic_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setStatusInput(parsed.status_message || "");
        calcDays(parsed.created_at);
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }
  }, [calcDays]);

  useEffect(() => {
    const fetchGardenData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        // 自分のプロフィールを最新化
        const { data: profRes } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profRes) {
          setProfile(profRes);
          setStatusInput(profRes.status_message || "");
          localStorage.setItem("picnic_user_profile", JSON.stringify(profRes));
          calcDays(profRes.created_at);
          // ステータスが空の場合のみ編集モードにする
          if (!profRes.status_message) setIsEditing(true);
        }

        // フォローしている友達のデータを取得
        const { data: followData } = await supabase
          .from("follows")
          .select(`following_id, profiles:following_id (*)`)
          .eq("follower_id", session.user.id);

        if (followData) {
          setFriends(followData.map(f => f.profiles).filter(Boolean));
        }

      } catch (e) {
        console.error("Garden entry error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGardenData();
  }, [supabase, calcDays]);

  const updateStatus = async (e) => {
    e.preventDefault();
    if (!profile || !statusInput.trim()) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status_message: statusInput })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      const updated = { ...profile, status_message: statusInput };
      setProfile(updated);
      localStorage.setItem("picnic_user_profile", JSON.stringify(updated));
      setIsEditing(false);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // アイコン描画コンポーネント（修正版）
  const RenderIcon = ({ user, sizeClass = "w-24 h-24", textClass = "text-3xl" }) => {
    const [imgError, setImgError] = useState(false);
    
    // プロフィールのカラム名の揺れを吸収
    const rawPath = user?.avatar_url || user?.icon || user?.avatar;
    const imageUrl = getFullImageUrl(rawPath);
    
    // 画像として表示すべきか判定（URL形式であり、かつ読み込みエラーが出ていない）
    const isEmoji = rawPath && rawPath.length < 5;
    const shouldShowImage = imageUrl && imageUrl.startsWith('http') && !imgError && !isEmoji;

    return (
      <div className={`${sizeClass} bg-white rounded-[2.5rem] overflow-hidden flex items-center justify-center border-[3px] border-white shadow-sm flex-shrink-0 transition-transform active:scale-95`}>
        {shouldShowImage ? (
          <img 
            src={imageUrl} 
            className="w-full h-full object-cover" 
            alt="" 
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={`${textClass} leading-none select-none`}>
            {isEmoji ? rawPath : "🍃"}
          </span>
        )}
      </div>
    );
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#E2F0D9] flex items-center justify-center">
        <div className="animate-pulse font-black text-[10px] tracking-[0.5em] uppercase text-[#94A684]">
          Spreading the blanket...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7EE] bg-gradient-to-b from-[#F0F7EE] to-[#E2F0D9] relative overflow-x-hidden pb-20">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
        body { font-family: 'Zen Maru Gothic', sans-serif; color: #5F6F7A; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .gingham-yellow { background-color: #ffffff; background-image: radial-gradient(#FFFBEB 50%, transparent 50%), radial-gradient(#FFFBEB 50%, #ffffff 50%); background-size: 30px 30px; }
        .gingham-blue { background-color: #ffffff; background-image: radial-gradient(#F0F9FF 50%, transparent 50%), radial-gradient(#F0F9FF 50%, #ffffff 50%); background-size: 30px 30px; }
        .gingham-red { background-color: #ffffff; background-image: radial-gradient(#FFF1F2 50%, transparent 50%), radial-gradient(#FFF1F2 50%, #ffffff 50%); background-size: 30px 30px; }
      `}</style>

      {decorations.map((deco) => (
        <div key={deco.id} className="absolute pointer-events-none opacity-20 animate-bounce" style={{ top: deco.top, left: deco.left, transform: `rotate(${deco.rotate})`, fontSize: deco.size, animationDuration: `${Math.random() * 2 + 4}s` }}>
          {deco.item}
        </div>
      ))}

      <div className="max-w-4xl mx-auto pt-16 px-6 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl italic text-[#94A684]/70 mb-2 font-light tracking-tighter">
            m. <span className="font-bold">picnic</span> space
          </h1>
          
          {/* 広場を抜けるボタン */}
          <button 
            onClick={() => router.push('/')}
            className="mt-4 text-[9px] font-black tracking-[0.3em] text-[#94A684]/60 hover:text-[#7A8C69] transition-colors border-b border-[#94A684]/20 pb-1 uppercase"
          >
            Leave the Garden
          </button>

          <div className="h-1 w-12 bg-[#A8C69F]/30 mx-auto rounded-full mt-6"></div>
        </header>

        {/* ユーザー＆フレンドリスト セクション */}
        <section className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-xl">🧺</span>
            <h2 className="text-[12px] font-black text-[#7A8C69] tracking-[0.4em] uppercase italic">Our Picnic Spot</h2>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-12 px-4 snap-x snap-mandatory justify-start md:justify-center items-end">
            {profile && (
              <div className="snap-center w-[280px] min-h-[440px] flex-shrink-0 bg-white/95 backdrop-blur-md pt-12 pb-10 px-8 rounded-[4.5rem] shadow-2xl shadow-green-900/10 border-2 border-white flex flex-col items-center text-center gap-6 relative transition-all">
                <div onClick={() => router.push('/picnic/me')} className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
                  <RenderIcon user={profile} sizeClass="w-32 h-32" textClass="text-5xl" />
                </div>
                
                <div className="space-y-3">
                  <span className="text-[9px] font-black bg-[#A8C69F] text-white px-5 py-2 rounded-full uppercase tracking-widest inline-block">
                    {profile.title || "Resident"}
                  </span>
                  <h2 onClick={() => router.push('/picnic/me')} className="text-3xl font-black text-[#5F6F7A] cursor-pointer hover:opacity-70 transition-opacity">
                    {profile.nickname}
                  </h2>
                  <p className="text-[10px] font-bold text-[#B5A773] tracking-widest uppercase opacity-60">
                    Day {daysCount}
                  </p>
                </div>

                <div className="w-full mt-auto min-h-[70px] flex items-center justify-center">
                  {isEditing ? (
                    <form onSubmit={updateStatus} className="w-full relative animate-in zoom-in duration-300">
                      <input 
                        type="text" 
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        placeholder="今なにしてる？"
                        autoFocus
                        className="w-full bg-[#F8FAF7] border-2 border-[#E2F0D9] rounded-[1.5rem] px-5 py-4 text-[12px] text-[#5F6F7A] font-bold focus:bg-white focus:border-[#A8C69F] transition-all outline-none shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={isUpdatingStatus}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#A8C69F] text-white rounded-full flex items-center justify-center shadow-md active:scale-90 disabled:opacity-30"
                      >
                        {isUpdatingStatus ? "..." : "✓"}
                      </button>
                    </form>
                  ) : (
                    <div className="relative group cursor-pointer w-full px-4 text-center" onClick={() => setIsEditing(true)}>
                      <p className="text-[13px] text-[#B5A773] font-bold italic leading-relaxed break-words">
                        "{profile.status_message || "ひとこと書く..."}"
                      </p>
                      <span className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-40 transition-opacity text-xs">✏️</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {friends.map((friend) => (
              <div 
                key={friend.id}
                onClick={() => router.push(`/picnic/user/${friend.id}`)}
                className="snap-center w-[240px] min-h-[380px] flex-shrink-0 bg-white/70 backdrop-blur-sm pt-10 pb-8 px-8 rounded-[4rem] shadow-xl shadow-green-900/5 border border-white/50 flex flex-col items-center text-center gap-5 cursor-pointer hover:bg-white/90 transition-all group"
              >
                <RenderIcon user={friend} sizeClass="w-24 h-24" textClass="text-4xl" />
                <div className="space-y-2">
                  <span className="text-[8px] font-bold bg-[#D1D9CF] text-[#7A8C69] px-4 py-1.5 rounded-full uppercase tracking-tighter">
                    {friend.title || "Resident"}
                  </span>
                  <h3 className="text-xl font-black text-[#5F6F7A] line-clamp-1">{friend.nickname}</h3>
                  {friend.status_message && (
                    <p className="text-[11px] text-[#B5A773] font-bold italic line-clamp-2 opacity-80 leading-relaxed">
                      "{friend.status_message}"
                    </p>
                  )}
                </div>
                <div className="mt-auto pt-2 text-[9px] text-[#A8C69F] font-black tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                  Visit →
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* メニューセクション */}
        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2 px-2">
            <span className="text-xl">🥪</span>
            <h2 className="text-[12px] font-black text-[#7A8C69] tracking-[0.4em] uppercase italic">Menu</h2>
          </div>

          {[
            { title: "ちょこっとーく", desc: "ゆるいつぶやき、誰かの気配。", icon: "💬", path: "/picnic/talk", theme: "gingham-yellow", iconBg: "bg-amber-50/80" },
            { title: "オタトーーーーク！！！", desc: "好きを叫ぶ、熱量の社交場。", icon: "🔥", path: "/picnic/otaku", theme: "gingham-blue", iconBg: "bg-sky-50/80" },
            { title: "限定コラム", desc: "ここでしか読めない、内緒の話。", icon: "📖", path: "/picnic/jimmy", theme: "gingham-red", iconBg: "bg-rose-50/80" }
          ].map((item, idx) => (
            <Link href={item.path} key={item.path} className={`block group transform transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
              <div className={`p-1.5 rounded-[2.2rem] shadow-xl shadow-green-900/5 ${item.theme}`}>
                <div className="bg-white/80 backdrop-blur-[4px] p-8 rounded-[2rem] flex items-center gap-6 border border-white/80">
                  <div className={`w-16 h-16 ${item.iconBg} rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm border border-white flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#5F6F7A] mb-1 group-hover:text-[#A8C69F] transition-colors">{item.title}</h3>
                    <p className="text-[12px] text-[#B5A773] font-bold leading-tight opacity-80">{item.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-24 text-center pb-12">
          <div className="flex justify-center gap-4 mb-4 opacity-20">
            <span>🌿</span><span>🌼</span><span>🌿</span>
          </div>
          <p className="text-[10px] font-black text-[#94A684]/60 tracking-[0.6em] uppercase italic">Enjoy your quiet picnic</p>
        </footer>
      </div>
    </div>
  );
}