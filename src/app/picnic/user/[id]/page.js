"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [targetProfile, setTargetProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
    return createBrowserClient(rawUrl, rawKey);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profErr) throw profErr;
        setTargetProfile(prof);

        // talk_posts（ちょこっとーく）と otaku_posts（オタトーーーク！！！）の両方から取得して結合
        const [{ data: talkPosts }, { data: otakuPosts }] = await Promise.all([
          supabase.from("talk_posts").select("*").eq("user_id", id),
          supabase.from("otaku_posts").select("*").eq("user_id", id)
        ]);

        const combinedPosts = [
          ...(talkPosts?.map(p => ({ ...p, is_otaku: false })) || []),
          ...(otakuPosts?.map(p => ({ ...p, is_otaku: true })) || [])
        ];

        // 作成日時の新しい順にソートしてステートにセット
        setPosts(combinedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        loading && setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id, supabase]);

  if (loading) return <div className="p-10 text-center">Loading picnic...</div>;
  if (!targetProfile) return <div className="p-10 text-center">User not found.</div>;

  return (
    <div className="min-h-screen bg-[#F0F7EE] p-8">
      <button onClick={() => router.back()} className="mb-8 text-[#94A684] font-bold hover:underline">
        ← Back to Garden
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 shadow-xl text-center mb-10">
        <div className="w-24 h-24 bg-gray-100 rounded-[2rem] mx-auto mb-4 overflow-hidden flex items-center justify-center border-4 border-[#E2F0D9]">
          {targetProfile.avatar_url ? (
            <img 
              src={targetProfile.avatar_url} 
              className="w-full h-full object-cover"
              alt=""
            />
          ) : (
            <span className="text-4xl">🍃</span>
          )}
        </div>
        <h1 className="text-2xl font-black text-[#5F6F7A]">{targetProfile.nickname}</h1>
        <p className="text-[#B5A773] mt-2 italic">"{targetProfile.status_message}"</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-[#7A8C69] font-black uppercase tracking-widest text-sm px-4">Recent Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => {
            // ★ ここでリンク先を判定 ★
            // 投稿データの中に "is_otaku" などのフラグがある場合の例です
            // なければ、とりあえず現在のアプリのパス構造に合わせて変更してください
            const destination = post.is_otaku ? "/otatalk" : "/talk"; 

            return (
              <Link 
                key={post.id} 
                href={`${destination}?postId=${post.id}`} // 判定した宛先にIDを持って飛ぶ
                className="block bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-white hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                   <p className="text-[#5F6F7A] leading-relaxed flex-1">{post.content}</p>
                   {/* どっちの投稿かラベルをつけておくと親切です */}
                   <span className="text-[8px] px-2 py-1 rounded-full bg-[#E2F0D9] text-[#7A8C69] ml-2">
                     {post.is_otaku ? "オタトーーーク" : "ちょこっとーく"}
                   </span>
                </div>
                <span className="text-[10px] text-[#94A684] block mt-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </Link>
            );
          })
        ) : (
          <p className="text-center text-[#94A684] py-10 opacity-60">まだ投稿がありません 🧺</p>
        )}
      </div>
    </div>
  );
}