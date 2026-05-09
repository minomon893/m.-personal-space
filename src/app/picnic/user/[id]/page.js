"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function UserProfilePage() {
  const { id } = useParams(); // URLの [id] 部分を取得
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
        // 1. そのユーザーのプロフィールを取得
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profErr) throw profErr;
        setTargetProfile(prof);

        // 2. そのユーザーの投稿（postsテーブルと想定）を取得
        // テーブル名やカラム名はご自身の環境に合わせて調整してください
        const { data: postData, error: postErr } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false });

        if (!postErr) setPosts(postData);

      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id, supabase]);

  if (loading) return <div className="p-10 text-center">Loading picnic...</div>;
  if (!targetProfile) return <div className="p-10 text-center">User not found.</div>;

  return (
    <div className="min-h-screen bg-[#F0F7EE] p-8">
      {/* 戻るボタン */}
      <button onClick={() => router.back()} className="mb-8 text-[#94A684] font-bold">
        ← Back to Garden
      </button>

      {/* プロフィール表示部分 */}
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 shadow-xl text-center mb-10">
        <div className="w-24 h-24 bg-gray-100 rounded-[2rem] mx-auto mb-4 overflow-hidden flex items-center justify-center border-4 border-[#E2F0D9]">
          {targetProfile.avatar_url ? (
            <img 
              src={supabase.storage.from('avatars').getPublicUrl(targetProfile.avatar_url).data.publicUrl} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">🍃</span>
          )}
        </div>
        <h1 className="text-2xl font-black text-[#5F6F7A]">{targetProfile.nickname}</h1>
        <p className="text-[#B5A773] mt-2 italic">"{targetProfile.status_message}"</p>
      </div>

      {/* 投稿一覧部分 */}
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-[#7A8C69] font-black uppercase tracking-widest text-sm px-4">Recent Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-white">
              <p className="text-[#5F6F7A]">{post.content}</p>
              <span className="text-[10px] text-[#94A684] block mt-2">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-[#94A684] py-10 opacity-60">まだ投稿がありません 🧺</p>
        )}
      </div>
    </div>
  );
}