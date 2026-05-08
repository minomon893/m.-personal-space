"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function TalkPage() {
  const [posts, setPosts] = useState([]); // 修正: <any[]> を削除
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myProfile, setMyProfile] = useState(null); // 修正: <any> を削除

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    fetchPosts();
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setMyProfile(data);
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("talk_posts")
      .select(`
        *,
        profiles (nickname, icon, title)
      `)
      .order("created_at", { ascending: false });
    
    if (!error) setPosts(data);
  }

  const handleSubmit = async (e) => { // 修正: <React.FormEvent> を削除
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("talk_posts").insert({
      user_id: user?.id,
      content: content,
    });

    if (!error) {
      setContent("");
      fetchPosts();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5F6F7A] font-[var(--font-sans)] pb-20">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#B5A773]/10 px-6 py-4 flex items-center justify-between">
        <Link href="/picnic" className="text-[10px] tracking-widest opacity-60">← BACK</Link>
        <h1 className="text-sm font-bold tracking-[0.2em] text-[#B5A773]">ちょこっとーく</h1>
        <div className="w-10"></div>
      </header>

      {/* POST FORM */}
      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-[#B5A773]/10 mb-10">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今、なにしてる？（500文字まで）"
            maxLength={500}
            className="w-full h-24 resize-none bg-transparent text-sm focus:outline-none"
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#B5A773]/5">
            <span className="text-[10px] opacity-30">{content.length} / 500</span>
            <button 
              disabled={isSubmitting || !content.trim()}
              className="px-6 py-2 bg-[#B5A773] text-white rounded-full text-[11px] font-bold tracking-widest disabled:opacity-30 transition-all"
            >
              つぶやく
            </button>
          </div>
        </form>

        {/* FEED */}
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#F0F7F9] rounded-full flex items-center justify-center text-xl shadow-sm border border-white">
                  {post.profiles?.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold">{post.profiles?.nickname}</span>
                    <span className="text-[8px] bg-[#B5A773]/10 text-[#B5A773] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                      {post.profiles?.title}
                    </span>
                  </div>
                  <p className="text-[9px] opacity-40 uppercase tracking-tighter">
                    {new Date(post.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>
              </div>

              <div className="bg-white/60 rounded-[2rem] rounded-tl-none p-6 shadow-sm border border-white relative">
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                
                <div className="flex gap-4 mt-5 pt-4 border-t border-[#B5A773]/5">
                  <button className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all">
                    <span className="text-sm">🌸</span>
                    <span className="text-[10px] opacity-50">分かる</span>
                  </button>
                  <button className="flex items-center gap-1.5 grayscale hover:grayscale-0 transition-all">
                    <span className="text-sm">✨</span>
                    <span className="text-[10px] opacity-50">気になる</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}