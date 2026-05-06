"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, PlusCircle, List, ArrowLeft, Megaphone, PenLine, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("notices"); 
  
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [noticeTag, setNoticeTag] = useState("Update");
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchItems = async () => {
    const table = activeTab;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated, activeTab]);

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
    
    const table = activeTab;
    const payload = table === "notices" 
      ? { title, content: body, tag: noticeTag }
      : { title, body };

    const { error } = await supabase.from(table).insert([payload]);

    if (error) {
      alert("エラーが発生しました: " + error.message);
    } else {
      setBody("");
      setTitle("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchItems();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(`この${activeTab === "notices" ? "お知らせ" : "ポエム"}を削除しますか？`)) return;
    const { error } = await supabase.from(activeTab).delete().eq("id", id);
    if (!error) fetchItems();
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
          <button className="w-full py-4 bg-[#4F5D6B] text-white rounded-xl font-bold hover:bg-[#3d4852] transition-all">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1E1] p-6 text-[#4F5D6B] font-sans relative">
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-[#2D363F] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-[#B5A773]" />
          <span className="text-sm font-bold tracking-widest">SAVED SUCCESSFULLY</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[10px] tracking-widest opacity-50 flex items-center gap-2 mb-8 hover:opacity-100 transition-all">
          <ArrowLeft size={12} /> BACK TO HOME
        </Link>

        <div className="flex gap-4 mb-10">
          <button 
            onClick={() => setActiveTab("notices")}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === "notices" ? "bg-[#5F6F7A] text-white shadow-md" : "bg-white/40 opacity-60"}`}
          >
            <Megaphone size={18} /> Notices
          </button>
          <button 
            onClick={() => setActiveTab("poems")}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === "poems" ? "bg-[#B5A773] text-white shadow-md" : "bg-white/40 opacity-60"}`}
          >
            <PenLine size={18} /> Poems
          </button>
        </div>

        <h1 className="text-2xl font-light mb-8 tracking-[0.2em] flex items-center gap-3">
          <PlusCircle size={24} className="text-[#B5A773]" /> 
          NEW {activeTab === "notices" ? "NOTICE" : "POEM"}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white/40 p-8 rounded-3xl border border-white shadow-sm mb-16">
          {activeTab === "notices" && (
            <div className="mb-6">
              <label className="block text-[10px] font-bold tracking-widest mb-2 opacity-60">TAG (Update, Info, etc.)</label>
              <input
                type="text"
                value={noticeTag}
                onChange={(e) => setNoticeTag(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white/60 border border-[#4F5D6B]/10 outline-none focus:border-[#B5A773] transition-all"
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-[10px] font-bold tracking-widest mb-2 opacity-60">TITLE / AUTHOR</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/60 border border-[#4F5D6B]/10 outline-none focus:border-[#B5A773] transition-all"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-[10px] font-bold tracking-widest mb-2 opacity-60">CONTENT / BODY</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/60 border border-[#4F5D6B]/10 h-32 outline-none focus:border-[#B5A773] transition-all"
              required
            />
          </div>
          <button
            disabled={loading}
            className={`w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all ${activeTab === "notices" ? "bg-[#5F6F7A] hover:bg-[#4d5b65]" : "bg-[#B5A773] hover:bg-[#a39665]"}`}
          >
            {loading ? "SAVING..." : "SAVE TO DATABASE"}
          </button>
        </form>

        <h2 className="text-2xl font-light mb-6 tracking-[0.2em] flex items-center gap-3">
          <List size={24} className="text-[#B5A773]" /> 
          LIST
        </h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white/60 p-6 rounded-2xl border border-white flex justify-between items-start group hover:bg-white/80 transition-all">
              <div className="flex-1 pr-4">
                <p className="text-[14px] leading-relaxed mb-2 whitespace-pre-wrap">{item.body || item.content}</p>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">— {item.title}</span>
                  {(item.tag && activeTab === "notices") && (
                    <span className="text-[8px] px-2 border border-[#4F5D6B]/20 rounded-full opacity-50">{item.tag}</span>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-[#4F5D6B]/20 hover:text-red-400 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}