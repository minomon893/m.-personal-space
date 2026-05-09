"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function TalkPage() {
  const [posts, setPosts] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [myFollows, setMyFollows] = useState([]); 
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const BUCKET_NAME = "talkimage";
  const MAX_CHARS = 500;

  const supabase = useMemo(() => {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(url, key);
  }, []);

  const ensureAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        return session.user.id;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) return null;
      setCurrentUserId(data.user.id);
      return data.user.id;
    } catch (e) {
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    const saved = localStorage.getItem("talk_blocked_users");
    if (saved) setBlockedUserIds(JSON.parse(saved));
  }, []);

  const handleBlock = (targetId) => {
    if (targetId === currentUserId) return;
    if (!confirm("このユーザーをブロックしますか？\n以降、このユーザーの投稿は表示されなくなります。")) return;
    
    const newList = [...blockedUserIds, targetId];
    setBlockedUserIds(newList);
    localStorage.setItem("talk_blocked_users", JSON.stringify(newList));
    setSelectedPost(null);
  };

  const handleReport = (postId) => {
    if (!confirm("この投稿を通報しますか？")) return;
    alert("通報を承りました。ご協力ありがとうございます。");
  };

  const fetchData = useCallback(async () => {
    const userId = await ensureAuth();
    if (!userId) return;

    try {
      const [{ data: favs }, { data: talkData }, { data: followData }] = await Promise.all([
        supabase.from("favorites").select("post_id").eq("user_id", userId),
        supabase
          .from("talk_posts")
          .select(`*, profiles:user_id (id, nickname, icon, avatar_url, title), talk_reactions (*)`)
          .order("created_at", { ascending: false }),
        supabase.from("follows").select("following_id").eq("follower_id", userId)
      ]);

      setMyFavorites(favs?.map(f => f.post_id) || []);
      setMyFollows(followData?.map(f => f.following_id) || []); 
      setPosts(talkData || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, [supabase, ensureAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleFollow = async (targetUserId) => {
    if (!currentUserId || targetUserId === currentUserId) return;

    const isFollowing = myFollows.includes(targetUserId);
    
    setMyFollows(prev => 
      isFollowing ? prev.filter(id => id !== targetUserId) : [...prev, targetUserId]
    );

    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", targetUserId);
      } else {
        await supabase.from("follows").insert({ follower_id: currentUserId, following_id: targetUserId });
        alert("お庭に招待しました！🏡");
      }
    } catch (err) {
      console.error("Follow error:", err);
      fetchData(); 
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && images.length === 0) || isSubmitting || content.length > MAX_CHARS) return;
    setIsSubmitting(true);

    try {
      const userId = await ensureAuth();
      if (!userId) throw new Error("ユーザー認証に失敗しました。");

      const uploadedUrls = [];
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
        if (uploadError) throw new Error(`アップロード失敗: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }

      const { data: newPost, error: insertError } = await supabase
        .from("talk_posts")
        .insert({ user_id: userId, content: content.trim(), image_urls: uploadedUrls })
        .select(`*, profiles:user_id (id, nickname, icon, avatar_url, title), talk_reactions (*)`)
        .single();

      if (insertError) throw new Error(`投稿失敗: ${insertError.message}`);
      setPosts(prev => [newPost, ...prev]);
      setContent("");
      setImages([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (postId, type) => {
    if (!currentUserId) return;
    const targetPost = posts.find(p => p.id === postId);
    const existing = targetPost?.talk_reactions?.find(r => r.type === type && r.user_id === currentUserId);

    const updateUI = (newReactions) => {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, talk_reactions: newReactions } : p));
      if (selectedPost?.id === postId) setSelectedPost(prev => ({ ...prev, talk_reactions: newReactions }));
    };

    const tempReactions = existing
      ? targetPost.talk_reactions.filter(r => r.id !== existing.id)
      : [...(targetPost.talk_reactions || []), { id: 'temp', type, user_id: currentUserId }];
    
    updateUI(tempReactions);

    if (existing) {
      await supabase.from("talk_reactions").delete().eq("id", existing.id);
    } else {
      const { data } = await supabase.from("talk_reactions").insert({ post_id: postId, user_id: currentUserId, type }).select().single();
      if (data) {
        updateUI(tempReactions.map(r => r.id === 'temp' ? data : r));
      }
    }
  };

  const toggleFavorite = async (postId) => {
    if (!currentUserId) return;
    const isAdding = !myFavorites.includes(postId);
    setMyFavorites(prev => isAdding ? [...prev, postId] : prev.filter(id => id !== postId));
    if (isAdding) {
      await supabase.from("favorites").insert({ user_id: currentUserId, post_id: postId });
    } else {
      await supabase.from("favorites").delete().eq("user_id", currentUserId).eq("post_id", postId);
    }
  };

  const renderIcon = (profile, size = "w-12 h-12", text = "text-xl") => {
    const iconData = profile?.avatar_url || profile?.icon;
    const isImg = iconData && (
      iconData.startsWith('http') || 
      iconData.startsWith('/') || 
      iconData.startsWith('data:') || 
      /\.(jpg|jpeg|png|webp|avif|gif)/i.test(iconData)
    );

    return (
      <div className={`${size} rounded-[1.2rem] overflow-hidden bg-white border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center ${text}`}>
        {isImg ? (
          <img 
            src={iconData} 
            className="w-full h-full object-cover" 
            alt="" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              if (e.target.parentElement && !e.target.parentElement.querySelector('.fallback-emoji')) {
                const span = document.createElement('span');
                span.className = 'fallback-emoji';
                span.innerText = '🍀';
                e.target.parentElement.appendChild(span);
              }
            }}
          />
        ) : (
          <span>{iconData || "🍀"}</span>
        )}
      </div>
    );
  };

  const visiblePosts = useMemo(() => {
    return posts.filter(p => !blockedUserIds.includes(p.user_id));
  }, [posts, blockedUserIds]);

  const shapes = [
    "rounded-[20%_50%_30%_60%]",
    "rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]",
    "rounded-[10px_100px_10px_100px]",
    "rounded-[60%_40%_70%_30%_/_30%_70%_40%_60%]",
    "rounded-[30%_70%_70%_30%_/_50%_30%_70%_50%]"
  ];

  const crayonColors = [
    "border-[#FFB7B7] text-[#5F6F7A]", 
    "border-[#B7DFFF] text-[#5F6F7A]",
    "border-[#C1FFB7] text-[#5F6F7A]",
    "border-[#FFE4B7] text-[#5F6F7A]",
    "border-[#D8B7FF] text-[#5F6F7A]"
  ];

  return (
    <div className="min-h-screen bg-[#F0F7EE] animate-in fade-in duration-1000 overflow-x-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&family=Cherry+Bomb+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        .font-cute { font-family: 'Cherry Bomb One', cursive; }
        body { font-family: 'Zen Maru Gothic', sans-serif; }
        .gingham-sheet {
          background-color: #fffdf0;
          background-image: linear-gradient(90deg, rgba(255, 230, 100, 0.2) 50%, transparent 50%),
                            linear-gradient(rgba(255, 230, 100, 0.2) 50%, transparent 50%);
          background-size: 50px 50px;
        }
        .crayon-border {
          border-style: solid;
          border-width: 4px;
          box-shadow: 2px 2px 0px rgba(0,0,0,0.05);
        }
        .sketchbook {
          background: #fff;
          border-left: 15px solid #4A4A4A;
          border-radius: 4px 20px 20px 4px;
          box-shadow: 10px 10px 0px rgba(0,0,0,0.05);
          position: relative;
        }
        .sketchbook::before {
          content: "";
          position: absolute;
          left: -12px;
          top: 10%;
          bottom: 10%;
          width: 8px;
          background-image: radial-gradient(circle, #ddd 30%, transparent 35%);
          background-size: 100% 20px;
          z-index: 10;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94A68440; border-radius: 10px; }
      `}</style>

      <div className="max-w-[95%] mx-auto min-h-screen gingham-sheet shadow-[0_0_100px_rgba(0,0,0,0.1)] relative px-6 sm:px-12 pb-40">
        <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
          <Link href="/picnic/garden" className="pointer-events-auto flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white hover:scale-105 transition-all text-[#94A684]">
            <span className="text-xl">🧺</span>
            <span className="text-[10px] font-black tracking-widest uppercase font-pop">Top</span>
          </Link>
          <Link href="/picnic/me" className="pointer-events-auto bg-white text-[#A8C69F] w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl hover:rotate-12 transition-all text-2xl border-2 border-white">
            🌼
          </Link>
        </header>

        <main className="max-w-4xl mx-auto pt-32 text-center">
          <div className="mb-12">
            <h1 className="font-cute text-[#94A684] text-5xl sm:text-6xl tracking-wider mb-2">
              ちょこっとーく
            </h1>
            <p className="text-sm font-medium text-[#5F6F7A]/70">
              ちょっとしたこと、ちょこっとおしえて。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-24 max-w-lg mx-auto relative z-10 text-left">
            <div className="sketchbook p-1 bg-gray-100">
              <div className="bg-white p-8 rounded-r-[1rem]">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="なにを描こうかな？"
                  className="w-full h-32 bg-transparent text-lg focus:outline-none placeholder:text-[#B5A773]/40 font-bold border-none resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {images.map((file, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg relative overflow-hidden border-2 border-[#eee]">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center">×</button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <label className="w-16 h-16 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer text-gray-400 hover:bg-white transition-all shadow-sm">
                      <span className="text-2xl font-light">＋</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6">
                  <span className="text-[10px] font-black opacity-20">{content.length} / {MAX_CHARS}</span>
                  <button 
                    disabled={isSubmitting || !currentUserId || (content.length === 0 && images.length === 0) || content.length > MAX_CHARS} 
                    className="px-12 py-3 bg-[#94A684] text-white rounded-full text-sm font-black tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "送信中..." : "つぶやく"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-10 relative">
            {visiblePosts.map((post, idx) => {
              const shapeClass = shapes[idx % shapes.length];
              const colorClass = crayonColors[idx % crayonColors.length];
              return (
                <button 
                  key={post.id} 
                  onClick={() => setSelectedPost({ ...post, shapeClass, colorClass })}
                  style={{ transform: `rotate(${((idx * 17) % 20) - 10}deg)` }}
                  className={`bg-white p-6 px-4 crayon-border w-48 h-48 flex flex-col items-center text-center hover:scale-110 hover:z-20 transition-all group relative overflow-hidden ${shapeClass} ${colorClass}`}
                >
                  {renderIcon(post.profiles, "w-12 h-12", "text-xl")}
                  <span className="text-[9px] font-black mt-2 truncate w-full opacity-60">
                    {post.profiles?.nickname || "だれかさん"}
                  </span>
                  <p className="text-[11px] font-bold mt-2 line-clamp-3 leading-relaxed font-serif italic break-all overflow-hidden w-full">
                    {post.content || "🎨"}
                  </p>
                  <div className="mt-auto text-[8px] font-black opacity-30">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#5F6F7A]/40 backdrop-blur-md" onClick={() => setSelectedPost(null)}></div>
          
          <div className={`relative w-full max-w-3xl aspect-square flex items-center justify-center bg-white crayon-border ${selectedPost.shapeClass} ${selectedPost.colorClass} border-8 shadow-2xl transition-all duration-700 overflow-hidden`}>
            
            {/* 四角を少し小さく w-[75%] h-[70%] に調整 */}
            <div className="w-[75%] h-[70%] max-w-md bg-white rounded-[2rem] shadow-inner flex flex-col justify-center overflow-hidden relative border border-gray-100/50">
              
              <div className="absolute top-0 left-0 right-0 pt-6 px-6 pb-3 flex items-center justify-between flex-shrink-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {renderIcon(selectedPost.profiles, "w-10 h-10", "text-lg")}
                    {selectedPost.user_id !== currentUserId && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFollow(selectedPost.user_id); }}
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] border-2 border-white shadow-sm transition-all ${myFollows.includes(selectedPost.user_id) ? 'bg-[#A8C69F] text-white' : 'bg-white text-[#94A684]'}`}
                      >
                        {myFollows.includes(selectedPost.user_id) ? "🏡" : "＋"}
                      </button>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-[#5F6F7A] text-sm leading-tight">{selectedPost.profiles?.nickname || "だれかさん"}</h3>
                    <p className="text-[8px] font-black text-[#A8C69F] tracking-widest uppercase">{selectedPost.profiles?.title || "Artist"}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 transition-all">×</button>
              </div>

              <div className="px-6 pt-20 pb-20 overflow-y-auto custom-scrollbar flex-shrink bg-white">
                <p className="text-sm sm:text-base leading-relaxed font-bold text-[#5F6F7A] whitespace-pre-wrap mb-6 break-all text-center">
                  {selectedPost.content}
                </p>
                
                {selectedPost.image_urls?.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {selectedPost.image_urls.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border-2 border-[#F0F7EE]">
                        <img src={url} className="w-full h-auto object-contain" alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-[#F0F7EE]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {["👍", "わかる", "気になる", "💞"].map(emoji => {
                      const reactions = selectedPost.talk_reactions || [];
                      const count = reactions.filter(r => r.type === emoji).length;
                      const hasReacted = reactions.some(r => r.type === emoji && r.user_id === currentUserId);
                      return (
                        <button 
                          key={emoji} 
                          onClick={() => handleReaction(selectedPost.id, emoji)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 transition-all active:scale-90 ${hasReacted ? 'bg-[#94A684] border-[#94A684] text-white' : 'bg-white border-[#F0F7EE]'}`}
                        >
                          <span className="text-xs">{emoji}</span>
                          <span className="text-[9px] font-bold">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => toggleFavorite(selectedPost.id)}
                      className={`h-9 px-3 rounded-xl flex items-center justify-center text-lg border-2 transition-all ${myFavorites.includes(selectedPost.id) ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-[#F0F7EE]'}`}
                    >
                      {myFavorites.includes(selectedPost.id) ? "🔖" : "🏷️"}
                    </button>

                    {selectedPost.user_id !== currentUserId && (
                      <div className="flex gap-2">
                        <button onClick={() => handleReport(selectedPost.id)} className="text-[8px] font-bold text-gray-300 hover:text-red-400">🚩通報</button>
                        <button onClick={() => handleBlock(selectedPost.user_id)} className="text-[8px] font-bold text-gray-300 hover:text-black">🚫ブロック</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}