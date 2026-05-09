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

  return (
    <div className="min-h-screen bg-[#FAF7F7] animate-in fade-in duration-1000 overflow-x-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&family=Cherry+Bomb+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        .font-cute { font-family: 'Cherry Bomb One', cursive; }
        body { font-family: 'Zen Maru Gothic', sans-serif; color: #7D7474; }
        .gingham-sheet {
          background-color: #FFFFFF;
          background-image: linear-gradient(90deg, rgba(255, 200, 200, 0.03) 50%, transparent 50%),
                            linear-gradient(rgba(255, 200, 200, 0.03) 50%, transparent 50%);
          background-size: 60px 60px;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F2D5D5; border-radius: 10px; }
      `}</style>

      <div className="max-w-[98%] mx-auto min-h-screen gingham-sheet shadow-[0_0_100px_rgba(0,0,0,0.02)] relative px-4 sm:px-12 pb-40 flex flex-col">
        
        <header className="sticky top-0 z-50 pt-8 pb-4 flex items-center justify-between">
          <Link href="/picnic/garden" className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-[#F9EEEE] hover:scale-105 transition-all text-[#A68080]">
            <span className="text-xl">🏡</span>
            <span className="text-[11px] font-black tracking-[0.2em] uppercase font-pop">Garden</span>
          </Link>

          <button 
            onClick={() => setShowOnlyLiked(!showOnlyLiked)}
            className={`px-6 py-3 rounded-full shadow-sm transition-all border-2 flex items-center gap-2 font-black text-[10px] tracking-widest ${showOnlyLiked ? 'bg-[#EAB8B8] border-white text-white' : 'bg-white border-[#F9EEEE] text-[#EAB8B8]'}`}
          >
            {showOnlyLiked ? "❤️ LIKED" : "♡ FAVORITES"}
          </button>
        </header>

        <main className="max-w-4xl mx-auto pt-16 flex-grow w-full">
          <div className="text-center mb-24">
            <h2 className="font-cute text-[#B59090] text-5xl sm:text-7xl tracking-widest mb-6 opacity-90">
              じみコラム
            </h2>
            <p className="text-[11px] font-black text-[#B59090]/40 tracking-[0.5em] uppercase">
              Simple moments, gentle stories.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-16">
              {[1, 2].map((n) => (
                <div key={n} className="h-80 w-full bg-white/40 rounded-[4rem] animate-pulse border border-white" />
              ))}
            </div>
          ) : (
            <div className="space-y-20">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <button 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="w-full text-left block group"
                  >
                    <article className="bg-white/70 hover:bg-white rounded-[4rem] p-10 sm:p-16 border-2 border-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-10">
                        <span className="text-[10px] font-black bg-[#FDF4F4] text-[#B59090] px-6 py-2 rounded-full tracking-[0.2em] font-pop border border-[#F9EEEE]">
                          {post.tag || "JIMI"}
                        </span>
                        <div className="flex items-center gap-6">
                          <span className="text-[11px] font-bold text-[#7D7474]/30 tracking-widest">
                            {new Date(post.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
                          </span>
                          <div 
                            onClick={(e) => toggleLike(e, post.id)}
                            className={`text-2xl transition-transform hover:scale-125 active:scale-150 ${likedIds.includes(post.id) ? 'grayscale-0' : 'grayscale opacity-20'}`}
                          >
                            ❤️
                          </div>
                        </div>
                      </div>

                      <h3 className="text-3xl sm:text-4xl font-bold text-[#5D5757] mb-8 leading-tight group-hover:text-[#B59090] transition-colors tracking-tight">
                        {post.title}
                      </h3>
                      <p className="text-lg leading-[2] text-[#7D7474]/70 font-medium line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="mt-12 flex items-center gap-4 text-[#B59090]/40 font-black text-[10px] tracking-[0.3em] uppercase">
                        <div className="h-[1px] flex-1 bg-[#F9EEEE]"></div>
                        <span>Click to read</span>
                        <div className="h-[1px] flex-1 bg-[#F9EEEE]"></div>
                      </div>
                    </article>
                  </button>
                ))
              ) : (
                <div className="text-center py-40 text-[#B59090]/30 font-black tracking-widest text-sm uppercase border-4 border-dashed border-white rounded-[5rem]">
                  {showOnlyLiked ? "Your favorite tray is empty." : "Still Preparing the table... ☁️"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-[#4A4444]/10 backdrop-blur-lg" onClick={() => setSelectedPost(null)}></div>
          <div className="bg-[#FFFBFA] w-full max-w-4xl rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] border-[12px] border-white">
            
            <div className="overflow-y-auto custom-scrollbar p-8 sm:p-20">
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                  <div className="text-[11px] font-bold text-[#B59090]/50 tracking-[0.4em] uppercase">
                    {new Date(selectedPost.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
                  </div>
                  <div 
                    onClick={(e) => toggleLike(e, selectedPost.id)}
                    className={`text-3xl cursor-pointer transition-transform hover:scale-110 active:scale-150 ${likedIds.includes(selectedPost.id) ? 'grayscale-0' : 'grayscale opacity-20'}`}
                  >
                    ❤️
                  </div>
                </div>

                <h3 className="text-4xl sm:text-5xl font-bold text-[#5D5757] leading-[1.3] mb-12 tracking-tight">
                  {selectedPost.title}
                </h3>
                
                <div className="w-20 h-1.5 bg-[#F2D5D5] rounded-full mb-16"></div>

                <div className="text-lg sm:text-xl leading-[2.4] text-[#5D5757]/80 font-medium whitespace-pre-wrap mb-24">
                  {selectedPost.content || selectedPost.excerpt}
                </div>

                <div className="text-center pb-10">
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="group flex flex-col items-center gap-4 mx-auto"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border border-[#F9EEEE] group-hover:scale-110 group-hover:bg-[#FDF4F4] transition-all text-xl">
                      ↩
                    </div>
                    <span className="text-[10px] font-black text-[#B59090] tracking-[0.5em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
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