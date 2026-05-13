"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OtakuContent() {
  const searchParams = useSearchParams();
  const targetPostId = searchParams.get("postId");

  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // お気に入りフィルター用
  const [myFollows, setMyFollows] = useState([]);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [content, setContent] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const MAX_CHARS = 1000;

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

  useEffect(() => {
    const savedBlocks = localStorage.getItem("otaku_blocked_users");
    if (savedBlocks) setBlockedUserIds(JSON.parse(savedBlocks));
  }, []);

  const fetchData = useCallback(async () => {
    const userId = await ensureAuth();
    if (!userId) return;
    try {
      const { data: postsData, error: postError } = await supabase
        .from("otaku_posts")
        .select(`
          *,
          profiles:user_id (id, nickname, icon, avatar_url, title),
          otaku_replies (
            id, content, user_id, created_at,
            profiles:user_id (id, nickname, icon, avatar_url, title)
          )
        `)
        .order("created_at", { ascending: false });

      if (postError) throw postError;

      const { data: favData, error: favError } = await supabase
        .from("favorites")
        .select("post_id")
        .eq("user_id", userId)
        .not("post_id", "is", null);

      if (favError) throw favError;

      const { data: followData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      setFavorites(new Set(favData.map(f => f.post_id)));
      setMyFollows(followData?.map(f => f.following_id) || []);
      setPosts((postsData || []).map(post => ({
        ...post,
        otaku_replies: post.otaku_replies?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []
      })));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [supabase, ensureAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel("otaku_all_events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "otaku_posts" },
        async (payload) => {
          setPosts((prev) => {
            if (prev.some(p => p.id === payload.new.id)) return prev;

            const fetchNewPost = async () => {
              const { data: newPost } = await supabase
                .from("otaku_posts")
                .select("*, profiles:user_id (id, nickname, icon, avatar_url, title)")
                .eq("id", payload.new.id)
                .single();
              
              if (newPost) {
                setPosts((current) => {
                  if (current.some(p => p.id === newPost.id)) return current;
                  return [{ ...newPost, otaku_replies: [] }, ...current];
                });
              }
            };
            fetchNewPost();
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "otaku_replies" },
        async (payload) => {
          const fetchNewReply = async () => {
            const { data: newReply } = await supabase
              .from("otaku_replies")
              .select("*, profiles:user_id (id, nickname, icon, avatar_url, title)")
              .eq("id", payload.new.id)
              .single();

            if (newReply) {
              setPosts((prev) =>
                prev.map((post) =>
                  post.id === newReply.post_id
                    ? { 
                        ...post, 
                        otaku_replies: [
                          ...(post.otaku_replies || []).filter(r => r.id !== newReply.id), 
                          newReply
                        ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                      }
                    : post
                )
              );

              const parentPost = posts.find(p => p.id === newReply.post_id);
              if (parentPost?.user_id === currentUserId && newReply.user_id !== currentUserId) {
                alert("あなたの叫びにレスポンスが届きました！💌");
              }
            }
          };
          fetchNewReply();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "favorites", filter: `user_id=eq.${currentUserId}` },
        () => {
          fetchData(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, posts, fetchData]);

  useEffect(() => {
    if (targetPostId && posts.length > 0) {
      const post = posts.find(p => p.id === targetPostId);
      if (post) setSelectedPost(post);
    }
  }, [targetPostId, posts]);

  useEffect(() => {
    if (selectedPost) {
      const updated = posts.find(p => p.id === selectedPost.id);
      if (updated) setSelectedPost(updated);
    }
  }, [posts]);

  const toggleFollow = async (targetUserId) => {
    if (!currentUserId || targetUserId === currentUserId) return;
    const isFollowing = myFollows.includes(targetUserId);
    try {
      if (isFollowing) {
        setMyFollows(prev => prev.filter(id => id !== targetUserId));
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", targetUserId);
      } else {
        setMyFollows(prev => [...prev, targetUserId]);
        await supabase.from("follows").insert({ follower_id: currentUserId, following_id: targetUserId });
        alert("お庭に招待しました！🏡");
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const toggleFavorite = async (postId) => {
    if (!currentUserId) return;
    const isFav = favorites.has(postId);
    try {
      if (isFav) {
        setFavorites(prev => { const next = new Set(prev); next.delete(postId); return next; });
        await supabase.from("favorites").delete().eq("user_id", currentUserId).eq("post_id", postId);
      } else {
        setFavorites(prev => new Set(prev).add(postId));
        await supabase.from("favorites").insert({ user_id: currentUserId, post_id: postId });
      }
    } catch (err) {
      console.error("Fav error:", err);
      fetchData(); 
    }
  };

  const handleReport = (postId) => {
    if (!confirm("この投稿を通報しますか？")) return;
    alert("通報を受け付けました。ご協力ありがとうございます。");
  };

  const handleBlock = (targetUserId) => {
    if (targetUserId === currentUserId) return;
    if (!confirm("このユーザーをブロックしますか？\nブロックするとこのユーザーの投稿や返信が一切表示されなくなります。")) return;
    
    const newBlockedList = [...blockedUserIds, targetUserId];
    setBlockedUserIds(newBlockedList);
    localStorage.setItem("otaku_blocked_users", JSON.stringify(newBlockedList));
    setSelectedPost(null);
    alert("ブロックしました。");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || content.length > MAX_CHARS) return;
    setIsSubmitting(true);
    try {
      const userId = await ensureAuth();
      const { data, error } = await supabase
        .from("otaku_posts")
        .insert({ user_id: userId, content, is_sensitive: isSensitive })
        .select("*, profiles:user_id (id, nickname, icon, avatar_url, title)")
        .single();
      
      if (error) throw error;

      if (data) {
        setPosts((prev) => [{ ...data, otaku_replies: [] }, ...prev]);
      }
      
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
      const { data, error } = await supabase
        .from("otaku_replies")
        .insert({ post_id: postId, user_id: currentUserId, content: replyText })
        .select("*, profiles:user_id (id, nickname, icon, avatar_url, title)")
        .single();

      if (error) throw error;
      
      if (data) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, otaku_replies: [...(post.otaku_replies || []), data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) }
              : post
          )
        );
      }
    } catch (err) {
      alert(`返信失敗: ${err.message}`);
    }
  };

  const renderIcon = (profile, sizeClass = "w-14 h-14") => {
    const iconData = profile?.avatar_url || profile?.icon;
    const isImage = iconData && (
      iconData.startsWith('http') || 
      iconData.startsWith('/') || 
      iconData.startsWith('data:') || 
      /\.(jpg|jpeg|png|webp|avif|gif)/i.test(iconData)
    );
    
    return (
      <div className={`${sizeClass} rounded-[1.2rem] overflow-hidden bg-white border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center`}>
        {isImage ? (
          <img 
            src={iconData} 
            className="w-full h-full object-cover" 
            alt="" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.style.display = 'none';
              const span = document.createElement('span');
              span.className = 'text-2xl';
              span.innerText = '🍀';
              e.target.parentElement.appendChild(span);
            }} 
          />
        ) : (
          <span className="text-2xl">{iconData || "🍀"}</span>
        )}
      </div>
    );
  };

  // ブロック済みを除外した全表示用
  const baseVisiblePosts = posts.filter(post => !blockedUserIds.includes(post.user_id));
  
  // お気に入りフィルター適用の最終リスト
  const visiblePosts = showFavoritesOnly 
    ? baseVisiblePosts.filter(post => favorites.has(post.id)) 
    : baseVisiblePosts;

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
        .lunch-box-lid { 
          background-color: #749BC2; 
          background-image: radial-gradient(#6387A9 10%, transparent 10%);
          background-size: 20px 20px;
          z-index: 10; 
        }
        .lid-band {
          background-color: #333;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        }
      `}</style>

      <div className="max-w-[96%] mx-auto min-h-screen gingham-blue shadow-[0_0_80px_rgba(0,0,0,0.05)] relative px-4 sm:px-12 flex flex-col">
        <header className="sticky top-0 z-40 px-4 py-6 flex items-center justify-between">
          <Link href="/picnic/garden" className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white text-[#749BC2]">
            <span className="text-xl">🧺</span>
            <span className="text-[10px] font-black font-pop uppercase">Top</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl border-2 transition-all ${showFavoritesOnly ? 'bg-yellow-100 border-yellow-400 scale-110' : 'bg-white border-white'}`}
            >
              <span className="text-2xl">{showFavoritesOnly ? "🔖" : "🏷️"}</span>
            </button>
            
            <Link href="/picnic/me" className="bg-white text-[#749BC2] w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl text-2xl border-2 border-white">🌼</Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto pt-10 text-center relative z-10 flex-grow pb-40">
          <div className="mb-12">
            <h1 className="font-cute text-[#749BC2] text-5xl sm:text-7xl tracking-wider mb-3">オタトーーーク！！！</h1>
            <p className="text-[10px] sm:text-xs font-bold text-[#5F6F7A] opacity-70 leading-relaxed">
              愛を叫ぶのも、ふとした疑問も。<br className="sm:hidden" />
              刺激が強いものは、お弁当箱の蓋を閉めてそっとシェア。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-24 max-w-2xl mx-auto text-left relative">
            <div className="bg-[#749BC2] p-4 rounded-[3rem] shadow-2xl">
              <div className="bg-white rounded-[2.5rem] overflow-hidden border-b-8 border-r-8 border-[#6387A9] p-8">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ここなら、好きなだけ叫んでいいよ."
                  maxLength={MAX_CHARS}
                  className="w-full h-44 bg-[#F8FBFF] p-6 rounded-[2rem] text-lg focus:outline-none font-bold resize-none shadow-inner text-[#5F6F7A]"
                />
                <div className="text-right text-[10px] font-bold opacity-30 mt-1">{content.length} / {MAX_CHARS}</div>
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

          {showFavoritesOnly && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-2">
              <span className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full text-xs font-black tracking-widest border border-yellow-200 shadow-sm">
                🔖 お気に入り中のみ表示しています
              </span>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-10">
            {visiblePosts.length === 0 ? (
              <div className="py-20 opacity-30 italic font-bold">表示できる投稿がありません 🍀</div>
            ) : (
              visiblePosts.map((post, idx) => (
                <div key={post.id} className="relative group">
                  <button 
                    onClick={() => setSelectedPost(post)}
                    style={{ transform: `rotate(${((idx * 17) % 20) - 10}deg)` }}
                    className="bg-white rounded-[2rem] shadow-xl border-4 border-white w-48 h-60 flex flex-col items-center text-center hover:scale-105 transition-all active:scale-95 relative overflow-hidden"
                  >
                    {post.is_sensitive && (
                      <div className="absolute inset-0 lunch-box-lid flex items-center justify-center">
                        <div className="absolute inset-y-0 w-8 lid-band left-1/2 -translate-x-1/2"></div>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#6387A9] rounded-full border-2 border-white/30"></div>
                      </div>
                    )}
                    {/* ここから蓋の上にも表示される情報レイヤー */}
                    <div className="p-5 flex flex-col items-center h-full w-full relative z-20">
                      <div className="relative">
                        {renderIcon(post.profiles, "w-16 h-16")}
                        {post.user_id !== currentUserId && (
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] border-2 border-white shadow-sm transition-all ${myFollows.includes(post.user_id) ? 'bg-[#A8C69F] text-white' : 'bg-white text-[#749BC2]'}`}>
                            {myFollows.includes(post.user_id) ? "🏡" : "＋"}
                          </div>
                        )}
                        {favorites.has(post.id) && (
                          <div className="absolute -top-1 -left-1 text-sm bg-white rounded-full p-0.5 shadow-sm">🔖</div>
                        )}
                      </div>
                      <span className={`text-[10px] font-black mt-1 truncate w-full ${post.is_sensitive ? 'text-white' : 'text-[#749BC2]'}`}>
                        {post.profiles?.nickname || "名無しさん"}
                      </span>
                      
                      {!post.is_sensitive && (
                        <p className="text-[11px] font-bold text-[#5F6F7A] mt-2 line-clamp-3 leading-tight">{post.content}</p>
                      )}
                      
                      <div className={`mt-auto pt-2 w-full text-[9px] font-black opacity-80 ${post.is_sensitive ? 'text-white/80' : 'text-[#B5A773] border-t border-[#F0F7EE]'}`}>
                        {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2D3E4B]/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border-[8px] border-[#749BC2]">
            <div className="p-6 flex items-center justify-between border-b-4 border-[#F8FBFF]">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleFollow(selectedPost.user_id)}
                  disabled={selectedPost.user_id === currentUserId}
                  className={`relative group ${selectedPost.user_id !== currentUserId ? 'hover:scale-105 transition-transform' : 'cursor-default'}`}
                >
                  {renderIcon(selectedPost.profiles, "w-16 h-16")}
                  {selectedPost.user_id !== currentUserId && (
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-sm transition-all ${myFollows.includes(selectedPost.user_id) ? 'bg-[#A8C69F] text-white' : 'bg-white text-[#749BC2]'}`}>
                      {myFollows.includes(selectedPost.user_id) ? "🏡" : "＋"}
                    </div>
                  )}
                </button>
                <div className="text-left">
                    <h3 className="font-black text-xl text-[#5F6F7A]">{selectedPost.profiles?.nickname}</h3>
                    <p className="text-[10px] font-bold text-[#749BC2] tracking-widest">{selectedPost.profiles?.title || "Resident"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleFavorite(selectedPost.id)} className="text-2xl hover:scale-120 transition-transform">
                  {favorites.has(selectedPost.id) ? "🔖" : "🏷️"}
                </button>
                <button onClick={() => setSelectedPost(null)} className="text-2xl font-bold ml-2">×</button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar bg-[#F8FBFF]/50 flex-grow">
              <div className="bg-white p-8 rounded-[2.5rem] mb-4 font-bold text-[#5F6F7A] whitespace-pre-wrap shadow-sm border-2 border-[#EBF5FF] text-lg">
                {selectedPost.content}
              </div>

              <div className="flex justify-end gap-2 mb-10">
                <button 
                  onClick={() => handleReport(selectedPost.id)} 
                  className="text-[8px] font-bold text-gray-300 hover:text-red-400"
                >
                  🚩通報
                </button>
                {selectedPost.user_id !== currentUserId && (
                  <button 
                    onClick={() => handleBlock(selectedPost.user_id)} 
                    className="text-[8px] font-bold text-gray-300 hover:text-black"
                  >
                    🚫ブロック
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 items-start justify-center">
                {selectedPost.otaku_replies
                  ?.filter(reply => !blockedUserIds.includes(reply.user_id))
                  .map((reply, i) => {
                    const shapes = ["rounded-[3rem]", "rounded-[1rem]", "rounded-full", "rounded-tr-[4rem] rounded-bl-[4rem]"];
                    const shape = shapes[i % shapes.length];
                    const colors = ["bg-[#FFF9F9] border-[#FFB4B4]", "bg-[#F9FFF9] border-[#B4FFB4]", "bg-[#F9F9FF] border-[#B4B4FF]", "bg-[#FFFFF0] border-[#F0F0B4]"];
                    const color = colors[i % colors.length];
                    
                    return (
                      <div 
                        key={reply.id} 
                        className={`p-5 border-2 shadow-sm ${shape} ${color} max-w-[240px] flex-shrink-0 animate-in slide-in-from-bottom-2 duration-500`}
                        style={{ marginTop: i % 2 === 0 ? "0" : "20px" }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className={`relative group ${reply.user_id !== currentUserId ? 'cursor-pointer' : 'cursor-default'}`} 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (reply.user_id !== currentUserId) toggleFollow(reply.user_id); 
                            }}
                          >
                            {renderIcon(reply.profiles, "w-8 h-8")}
                            {reply.user_id !== currentUserId && (
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[5px] border-white border shadow-sm ${myFollows.includes(reply.user_id) ? 'bg-[#A8C69F]' : 'bg-[#749BC2]'}`}>
                                {myFollows.includes(reply.user_id) ? "🏡" : "＋"}
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] leading-tight">
                            <p className="font-black text-[#5F6F7A] truncate max-w-[100px]">{reply.profiles?.nickname}</p>
                            <p className="opacity-40">{new Date(reply.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#5F6F7A] leading-relaxed">{reply.content}</p>
                        
                        {reply.user_id !== currentUserId && (
                          <div className="mt-2 text-right">
                            <button 
                              onClick={() => handleBlock(reply.user_id)} 
                              className="text-[8px] font-bold text-gray-300 hover:text-black"
                            >
                              🚫ブロック
                            </button>
                          </div>
                        )}
                      </div>
                    );
                })}
              </div>
            </div>

            <div className="p-6 bg-white border-t-4 border-[#F8FBFF]">
              <ReplyInput onSend={(text) => handleReply(selectedPost.id, text)} max={MAX_CHARS} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OtakuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F7EE] flex items-center justify-center">
        <div className="w-4 h-4 bg-[#749BC2] rounded-full animate-ping"></div>
      </div>
    }>
      <OtakuContent />
    </Suspense>
  );
}

function ReplyInput({ onSend, max }) {
  const [text, setText] = useState("");
  const handleSend = () => { if (!text.trim() || text.length > max) return; onSend(text); setText(""); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center bg-[#F8FBFF] rounded-3xl p-3 border-2 border-[#749BC2]">
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="愛を叫ぶ..." 
          className="flex-1 bg-transparent px-4 py-1 outline-none text-sm resize-none h-12 font-bold"
        />
        <button 
          onClick={handleSend} 
          disabled={!text.trim() || text.length > max}
          className="bg-[#749BC2] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:scale-105 active:scale-95 disabled:opacity-30 transition-all uppercase tracking-widest"
        >
          Send
        </button>
      </div>
      <div className="text-[9px] text-right font-black opacity-20 px-4">{text.length} / {max}</div>
    </div>
  );
}