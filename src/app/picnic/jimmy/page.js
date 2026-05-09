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
    <div className="min-h-screen bg-[#F2F0E9] text-[#5F6F7A] pb-12 animate-in fade-in duration-500">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&family=Cherry+Bomb+One&display=swap');
        .font-cute { font-family: 'Cherry Bomb One', cursive; }
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        body { font-family: 'Zen Maru Gothic', sans-serif; }
      `}</style>

      {/* Header: Exitボタンを大きく、押しやすく */}
      <header className="sticky top-0 z-50 bg-[#F2F0E9]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link 
          href="/picnic/garden" 
          className="flex items-center gap-2 px-4 py-2 -ml-2 bg-white/50 rounded-full border border-white shadow-sm text-[10px] font-black tracking-widest opacity-80 hover:opacity-100 transition-all active:scale-95"
        >
          <span className="text-sm">←</span> GARDEN
        </Link>
        <h1 className="text-[10px] font-black tracking-[0.3em] text-[#B5A773] uppercase">Official Column</h1>
        <div className="w-[70px]" /> {/* バランス調整用のダミー */}
      </header>

      <main className="max-w-md mx-auto px-6">
        {/* Title Section */}
        <div className="mb-10 mt-6 text-center">
          <div className="inline-block bg-[#E3E7D3] text-[#94A684] text-[9px] font-black px-3 py-1 rounded-full mb-3 tracking-widest font-pop">
            OFFICIAL
          </div>
          <h2 className="text-3xl font-cute text-[#94A684] tracking-tight mb-2">
            じみコラム。
          </h2>
          <p className="text-[10px] font-bold opacity-40 tracking-widest">
            ゆる〜く、じわじわ、更新中。
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 w-full bg-white/40 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link href={`/picnic/jimmy/${post.id}`} key={post.id} className="group block">
                  <article className="bg-white/60 p-7 rounded-[3rem] border border-white/80 hover:bg-white transition-all shadow-sm active:scale-[0.98]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[8px] font-black bg-[#FDE7E7] text-[#D19999] px-3 py-1 rounded-full tracking-widest font-pop">
                        {post.tag || "JIMI"}
                      </span>
                      <span className="text-[9px] font-bold opacity-30">
                        {new Date(post.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
                      </span>
                    </div>

                    <h3 className="text-[16px] font-black group-hover:text-[#94A684] transition-colors mb-2 leading-tight tracking-tight">
                      {post.title}
                    </h3>

                    <p className="text-[12px] leading-loose opacity-60 line-clamp-2 font-medium">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-4 flex justify-end">
                      <div className="text-[10px] font-black text-[#94A684] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        よむ <span>❯❯</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 bg-white/20 rounded-[3rem] border-2 border-dashed border-white text-[12px] opacity-30 font-black tracking-widest">
                まだなにもないよ ☁️
              </div>
            )}
          </div>
        )}

        {/* Membership: くすみカラーに変更 & 丸みを強化 */}
        <div className="mt-12 p-8 bg-[#94A684] rounded-[3rem] text-white text-center relative overflow-hidden shadow-lg shadow-[#94A684]/20">
          <div className="relative z-10">
            <div className="font-pop text-[16px] mb-1 tracking-widest">もっと、じみ。</div>
            <p className="text-[10px] font-black mb-6 opacity-80 leading-relaxed tracking-tighter">
              限定記事や裏話は<br/>メンバーシップで配信中！
            </p>
            <button className="w-full py-4 bg-white text-[#94A684] rounded-full text-[11px] font-black tracking-[0.2em] hover:bg-[#F2F0E9] active:scale-95 transition-all shadow-md uppercase">
              Join Membership
            </button>
          </div>
          <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 rotate-12">🌿</div>
        </div>

        <footer className="mt-12 mb-8 text-center">
          <p className="text-[8px] font-black opacity-20 tracking-[0.4em] uppercase">
            © 2026 JIMI COLUMN
          </p>
        </footer>
      </main>
    </div>
  );
}