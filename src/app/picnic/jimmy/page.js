"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function JimmyPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedIds, setLikedIds] = useState([]);
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);

  const supabase = useMemo(() => {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(rawUrl, rawKey);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("jimi_liked_posts");
    if (saved) setLikedIds(JSON.parse(saved));
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

  useEffect(() => { fetchJimmys(); }, [fetchJimmys]);

  const toggleLike = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    let newLikes;
    if (likedIds.includes(id)) {
      newLikes = likedIds.filter(favId => favId !== id);
    } else {
      newLikes = [...likedIds, id];
    }
    setLikedIds(newLikes);
    localStorage.setItem("jimi_liked_posts", JSON.stringify(newLikes));
  };

  const filteredPosts = showOnlyLiked 
    ? posts.filter(p => likedIds.includes(p.id)) 
    : posts;

  // ガタつきや欠けのない滑らかなハート
  const HeartIcon = ({ filled }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={`w-5 h-5 transition-all duration-300 ${filled ? 'fill-[#EAB8B8] stroke-[#EAB8B8]' : 'fill-none stroke-[#EAB8B8]'} `}
      style={{ strokeWidth: '2px', strokeLinecap: 'round', strokeLinejoin: 'round' }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#A8C69F] overflow-x-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&family=Cherry+Bomb+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        .font-cute { font-family: 'Cherry Bomb One', cursive; }
        body { font-family: 'Zen Maru Gothic', sans-serif; color: #7D7474; }
        
        .gingham-sheet {
          background-color: #FFFFFF;
          background-image: 
            linear-gradient(90deg, rgba(234, 184, 184, 0.12) 50%, transparent 50%),
            linear-gradient(rgba(234, 184, 184, 0.12) 50%, transparent 50%);
          background-size: 40px 40px;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EAB8B8; border-radius: 10px; }
      `}</style>

      {/* 左右に芝生が見えるメインシート */}
      <div className="max-w-[95%] mx-auto min-h-screen gingham-sheet shadow-[0_0_60px_rgba(0,0,0,0.1)] relative px-6 sm:px-16 pb-32 flex flex-col">
        
        <header className="sticky top-0 z-50 pt-6 pb-2 flex items-center justify-between">
          {/* 遷移先を /garden に変更 */}
          <Link href="/garden" className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full shadow-sm border border-[#F9EEEE] hover:scale-105 transition-all text-[#A68080]">
            <span className="text-lg">🧺</span>
            <span className="text-[10px] font-black tracking-widest uppercase font-pop">Top</span>
          </Link>

          <button 
            onClick={() => setShowOnlyLiked(!showOnlyLiked)}
            className={`px-5 py-2 rounded-full shadow-sm transition-all border-2 flex items-center gap-2 font-black text-[9px] tracking-widest ${showOnlyLiked ? 'bg-[#EAB8B8] border-white text-white' : 'bg-white border-[#F9EEEE] text-[#EAB8B8]'}`}
          >
            ♡ FAVORITES
          </button>
        </header>

        <main className="max-w-3xl mx-auto pt-10 flex-grow w-full">
          <div className="text-center mb-14">
            <h2 className="font-cute text-[#B59090] text-4xl sm:text-5xl tracking-widest mb-4 opacity-90">
              じみコラム
            </h2>
            <div className="max-w-md mx-auto mb-4">
              <p className="text-[10px] font-bold text-[#B59090]/70 leading-relaxed px-4">
                管理人ののんびり日記帳です。動画づくりの裏話や、<br className="hidden sm:block" />
                ふと思いついたこと、ちょっとしたお喋りなど、マイペースに綴っています。
              </p>
            </div>
            <p className="text-[8px] font-black text-[#B59090]/20 tracking-[0.6em] uppercase">
              Simple moments, gentle stories.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 w-full bg-white/50 rounded-[2.5rem] animate-pulse border border-white" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <button 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="w-full text-left block group"
                  >
                    <article className="bg-white/80 hover:bg-white rounded-[2rem] p-7 sm:p-9 border border-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black bg-[#FDF4F4] text-[#B59090] px-4 py-1.5 rounded-full tracking-widest font-pop border border-[#F9EEEE]">
                          {post.tag || "JIMI"}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-[#7D7474]/30 tracking-widest">
                            {new Date(post.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
                          </span>
                          <div 
                            onClick={(e) => toggleLike(e, post.id)}
                            className="transition-transform hover:scale-110 active:scale-125 cursor-pointer"
                          >
                            <HeartIcon filled={likedIds.includes(post.id)} />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-[#5D5757] mb-3 leading-tight group-hover:text-[#B59090] transition-colors tracking-tight">
                        {post.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#7D7474]/70 font-medium line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-7 flex items-center gap-3 text-[#B59090]/40 font-black text-[9px] tracking-widest uppercase">
                        <div className="h-[1px] flex-1 bg-[#F9EEEE]"></div>
                        <span>Read More</span>
                        <div className="h-[1px] flex-1 bg-[#F9EEEE]"></div>
                      </div>
                    </article>
                  </button>
                ))
              ) : (
                <div className="text-center py-24 text-[#B59090]/30 font-black tracking-widest text-[10px] uppercase border-2 border-dashed border-white rounded-[3rem]">
                  {showOnlyLiked ? "Your favorite tray is empty." : "Still Preparing the table... ☁️"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal - 本のページのようなデザイン */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#4A4444]/20 backdrop-blur-md" onClick={() => setSelectedPost(null)}></div>
          <div className="bg-[#FFFBFA] w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border-[6px] border-white">
            
            <div className="overflow-y-auto custom-scrollbar p-8 sm:p-12">
              <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-[10px] font-bold text-[#B59090]/50 tracking-widest uppercase">
                    {new Date(selectedPost.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
                  </div>
                  <div 
                    onClick={(e) => toggleLike(e, selectedPost.id)}
                    className="cursor-pointer transition-transform hover:scale-110 active:scale-125"
                  >
                    <HeartIcon filled={likedIds.includes(selectedPost.id)} />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#5D5757] leading-snug mb-6 tracking-tight">
                  {selectedPost.title}
                </h3>
                
                <div className="w-10 h-1 bg-[#F2D5D5] rounded-full mb-8"></div>

                <div className="text-sm sm:text-base leading-loose text-[#5D5757]/80 font-medium whitespace-pre-wrap mb-14">
                  {selectedPost.content || selectedPost.excerpt}
                </div>

                <div className="text-center pb-2">
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="group flex flex-col items-center gap-3 mx-auto"
                  >
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F9EEEE] group-hover:scale-105 group-hover:bg-[#FDF4F4] transition-all text-lg">
                      ↩
                    </div>
                    <span className="text-[9px] font-black text-[#B59090] tracking-widest uppercase opacity-60">
                      Back to List
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}