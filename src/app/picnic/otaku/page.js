"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function OtakuPage() {
  const [posts, setPosts] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [content, setContent] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 1. Supabaseクライアントの初期化（URLクリーンアップ強化）
  const supabase = useMemo(() => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const url = rawUrl.trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const key = rawKey.trim().replace(/['"]+/g, "");
    return createBrowserClient(url, key);
  }, []);

  // 2. 認証の保証
  const ensureAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        return session.user.id;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setCurrentUserId(data.user.id);
      return data.user.id;
    } catch (e) {
      console.error("Auth Error:", e);
      return null;
    }
  }, [supabase]);

  // 3. データの取得
  const fetchData = useCallback(async () => {
    const userId = await ensureAuth();
    if (!userId) return;

    try {
      const [{ data: blocks }, { data: favs }, { data: postsData }] = await Promise.all([
        supabase.from("blocks").select("blocked_id").eq("blocker_id", userId),
        supabase.from("favorites").select("post_id").eq("user_id", userId),
        supabase
          .from("otaku_posts")
          .select(`
            *,
            profiles (nickname, icon),
            otaku_replies (id, content, user_id, created_at, profiles (nickname, icon))
          `)
          .order("created_at", { ascending: false })
      ]);

      const blockedUserIds = blocks?.map(b => b.blocked_id) || [];
      setBlockedIds(blockedUserIds);
      setMyFavorites(favs?.map(f => f.post_id) || []);

      const filteredPosts = (postsData || [])
        .filter(p => !blockedUserIds.includes(p.user_id))
        .map(post => ({
          ...post,
          otaku_replies: post.otaku_replies?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []
        }));

      setPosts(filteredPosts);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, [supabase, ensureAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userId = await ensureAuth();
      const { data: newPost, error } = await supabase
        .from("otaku_posts")
        .insert({ user_id: userId, content, is_sensitive: isSensitive })
        .select("*, profiles (nickname, icon)")
        .single();

      if (error) throw error;
      setPosts(prev => [{ ...newPost, otaku_replies: [] }, ...prev]);
      setContent("");
      setIsSensitive(false);
    } catch (err) {
      alert("投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (postId, replyText) => {
    if (!replyText.trim() || !currentUserId) return;
    const { data: newReply, error } = await supabase
      .from("otaku_replies")
      .insert({ post_id: postId, user_id: currentUserId, content: replyText })
      .select("*, profiles (nickname, icon)").single();

    if (error) { alert("返信は1回までです。"); return; }
    setPosts(prev => prev.map(post => post.id === postId ? {
      ...post, otaku_replies: [newReply, ...(post.otaku_replies || [])]
    } : post));
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-[#445544] pb-20 font-main">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        .font-main { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F4F7F4]/90 backdrop-blur-md border-b border-[#66BB6A]/10 px-4 py-3 flex items-center justify-between">
        <Link href="/picnic/garden" className="flex items-center gap-1.5 text-[10px] font-black opacity-60 hover:opacity-100 transition-all">
          <span className="w-5 h-5 rounded-full bg-[#445544] text-white flex items-center justify-center text-[8px]">←</span>
          GARDEN
        </Link>
        <h1 className="font-pop text-[#66BB6A] text-xs tracking-tight">オタトーーーーク！</h1>
        <Link href="/picnic/me" className="text-[9px] font-black bg-white px-3 py-1 rounded-full shadow-sm border border-[#66BB6A]/10">MY PAGE</Link>
      </header>

      <div className="max-w-md mx-auto p-4">
        {/* Post Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#66BB6A]/10 mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="愛を語ってください..."
            className="w-full h-20 resize-none bg-transparent text-[13px] focus:outline-none placeholder:opacity-30"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#66BB6A]/5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} className="rounded-full text-[#66BB6A] focus:ring-0 w-3 h-3" />
              <span className="text-[10px] font-bold opacity-40 group-hover:opacity-100 transition-opacity">閲覧注意に設定</span>
            </label>
            <button 
              disabled={isSubmitting || !currentUserId || !content.trim()} 
              className="px-6 py-2 bg-[#66BB6A] text-white rounded-full text-[11px] font-black tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-20 transition-all shadow-md shadow-green-100"
            >
              {isSubmitting ? "WAIT..." : "叫ぶ"}
            </button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl drop-shadow-sm">{post.profiles?.icon || "🍀"}</span>
                <div>
                  <p className="text-[11px] font-black leading-none mb-1">{post.profiles?.nickname || "ななしのオタク"}</p>
                  <p className="text-[8px] opacity-20 font-bold uppercase tracking-tighter">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                {post.is_sensitive ? (
                  <details className="group">
                    <summary className="list-none cursor-pointer bg-[#F4F7F4] text-[#66BB6A] text-[9px] font-black py-2 rounded-xl text-center group-open:hidden tracking-widest border border-[#66BB6A]/10">⚠️ VIEW WARNING</summary>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap pt-2 text-[#3A4A3A] font-medium">{post.content}</p>
                  </details>
                ) : (
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-[#3A4A3A] font-medium">{post.content}</p>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <button className="text-lg filter grayscale active:grayscale-0 hover:grayscale-0 transition-all">
                  ❤️
                </button>
              </div>

              {/* Replies */}
              <div className="mt-4 pt-4 border-t border-[#66BB6A]/5">
                <div className="space-y-2 mb-4">
                  {post.otaku_replies?.map(reply => (
                    <div key={reply.id} className="bg-[#F8FBF8] p-3 rounded-2xl border border-[#66BB6A]/5">
                      <div className="flex items-center gap-2 mb-1 opacity-70">
                        <span className="text-xs">{reply.profiles?.icon}</span>
                        <span className="text-[9px] font-black">{reply.profiles?.nickname}</span>
                      </div>
                      <p className="text-[11px] font-medium text-[#4A5D4A] leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
                <ReplyInput onSend={(text) => handleReply(post.id, text)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReplyInput({ onSend }) {
  const [text, setText] = useState("");
  const handleSend = () => { if (!text.trim()) return; onSend(text); setText(""); };
  return (
    <div className="flex gap-2 items-center bg-[#F4F7F4] p-1 pr-1 pl-4 rounded-full border border-[#66BB6A]/10">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="愛をかえす..." className="flex-1 bg-transparent text-[10px] focus:outline-none font-medium" />
      <button onClick={handleSend} className="bg-[#66BB6A] text-white text-[9px] font-black px-4 py-2 rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all">Send</button>
    </div>
  );
}