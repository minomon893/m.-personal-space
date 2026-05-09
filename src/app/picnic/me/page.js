"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, Home } from "lucide-react"; // Homeを追加

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("otaku"); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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

  const fetchMyData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let data = [];
    if (activeTab === "otaku") {
      const { data: myPosts } = await supabase.from("otaku_posts").select("*").eq("user_id", user.id);
      const { data: myReplies } = await supabase.from("otaku_replies").select("*, otaku_posts(*)").eq("user_id", user.id);
      const { data: favs } = await supabase.from("favorites").select("id, created_at, otaku_posts(*)").eq("user_id", user.id).not("post_id", "is", null);

      data = [
        ...(myPosts?.map(p => ({ ...p, type: 'my_post', label: '自分の叫び', postId: p.id })) || []),
        ...(myReplies?.map(r => ({ ...r, type: 'my_reply', label: '返信しました', postId: r.otaku_posts?.id })) || []),
        ...(favs?.map(f => ({ ...f.otaku_posts, fav_id: f.id, created_at: f.created_at, type: 'favorite', label: 'お気に入り', postId: f.otaku_posts?.id })) || [])
      ];
    } else {
      const { data: myTalks } = await supabase.from("talk_posts").select("*").eq("user_id", user.id);
      const { data: myReactions } = await supabase.from("talk_reactions").select("*, talk_posts(*)").eq("user_id", user.id);
      const { data: favs } = await supabase.from("favorites").select("id, created_at, talk_posts(*)").eq("user_id", user.id).not("talk_post_id", "is", null);

      data = [
        ...(myTalks?.map(t => ({ ...t, type: 'my_talk', label: '自分のつぶやき', postId: t.id })) || []),
        ...(myReactions?.map(r => ({ ...r, type: 'my_reaction', label: 'リアクション済', postId: r.talk_posts?.id })) || []),
        ...(favs?.map(f => ({ ...f.talk_posts, fav_id: f.id, created_at: f.created_at, type: 'favorite', label: 'お気に入り', postId: f.talk_posts?.id })) || [])
      ];
    }

    setItems(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  }, [activeTab, supabase]);

  useEffect(() => { fetchMyData(); }, [fetchMyData]);

  const filteredItems = useMemo(() => {
    return showFavoritesOnly ? items.filter(item => item.type === 'favorite') : items;
  }, [items, showFavoritesOnly]);

  const handleUnfavorite = async (e, favId) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("お気に入りを解除しますか？")) return;
    const { error } = await supabase.from("favorites").delete().eq("id", favId);
    if (!error) fetchMyData();
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} pb-40 transition-all duration-500`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
        body { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      {/* Gardenに戻るボタン (左上) */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          href="/picnic/garden"
          className="w-14 h-14 flex items-center justify-center rounded-full shadow-xl transition-all border-2 bg-white border-[#FAF7F7] opacity-80 hover:opacity-100 active:scale-95"
        >
          <span className="text-2xl">🏠</span>
        </Link>
      </div>

      {/* お気に入りフィルターボタン (🔖/🏷️) */}
      <div className="fixed top-6 right-6 z-50">
        <button 
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-xl transition-all border-2 bg-white ${showFavoritesOnly ? 'border-yellow-400 scale-110' : 'border-[#FAF7F7] opacity-80'}`}
        >
          <span className="text-2xl">
            {showFavoritesOnly ? "🔖" : "🏷️"}
          </span>
        </button>
      </div>

      <header className="p-10 text-center">
        <h1 className={`text-[10px] tracking-[0.5em] font-black uppercase mb-2 ${theme.header}`}>My Picnic Log</h1>
        <p className="text-[12px] font-black opacity-40 italic">あしあとときろく</p>
      </header>

      {/* タブ */}
      <div className="flex px-6 mb-20 max-w-md mx-auto">
        <div className="flex w-full bg-white/40 p-1.5 rounded-full border border-white/50 backdrop-blur-sm shadow-sm">
          <button 
            onClick={() => {setActiveTab("otaku"); setExpandedId(null);}} 
            className={`flex-1 py-3 rounded-full text-[11px] font-black transition-all ${activeTab === "otaku" ? `${theme.button} text-white shadow-md` : "text-[#7D7474]/40"}`}
          >
            オタトーーーク！！！
          </button>
          <button 
            onClick={() => {setActiveTab("talk"); setExpandedId(null);}} 
            className={`flex-1 py-3 rounded-full text-[11px] font-black transition-all ${activeTab === "talk" ? `${theme.button} text-white shadow-md` : "text-[#7D7474]/40"}`}
          >
            ちょこっとーく
          </button>
        </div>
      </div>

      {/* カードリスト */}
      <div className="max-w-md mx-auto p-6 space-y-16">
        {loading ? (
          <div className="text-center py-20 opacity-40 animate-pulse text-[10px] tracking-widest">LOADING YOUR MEMORIES...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 bg-white/20 rounded-[3rem] border-2 border-dashed border-white/40 text-[12px] font-black opacity-30 italic">きろくが見つかりません 🍀</div>
        ) : (
          filteredItems.map((item, idx) => {
            const isExpanded = expandedId === `${item.id}-${idx}`;
            const originalPostLink = `/picnic/${activeTab}?postId=${item.postId}`;

            return (
              <div 
                key={`${item.id}-${idx}`} 
                onClick={() => setExpandedId(isExpanded ? null : `${item.id}-${idx}`)}
                className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-9 shadow-sm border border-white cursor-pointer transition-all hover:shadow-xl relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-2 h-full ${theme.button} opacity-20`} />

                <div className="flex justify-between items-center mb-8">
                  <span className={`text-[9px] font-black px-4 py-2 rounded-full tracking-widest ${item.type === 'favorite' ? 'bg-[#FFF9C4] text-[#B5A773]' : theme.tag}`}>
                    {item.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] opacity-30 font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                    {isExpanded ? <ChevronUp size={16} className="opacity-20"/> : <ChevronDown size={16} className="opacity-20"/>}
                  </div>
                </div>

                <div className="space-y-8">
                  {(item.type === 'my_reply' || item.type === 'my_reaction' || item.type === 'favorite') && (
                    <div className="p-6 bg-[#FAF7F7] rounded-[2rem] border border-white/50 shadow-inner">
                      <p className="text-[8px] font-black opacity-30 mb-3 tracking-widest uppercase italic">Target Content</p>
                      <p className={`text-[13px] italic opacity-60 leading-relaxed ${isExpanded ? "" : "line-clamp-1"}`}>
                        {(item.otaku_posts || item.talk_posts)?.content || "元の投稿が保持されています"}
                      </p>
                    </div>
                  )}

                  {item.type !== 'favorite' && (
                    <div className="px-2">
                      <p className={`text-[16px] leading-loose font-medium break-words ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                        {item.type === 'my_reaction' ? `リアクションを贈りました ✨` : item.content}
                      </p>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="pt-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                      {item.image_urls?.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {item.image_urls.map((url, i) => (
                            <img key={i} src={url} className="rounded-[2rem] w-full h-40 object-cover border-4 border-white shadow-sm" alt="post" />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-4">
                        <Link 
                          href={originalPostLink}
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center justify-center gap-3 py-5 rounded-3xl text-[11px] font-black tracking-[0.2em] uppercase transition-all shadow-sm ${theme.button} text-white hover:scale-[1.02] active:scale-95`}
                        >
                          Back to original <ArrowUpRight size={16} />
                        </Link>

                        {item.type === 'favorite' && (
                          <button 
                            onClick={(e) => handleUnfavorite(e, item.fav_id)} 
                            className="text-[10px] font-black text-red-400 py-2 hover:text-red-600 transition-colors uppercase tracking-widest"
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
          })
        )}
      </div>

      {/* フッター */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-8 z-50">
        <Link href={`/picnic/${activeTab}`} className={`w-full max-w-sm ${theme.button} text-white text-center py-6 rounded-full shadow-2xl text-[12px] font-black tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3`}>
          <span>←</span> {activeTab === 'otaku' ? 'オタトーーーク！！！に戻る' : 'ちょこっとーくに戻る'}
        </Link>
      </div>
    </div>
  );
}