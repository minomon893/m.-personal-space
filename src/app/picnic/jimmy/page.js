"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export default function JimmyPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedIds, setLikedIds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); 
  const [showOnlyLiked, setShowOnlyLiked] = useState(false);
  const [viewedIds, setViewedIds] = useState([]);

  // プロフィール用ステート
  const [profile, setProfile] = useState(null);
  const [daysCount, setDaysCount] = useState(0);

  const supabase = useMemo(() => {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(rawUrl, rawKey);
  }, []);

  // 画像URL変換関数
  const getFullImageUrl = useCallback((path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:') || path.length < 5) return path;
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, "");
    const cleanPath = path.replace(/^talkimage\//, "");
    return `${supabaseUrl}/storage/v1/object/public/talkimage/${cleanPath}`;
  }, []);

  // 経過日数計算
  const calcDays = useCallback((dateStr) => {
    const createdDate = new Date(dateStr || new Date());
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    setDaysCount(diffDays);
  }, []);

  // 初期読み込み＆プロフィールキャッシュ取得
  useEffect(() => {
    const savedLikes = localStorage.getItem("jimi_liked_posts");
    if (savedLikes) setLikedIds(JSON.parse(savedLikes));
    
    const savedViewed = localStorage.getItem("jimi_viewed_posts");
    if (savedViewed) setViewedIds(JSON.parse(savedViewed));

    const savedProfile = localStorage.getItem("picnic_user_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        calcDays(parsed.created_at);
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }
  }, [calcDays]);

  // コラム一覧取得
  const fetchJimmys = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("jimmys")
        .select("*")
        .order("created_at", { ascending: true }); 
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // プロフィールをDBから追従取得
  useEffect(() => {
    fetchJimmys();

    const fetchProfileData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profRes } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profRes) {
          setProfile(profRes);
          localStorage.setItem("picnic_user_profile", JSON.stringify(profRes));
          calcDays(profRes.created_at);
        }
      } catch (e) {
        console.error("Profile fetch error in jimmy page:", e);
      }
    };
    fetchProfileData();
  }, [supabase, fetchJimmys, calcDays]);

  // 通常ページのカウント（特別ページ用に+1する前の最大値）
  const baseTotalPagesPC = Math.ceil(posts.length / 2);
  const baseTotalPagesMobile = posts.length;

  // 特別ページ（プロフィール）を含めた最大ページ数
  const totalPagesPC = baseTotalPagesPC + 1;
  const totalPagesMobile = baseTotalPagesMobile + 1;

  const hasNewPost = useMemo(() => {
    if (posts.length === 0) return false;
    const latestPost = posts[posts.length - 1];
    return !viewedIds.includes(latestPost.id);
  }, [posts, viewedIds]);

  // 既読処理
  useEffect(() => {
    if (!isOpen || posts.length === 0) return;
    
    const markAsViewed = (post) => {
      if (post && !viewedIds.includes(post.id)) {
        const newViewed = [...viewedIds, post.id];
        setViewedIds(newViewed);
        localStorage.setItem("jimi_viewed_posts", JSON.stringify(newViewed));
      }
    };

    if (window.innerWidth < 640) {
      // 特別ページ以外かつインデックス（0）以外のとき
      if (currentPage > 0 && currentPage <= baseTotalPagesMobile) {
        markAsViewed(posts[currentPage - 1]);
      }
    } else {
      if (currentPage > 0 && currentPage <= baseTotalPagesPC) {
        markAsViewed(posts[(currentPage - 1) * 2]);
        markAsViewed(posts[(currentPage - 1) * 2 + 1]);
      }
    }
  }, [currentPage, isOpen, posts, viewedIds, baseTotalPagesPC, baseTotalPagesMobile]);

  const toggleLike = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    let newLikes = likedIds.includes(id) 
      ? likedIds.filter(favId => favId !== id) 
      : [...likedIds, id];
    setLikedIds(newLikes);
    localStorage.setItem("jimi_liked_posts", JSON.stringify(newLikes));
  };

  const displayedPostsInIndex = showOnlyLiked 
    ? posts.filter(p => likedIds.includes(p.id)) 
    : posts;

  // アイコンレンダリングコンポーネント
  const RenderIcon = ({ user, sizeClass = "w-24 h-24", textClass = "text-3xl" }) => {
    const [imgError, setImgError] = useState(false);
    const rawPath = user?.avatar_url || user?.icon || user?.avatar;
    const imageUrl = getFullImageUrl(rawPath);
    const isEmoji = rawPath && rawPath.length < 5;
    const shouldShowImage = imageUrl && imageUrl.startsWith('http') && !imgError && !isEmoji;

    return (
      <div className={`${sizeClass} bg-white rounded-[2.5rem] overflow-hidden flex items-center justify-center border-[3px] border-white shadow-sm flex-shrink-0 transition-transform active:scale-95`}>
        {shouldShowImage ? (
          <img 
            src={imageUrl} 
            className="w-full h-full object-cover" 
            alt="" 
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={`${textClass} leading-none select-none`}>
            {isEmoji ? rawPath : "🍃"}
          </span>
        )}
      </div>
    );
  };

  // 栞コンポーネント
  const Bookmark = ({ isClosed, currentPage, totalPagesMobile, totalPagesPC }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxPage = isMobile ? totalPagesMobile : totalPagesPC;
    const isSpecialPage = isOpen && currentPage === maxPage;
    const isAtLatest = isOpen && !isSpecialPage && currentPage === (isMobile ? baseTotalPagesMobile : baseTotalPagesPC);
    const isLatestOnRight = posts.length % 2 === 0;

    let positionClass = "";
    
    if (isClosed) {
      // 本が閉じている時：表紙の裏側、上部に20pxはみ出す位置
      positionClass = "top-[-20px] left-[65%] h-[60px] z-0 opacity-100 border-b-[12px] border-b-transparent after:bottom-[-12px] after:border-b-transparent after:border-l-[#EAB8B8] after:border-r-[#EAB8B8]";
    } else if (isSpecialPage) {
      // 特別ページ（プロフィール）表示中：通常ページを読んでいる時の「top-[-15px]」のサイズ・位置感に完全一致。
      // かつ、背面（z-0）に回すことで、本の下に隠れる部分は被ってピシッと切れます。
      positionClass = `top-[-15px] h-[220px] z-0 opacity-100 border-b-[12px] border-b-transparent after:bottom-[-12px] after:border-b-transparent after:border-l-[#EAB8B8] after:border-r-[#EAB8B8] ${
        isMobile 
          ? "right-4 translate-x-0" 
          : isLatestOnRight 
            ? "left-1/2 translate-x-0" 
            : "left-1/2 -translate-x-full"
      }`;
    } else if (isAtLatest) {
      // 最新ページ表示中：通常ページを読んでいる時の「top-[-15px]」のサイズ・位置感に完全一致。
      // 紙の上に乗るため z-50 と影を設定します。
      positionClass = `top-[-15px] h-[220px] z-50 shadow-md opacity-100 border-b-[12px] border-b-transparent after:bottom-[-12px] after:border-b-transparent after:border-l-[#EAB8B8] after:border-r-[#EAB8B8] ${
        isMobile 
          ? "right-4 translate-x-0" 
          : isLatestOnRight 
            ? "left-1/2 translate-x-0" 
            : "left-1/2 -translate-x-full"
      }`;
    } else {
      // 前のページ（目次など）を読んでいる時：後ろに挟まっているので裏側へ（z-0）
      positionClass = `top-[-15px] h-[220px] z-0 opacity-100 border-b-[12px] border-b-transparent after:bottom-[-12px] after:border-b-transparent after:border-l-[#EAB8B8] after:border-r-[#EAB8B8] ${
        isMobile ? "right-4" : isLatestOnRight ? "left-1/2" : "left-1/2 -translate-x-full"
      }`;
    }

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
          // 閉じている時、または特別ページにいる時は「最新ページ」へジャンプ。それ以外の時は「最新ページ / 特別ページ」のトグル移動が可能
          if (isClosed || isSpecialPage) {
            setCurrentPage(isMobile ? baseTotalPagesMobile : baseTotalPagesPC);
          } else {
            setCurrentPage(maxPage);
          }
        }}
        className={`absolute cursor-pointer transition-all duration-700 ease-in-out w-8 bg-[#EAB8B8] border-x border-x-white/10 after:content-[''] after:absolute after:left-0 after:border-l-[16px] after:border-r-[16px] ${
          hasNewPost ? 'animate-bookmark-glow' : ''
        } ${positionClass}`}
      >
        <div className="w-full h-full border-x border-white/10" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F7EE] relative overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght=500;700;900&family=Mochiypop+One&family=Cherry+Bomb+One&display=swap');
        
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        .font-cute { font-family: 'Cherry Bomb One', cursive; }
        body { font-family: 'Zen Maru Gothic', sans-serif; color: #7D7474; }

        .gingham-pink {
          background-color: #FFF5F7;
          background-image:
            linear-gradient(90deg, rgba(255, 182, 193, 0.3) 50%, transparent 50%),
            linear-gradient(rgba(255, 182, 193, 0.3) 50%, transparent 50%);
          background-size: 60px 60px;
        }

        .book-shadow {
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }
        .page-left { border-right: 1px solid rgba(0,0,0,0.05); }

        @keyframes bookmark-glow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(234, 184, 184, 0.5)); }
          50% { filter: drop-shadow(0 0 12px rgba(234, 184, 184, 0.9)); transform: translateY(4px); }
        }
        .animate-bookmark-glow {
          animation: bookmark-glow 3s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-[96%] mx-auto min-h-screen gingham-pink shadow-[0_0_80px_rgba(0,0,0,0.05)] relative flex flex-col items-center justify-center py-10 sm:py-20">
        
        <header className="fixed top-6 left-[6%] z-50 pointer-events-none">
          <Link href="/picnic/garden" className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-5 py-2 rounded-full shadow-sm border border-[#FFE4E9] hover:scale-105 transition-all text-[#B59090]">
            <span className="text-lg">🧺</span>
            <span className="text-[10px] font-black tracking-widest uppercase font-pop">Top</span>
          </Link>
        </header>

        <div className="relative w-full max-w-5xl aspect-[0.7/1] sm:aspect-[1.6/1] px-2 sm:px-4">
          
          <Bookmark 
            isClosed={!isOpen}
            currentPage={currentPage}
            totalPagesMobile={totalPagesMobile}
            totalPagesPC={totalPagesPC}
          />

          {!isOpen ? (
            <div 
              onClick={() => setIsOpen(true)}
              className="absolute inset-0 m-auto w-[90%] sm:w-[80%] max-w-md aspect-[0.7/1] bg-[#FFFBFB] rounded-r-3xl rounded-l-md border-y-4 sm:border-y-8 border-r-4 sm:border-r-8 border-white book-shadow cursor-pointer hover:rotate-[-1deg] transition-transform flex flex-col items-center justify-center text-center p-8 z-10"
            >
              <div className="w-16 h-16 mb-8 text-[#EAB8B8] opacity-40"><BookOpen size={64} /></div>
              <h1 className="font-cute text-[#B59090] text-3xl sm:text-4xl mb-6 leading-relaxed">じみコラム</h1>
              <p className="text-xs sm:text-sm font-bold text-[#7D7474]/60 tracking-widest">— 地味で愛しいソロ生活 —</p>
              <div className="mt-12 text-[10px] text-[#B59090]/40 font-black tracking-[0.4em] uppercase">Click to open</div>
            </div>
          ) : (
            <div className="w-full h-full bg-[#FFFBFA] rounded-xl flex overflow-hidden book-shadow border-[4px] sm:border-[6px] border-white relative z-10">
              
              {/* PC用見開き表示 */}
              <div className="hidden sm:flex w-full h-full relative z-10">
                {/* 左ページ */}
                <div className="flex-1 p-14 overflow-y-auto page-left bg-white/60 relative z-10">
                  {currentPage === 0 ? (
                    <div className="h-full flex flex-col justify-center">
                      <div className="space-y-6">
                        <p className="text-[10px] font-bold leading-loose text-[#B59090]/60">
                          日々の地味な出来事を<br />
                          一頁ずつ綴っています。
                        </p>
                      </div>
                    </div>
                  ) : currentPage === totalPagesPC ? (
                    /* 特別ページの左側 */
                    <div className="h-full flex flex-col justify-center text-center p-4">
                      <span className="text-4xl mb-4 animate-bounce">🌿</span>
                      <h3 className="font-cute text-[#B59090] text-xl mb-2">管理人プロフィール</h3>
                      <p className="text-[11px] leading-relaxed opacity-70 font-bold">
                        いつも広場を大切にしてくれてありがとうございます。<br />
                        ここは私の小さなお部屋の裏書きです。
                      </p>
                    </div>
                  ) : (
                    <ColumnContent post={posts[(currentPage - 1) * 2]} likedIds={likedIds} toggleLike={toggleLike} viewedIds={viewedIds} />
                  )}
                </div>

                {/* 右ページ */}
                <div className="flex-1 p-14 overflow-y-auto bg-white/40 relative z-10">
                  {currentPage === 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-8 border-b border-[#FFE4E9] pb-4">
                        <h2 className="font-cute text-[#B59090] text-2xl">
                          {showOnlyLiked ? "おきにいり" : "もくじ"}
                        </h2>
                        <button 
                          onClick={() => setShowOnlyLiked(!showOnlyLiked)}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-cute tracking-widest transition-all border-2 ${
                            showOnlyLiked 
                            ? 'bg-[#EAB8B8] border-white text-white' 
                            : 'bg-white border-[#FFE4E9] text-[#EAB8B8]'
                          }`}
                        >
                          <Heart size={12} fill={showOnlyLiked ? "white" : "none"} />
                          Filter
                        </button>
                      </div>
                      <div className="space-y-4">
                        {displayedPostsInIndex.length > 0 ? (
                          displayedPostsInIndex.map((post) => {
                            const originalIdx = posts.findIndex(p => p.id === post.id);
                            const isNew = !viewedIds.includes(post.id);
                            return (
                              <button 
                                key={post.id}
                                onClick={() => setCurrentPage(Math.floor(originalIdx / 2) + 1)}
                                className="w-full text-left text-xs font-bold text-[#7D7474] hover:text-[#EAB8B8] transition-colors flex items-center gap-3 group"
                              >
                                <span className="opacity-20 font-pop">{String(originalIdx + 1).padStart(2, '0')}</span>
                                <span className="line-clamp-1 border-b border-transparent group-hover:border-[#EAB8B8]">{post.title}</span>
                                {isNew && <span className="text-[8px] bg-[#EAB8B8] text-white px-1.5 py-0.5 rounded-sm font-pop scale-90">NEW</span>}
                                {likedIds.includes(post.id) && <Heart size={10} fill="#EAB8B8" className="text-[#EAB8B8] ml-auto" />}
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-[10px] font-bold text-[#B59090]/40 mt-10 text-center uppercase tracking-widest">
                            No items found.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : currentPage === totalPagesPC ? (
                    /* 特別ページの右側（プロフィールカード） */
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                      {profile && (
                        <div className="w-[280px] min-h-[420px] bg-white/95 backdrop-blur-md pt-10 pb-8 px-8 rounded-[4.5rem] shadow-xl border-2 border-white flex flex-col items-center text-center gap-5 relative">
                          <div onClick={() => router.push('/picnic/me')} className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
                            <RenderIcon user={profile} sizeClass="w-32 h-32" textClass="text-5xl" />
                          </div>
                          
                          <div className="space-y-3 w-full">
                            <span className="text-[9px] font-black bg-[#A8C69F] text-white px-5 py-2 rounded-full uppercase tracking-widest inline-block">
                              {profile.title || "Resident"}
                            </span>
                            <h2 onClick={() => router.push('/picnic/me')} className="text-xl font-black text-[#5F6F7A] tracking-tight cursor-pointer hover:text-[#A8C69F] transition-colors">
                              {profile.username || "Anonymous"}
                            </h2>
                            <p className="text-[10px] tracking-widest font-bold text-[#94A684]/60 uppercase">
                              Day {daysCount} in space
                            </p>
                          </div>

                          <div className="w-full bg-[#F4F7F2] rounded-[2rem] p-5 border border-white/60 min-h-[80px] flex items-center justify-center">
                            <p className="text-[11px] leading-relaxed font-bold text-[#5F6F7A]/80 whitespace-pre-wrap">
                              {profile.status_message || "のんびりピクニック中..."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ColumnContent post={posts[(currentPage - 1) * 2 + 1]} likedIds={likedIds} toggleLike={toggleLike} viewedIds={viewedIds} />
                  )}
                </div>
              </div>

              {/* スマホ用単一ページ表示 */}
              <div className="sm:hidden w-full h-full overflow-y-auto p-6 bg-white/50 relative z-10">
                {currentPage === 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-6 border-b border-[#FFE4E9] pb-4">
                      <h2 className="font-cute text-[#B59090] text-xl">
                        {showOnlyLiked ? "お気に入り" : "目次"}
                      </h2>
                      <button 
                        onClick={() => setShowOnlyLiked(!showOnlyLiked)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-cute tracking-widest border-2 ${
                          showOnlyLiked ? 'bg-[#EAB8B8] border-white text-white' : 'bg-white border-[#FFE4E9] text-[#EAB8B8]'
                        }`}
                      >
                        <Heart size={10} fill={showOnlyLiked ? "white" : "none"} />
                        Filter
                      </button>
                    </div>
                    <div className="space-y-4">
                      {displayedPostsInIndex.map((post) => {
                        const originalIdx = posts.findIndex(p => p.id === post.id);
                        const isNew = !viewedIds.includes(post.id);
                        return (
                          <button 
                            key={post.id}
                            onClick={() => setCurrentPage(originalIdx + 1)}
                            className="w-full text-left text-xs font-bold text-[#7D7474] flex items-center gap-3"
                          >
                            <span className="opacity-20 font-pop">{String(originalIdx + 1).padStart(2, '0')}</span>
                            <span className="line-clamp-1">{post.title}</span>
                            {isNew && <span className="text-[8px] bg-[#EAB8B8] text-white px-1.5 py-0.5 rounded-sm font-pop scale-90">NEW</span>}
                            {likedIds.includes(post.id) && <Heart size={10} fill="#EAB8B8" className="text-[#EAB8B8] ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : currentPage === totalPagesMobile ? (
                  /* スマホ用特別ページ表示 */
                  <div className="h-full flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                    {profile && (
                      <div className="w-[260px] min-h-[400px] bg-white/95 backdrop-blur-md pt-8 pb-6 px-6 rounded-[4.5rem] shadow-xl border-2 border-white flex flex-col items-center text-center gap-4 relative">
                        <div onClick={() => router.push('/picnic/me')} className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
                          <RenderIcon user={profile} sizeClass="w-28 h-28" textClass="text-4xl" />
                        </div>
                        
                        <div className="space-y-2 w-full">
                          <span className="text-[9px] font-black bg-[#A8C69F] text-white px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">
                            {profile.title || "Resident"}
                          </span>
                          <h2 onClick={() => router.push('/picnic/me')} className="text-lg font-black text-[#5F6F7A] tracking-tight cursor-pointer hover:text-[#A8C69F] transition-colors">
                            {profile.username || "Anonymous"}
                          </h2>
                          <p className="text-[9px] tracking-widest font-bold text-[#94A684]/60 uppercase">
                            Day {daysCount} in space
                          </p>
                        </div>

                        <div className="w-full bg-[#F4F7F2] rounded-[2rem] p-4 border border-white/60 min-h-[70px] flex items-center justify-center">
                          <p className="text-[11px] leading-relaxed font-bold text-[#5F6F7A]/80 whitespace-pre-wrap">
                            {profile.status_message || "のんびりピクニック中..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <ColumnContent post={posts[currentPage - 1]} likedIds={likedIds} toggleLike={toggleLike} viewedIds={viewedIds} />
                )}
              </div>

              {/* ナビゲーションボタン */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 sm:px-10 pointer-events-none z-50">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
                  className={`pointer-events-auto w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#B59090] active:scale-95 transition-transform ${currentPage === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => {
                    const max = typeof window !== 'undefined' && window.innerWidth < 640 ? totalPagesMobile : totalPagesPC;
                    setCurrentPage(prev => Math.min(max, prev + 1));
                  }} 
                  className={`pointer-events-auto w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#B59090] active:scale-95 transition-transform ${
                    currentPage === (typeof window !== 'undefined' && window.innerWidth < 640 ? totalPagesMobile : totalPagesPC) ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <button 
                onClick={() => { setIsOpen(false); setCurrentPage(0); setShowOnlyLiked(false); }} 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto text-[9px] font-black text-[#B59090]/40 tracking-widest uppercase hover:text-[#B59090] transition-colors z-50"
              >
                Close Book
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-[10px] font-bold text-[#7D7474]/40 tracking-[0.4em] uppercase relative">
          Simple moments, gentle stories.
        </p>
      </div>
    </div>
  );
}

function ColumnContent({ post, likedIds, toggleLike, viewedIds = [] }) {
  if (!post) return (
    <div className="h-full flex items-center justify-center opacity-10">
      <BookOpen size={40} className="text-[#B59090]" />
    </div>
  );

  const isNew = !viewedIds.includes(post.id);
  
  return (
    <article className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[9px] font-black bg-[#FFFBFB] text-[#B59090] px-3 py-1 rounded-full border border-[#FFE4E9]">
          {post.tag || "JIMI"}
        </span>
        <button 
          onClick={(e) => toggleLike(e, post.id)} 
          className="text-[#EAB8B8] hover:scale-110 transition-transform"
        >
          <Heart size={18} fill={likedIds.includes(post.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-[#5D5757] leading-snug">{post.title}</h3>
        {isNew && <span className="text-[8px] bg-[#EAB8B8] text-white px-2 py-0.5 rounded-sm font-pop shrink-0">NEW</span>}
      </div>
      <div className="text-[10px] text-[#7D7474]/30 mb-6 tracking-widest font-bold">
        {new Date(post.created_at).toLocaleDateString("ja-JP").replace(/\//g, '.')}
      </div>
      <div className="text-xs sm:text-sm leading-loose text-[#5D5757]/80 whitespace-pre-wrap pb-20">
        {post.content || post.excerpt}
      </div>
    </article>
  );
}