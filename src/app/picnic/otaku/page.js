"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function OtakuPage() {
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState(new Set()); // お気に入りIDの管理
  const [content, setContent] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const supabase = useMemo(() => {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(url, key);
  }, []);

  const ensureAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      if (!userId) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        userId = data.user.id;
      }
      setCurrentUserId(userId);
      return userId;
    } catch (e) {
      console.error("Auth error:", e);
      return null;
    }
  }, [supabase]);

  const fetchData = useCallback(async () => {
    const userId = await ensureAuth();
    if (!userId) return;
    try {
      // 1. 投稿と返信を取得
      const { data: postsData, error: postError } = await supabase
        .from("otaku_posts")
        .select(`
          *,
          profiles:user_id (nickname, icon, title),
          otaku_replies (
            id, content, user_id, created_at,
            profiles:user_id (nickname, icon, title)
          )
        `)
        .order("created_at", { ascending: false });

      if (postError) throw postError;

      // 2. お気に入り一覧を取得
      const { data: favData, error: favError } = await supabase
        .from("otaku_favorites")
        .select("post_id")
        .eq("user_id", userId);

      if (favError) throw favError;

      setFavorites(new Set(favData.map(f => f.post_id)));
      setPosts((postsData || []).map(post => ({
        ...post,
        otaku_replies: post.otaku_replies?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []
      })));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [supabase, ensureAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // お気に入り切り替え機能
  const toggleFavorite = async (e, postId) => {
    e.stopPropagation(); // 詳細モーダルが開かないようにする
    if (!currentUserId) return;

    const isFav = favorites.has(postId);
    try {
      if (isFav) {
        await supabase.from("otaku_favorites").delete().eq("user_id", currentUserId).eq("post_id", postId);
        setFavorites(prev => { const next = new Set(prev); next.delete(postId); return next; });
      } else {
        await supabase.from("otaku_favorites").insert({ user_id: currentUserId, post_id: postId });
        setFavorites(prev => new Set(prev).add(postId));
      }
    } catch (err) {
      console.error("Fav error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const userId = await ensureAuth();
      const { data: newPost, error } = await supabase
        .from("otaku_posts")
        .insert({ user_id: userId, content, is_sensitive: isSensitive })
        .select("*, profiles:user_id (nickname, icon, title)")
        .single();
      if (error) throw error;
      setPosts(prev => [{ ...newPost, otaku_replies: [] }, ...prev]);
      setContent("");
      setIsSensitive(false);
    } catch (err) {
      alert("叫び損ねました: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (postId, replyText) => {
    try {
      const { data: newReply, error } = await supabase
        .from("otaku_replies")
        .insert({ post_id: postId, user_id: currentUserId, content: replyText })
        .select("*, profiles:user_id (nickname, icon, title)")
        .single();
      if (error) throw error;

      const updatedPosts = posts.map(post => post.id === postId ? {
        ...post, otaku_replies: [...(post.otaku_replies || []), newReply]
      } : post);
      
      setPosts(updatedPosts);
      if (selectedPost?.id === postId) setSelectedPost(updatedPosts.find(p => p.id === postId));
    } catch (err) {
      alert(`返信失敗: ${err.message}`);
    }
  };

  const renderIcon = (profile, sizeClass = "w-14 h-14") => {
    const iconData = profile?.icon;
    const isImage = iconData && (iconData.startsWith('data:image') || iconData.startsWith('http') || iconData.length > 100);
    return (
      <div className={`${sizeClass} rounded-[1.2rem] overflow-hidden bg-white border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center`}>
        {isImage ? <img src={iconData} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl">{iconData || "🍀"}</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F7EE] animate-in fade-in duration-1000 overflow-x-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&family=Cherry+Bomb+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        .font-cute { font-family: 'Cherry Bomb One', cursive; }
        body { font-family: 'Zen Maru Gothic', sans-serif; }
        .gingham-blue {
          background-color: #f0f9ff;
          background-image: linear-gradient(90deg, rgba(186, 230, 253, 0.3) 50%, transparent 50%),
                            linear-gradient(rgba(186, 230, 253, 0.3) 50%, transparent 50%);
          background-size: 60px 60px;
        }
        .lunch-box-lid { background-color: #749BC2; z-index: 20; }
      `}</style>

      <div className="max-w-[96%] mx-auto min-h-screen gingham-blue shadow-[0_0_80px_rgba(0,0,0,0.05)] relative px-4 sm:px-12 flex flex-col">
        <header className="sticky top-0 z-40 px-4 py-6 flex items-center justify-between">
          <Link href="/picnic/garden" className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white text-[#749BC2]">
            <span className="text-xl">🧺</span>
            <span className="text-[10px] font-black font-pop uppercase">Garden</span>
          </Link>
          <Link href="/picnic/me" className="bg-[#749BC2] text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl text-2xl border-2 border-white">👤</Link>
        </header>

        <main className="max-w-5xl mx-auto pt-10 text-center relative z-10 flex-grow pb-40">
          <div className="mb-12">
            <h1 className="font-cute text-[#749BC2] text-5xl sm:text-7xl tracking-wider mb-3">オタトーーーーク！</h1>
          </div>

          <form onSubmit={handleSubmit} className="mb-24 max-w-2xl mx-auto text-left relative">
            <div className="bg-[#749BC2] p-4 rounded-[3rem] shadow-2xl">
              <div className="bg-white rounded-[2.5rem] overflow-hidden border-b-8 border-r-8 border-[#6387A9] p-8">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ここなら、好きなだけ叫んでいいよ。"
                  className="w-full h-44 bg-[#F8FBFF] p-6 rounded-[2rem] text-lg focus:outline-none font-bold resize-none shadow-inner text-[#5F6F7A]"
                />
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-2.5 rounded-full border-2 border-[#EBF5FF]">
                    <input type="checkbox" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} className="w-5 h-5 rounded text-[#749BC2]" />
                    <span className="text-[10px] font-black text-[#749BC2] uppercase">蓋を閉める</span>
                  </label>
                  <button disabled={isSubmitting || !content.trim()} className="w-full sm:w-auto px-16 py-4 bg-[#749BC2] text-white rounded-full text-sm font-black shadow-[0_6px_0_#5a7da0] active:translate-y-[6px] active:shadow-none transition-all disabled:opacity-30">
                    叫ぶ！
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-10">
            {posts.map((post, idx) => (
              <div key={post.id} className="relative group">
                {/* お気に入りタグアイコン */}
                <button 
                  onClick={(e) => toggleFavorite(e, post.id)}
                  className={`absolute -top-2 -right-2 z-[30] w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all shadow-md border-2 border-white
                    ${favorites.has(post.id) ? 'bg-yellow-400 scale-110 rotate-12' : 'bg-white text-gray-300 hover:text-yellow-400'}
                  `}
                >
                  🏷️
                </button>

                <button 
                  onClick={() => setSelectedPost(post)}
                  style={{ transform: `rotate(${((idx * 17) % 20) - 10}deg)` }}
                  className="bg-white rounded-[2rem] shadow-xl border-4 border-white w-48 h-56 flex flex-col items-center text-center hover:scale-105 transition-all active:scale-95 relative overflow-hidden"
                >
                  {post.is_sensitive && (
                    <div className="absolute inset-0 lunch-box-lid flex items-center justify-center">
                       <span className="text-[8px] font-black text-white/80 border-2 border-white/30 px-2 py-1 rounded-md">TAP TO OPEN</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col items-center h-full w-full">
                    <div className="mt-2">{renderIcon(post.profiles, "w-16 h-16")}</div>
                    <p className="text-[11px] font-bold text-[#5F6F7A] mt-4 line-clamp-4">{post.content}</p>
                    <div className="mt-auto pt-3 border-t border-[#F0F7EE] w-full text-[10px] font-black text-[#749BC2]">
                      💬 {post.otaku_replies?.length || 0}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* 詳細モーダル (略) - ここは以前と同じですが、念のため構造を維持 */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2D3E4B]/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border-[8px] border-[#749BC2]">
            <div className="p-6 flex items-center justify-between border-b-4 border-[#F8FBFF]">
              <div className="flex items-center gap-4">
                {renderIcon(selectedPost.profiles, "w-16 h-16")}
                <div className="text-left">
                   <h3 className="font-black text-2xl text-[#5F6F7A]">{selectedPost.profiles?.nickname}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-2xl font-bold p-4">×</button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="bg-[#F8FBFF] p-8 rounded-[2.5rem] mb-8 font-bold text-[#5F6F7A] whitespace-pre-wrap">{selectedPost.content}</div>
              <div className="space-y-4">
                {selectedPost.otaku_replies?.map(reply => (
                  <div key={reply.id} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    {renderIcon(reply.profiles, "w-10 h-10")}
                    <div className="text-left">
                      <p className="text-xs font-black text-[#749BC2]">{reply.profiles?.nickname}</p>
                      <p className="text-sm font-medium">{reply.content}</p>
                    </div>
                  </div>
                ))}
                <div className="sticky bottom-0 bg-white pt-4">
                   <ReplyInput onSend={(text) => handleReply(selectedPost.id, text)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReplyInput({ onSend }) {
  const [text, setText] = useState("");
  const handleSend = () => { if (!text.trim()) return; onSend(text); setText(""); };
  return (
    <div className="flex gap-2 items-center bg-[#F8FBFF] rounded-full p-2 border-2 border-[#749BC2]">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="愛を叫ぶ..." className="flex-1 bg-transparent px-4 py-2 outline-none text-sm" />
      <button onClick={handleSend} className="bg-[#749BC2] text-white px-6 py-2 rounded-full text-xs font-black">SEND</button>
    </div>
  );
}