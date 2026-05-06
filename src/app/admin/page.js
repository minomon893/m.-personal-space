"use client";

import { useState } from "react";
import { ArrowLeft, Send, BookOpen, Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // 先ほど作った接続ファイルを読み込み

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("notice");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 送信状態の管理
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // 1. 送信先のテーブルとデータを判定
      const isNotice = activeTab === "notice";
      const tableName = isNotice ? "notices" : "poems";
      
      // noticesはcontent、poemsはbodyというカラム名に合わせる
      const insertData = isNotice 
        ? { title: formData.title, content: formData.content }
        : { title: formData.title, body: formData.content };

      // 2. Supabaseへデータを挿入
      const { error } = await supabase
        .from(tableName)
        .insert([insertData]);

      if (error) throw error;

      // 成功時
      setStatus("success");
      setFormData({ title: "", content: "" }); // フォームをクリア
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => setStatus(null), 3000);

    } catch (error) {
      console.error("Error publishing:", error.message);
      alert("エラーが発生しました: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-6 text-[#5F6F7A] font-sans">
      <div className="max-w-md mx-auto">
        <Link href="/menu" className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-10 hover:opacity-100 transition-all">
          <ArrowLeft size={12} /> Exit Studio
        </Link>

        <header className="mb-8 text-center">
          <h1 className="text-xl font-[var(--font-serif)] italic opacity-80">Studio Manager</h1>
          <p className="text-[10px] tracking-widest opacity-40 uppercase mt-1">Content Management</p>
        </header>

        {/* タブ切り替え */}
        <div className="flex gap-2 mb-8 bg-black/5 p-1 rounded-2xl">
          <button 
            onClick={() => { setActiveTab("notice"); setStatus(null); }}
            className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "notice" ? "bg-white text-[#5F6F7A] shadow-sm" : "opacity-50"}`}
          >
            <Bell size={14} /> NOTICE
          </button>
          <button 
            onClick={() => { setActiveTab("poem"); setStatus(null); }}
            className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${activeTab === "poem" ? "bg-white text-[#5F6F7A] shadow-sm" : "opacity-50"}`}
          >
            <BookOpen size={14} /> POEM
          </button>
        </div>

        {/* 成功メッセージ */}
        {status === "success" && (
          <div className="mb-6 flex items-center justify-center gap-2 text-[#B5A773] bg-[#B5A773]/10 py-3 rounded-xl animate-pulse">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Published Successfully</span>
          </div>
        )}

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/45 border border-white/40 p-6 rounded-[2rem] shadow-sm">
            <div className="mb-6">
              <label className="text-[9px] font-black tracking-[0.2em] opacity-40 uppercase mb-2 block ml-1">Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/60 border-none rounded-xl p-4 text-[14px] font-bold focus:ring-2 focus:ring-[#B5A773]/20 outline-none transition-all"
                placeholder={activeTab === "notice" ? "Update v1.x" : "Poem Title..."}
                required
              />
            </div>

            <div>
              <label className="text-[9px] font-black tracking-[0.2em] opacity-40 uppercase mb-2 block ml-1">Content</label>
              <textarea 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full bg-white/60 border-none rounded-xl p-4 text-[14px] leading-relaxed min-h-[240px] focus:ring-2 focus:ring-[#B5A773]/20 outline-none resize-none transition-all font-serif italic"
                placeholder={activeTab === "notice" ? "お知らせの内容を書いてください..." : "今日のことばを綴ってください..."}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#5F6F7A] text-white rounded-2xl font-bold text-[12px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-[#4A5A65] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#5F6F7A]/20"
          >
            {loading ? (
              "Publishing..."
            ) : (
              <><Send size={14} /> Publish to Space</>
            )}
          </button>
        </form>

        <footer className="mt-12 text-center opacity-20 text-[8px] tracking-widest uppercase">
          Authorized Access Only
        </footer>
      </div>
    </div>
  );
}