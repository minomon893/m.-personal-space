"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function PicnicPage() {
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSubscription, setShowSubscription] = useState(false); // サブスク案内の表示管理
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. ログインしていない場合は、まずログインが必要（本来はここでTopへ戻すか、Authへ）
    if (!user) {
      router.push("/");
      return;
    }

    // 2. プロフィール取得を試みる
    const { data: profRes, error: profError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // プロフィールがない ＝ まだ加入・セットアップが終わっていない
    if (profError || !profRes) {
      setShowSubscription(true); // サブスク案内（オーバーレイ）を表示
      setLoading(false);
      return;
    }

    // 3. プロフィールがある場合は通常通りメッセージ取得
    setProfile(profRes);
    const { data: msgRes } = await supabase
      .from("messages")
      .select("*, profiles(nickname, icon)")
      .order("created_at", { ascending: false })
      .limit(20);

    setMessages(msgRes || []);
    setShowSubscription(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime_messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchData(); 
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      content: newMessage,
      user_id: user.id
    });

    if (!error) setNewMessage("");
  };

  if (loading) return <div className="p-10 text-center text-[#B5A773] animate-pulse">ピクニック会場へ移動中...</div>;

  return (
    <div className="min-h-screen bg-[#F9F8F3] p-4 pb-24 font-[family-name:var(--font-sans)]">
      
      {/* --- サブスク案内オーバーレイ --- */}
      {showSubscription && (
        <div className="fixed inset-0 z-50 bg-[#F2F0E9] overflow-y-auto flex flex-col items-center p-8 animate-in fade-in duration-500">
          <header className="w-full max-w-md text-center mt-12 mb-16">
            <Link href="/" className="inline-block mb-8 opacity-60 hover:opacity-100 text-xs tracking-widest text-[#5F6F7A]">
              &larr; BACK TO HOME
            </Link>
            <h1 className="text-3xl italic mb-3 text-[#B5A773]">
              M. <span className="font-light">picnic space</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] opacity-70 uppercase leading-relaxed text-[#5F6F7A]">
              自分の部屋をちょっと飛び出して、<br />
              みんなとゆるく繋がる場所
            </p>
          </header>

          <section className="w-full max-w-sm bg-white/50 rounded-[2.5rem] p-8 border border-white/60 shadow-sm mb-12">
            <p className="text-[13px] leading-loose opacity-90 text-center text-[#5F6F7A]">
              「一人の時間は大切だけど、たまには誰かの気配を感じたい」<br />
              そんな時にふらっと立ち寄れるピクニック広場のような場所です。
            </p>
          </section>

          <div className="w-full max-w-sm space-y-6 mb-20 text-[#5F6F7A]">
            <h2 className="text-center text-[11px] font-bold tracking-[0.4em] opacity-40 uppercase mb-8">Contents</h2>
            {[
              { title: "ちょこっとーく", desc: "タイムライン形式のつぶやき場。" },
              { title: "オタトーーーーク！！！", desc: "熱量をさらけ出す趣味の場。" },
              { title: "限定コラム", desc: "ここだけの読み物。" }
            ].map((item, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border-b border-[#B5A773]/20">
                <span className="text-[#B5A773] text-lg">0{index + 1}</span>
                <div>
                  <h3 className="text-sm font-bold mb-1">{item.title}</h3>
                  <p className="text-[11px] opacity-70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-xs text-center pb-12">
            <button 
              onClick={() => router.push("/picnic/setup")} // セットアップへ飛ばす
              className="w-full py-5 bg-[#B5A773] text-white rounded-2xl text-[12px] font-bold tracking-[0.2em] shadow-lg shadow-[#B5A773]/30"
            >
              ピクニックに参加する
            </button>
            <p className="mt-6 text-[9px] opacity-40 text-[#5F6F7A]">
              ※現在はプレビュー期間中のため無料です。
            </p>
          </div>
        </div>
      )}

      {/* --- メインコンテンツ（加入済みの場合のみ表示） --- */}
      {!showSubscription && profile && (
        <>
          {/* プロフィール表示 */}
          <div className="max-w-2xl mx-auto mb-8 bg-white p-6 rounded-[2rem] flex items-center shadow-sm border border-[#F1EFEA]">
            <div className="text-4xl mr-5 shadow-inner bg-[#F9F8F3] w-16 h-16 rounded-[1.5rem] flex items-center justify-center overflow-hidden">
              {profile.icon?.startsWith('http') ? (
                <img src={profile.icon} className="w-full h-full object-cover" alt="icon"/>
              ) : (
                profile.icon || "🌸"
              )}
            </div>
            <div>
              <div className="text-[10px] text-[#B5A773] font-bold tracking-widest uppercase mb-1">{profile.title}</div>
              <div className="font-bold text-[#5F6F7A] text-lg">{profile.nickname}</div>
            </div>
          </div>

          {/* トークエリア */}
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-[#B5A773] font-black text-xs tracking-[0.3em] uppercase mb-6 ml-2">Open Space</h2>
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-5 rounded-[1.8rem] shadow-sm border border-[#F1EFEA] animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#F9F8F3] overflow-hidden mr-3 border border-[#F1EFEA]">
                     {msg.profiles?.icon?.startsWith('http') ? (
                        <img src={msg.profiles.icon} className="w-full h-full object-cover" alt="icon"/>
                      ) : (
                        <span className="flex items-center justify-center h-full text-sm">{msg.profiles?.icon || "🌸"}</span>
                      )}
                  </div>
                  <span className="text-[11px] font-bold text-[#5F6F7A] mr-auto">{msg.profiles?.nickname || "ななし"}</span>
                  <span className="text-[9px] text-[#C1B9AE]">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-[13px] text-[#5F6F7A] leading-loose ml-1">{msg.content}</p>
              </div>
            ))}
          </div>

          {/* 投稿フォーム */}
          <form onSubmit={handleSendMessage} className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto flex gap-3">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 px-6 py-4 rounded-full border border-[#F1EFEA] focus:outline-none focus:ring-2 focus:ring-[#B5A773]/20 bg-white shadow-xl text-sm"
            />
            <button type="submit" className="bg-[#B5A773] text-white w-14 h-14 rounded-full font-bold shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
              <span className="text-xl">＋</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
}