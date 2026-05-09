"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function TalkPage() {
  const [posts, setPosts] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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
          .select(`*, profiles (nickname, icon), talk_reactions (*)`)
          .order("created_at", { ascending: false })
      ]);

      const blockedUserIds = blocks?.map(b => b.blocked_id) || [];
      setBlockedIds(blockedUserIds);
      setMyFavorites(favs?.map(f => f.post_id) || []);
      setPosts(talkData?.filter(p => !blockedUserIds.includes(p.user_id)) || []);
    } catch (err) {
      console.error(err);
    }
  }, [supabase, ensureAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && images.length === 0) || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userId = await ensureAuth();
      const uploadedUrls = [];
      for (const file of images) {
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("talk_images").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("talk_images").getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }

      const { data: newPost, error: insertError } = await supabase
        .from("talk_posts")
        .insert({ user_id: userId, content, image_urls: uploadedUrls })
        .select(`*, profiles (nickname, icon), talk_reactions (*)`)
        .single();

      if (insertError) throw insertError;
      setPosts(prev => [newPost, ...prev]);
      setContent("");
      setImages([]);
    } catch (err) {
      alert("投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (postId, type) => {
    if (!currentUserId) return;
    const targetPost = posts.find(p => p.id === postId);
    const existing = targetPost?.talk_reactions?.find(r => r.type === type && r.user_id === currentUserId);

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newReactions = existing
          ? post.talk_reactions.filter(r => r.id !== existing.id)
          : [...(post.talk_reactions || []), { id: 'temp', type, user_id: currentUserId }];
        return { ...post, talk_reactions: newReactions };
      }
      return post;
    }));

    if (existing) {
      await supabase.from("talk_reactions").delete().eq("id", existing.id);
    } else {
      const { data } = await supabase.from("talk_reactions").insert({ post_id: postId, user_id: currentUserId, type }).select().single();
      if (data) {
        setPosts(prev => prev.map(p => p.id === postId ? {
          ...p, talk_reactions: p.talk_reactions.map(r => r.id === 'temp' ? data : r)
        } : p));
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

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#5F6F7A] pb-24 animate-in fade-in duration-500">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
        body { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F2F0E9]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/picnic/garden" className="p-2 -ml-2 opacity-60 hover:opacity-100 transition-all flex items-center gap-2 text-[10px] font-black tracking-widest">
          <span className="text-lg">←</span> GARDEN
        </Link>
        <h1 className="text-xs font-black tracking-[0.3em] text-[#B5A773] uppercase">ちょこっとーく</h1>
        <Link href="/picnic/me" className="text-[10px] font-black bg-white/50 px-4 py-2 rounded-full border border-white shadow-sm">MY PAGE</Link>
      </header>

      <div className="max-w-md mx-auto p-6">
        {/* Post Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-white/60 mb-10">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今の気持ちをどうぞ..."
            className="w-full h-24 resize-none bg-transparent text-[14px] focus:outline-none placeholder:text-[#B5A773]/40"
            maxLength={500}
          />
          
          <div className="flex flex-wrap gap-2 mb-4">
            {images.map((file, i) => (
              <div key={i} className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden relative border border-white shadow-sm">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/20 flex items-center justify-center text-white font-bold">×</button>
              </div>
            ))}
            {images.length < 4 && (
              <label className="w-16 h-16 rounded-2xl bg-[#F2F0E9] border-2 border-dashed border-[#B5A773]/20 flex items-center justify-center cursor-pointer text-[#B5A773] hover:bg-white transition-all">
                <span className="text-xl">＋</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages([...images, ...Array.from(e.target.files)].slice(0, 4))} />
              </label>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#F2F0E9]">
            <button 
              disabled={isSubmitting || !currentUserId || (!content.trim() && images.length === 0)} 
              className="px-10 py-3 bg-[#B5A773] text-white rounded-full text-[12px] font-black tracking-widest disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#B5A773]/20"
            >
              {isSubmitting ? "WAIT..." : "POST"}
            </button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/60 rounded-[3rem] p-7 shadow-sm border border-white/80">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <span className="text-3xl grayscale-[0.2]">{post.profiles?.icon || "🍀"}</span>
                  <div>
                    <p className="text-[12px] font-black text-[#5F6F7A] leading-none mb-1.5">{post.profiles?.nickname}</p>
                    <p className="text-[9px] opacity-40 font-bold uppercase tracking-tighter">{new Date(post.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(post.id)} className="p-2 -mr-2 text-xl active:scale-125 transition-transform">
                  {myFavorites.includes(post.id) ? "🔖" : "🏷️"}
                </button>
              </div>

              <p className="text-[14px] leading-loose mb-6 whitespace-pre-wrap text-[#5F6F7A]">{post.content}</p>

              {post.image_urls?.length > 0 && (
                <div className={`grid gap-3 mb-6 ${post.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.image_urls.map((url, i) => (
                    <img key={i} src={url} className="rounded-[2rem] w-full object-cover max-h-64 shadow-sm border border-white" alt="post" />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white pt-5">
                <div className="flex gap-5">
                  {["👍", "わかる", "気になる", "💞"].map(emoji => {
                    const count = post.talk_reactions?.filter(r => r.type === emoji).length || 0;
                    const hasReacted = post.talk_reactions?.some(r => r.type === emoji && r.user_id === currentUserId);
                    return (
                      <button key={emoji} onClick={() => handleReaction(post.id, emoji)} className={`flex items-center gap-1.5 transition-all ${hasReacted ? 'scale-110 opacity-100' : 'opacity-30 hover:opacity-60'}`}>
                        <span className="text-md">{emoji}</span>
                        <span className="text-[10px] font-black">{count > 0 ? count : ""}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4 opacity-20 hover:opacity-100 transition-opacity">
                  <button onClick={() => alert("通報しました")} className="text-[8px] font-black uppercase tracking-widest">Report</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}