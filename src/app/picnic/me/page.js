"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function MyPage() {
  const [activeTab, setActiveTab] = useState("otaku"); // otaku, talk
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const fetchMyData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let data = [];

    if (activeTab === "otaku") {
      // 1. 自分の投稿と、それに付いたコメント
      const { data: myPosts } = await supabase.from("otaku_posts")
        .select("*, profiles(nickname, icon), otaku_replies(*, profiles(nickname, icon))")
        .eq("user_id", user.id);
      
      // 2. 自分のコメントと、その元の投稿
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
        ...(myReplies?.map(r => ({ ...r, type: 'my_reply', label: '自分のコメント', link: `/picnic/otaku` })) || []),
        ...(favs?.map(f => ({ ...f.otaku_posts, fav_id: f.id, type: 'favorite', label: 'お気に入り', link: `/picnic/otaku` })) || [])
      ];

    } else if (activeTab === "talk") {
      // 1. 自分のつぶやきと、それに付いた反応
      const { data: myTalks } = await supabase.from("talk_posts")
        .select("*, profiles(nickname, icon), talk_reactions(*)")
        .eq("user_id", user.id);
      
      // 2. 自分のリアクションと、その元のつぶやき
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

    // 全てを最新順にソート
    setItems(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    setLoading(false);
  }, [activeTab, supabase]);

  useEffect(() => { fetchMyData(); }, [fetchMyData]);

  // お気に入り解除
  const handleUnfavorite = async (e, favId) => {
    e.preventDefault(); // Linkへの遷移を防止
    e.stopPropagation();
    await supabase.from("favorites").delete().eq("id", favId);
    fetchMyData();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#70695E] pb-32">
      <header className="p-8 text-center bg-white border-b border-[#F1EFEA]">
        <h1 className="text-[10px] tracking-[0.5em] text-[#B5A773] font-black uppercase mb-1">My Picnic Log</h1>
        <p className="text-[9px] opacity-40 uppercase tracking-widest italic">足跡ときろく</p>
      </header>

      {/* タブ */}
      <div className="flex justify-center border-b border-[#F1EFEA] bg-white sticky top-0 z-20">
        {[
          { id: "otaku", label: "オタトーーーーク！！！" },
          { id: "talk", label: "ちょこっとーく。" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 text-[10px] font-black tracking-[0.2em] transition-all ${
              activeTab === tab.id ? "text-[#B5A773] border-b-2 border-[#B5A773]" : "text-[#C1B9AE]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-[10px] tracking-[0.3em] opacity-40 animate-pulse">LOADING...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-[10px] tracking-widest opacity-30 italic">記録がまだありません</div>
        ) : (
          items.map((item, idx) => (
            <Link key={`${item.id}-${idx}`} href={item.link}>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#F1EFEA] active:scale-[0.98] transition-all duration-200 hover:border-[#B5A773]/30">
                
                {/* ヘッダー情報 */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                    item.type === 'favorite' ? 'bg-[#FFF9C4] text-[#FBC02D]' : 'bg-[#F1EFEA] text-[#B5A773]'
                  }`}>
                    {item.label}
                  </span>
                  <span className="text-[8px] opacity-30 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                {/* メイン内容 */}
                <div className="space-y-3">
                  {/* アクションの対象（リプライ先やリアクション先） */}
                  {(item.type === 'my_reply' || item.type === 'my_reaction') && (
                    <div className="p-3 bg-[#FAF9F6] rounded-xl border-l-2 border-[#B5A773]/20">
                      <p className="text-[9px] font-black opacity-30 mb-1 uppercase">Target Post:</p>
                      <p className="text-[11px] italic line-clamp-1 opacity-60">
                        {(item.otaku_posts || item.talk_posts)?.content}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <span className="text-xl">{item.profiles?.icon || (item.otaku_posts?.profiles?.icon || item.talk_posts?.profiles?.icon)}</span>
                    <div className="flex-1">
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                        {item.type === 'my_reaction' ? `リアクションを贈りました：${item.type}` : item.content}
                      </p>
                      
                      {/* 画像プレビュー（ちょこっとーく用） */}
                      {item.image_urls?.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {item.image_urls.map((url, i) => (
                            <img key={i} src={url} className="rounded-xl w-full h-24 object-cover shadow-inner" alt="post" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 自分の投稿への他者からのレスポンス */}
                  {item.type === 'my_post' && item.otaku_replies?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F1EFEA]">
                      <p className="text-[8px] font-black text-[#66BB6A] mb-2 uppercase">New Comments:</p>
                      <div className="flex gap-2 overflow-hidden">
                        {item.otaku_replies.map(r => (
                          <span key={r.id} className="text-xs bg-[#F0F4F0] px-2 py-1 rounded-lg">🗨️</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.type === 'my_talk' && item.talk_reactions?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F1EFEA] flex gap-2">
                      {item.talk_reactions.map((re, i) => (
                        <span key={i} className="text-xs">{re.type}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 下部アクション */}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[9px] font-bold opacity-20 uppercase tracking-widest">Tap to view detail</span>
                  {item.type === 'favorite' && (
                    <button 
                      onClick={(e) => handleUnfavorite(e, item.fav_id)}
                      className="text-[9px] font-black text-red-300 hover:text-red-500 uppercase transition-colors"
                    >
                      Unfavorite ×
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* フッター風ボタン */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 px-6">
        <Link href={`/picnic/${activeTab}`} className="w-full max-w-[200px] bg-[#70695E] text-white text-center py-4 rounded-full shadow-2xl text-[10px] font-black tracking-[0.3em] uppercase hover:scale-105 transition-transform">
          GO TO {activeTab === 'otaku' ? 'TALK FIELD' : 'CHOKO FIELD'}
        </Link>
      </div>
    </div>
  );
}