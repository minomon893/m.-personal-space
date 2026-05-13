"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, MessageCircle, PenTool } from "lucide-react";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("otaku"); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const theme = {
    otaku: {
      bg: "bg-[#EBF3F9]",
      text: "text-[#5D7B8F]",
      button: "bg-[#5D7B8F]",
      tag: "bg-[#D8E6F0] text-[#5D7B8F]",
      header: "text-[#5D7B8F]/60"
    },
    talk: {
      bg: "bg-[#F2F0E9]",
      text: "text-[#7D7474]",
      button: "bg-[#B5A773]",
      tag: "bg-[#EAE3CC] text-[#B5A773]",
      header: "text-[#B5A773]"
    }
  }[activeTab];

  const supabase = useMemo(() => {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "");
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(url, key);
  }, []);

  const renderIcon = (profile, sizeClass = "w-10 h-10") => {
    const iconData = profile?.avatar_url || profile?.icon;
    const isImage = iconData && (
      iconData.startsWith('http') || 
      iconData.startsWith('/') || 
      iconData.startsWith('data:') || 
      /\.(jpg|jpeg|png|webp|avif|gif)/i.test(iconData)
    );
    
    return (
      <div className={`${sizeClass} rounded-2xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center shadow-sm`}>
        {isImage ? (
          <img src={iconData} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="text-lg">{iconData || "🍀"}</span>
        )}
      </div>
    );
  };

  const fetchMyData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);

    let data = [];
    try {
      if (activeTab === "otaku") {
        const [{ data: myPosts }, { data: myReplies }, { data: favs }] = await Promise.all([
          supabase.from("otaku_posts").select("*, profiles:user_id(*)").eq("user_id", user.id),
          supabase.from("otaku_replies").select("*, profiles:user_id(*), otaku_posts(*, profiles:user_id(*))").eq("user_id", user.id),
          supabase.from("favorites")
            .select("id, created_at, post_id, otaku_posts!post_id(*, profiles:user_id(*))")
            .eq("user_id", user.id)
            .not("post_id", "is", null)
        ]);

        data = [
          ...(myPosts?.map(p => ({ ...p, type: 'my_post', label: '自分の叫び', postId: p.id, authorProfile: p.profiles })) || []),
          ...(myReplies?.map(r => ({ ...r, type: 'my_reply', label: '返信しました', postId: r.otaku_posts?.id, authorProfile: r.profiles, targetProfile: r.otaku_posts?.profiles })) || []),
          ...(favs?.filter(f => f.otaku_posts).map(f => ({ 
            ...f.otaku_posts, 
            fav_id: f.id, 
            created_at: f.created_at, 
            type: 'favorite_otaku',
            label: 'お気に入り', 
            postId: f.otaku_posts.id, 
            authorProfile: f.otaku_posts.profiles 
          })) || [])
        ];
      } else {
        const [{ data: myTalks }, { data: myReactions }, { data: favs }] = await Promise.all([
          supabase.from("talk_posts").select("*, profiles:user_id(*)").eq("user_id", user.id),
          supabase.from("talk_reactions").select("*, talk_posts(*, profiles:user_id(*))").eq("user_id", user.id),
          supabase.from("favorites")
            .select("id, created_at, talk_post_id, talk_posts!talk_post_id(*, profiles:user_id(*))")
            .eq("user_id", user.id)
            .not("talk_post_id", "is", null)
        ]);

        data = [
          ...(myTalks?.map(t => ({ ...t, type: 'my_talk', label: '自分のつぶやき', postId: t.id, authorProfile: t.profiles })) || []),
          ...(myReactions?.filter(r => r.talk_posts).map(r => ({ 
            ...r.talk_posts, 
            reaction_id: r.id,
            created_at: r.created_at, 
            type: 'my_reaction', 
            label: 'リアクション済', 
            postId: r.talk_posts.id, 
            authorProfile: r.talk_posts.profiles 
          })) || []),
          ...(favs?.filter(f => f.talk_posts).map(f => ({ 
            ...f.talk_posts, 
            fav_id: f.id, 
            created_at: f.created_at, 
            type: 'favorite_talk',
            label: 'お気に入り', 
            postId: f.talk_posts.id, 
            authorProfile: f.talk_posts.profiles 
          })) || [])
        ];
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }

    setItems(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  }, [activeTab, supabase]);

  useEffect(() => { 
    fetchMyData(); 
  }, [fetchMyData]);

  const postsList = useMemo(() => items.filter(i => (i.type === 'my_post' || i.type === 'my_talk')), [items]);
  const reactionsList = useMemo(() => items.filter(i => (i.type === 'my_reply' || i.type === 'my_reaction')), [items]);
  const favoriteItems = useMemo(() => items.filter(i => i.type?.startsWith('favorite')), [items]);

  const handleUnfavorite = async (e, favId) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("お気に入りを解除しますか？")) return;
    const { error } = await supabase.from("favorites").delete().eq("id", favId);
    if (!error) fetchMyData();
  };

  const ItemCard = ({ item, idx }) => {
    const isExpanded = expandedId === `${item.id}-${idx}`;
    const originalPostLink = `/picnic/${activeTab}?postId=${item.postId}`;

    return (
      <div 
        onClick={() => setExpandedId(isExpanded ? null : `${item.id}-${idx}`)}
        className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-7 shadow-sm border border-white cursor-pointer transition-all hover:shadow-lg relative overflow-hidden mb-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            {renderIcon(item.authorProfile, "w-9 h-9")}
            <div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full tracking-widest ${item.type?.startsWith('favorite') ? 'bg-[#FFF9C4] text-[#B5A773]' : theme.tag}`}>
                {item.label}
              </span>
              <p className="text-[8px] opacity-30 font-bold mt-1 uppercase tracking-tighter">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {isExpanded ? <ChevronUp size={14} className="opacity-20"/> : <ChevronDown size={14} className="opacity-20"/>}
        </div>

        <div className="space-y-6">
          {(item.type === 'my_reply' || item.type === 'my_reaction') && (
            <div className="p-5 bg-[#FAF7F7] rounded-[1.5rem] border border-white/50 shadow-inner flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black opacity-20 mb-1 tracking-widest uppercase italic">Original Post</p>
                <p className={`text-[12px] font-bold text-[#5F6F7A] leading-relaxed truncate ${isExpanded ? "whitespace-normal" : ""}`}>
                  {item.content || "リアクションしました ✨"}
                </p>
              </div>
            </div>
          )}

          {(item.type === 'my_post' || item.type === 'my_talk' || item.type?.startsWith('favorite')) && (
            <div className="px-1">
              <p className={`text-[15px] leading-relaxed font-bold break-words text-[#5F6F7A] ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                {item.content}
              </p>
            </div>
          )}

          {isExpanded && (
            <div className="pt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {item.image_urls?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {item.image_urls.map((url, i) => (
                    <img key={i} src={url} className="rounded-2xl w-full h-32 object-cover border-2 border-white shadow-sm" alt="" />
                  ))}
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <Link 
                  href={originalPostLink}
                  onClick={(e) => e.stopPropagation()}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black tracking-[0.1em] uppercase transition-all shadow-sm ${theme.button} text-white hover:brightness-110 active:scale-95`}
                >
                  Post Detail <ArrowUpRight size={14} />
                </Link>

                {item.type?.startsWith('favorite') && (
                  <button 
                    onClick={(e) => handleUnfavorite(e, item.fav_id)} 
                    className="text-[9px] font-black text-red-300 py-1 hover:text-red-500 transition-colors uppercase tracking-widest text-center"
                  >
                    ー Unfavorite this post
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-screen overflow-hidden ${theme.bg} ${theme.text} transition-all duration-500 flex flex-col`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
        body { font-family: 'Zen Maru Gothic', sans-serif; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
      `}</style>

      <header className="flex-shrink-0 p-8 pb-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/picnic/garden" className="w-14 h-14 flex items-center justify-center rounded-full shadow-xl bg-white border-2 border-[#FAF7F7] opacity-80 hover:opacity-100 transition-all">🧺</Link>
          <div className="text-center">
            <h1 className={`text-[10px] tracking-[0.5em] font-black uppercase mb-1 ${theme.header}`}>My Picnic Log</h1>
            <p className="text-[12px] font-black opacity-40 italic">あしあとときろく</p>
          </div>
          <button 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`w-14 h-14 flex items-center justify-center rounded-full shadow-xl transition-all border-2 bg-white ${showFavoritesOnly ? 'border-yellow-400 scale-110' : 'border-[#FAF7F7] opacity-80'}`}
          >
            <span className="text-2xl">{showFavoritesOnly ? "🔖" : "🏷️"}</span>
          </button>
        </div>
      </header>

      <div className="flex-shrink-0 px-6 mb-8 max-w-md mx-auto w-full">
        <div className="flex w-full bg-white/40 p-1.5 rounded-full border border-white/50 backdrop-blur-sm shadow-sm">
          <button onClick={() => {setActiveTab("otaku"); setExpandedId(null);}} className={`flex-1 py-3 rounded-full text-[11px] font-black transition-all ${activeTab === "otaku" ? `${theme.button} text-white shadow-md` : "text-[#7D7474]/40"}`}>
            オタトーーーク！！！
          </button>
          <button onClick={() => {setActiveTab("talk"); setExpandedId(null);}} className={`flex-1 py-3 rounded-full text-[11px] font-black transition-all ${activeTab === "talk" ? `${theme.button} text-white shadow-md` : "text-[#7D7474]/40"}`}>
            ちょこっとーく
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-hidden px-6 pb-32">
        <div className="max-w-5xl mx-auto h-full">
          {loading ? (
            <div className="text-center py-20 opacity-40 animate-pulse text-[10px] tracking-widest uppercase">Loading your memories...</div>
          ) : showFavoritesOnly ? (
            <div className="h-full flex flex-col animate-in fade-in duration-500">
              <h2 className="text-[10px] font-black opacity-30 mb-6 tracking-widest uppercase text-center flex items-center justify-center gap-2">🔖 Favorites Only ({activeTab})</h2>
              <div className="flex-1 overflow-y-auto custom-scroll px-4">
                <div className="max-w-md mx-auto">
                  {favoriteItems.length === 0 ? (
                    <div className="text-center py-32 bg-white/20 rounded-[3rem] border-2 border-dashed border-white/40 text-[12px] font-black opacity-30 italic">お気に入りはまだありません 🍀</div>
                  ) : (
                    favoriteItems.map((item, idx) => <ItemCard key={`fav-${idx}`} item={item} idx={`fav-${idx}`} />)
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
              <div className="flex flex-col h-full overflow-hidden">
                <h2 className="text-[10px] font-black opacity-30 mb-6 tracking-widest uppercase flex items-center gap-2 px-4">
                  <PenTool size={14}/> My Footprints
                </h2>
                <div className="flex-1 overflow-y-auto custom-scroll px-4">
                  {postsList.length === 0 ? (
                    <div className="text-center py-20 bg-white/10 rounded-[2rem] text-[10px] opacity-20 italic">No posts yet.</div>
                  ) : (
                    postsList.map((item, idx) => <ItemCard key={`post-${idx}`} item={item} idx={`post-${idx}`} />)
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full overflow-hidden">
                <h2 className="text-[10px] font-black opacity-30 mb-6 tracking-widest uppercase flex items-center gap-2 px-4">
                  <MessageCircle size={14}/> {activeTab === 'talk' ? 'My Reactions' : 'My Replies'}
                </h2>
                <div className="flex-1 overflow-y-auto custom-scroll px-4">
                  {reactionsList.length === 0 ? (
                    <div className="text-center py-20 bg-white/10 rounded-[2rem] text-[10px] opacity-20 italic">No activity yet.</div>
                  ) : (
                    reactionsList.map((item, idx) => <ItemCard key={`react-${idx}`} item={item} idx={`react-${idx}`} />)
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-8 z-50">
        <Link 
          href={`/picnic/${activeTab}`} 
          className={`w-full max-w-sm ${theme.button} text-white text-center py-5 rounded-full shadow-2xl text-[11px] font-black tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3`}
        >
          <span>←</span> {activeTab === 'otaku' ? 'オタトーーーク！！！に戻る' : 'ちょこっとーくに戻る'}
        </Link>
      </div>
    </div>
  );
}