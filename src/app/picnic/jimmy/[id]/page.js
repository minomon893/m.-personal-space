"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function JimmyDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from("jimmys") // テーブル名もjimmys
        .select("*")
        .eq("id", params.id)
        .single();
      
      setPost(data);
      setLoading(false);
    }
    fetchPost();
  }, [params.id, supabase]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Jimmy...</div>;
  if (!post) return <div className="p-10 text-center">記事が見つかりませんでした。</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A5D4A]">
      <header className="p-6 border-b border-[#66BB6A]/10">
        <Link href="/picnic/jimmy" className="text-[10px] font-black opacity-50 uppercase tracking-widest">
          ← Back to Jimmy
        </Link>
      </header>

      <main className="max-w-xl mx-auto py-12 px-6">
        <div className="mb-8">
          <span className="text-[10px] font-black text-[#66BB6A] tracking-[0.3em] uppercase">{post.tag}</span>
          <h1 className="text-3xl font-black mt-2 leading-tight">{post.title}</h1>
          <p className="text-[10px] font-mono opacity-40 mt-4">{new Date(post.created_at).toLocaleDateString()}</p>
        </div>

        {/* 本文エリア */}
        <div className="prose prose-sm leading-[2] text-[#3A4A3A] whitespace-pre-wrap">
          {post.content}
        </div>

        <footer className="mt-20 pt-10 border-t border-[#66BB6A]/10 text-center">
          <Link href="/picnic/jimmy" className="inline-block px-10 py-3 bg-[#66BB6A] text-white rounded-full text-[10px] font-black">
            一覧に戻る
          </Link>
        </footer>
      </main>
    </div>
  );
}