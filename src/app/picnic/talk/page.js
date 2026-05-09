"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function TalkPage() {
  const [posts, setPosts] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
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

  const fetchData = useCallback(async () => {
    const userId = await ensureAuth();
    if (!userId) return;

    try {
      const [{ data: blocks }, { data: favs }, { data: talkData }] = await Promise.all([
        supabase.from("blocks").select("blocked_id").eq("blocker_id", userId),
        supabase.from("favorites").select("post_id").eq("user_id", userId),
        supabase
          .from("talk_posts")
          .select(`*, profiles:user_id (nickname, icon, avatar_url, title), talk_reactions (*)`)
          .order("created_at", { ascending: false })
      ]);

      const blockedUserIds = blocks?.map(b => b.blocked_id) || [];
      setMyFavorites(favs?.map(f => f.post_id) || []);
      setPosts(talkData?.filter(p => !blockedUserIds.includes(p.user_id)) || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, [supabase, ensureAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
        .select(`*, profiles:user_id (nickname, icon, avatar_url, title), talk_reactions (*)`)
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

  /**
   * アイコン表示コンポーネントの修正版
   */
  const renderIcon = (profile, size = "w-12 h-12", text = "text-xl") => {
    // 複数の可能性のあるカラム名をチェック
    const iconData = profile?.avatar_url || profile?.icon;
    
    // URL形式かBase64画像データか、あるいは単なる絵文字かを判定
    const isImg = iconData && (
      iconData.startsWith('http') || 
      iconData.startsWith('/') || 
      iconData.startsWith('data:') || 
      iconData.includes('.') // ファイル拡張子らしきものがある場合
    );

    return (
      <div className={`${size} rounded-[1.2rem] overflow-hidden bg-white border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center ${text}`}>
        {isImg ? (
          <img 
            src={iconData} 
            className="w-full h-full object-cover" 
            alt="" 
            onError={(e) => {
              // 読み込み失敗時のフォールバック
              e.target.onerror = null;
              e.target.parentElement.innerHTML = '<span>🍀</span>';
            }}
          />
        ) : (
          <span>{iconData || "🍀"}</span>
        )}
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
        .gingham-sheet {
          background-color: #fffdf0;
          background-image: linear-gradient(90deg, rgba(255, 230, 100, 0.2) 50%, transparent 50%),
                            linear-gradient(rgba(255, 230, 100, 0.2) 50%, transparent 50%);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Main Sheet Container */}
      <div className="max-w-[95%] mx-auto min-h-screen gingham-sheet shadow-[0_0_100px_rgba(0,0,0,0.1)] relative px-6 sm:px-12 pb-40">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
          {/* TOPボタンの遷移先を /garden に変更 */}
          <Link href="/garden" className="pointer-events-auto flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white hover:scale-105 transition-all text-[#94A684]">
            <span className="text-xl">🏡</span>
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
            <div className="bg-[#FF9494] p-3 rounded-[3.5rem] shadow-2xl">
              <div className="bg-white rounded-[3rem] overflow-hidden border-4 border-[#FFB4B4]">
                <div className="p-8">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="今日のおかずは何にする？（500文字以内）"
                    className="w-full h-28 bg-[#FFF9F9] p-4 rounded-3xl text-lg focus:outline-none placeholder:text-[#B5A773]/60 font-bold border-none resize-none shadow-inner"
                  />
                  <div className="text-[10px] text-right mt-2 font-black opacity-30">
                    {content.length} / {MAX_CHARS}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {images.map((file, i) => (
                      <div key={i} className="w-16 h-16 rounded-2xl relative overflow-hidden border-2 border-[#FFE0E0]">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center">×</button>
                      </div>
                    ))}
                    {images.length < 4 && (
                      <label className="w-16 h-16 rounded-2xl bg-[#FFF9F9] border-2 border-dashed border-[#FFB4B4] flex items-center justify-center cursor-pointer text-[#FFB4B4] hover:bg-white transition-all shadow-sm">
                        <span className="text-2xl">＋</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button 
                      disabled={isSubmitting || !currentUserId || (content.length === 0 && images.length === 0) || content.length > MAX_CHARS} 
                      className="px-14 py-4 bg-[#FF9494] text-white rounded-full text-sm font-black tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                      {isSubmitting ? "調理中..." : "つぶやく"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-8 relative">
            {posts.map((post, idx) => (
              <button 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                style={{ transform: `rotate(${((idx * 13) % 14) - 7}deg)` }}
                className="bg-white p-5 rounded-[2rem] shadow-xl border border-[#F0F7EE] w-44 h-44 flex flex-col items-center text-center hover:scale-110 hover:z-10 transition-all active:scale-95 group relative"
              >
                {renderIcon(post.profiles, "w-14 h-14", "text-2xl")}
                <span className="text-[10px] font-black text-[#94A684] mt-1 truncate w-full">
                  {post.profiles?.nickname || "誰かさん"}
                </span>
                <p className="text-[11px] font-bold text-[#5F6F7A] mt-2 line-clamp-2 leading-relaxed">
                  {post.content || (post.image_urls?.length > 0 ? "📷 写真を投稿したよ" : "...") }
                </p>
                <div className="mt-auto pt-2 flex items-center gap-2">
                  <span className="text-[9px] font-black text-[#B5A773] opacity-50 uppercase">
                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* Full Screen Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-[#5F6F7A]/40 backdrop-blur-md" onClick={() => setSelectedPost(null)}></div>
          
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] border-[12px] border-[#FFF9F9]">
            <div className="p-6 flex items-center justify-between border-b-2 border-[#F0F7EE] bg-[#FFF9F9]/50">
              <div className="flex items-center gap-4">
                {renderIcon(selectedPost.profiles, "w-12 h-12", "text-xl")}
                <div className="text-left">
                  <h3 className="font-black text-[#5F6F7A] text-base">{selectedPost.profiles?.nickname || "誰かさん"}</h3>
                  <p className="text-[9px] font-black text-[#A8C69F] tracking-widest uppercase">{selectedPost.profiles?.title || "Resident"}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm hover:rotate-90 transition-all">×</button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <p className="text-lg leading-relaxed font-bold text-[#5F6F7A] whitespace-pre-wrap mb-8">
                {selectedPost.content}
              </p>
              
              {selectedPost.image_urls?.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {selectedPost.image_urls.map((url, i) => (
                    <div key={i} className="rounded-[2rem] overflow-hidden border-4 border-[#FFF9F9] shadow-sm">
                      <img src={url} className="w-full h-auto object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t-2 border-[#F0F7EE]">
                <div className="flex gap-2">
                  {["👍", "わかる", "気になる", "💞"].map(emoji => {
                    const reactions = selectedPost.talk_reactions || [];
                    const count = reactions.filter(r => r.type === emoji).length;
                    const hasReacted = reactions.some(r => r.type === emoji && r.user_id === currentUserId);
                    return (
                      <button 
                        key={emoji} 
                        onClick={() => handleReaction(selectedPost.id, emoji)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all active:scale-90 ${hasReacted ? 'bg-[#FF9494] border-[#FF9494] text-white shadow-md' : 'bg-white border-[#F0F7EE]'}`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-bold">{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-[#B5A773]">{new Date(selectedPost.created_at).toLocaleTimeString()}</span>
                  <button 
                    onClick={() => toggleFavorite(selectedPost.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${myFavorites.includes(selectedPost.id) ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-[#F0F7EE]'}`}
                  >
                    {myFavorites.includes(selectedPost.id) ? "🔖" : "🏷️"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}