"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, PlusCircle, List, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [poems, setPoems] = useState([]); // 一覧用の状態
  const [loading, setLoading] = useState(false);

  // 一覧を取得する関数
  const fetchPoems = async () => {
    const { data, error } = await supabase
      .from("poems")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPoems(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPoems();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("合言葉が違います");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("poems")
      .insert([{ body, title }]);

    if (error) {
      alert("エラーが発生しました: " + error.message);
    } else {
      setBody("");
      setTitle("");
      fetchPoems(); // 投稿後に一覧を更新
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("本当にこのポエムを削除しますか？")) return;

    const { error } = await supabase
      .from("poems")
      .delete()
      .eq("id", id);

    if (error) {
      alert("削除に失敗しました");
    } else {
      fetchPoems(); // 削除後に一覧を更新
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#E6E1CF] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white/50 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-white">
          <h1 className="text-xl font-bold mb-6 text-[#4F5D6B] text-center tracking-widest">ADMIN ACCESS</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl border border-[#4F5D6B]/20 mb-4 outline-none focus:ring-2 focus:ring-[#B5A773]"
            placeholder="合言葉を入力"
          />
          <button className="w-full py-4 bg-[#4F5D6B] text-white rounded-xl font-bold hover:bg-[#3d4852] transition-all">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1E1] p-6 text-[#4F5D6B] font-sans">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[10px] tracking-widest opacity-50 flex items-center gap-2 mb-8 hover:opacity-100 transition-all">
          <ArrowLeft size={12} /> BACK TO HOME
        </Link>

        <h1 className="text-2xl font-light mb-10 tracking-[0.2em] flex items-center gap-3">
          <PlusCircle size={24} className="text-[#B5A773]" /> 
          NEW POEM
        </h1>

        {/* 投稿フォーム */}
        <form onSubmit={handleSubmit} className="bg-white/40 p-8 rounded-3xl border border-white shadow-sm mb-16">
          <div className="mb-6">
            <label className="block text-[10px] font-bold tracking-widest mb-2 opacity-60">MESSAGE</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/60 border border-[#4F5D6B]/10 h-32 outline-none focus:border-[#B5A773] transition-all"
              placeholder="心に残った言葉を..."
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-[10px] font-bold tracking-widest mb-2 opacity-60">AUTHOR / TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/60 border border-[#4F5D6B]/10 outline-none focus:border-[#B5A773] transition-all"
              placeholder="著者名や出典など"
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-4 bg-[#B5A773] text-white rounded-2xl font-bold shadow-lg hover:bg-[#a39665] disabled:opacity-50 transition-all"
          >
            {loading ? "SAVING..." : "SAVE TO DATABASE"}
          </button>
        </form>

        <h2 className="text-2xl font-light mb-6 tracking-[0.2em] flex items-center gap-3">
          <List size={24} className="text-[#B5A773]" /> 
          DATABASE LIST
        </h2>

        {/* 一覧表示部分 */}
        <div className="space-y-4">
          {poems.length === 0 ? (
            <p className="text-center py-10 opacity-40 italic">まだ登録された言葉はありません</p>
          ) : (
            poems.map((p) => (
              <div key={p.id} className="bg-white/60 p-6 rounded-2xl border border-white flex justify-between items-start group hover:bg-white/80 transition-all">
                <div className="flex-1 pr-4">
                  <p className="text-[14px] leading-relaxed mb-2">{p.body}</p>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">— {p.title || "Unknown"}</p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 text-[#4F5D6B]/20 hover:text-red-400 transition-colors"
                  title="削除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}