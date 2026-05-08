"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function OtakuPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("otaku_posts")
      .select(`*, profiles (nickname, icon, title)`)
      .order("created_at", { ascending: false });
    
    if (!error) setPosts(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("otaku_posts").insert({
      user_id: user?.id,
      content: content,
      is_sensitive: isSensitive,
    });

    if (!error) {
      setContent("");
      setIsSensitive(false);
      fetchPosts();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F0] text-[#4A5D4A] pb-20">
      <header className="sticky top-0 z-30 bg-[#F0F4F0]/80 backdrop-blur-md border-b border-[#66BB6A]/10 px-6 py-4 flex items-center justify-between">
        <Link href="/picnic" className="text-[10px] tracking-widest opacity-60">← BACK</Link>
        <h1 className="text-sm font-bold tracking-[0.2em] text-[#66BB6A]">オタトーーーーク！！！</h1>
        <div className="w-10"></div>
      </header>

      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-[#66BB6A]/10 mb-10">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="愛を語ってください（1000文字まで）"
            className="w-full h-32 resize-none bg-transparent text-sm focus:outline-none"
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#66BB6A]/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isSensitive} 
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="rounded text-[#66BB6A] focus:ring-[#66BB6A]"
              />
              <span className="text-[10px] font-bold opacity-60">閲覧注意（ネタバレなど）</span>
            </label>
            <button 
              disabled={isSubmitting || !content.trim()}
              className="px-6 py-2 bg-[#66BB6A] text-white rounded-full text-[11px] font-bold tracking-widest disabled:opacity-30"
            >
              叫ぶ
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/60 rounded-3xl p-6 shadow-sm border border-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{post.profiles?.icon}</span>
                <div>
                  <p className="text-[11px] font-bold">{post.profiles?.nickname}</p>
                  <p className="text-[8px] opacity-40 uppercase">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {post.is_sensitive ? (
                <details className="group">
                  <summary className="list-none cursor-pointer bg-[#66BB6A]/10 text-[#66BB6A] text-[10px] font-bold py-2 px-4 rounded-full text-center group-open:hidden">
                    ⚠️ 閲覧注意（タップで表示）
                  </summary>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap pt-2">{post.content}</p>
                </details>
              ) : (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}