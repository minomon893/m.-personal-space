"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function JimmyPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const cleanUrl = rawUrl.trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const cleanKey = rawKey.trim().replace(/['"]+/g, "");
    return createBrowserClient(cleanUrl, cleanKey);
  }, []);

  const fetchJimmys = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jimmys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchJimmys();
  }, [fetchJimmys]);

  return (
    <div className="min-h-screen bg-[#FAF9F0] text-[#445544] pb-8 selection:bg-[#FFDDEE] font-main">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&family=Cherry+Bomb+One&display=swap');
        .font-cute { font-family: 'Cherry Bomb One', cursive; }
        .font-pop { font-family: 'Mochiypop+One', sans-serif; }
        .font-main { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      {/* Navigation: リンク先を /picnic/garden に修正 & タイトに */}
      <nav className="sticky top-0 z-50 bg-[#FAF9F0]/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-[#445544]/5">
        <Link 
          href="/picnic/garden" 
          className="flex items-center gap-1.5 text-[10px] font-black opacity-60 hover:opacity-100 transition-all"
        >
          <span className="w-5 h-5 rounded-full bg-[#445544] text-white flex items-center justify-center text-[8px]">
            ←
          </span>
          GARDEN
        </Link>
        <div className="font-cute text-[#66BB6A] text-xs tracking-tighter">
          じみコラム
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4">
        {/* Title Section: 余白を極限まで削る */}
        <div className="mb-6 mt-4 text-center">
          <div className="inline-block bg-[#E8F5E9] text-[#66BB6A] text-[9px] font-black px-2 py-0.5 rounded-md mb-1 font-pop">
            OFFICIAL
          </div>
          <h2 className="text-2xl font-cute text-[#445544] tracking-tight">
            じみコラム。
          </h2>
          <p className="text-[9px] font-bold opacity-30 tracking-tighter mt-0.5">
            ゆる〜く、じわじわ、更新中。
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 w-full bg-white/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link href={`/picnic/jimmy/${post.id}`} key={post.id} className="group block">
                  <article className="bg-white p-4 rounded-[1.5rem] border-2 border-[#66BB6A]/5 hover:border-[#66BB6A]/20 transition-all shadow-sm active:scale-[0.98]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] font-black bg-[#FFDDEE] text-[#D1668B] px-2 py-0.5 rounded-full font-pop">
                        {post.tag || "JIMI"}
                      </span>
                      <span className="text-[9px] font-bold opacity-20">
                        {new Date(post.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-900 group-hover:text-[#66BB6A] transition-colors mb-1 leading-tight tracking-tight">
                      {post.title}
                    </h3>

                    <p className="text-[11px] leading-relaxed opacity-50 line-clamp-2 font-medium">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-2 flex justify-end">
                      <div className="text-[8px] font-cute text-[#66BB6A] transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        みる ❯❯
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 bg-white/30 rounded-[2rem] border border-dashed border-[#445544]/10 text-[11px] opacity-30 font-bold">
                まだなにもないよ ☁️
              </div>
            )}
          </div>
        )}

        {/* Membership: さらにコンパクトに */}
        <div className="mt-8 p-5 bg-[#66BB6A] rounded-[2rem] text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="font-pop text-[14px] mb-0.5">もっと、じみ。</div>
            <p className="text-[9px] font-bold mb-4 opacity-80 leading-tight">
              限定記事はメンバーシップで！
            </p>
            <button className="w-full py-2.5 bg-white text-[#66BB6A] rounded-xl text-[10px] font-black tracking-tighter hover:bg-[#FAF9F0] transition-colors shadow-md">
              JOIN MEMBERSHIP
            </button>
          </div>
          <div className="absolute -bottom-2 -right-2 text-4xl opacity-10">🌿</div>
        </div>

        <footer className="mt-8 mb-4 text-center">
          <p className="text-[7px] font-black opacity-10 tracking-[0.3em] uppercase">
            © 2026 JIMI COLUMN
          </p>
        </footer>
      </main>
    </div>
  );
}