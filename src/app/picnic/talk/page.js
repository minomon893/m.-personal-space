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

  // 1. Supabaseクライアントの初期化（URLクリーンアップ処理を追加）
  const supabase = useMemo(() => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    // 引用符や末尾のスラッシュを削除してURLを正規化
    const url = rawUrl.trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const key = rawKey.trim().replace(/['"]+/g, "");

    return createBrowserClient(url, key);
  }, []);

  // 2. 認証の保証（匿名ログイン含む）
  const ensureAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUserId(session.user.id);
        return session.user.id;
      }
      
      // セッションがない場合は匿名でサインイン
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        // 匿名認証がダッシュボードでオフの場合などのエラーハンドリング
        console.error("Auth Error (Check Supabase Dashboard):", error.message);
        return null;
      }
      
      setCurrentUserId(data.user.id);
      return data.user.id;
    } catch (e) {
      console.error("Unexpected Auth Error:", e);
      return null;
    }
  }, [supabase]);

  // 3. データ取得
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
      console.error("Fetch Data Error:", err);
    }
  }, [supabase, ensureAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 新規投稿
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && images.length === 0) || isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const userId = await ensureAuth();
      if (!userId) {
        alert("認証に失敗しました。ページを再読み込みしてください。");
        return;
      }

      const uploadedUrls = [];
      for (const file of images) {
        const fileName = `${userId}/${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage.from("talk_images").upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("talk_images").getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }

      const { data: newPost, error: insertError } = await supabase
        .from("talk_posts")
        .insert({
          user_id: userId,
          content,
          image_urls: uploadedUrls,
        })
        .select(`*, profiles (nickname, icon), talk_reactions (*)`)
        .single();

      if (insertError) throw insertError;

      setPosts(prev => [newPost, ...prev]);
      setContent("");
      setImages([]);
    } catch (err) {
      console.error(err);
      alert("投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // リアクション
  const handleReaction = async (postId, type) => {
    if (!currentUserId) return;

    const targetPost = posts.find(p => p.id === postId);
    const existing = targetPost?.talk_reactions?.find(
      r => r.type === type && r.user_id === currentUserId
    );

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
      const { data } = await supabase
        .from("talk_reactions")
        .insert({ post_id: postId, user_id: currentUserId, type })
        .select().single();
      
      if (data) {
        setPosts(prev => prev.map(p => p.id === postId ? {
          ...p, talk_reactions: p.talk_reactions.map(r => r.id === 'temp' ? data : r)
        } : p));
      }
    }
  };

  // お気に入り
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

  const handleBlock = async (targetUserId) => {
    if (!confirm("このユーザーをブロックしますか？")) return;
    await supabase.from("blocks").insert({ blocker_id: currentUserId, blocked_id: targetUserId });
    setPosts(prev => prev.filter(p => p.user_id !== targetUserId));
  };

  const handleReport = async (postId) => {
    const reason = prompt("通報の理由を入力してください");
    if (!reason) return;
    await supabase.from("reports").insert({ reporter_id: currentUserId, target_post_id: postId, reason });
    alert("通報を受理しました。");
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-[#445544] pb-24 font-main">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&display=swap');
        .font-main { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      {/* Header: Link修正済み */}
      <header className="sticky top-0 z-50 bg-[#F4F7F4]/90 backdrop-blur-md border-b border-[#66BB6A]/10 px-4 py-3 flex items-center justify-between">
        <Link href="/picnic/garden" className="flex items-center gap-1.5 text-[10px] font-black opacity-60 hover:opacity-100 transition-all">
          <span className="w-5 h-5 rounded-full bg-[#445544] text-white flex items-center justify-center text-[8px]">←</span>
          GARDEN
        </Link>
        <h1 className="text-xs font-black tracking-[0.2em] text-[#66BB6A]">ちょこっとーく</h1>
        <Link href="/picnic/me" className="text-[9px] font-black bg-white px-3 py-1 rounded-full shadow-sm border border-[#66BB6A]/10">MY PAGE</Link>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Post Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#66BB6A]/10 mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今の気持ちをどうぞ..."
            className="w-full h-20 resize-none bg-transparent text-[13px] focus:outline-none placeholder:opacity-30"
            maxLength={500}
          />
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {images.map((file, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative group">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/40 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">×</button>
              </div>
            ))}
            {images.length < 4 && (
              <label className="aspect-square rounded-2xl bg-[#F8FAFC] border-2 border-dashed border-[#66BB6A]/10 flex items-center justify-center cursor-pointer text-lg opacity-40 hover:opacity-100 transition-all">
                ＋<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImages([...images, ...Array.from(e.target.files)].slice(0, 4))} />
              </label>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-[#66BB6A]/5">
            <button 
              disabled={isSubmitting || !currentUserId || (!content.trim() && images.length === 0)} 
              className="px-8 py-2 bg-[#66BB6A] text-white rounded-full text-[11px] font-black tracking-widest disabled:opacity-30 hover:brightness-110 transition-all shadow-md shadow-green-100"
            >
              {isSubmitting ? "WAIT..." : "POST"}
            </button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-[2.2rem] p-5 shadow-sm border border-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl drop-shadow-sm">{post.profiles?.icon || "🍀"}</span>
                  <div>
                    <p className="text-[11px] font-black text-[#445544] leading-none mb-1">{post.profiles?.nickname}</p>
                    <p className="text-[8px] opacity-20 font-bold uppercase">{new Date(post.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(post.id)} className="text-lg hover:scale-110 transition-transform">
                  {myFavorites.includes(post.id) ? "🔖" : "🏷️"}
                </button>
              </div>

              <p className="text-[13px] leading-relaxed mb-4 whitespace-pre-wrap text-[#3A4A3A] font-medium">{post.content}</p>

              {post.image_urls?.length > 0 && (
                <div className={`grid gap-2 mb-4 ${post.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.image_urls.map((url, i) => (
                    <img key={i} src={url} className="rounded-2xl w-full object-cover max-h-60 shadow-sm border border-[#F8FAFC]" alt="post" />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#66BB6A]/5 pt-4">
                <div className="flex gap-4">
                  {["👍", "わかる", "気になる", "💞"].map(emoji => {
                    const reactions = post.talk_reactions || [];
                    const count = reactions.filter(r => r.type === emoji).length;
                    const hasReacted = reactions.some(r => r.type === emoji && r.user_id === currentUserId);
                    
                    return (
                      <button 
                        key={emoji} 
                        onClick={() => handleReaction(post.id, emoji)} 
                        className={`flex items-center gap-1 transition-all ${hasReacted ? 'scale-110 opacity-100' : 'opacity-40'}`}
                      >
                        <span className="text-sm">{emoji}</span>
                        <span className={`text-[10px] font-black ${hasReacted ? 'text-[#66BB6A]' : ''}`}>
                          {count > 0 ? count : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleReport(post.id)} className="text-[8px] font-bold uppercase opacity-10 hover:opacity-100 hover:text-red-400 transition-all tracking-tighter">Report</button>
                  <button onClick={() => handleBlock(post.user_id)} className="text-[8px] font-bold uppercase opacity-10 hover:opacity-100 hover:text-red-400 transition-all tracking-tighter">Block</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}