"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, BookOpen, Bell, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("notice");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  // パスワードチェック
  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
    
    if (passwordInput === correctPassword) {
      setIsAuthorized(true);
      sessionStorage.setItem("admin_auth", "true"); // ブラウザを閉じるまで有効
    } else {
      alert("合言葉が違います。");
    }
  };

  // リロード時もセッションがあればログイン状態を維持
  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const isNotice = activeTab === "notice";
      const tableName = isNotice ? "notices" : "poems";
      const insertData = isNotice 
        ? { title: formData.title, content: formData.content }
        : { title: formData.title, body: formData.content };

      const { error } = await supabase.from(tableName).insert([insertData]);
      if (error) throw error;

      setStatus("success");
      setFormData({ title: "", content: "" });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      alert("エラーが発生しました: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ロック画面
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#E6E1CF] flex items-center justify-center p-6 text-[#5F6F7A]">
        <div className="max-w-sm w-full text-center">
          <Lock size={40} className="mx-auto mb-6 opacity-20" />
          <h1 className="text-lg font-[var(--font-serif)] italic mb-8">Unauthorized Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-white/45 border border-white/40 rounded-2xl p-4 text-center outline-none focus:ring-2 focus:ring-[#B5A773]/20 transition-all"
              placeholder="合言葉を入力..."
            />
            <button type="submit" className="w-full py-4 bg-[#5F6F7A] text-white rounded-2xl font-bold text-[11px] tracking-widest uppercase">
              Enter Studio
            </button>
          </form>
          <Link href="/menu" className="block mt-10 text-[9px] tracking-widest opacity-40 hover:opacity-100 uppercase transition-all">
            Return to Space
          </Link>
        </div>
      </div>
    );
  }

  // ログイン後の管理画面（以前のコードに少し装飾を追加）
  return (
    <div className="min-h-screen bg-[#E6E1CF] p-6 text-[#5F6F7A] font-sans">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/menu" className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-all">
            <ArrowLeft size={12} /> Exit
          </Link>
          <button onClick={() => { sessionStorage.clear(); setIsAuthorized(false); }} className="text-[9px] font-bold opacity-30 hover:opacity-60 uppercase tracking-tighter">Logout</button>
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-xl font-[var(--font-serif)] italic opacity-80">Studio Manager</h1>
          <p className="text-[10px] tracking-widest opacity-40 uppercase mt-1">Hello, Owner</p>
        </header>

        <div className="flex gap-2 mb-8 bg-black/5 p-1 rounded-2xl">
          <button onClick={() => setActiveTab("notice")} className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "notice" ? "bg-white text-[#5F6F7A] shadow-sm" : "opacity-50"}`}>
            <Bell size={14} /> NOTICE
          </button>
          <button onClick={() => setActiveTab("poem")} className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "poem" ? "bg-white text-[#5F6F7A] shadow-sm" : "opacity-50"}`}>
            <BookOpen size={14} /> POEM
          </button>
        </div>

        {status === "success" && (
          <div className="mb-6 flex items-center justify-center gap-2 text-[#B5A773] bg-[#B5A773]/10 py-3 rounded-xl animate-pulse">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Published</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/45 border border-white/40 p-6 rounded-[2rem] shadow-sm">
            <div className="mb-6">
              <label className="text-[9px] font-black tracking-[0.2em] opacity-40 uppercase mb-2 block ml-1">Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/60 border-none rounded-xl p-4 text-[14px] font-bold outline-none"
                placeholder={activeTab === "notice" ? "Update Title" : "Author / Category"}
                required
              />
            </div>
            <div>
              <label className="text-[9px] font-black tracking-[0.2em] opacity-40 uppercase mb-2 block ml-1">Content</label>
              <textarea 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full bg-white/60 border-none rounded-xl p-4 text-[14px] leading-relaxed min-h-[200px] outline-none font-serif italic"
                placeholder="..."
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-[#5F6F7A] text-white rounded-2xl font-bold text-[12px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-[#4A5A65] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#5F6F7A]/20">
            {loading ? "Publishing..." : <><Send size={14} /> Publish</>}
          </button>
        </form>
      </div>
    </div>
  );
}