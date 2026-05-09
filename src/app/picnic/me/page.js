"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("otaku"); // otaku, talk
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

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
    setCurrentUserId(user.id);

    let data = [];

    if (activeTab === "otaku") {
      // 1. 自分の投稿
      const { data: myPosts } = await supabase.from("otaku_posts")
        .select("*, profiles(nickname, icon), otaku_replies(*, profiles(nickname, icon))")
        .eq("user_id", user.id);
      
      // 2. 自分のコメント
      const { data: myReplies } = await supabase.from("otaku_replies")
        .select("*, otaku_posts(*, profiles(nickname, icon))")
        .eq("user_id", user.id);

      // 3. お気に入り
      const { data: favs } = await supabase.from("favorites")
        .select("id, otaku_posts(*, profiles(nickname, icon))")
        .eq("user_id", user.id)
        .not("post_id", "is", null);

      data = [
        ...(myPosts?.map(p => ({ ...p, type: 'my_post', label: '自分の叫び', link: `/picnic/otaku` })) || []),
        ...(myReplies?.map(r => ({ ...r, type: 'my_reply', label: '自分の返信', link: `/picnic/otaku` })) || []),
        ...(favs?.map(f => ({ ...f.otaku_posts, fav_id: f.id, type: 'favorite', label: 'お気に入り', link: `/picnic/otaku` })) || [])
      ];

    } else if (activeTab === "talk") {
      // 1. 自分のつぶやき
      const { data: myTalks } = await supabase.from("talk_posts")
        .select("*, profiles(nickname, icon), talk_reactions(*)")
        .eq("user_id", user.id);
      
      // 2. 自分のリアクション
      const { data: myReactions } = await supabase.from("talk_reactions")
        .select("*, talk_posts(*, profiles(nickname, icon))")
        .eq("user_id", user.id);

      // 3. お気に入り
      const { data: favs } = await supabase.from("favorites")
        .select("id, talk_posts(*, profiles(nickname, icon))")
        .eq("user_id", user.id)
        .not("talk_post_id", "is", null);

      data = [
        ...(myTalks?.map(t => ({ ...t, type: 'my_talk', label: '自分のつぶやき', link: `/picnic/talk` })) || []),
        ...(myReactions?.map(r => ({ ...r, type: 'my_reaction', label: 'リアクション済', link: `/picnic/talk` })) || []),
        ...(favs?.map(f => ({ ...f.talk_posts, fav_id: f.id, type: 'favorite', label: 'お気に入り', link: `/picnic/talk` })) || [])
      ];
    }

    setItems(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    setLoading(false);
  }, [activeTab, supabase]);

  useEffect(() => { fetchMyData(); }, [fetchMyData]);

  const handleUnfavorite = async (e, favId) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!confirm("お気に入りを解除しますか？")) return;
    const { error } = await supabase.from("favorites").delete().eq("id", favId);
    if (!error) fetchMyData();
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#5F6F7A] pb-32 animate-in fade-in duration-500">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
        body { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      <header className="p-10 text-center bg-[#F2F0E9]">
        <h1 className="text-[10px] tracking-[0.5em] text-[#B5A773] font-black uppercase mb-2">My Picnic Log</h1>
        <p className="text-[12px] font-black opacity-40">あしあとときろく</p>
      </header>

      {/* タブ切り替え（押しやすく、視覚的に分かりやすく） */}
      <div className="flex px-6 mb-8 max-w-md mx-auto">
        <div className="flex w-full bg-white/50 p-1.5 rounded-full border border-white shadow-sm">
          {[
            { id: "otaku", label: "オタトーーーーク！" },
            { id: "talk", label: "ちょこっとーく" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-full text-[11px] font-black transition-all ${
                activeTab === tab.id 
                  ? "bg-[#B5A773] text-white shadow-md scale-105" 
                  : "text-[#B5A773]/50 hover:text-[#B5A773]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-[10px] tracking-[0.3em] opacity-40 animate-pulse">LOADING...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white/30 rounded-[3rem] border-2 border-dashed border-white">
             <p className="text-[12px] font-black opacity-30 italic">まだきろくがありません 🍀</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <Link key={`${item.id}-${idx}`} href={item.link}>
              <div className="bg-white rounded-[3rem] p-7 shadow-sm border border-white/80 active:scale-[0.97] transition-all hover:shadow-lg group">
                
                <div className="flex justify-between items-center mb-5">
                  <span className={`text-[9px] font-black px-4 py-1.5 rounded-full tracking-widest ${
                    item.type === 'favorite' ? 'bg-[#FFF9C4] text-[#B5A773]' : 'bg-[#F2F0E9] text-[#B5A773]'
                  }`}>
                    {item.label}
                  </span>
                  <span className="text-[9px] opacity-30 font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                <div className="space-y-4">
                  {/* 返信先などのコンテキスト表示 */}
                  {(item.type === 'my_reply' || item.type === 'my_reaction') && (
                    <div className="p-4 bg-[#F2F0E9]/50 rounded-[1.5rem] border-l-4 border-[#B5A773]/30">
                      <p className="text-[9px] font-black opacity-40 mb-1">TARGET POST</p>
                      <p className="text-[12px] italic line-clamp-1 opacity-70">
                        {(item.otaku_posts || item.talk_posts)?.content}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <span className="text-3xl grayscale-[0.2]">
                        {item.profiles?.icon || (item.otaku_posts?.profiles?.icon || item.talk_posts?.profiles?.icon || "🍀")}
                    </span>
                    <div className="flex-1">
                      <p className="text-[14px] leading-loose whitespace-pre-wrap text-[#5F6F7A]">
                        {item.type === 'my_reaction' ? `リアクションを贈りました：${item.type}` : item.content}
                      </p>
                      
                      {item.image_urls?.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {item.image_urls.map((url, i) => (
                            <img key={i} src={url} className="rounded-[1.5rem] w-full h-28 object-cover border border-white shadow-sm" alt="post" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#F2F0E9]">
                  <span className="text-[9px] font-black opacity-20 group-hover:opacity-100 transition-opacity tracking-[0.2em]">タップで詳細をみる →</span>
                  {item.type === 'favorite' && (
                    <button 
                      onClick={(e) => handleUnfavorite(e, item.fav_id)}
                      className="text-[10px] font-black text-red-300 hover:text-red-500 bg-red-50 px-4 py-2 rounded-full transition-colors"
                    >
                      解除する
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* フッターナビゲーション：巨大で押しやすいボタン */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-8 z-50">
        <Link 
          href={`/picnic/${activeTab}`} 
          className="w-full max-w-sm bg-[#B5A773] text-white text-center py-5 rounded-full shadow-2xl shadow-[#B5A773]/40 text-[12px] font-black tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>←</span>
          {activeTab === 'otaku' ? 'オタトーーーーク！に戻る' : 'ちょこっとーくに戻る'}
        </Link>
      </div>
    </div>
  );
}