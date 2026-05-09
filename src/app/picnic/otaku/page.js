"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function OtakuPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
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
      if (error) throw error;
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
      const { data: postsData } = await supabase
        .from("otaku_posts")
        .select(`*, profiles (nickname, icon), otaku_replies (id, content, user_id, created_at, profiles (nickname, icon))`)
        .order("created_at", { ascending: false });

      setPosts((postsData || []).map(post => ({
        ...post,
        otaku_replies: post.otaku_replies?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []
      })));
    } catch (err) {
      console.error(err);
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

    if (error) { alert("返信に失敗しました（1人1回まで）"); return; }
    setPosts(prev => prev.map(post => post.id === postId ? {
      ...post, otaku_replies: [...(post.otaku_replies || []), newReply]
    } : post));
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#5F6F7A] pb-24 animate-in fade-in duration-500">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        body { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F2F0E9]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/picnic/garden" className="p-2 -ml-2 opacity-60 hover:opacity-100 transition-all flex items-center gap-2 text-[10px] font-black tracking-widest">
          <span className="text-lg">←</span> GARDEN
        </Link>
        <h1 className="font-pop text-[#B5A773] text-[10px] tracking-widest uppercase">オタトーーーーク！</h1>
        <Link href="/picnic/me" className="text-[10px] font-black bg-white/50 px-4 py-2 rounded-full border border-white shadow-sm">MY PAGE</Link>
      </header>

      <div className="max-w-md mx-auto p-6">
        {/* Post Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-white mb-10">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="愛を爆発させてください..."
            className="w-full h-24 resize-none bg-transparent text-[14px] focus:outline-none placeholder:text-[#B5A773]/40"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-5 pt-5 border-t border-[#F2F0E9]">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} className="rounded-full text-[#B5A773] border-[#B5A773]/20 focus:ring-0 w-4 h-4" />
              <span className="text-[10px] font-black opacity-40 group-hover:opacity-100 transition-opacity tracking-widest">閲覧注意</span>
            </label>
            <button 
              disabled={isSubmitting || !currentUserId || !content.trim()} 
              className="px-10 py-3 bg-[#B5A773] text-white rounded-full text-[12px] font-black tracking-widest hover:opacity-90 active:scale-95 disabled:opacity-30 transition-all shadow-lg shadow-[#B5A773]/20"
            >
              {isSubmitting ? "WAIT..." : "叫ぶ"}
            </button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-10">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/40 rounded-[3rem] p-8 shadow-sm border border-white/60">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-3xl grayscale-[0.2]">{post.profiles?.icon || "🍀"}</span>
                <div>
                  <p className="text-[12px] font-black leading-none mb-1.5">{post.profiles?.nickname || "名無しのオタク"}</p>
                  <p className="text-[9px] opacity-30 font-bold uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-8">
                {post.is_sensitive ? (
                  <details className="group">
                    <summary className="list-none cursor-pointer bg-white/80 text-[#B5A773] text-[10px] font-black py-4 rounded-2xl text-center group-open:hidden tracking-[0.2em] border border-[#B5A773]/10">⚠️ VIEW WARNING</summary>
                    <p className="text-[14px] leading-loose whitespace-pre-wrap pt-2 text-[#5F6F7A]">{post.content}</p>
                  </details>
                ) : (
                  <p className="text-[14px] leading-loose whitespace-pre-wrap text-[#5F6F7A]">{post.content}</p>
                )}
              </div>

              {/* Replies */}
              <div className="space-y-3 mt-8 pt-8 border-t border-white">
                {post.otaku_replies?.map(reply => (
                  <div key={reply.id} className="bg-white/80 p-4 rounded-[1.5rem] border border-white shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5 opacity-60 scale-90 origin-left">
                      <span className="text-sm">{reply.profiles?.icon}</span>
                      <span className="text-[10px] font-black">{reply.profiles?.nickname}</span>
                    </div>
                    <p className="text-[12px] font-medium text-[#5F6F7A] leading-relaxed pl-1">{reply.content}</p>
                  </div>
                ))}
                <div className="pt-4">
                  <ReplyInput onSend={(text) => handleReply(post.id, text)} />
                </div>
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
    <div className="flex gap-3 items-center bg-white rounded-full p-1.5 pl-5 border border-white shadow-inner">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="愛をかえす..." className="flex-1 bg-transparent text-[12px] focus:outline-none text-[#5F6F7A] font-medium" />
      <button onClick={handleSend} className="bg-[#B5A773] text-white text-[10px] font-black px-6 py-2.5 rounded-full shadow-md hover:opacity-90 active:scale-95 transition-all tracking-widest">SEND</button>
    </div>
  );
}