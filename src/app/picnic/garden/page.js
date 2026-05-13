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
  const [isGuideOpen, setIsGuideOpen] = useState(false); // ガイドモーダル用

  const supabase = useMemo(() => {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(rawUrl, rawKey);
  }, []);

  const getFullImageUrl = useCallback((path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:') || path.length < 5) return path;
    
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const cleanPath = path.replace(/^talkimage\//, "");
    return `${supabaseUrl}/storage/v1/object/public/talkimage/${cleanPath}`;
  }, []);

  const calcDays = useCallback((dateStr) => {
    const createdDate = new Date(dateStr || new Date());
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    setDaysCount(diffDays);
  }, []);

  useEffect(() => {
    const items = ["🧺", "🥪", "🎈", "🍎", "🥐", "🥤", "🌼", "🌿", "☁️"];
    setDecorations(Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      item: items[Math.floor(Math.random() * items.length)],
      top: `${Math.random() * 85 + 5}%`,
      left: `${Math.random() * 90 + 5}%`,
      rotate: `${Math.random() * 60 - 30}deg`,
      size: Math.random() * 15 + 20 + "px"
    })));

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
          if (!profRes.status_message) setIsEditing(true);
        }

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
    if (!profile?.id) {
      console.error("Update aborted: No profile ID found");
      return;
    }

    const updated = { ...profile, status_message: statusInput };
    setProfile(updated);
    localStorage.setItem("picnic_user_profile", JSON.stringify(updated));
    setIsEditing(false);

    setIsUpdatingStatus(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session found. Please re-login.");

      const { data, error, status, statusText } = await supabase
        .from("profiles")
        .update({ status_message: statusInput })
        .eq("id", profile.id)
        .select();
      
      if (error) {
        const errorDetails = `Code: ${error.code}, Message: ${error.message}, Hint: ${error.hint}`;
        throw new Error(errorDetails);
      }
      console.log("Update success:", { status, statusText, data });

    } catch (err) {
      console.error("Status update error details:", String(err));
      if (err instanceof Error) {
        console.error("Error Stack:", err.stack);
      }
      console.dir(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const RenderIcon = ({ user, sizeClass = "w-24 h-24", textClass = "text-3xl" }) => {
    const [imgError, setImgError] = useState(false);
    const rawPath = user?.avatar_url || user?.icon || user?.avatar;
    const imageUrl = getFullImageUrl(rawPath);
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
        
        .gingham-yellow { 
          background-color: #ffffff; 
          background-image: 
            linear-gradient(45deg, #FFFAE0 25%, transparent 25%, transparent 75%, #FFFAE0 75%, #FFFAE0), 
            linear-gradient(45deg, #FFFAE0 25%, transparent 25%, transparent 75%, #FFFAE0 75%, #FFFAE0);
          background-size: 40px 40px;
          background-position: 0 0, 20px 20px;
        }
        .gingham-blue { 
          background-color: #ffffff; 
          background-image: 
            linear-gradient(45deg, #E0F2FE 25%, transparent 25%, transparent 75%, #E0F2FE 75%, #E0F2FE), 
            linear-gradient(45deg, #E0F2FE 25%, transparent 25%, transparent 75%, #E0F2FE 75%, #E0F2FE);
          background-size: 40px 40px;
          background-position: 0 0, 20px 20px;
        }
        .gingham-red { 
          background-color: #ffffff; 
          background-image: 
            linear-gradient(45deg, #FFE4E6 25%, transparent 25%, transparent 75%, #FFE4E6 75%, #FFE4E6), 
            linear-gradient(45deg, #FFE4E6 25%, transparent 25%, transparent 75%, #FFE4E6 75%, #FFE4E6);
          background-size: 40px 40px;
          background-position: 0 0, 20px 20px;
        }
      `}</style>

      {/* 右上の本マークボタン */}
      <button 
        onClick={() => setIsGuideOpen(true)}
        className="fixed top-6 right-6 z-40 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-lg shadow-green-900/5 flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all border border-white"
      >
        📖
      </button>

      {/* ガイドモーダル */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#5F6F7A]/20 backdrop-blur-sm" onClick={() => setIsGuideOpen(false)}></div>
          <div className="relative bg-[#F8FAF7] w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-[3rem] shadow-2xl p-8 md:p-12 no-scrollbar animate-in zoom-in-95 duration-300 border-4 border-white">
            <button 
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-6 right-6 text-2xl opacity-40 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
            
            <div className="text-center mb-10">
              <span className="text-4xl block mb-4">🧺</span>
              <h2 className="text-xl font-black text-[#A8C69F] tracking-[0.2em] uppercase">m. picnic space</h2>
              <div className="h-1 w-8 bg-[#A8C69F]/30 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="space-y-10">
              <section>
                <h3 className="text-[10px] font-black tracking-[0.4em] text-[#A8C69F] uppercase mb-4">Concept</h3>
                <p className="text-[12px] leading-loose font-bold opacity-80">
                  SNSの喧騒から離れた「心理的安全性の高い避難所」です。月額500円の有料制にすることで、広告のない、穏やかな繋がりと静かな時間を守っています。
                </p>
              </section>

              <section>
                <h3 className="text-[10px] font-black tracking-[0.4em] text-[#A8C69F] uppercase mb-4">Inside the Space</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0">💬</span>
                    <p className="text-[11px] opacity-70 leading-relaxed"><strong>ちょこっとーく:</strong> 写真と500文字で綴る、ゆるい日常。4つのリアクションでおだやかに共鳴。</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex-shrink-0">🔥</span>
                    <p className="text-[11px] opacity-70 leading-relaxed"><strong>オタトーーーク！！！:</strong> 趣味や好きを全力で叫ぶ場所。1000文字の熱量や、センシティブな悩み相談も。</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex-shrink-0">📖</span>
                    <p className="text-[11px] opacity-70 leading-relaxed"><strong>じみコラム:</strong> 管理人や住人が綴る、ここだけの内緒の話。少し真面目な気づきや創作の裏側。</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black tracking-[0.4em] text-[#A8C69F] uppercase mb-4">Safe Rules</h3>
                <ul className="space-y-3">
                  <li className="text-[11px] opacity-60 leading-relaxed">・プロフィール（名前・アイコン）は変更できません。</li>
                  <li className="text-[11px] opacity-60 leading-relaxed">・投稿やコメントは「人生の記録」として削除できません。</li>
                  <li className="text-[11px] opacity-60 leading-relaxed">・広場内の言葉やコラムを許可なく外へ公開するのは厳禁です。</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      )}

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
          
          <button 
            onClick={() => router.push('/')}
            className="mt-4 text-[9px] font-black tracking-[0.3em] text-[#94A684]/60 hover:text-[#7A8C69] transition-colors border-b border-[#94A684]/20 pb-1 uppercase"
          >
            🏠自分の部屋に戻る
          </button>

          <div className="h-1 w-12 bg-[#A8C69F]/30 mx-auto rounded-full mt-6"></div>
        </header>

        <section className="mb-16">
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
                        onBlur={() => { if(statusInput === (profile.status_message || "")) setIsEditing(false) }}
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
                    <div 
                      className="relative group cursor-pointer w-full flex items-center justify-center gap-2 py-2" 
                      onClick={() => setIsEditing(true)}
                    >
                      <p className="text-[13px] text-[#B5A773] font-bold italic leading-relaxed break-words px-4">
                        "{profile.status_message || "ひとこと書く..."}"
                      </p>
                      <span className="text-[10px] opacity-20 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        ✏️
                      </span>
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

        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2 px-2">
            <span className="text-xl">🥪</span>
            <h2 className="text-[12px] font-black text-[#7A8C69] tracking-[0.4em] uppercase italic">Menu</h2>
          </div>

          {[
            { title: "ちょこっとーく", desc: "ゆるいつぶやき、誰かの気配。", icon: "💬", path: "/picnic/talk", theme: "gingham-yellow", iconBg: "bg-amber-50/80" },
            { title: "オタトーーーク！！！", desc: "好きを叫ぶ、熱量の社交場。", icon: "🔥", path: "/picnic/otaku", theme: "gingham-blue", iconBg: "bg-sky-50/80" },
            { title: "じみコラム", desc: "ここでしか読めない、内緒の話。", icon: "📖", path: "/picnic/jimmy", theme: "gingham-red", iconBg: "bg-rose-50/80" }
          ].map((item, idx) => (
            <Link href={item.path} key={item.path} className={`block group transform transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
              <div className={`p-1 rounded-[1.2rem] shadow-xl shadow-green-900/10 ${item.theme}`}>
                <div className="bg-white/90 backdrop-blur-[2px] p-8 rounded-[0.9rem] flex items-center gap-6 border border-white/50">
                  <div className={`w-16 h-16 ${item.iconBg} rounded-[1.1rem] flex items-center justify-center text-3xl shadow-sm border border-white flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
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