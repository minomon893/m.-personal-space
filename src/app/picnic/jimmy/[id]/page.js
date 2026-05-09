"use client";

import { useEffect, useState, useMemo, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function JimmyDetailPage({ params: paramsPromise }) {
  // paramsをPromiseとして受け取る（Next.jsの仕様変更対策）
  const params = use(paramsPromise);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Supabaseクライアントの初期化をメモ化
  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  useEffect(() => {
    async function fetchPost() {
      if (!params?.id) return; // IDがない場合は何もしない

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("jimmys")
          .select("*")
          .eq("id", params.id)
          .single();
        
        if (error) {
          console.error("Supabase Error:", error);
        }
        setPost(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params?.id, supabase]);

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
      <div className="text-[10px] font-black opacity-30 animate-pulse uppercase tracking-widest">
        Loading Jimmy...
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-10 text-center">
      <div className="text-4xl mb-4">☁️</div>
      <p className="text-[12px] font-bold opacity-40 mb-6">記事が見つかりませんでした。</p>
      <Link href="/picnic/jimmy" className="text-[10px] font-black text-[#66BB6A] border-b border-[#66BB6A]">
        BACK TO LIST
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A5D4A] font-sans selection:bg-[#FFDDEE]">
      <header className="p-6 border-b border-[#66BB6A]/10 sticky top-0 bg-[#FAF9F6]/80 backdrop-blur-md z-50">
        <Link href="/picnic/jimmy" className="text-[10px] font-black opacity-50 hover:opacity-100 transition-all flex items-center gap-2 uppercase tracking-widest">
          <span className="w-4 h-4 rounded-full bg-[#4A5D4A] text-white flex items-center justify-center text-[8px]">←</span>
          Back to Jimmy
        </Link>
      </header>

      <main className="max-w-xl mx-auto py-12 px-6">
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10">
            <span className="text-[10px] font-black text-[#D1668B] bg-[#FFDDEE] px-3 py-1 rounded-full tracking-[0.1em] uppercase">
              {post.tag || "JIMI"}
            </span>
            <h1 className="text-3xl font-black mt-4 leading-tight tracking-tight text-[#445544]">
              {post.title}
            </h1>
            <p className="text-[10px] font-bold opacity-30 mt-6 flex items-center gap-2">
              <span className="w-1 h-1 bg-[#66BB6A] rounded-full"></span>
              {new Date(post.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
            </p>
          </div>

          {/* 本文エリア */}
          <div className="prose prose-sm leading-[2.2] text-[#3A4A3A] whitespace-pre-wrap font-medium">
            {post.content}
          </div>

          <footer className="mt-20 pt-10 border-t border-[#66BB6A]/10 text-center">
            <Link href="/picnic/jimmy" className="inline-block px-12 py-4 bg-[#66BB6A] text-white rounded-2xl text-[10px] font-black shadow-lg shadow-[#66BB6A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              コラム一覧に戻る
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}