"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, PlusCircle, List, ArrowLeft, Megaphone, PenLine, CheckCircle2, MessageSquareQuote, ChevronDown, Coffee } from "lucide-react";
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
  
  // お知らせ・Jimmyのアコーディオン用
  const [expandedId, setExpandedId] = useState(null);

  const fetchItems = async () => {
    const table = activeTab;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data || []);
  };

  useEffect(() => {
    if (activeTab === "notices") {
      setNoticeTag("Update"); 
    } else if (activeTab === "jimmys") {
      setNoticeTag("JIMMY");
    } else {
      setNoticeTag(""); 
    }
    
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const table = activeTab;
    let payload = {};

    if (table === "notices") {
      payload = { title, content: body, tag: noticeTag || "Update" };
    } else if (table === "feedbacks") {
      payload = { attribute: title, content: body, service_tag: noticeTag || "" };
    } else if (table === "jimmys") {
      // Jimmy用のペイロード: contentの冒頭80文字を自動でexcerptにする
      payload = { 
        title, 
        content: body, 
        tag: noticeTag || "JIMMY",
        excerpt: body.substring(0, 80).replace(/\n/g, ' ') + "..."
      };
    } else {
      payload = { title, body };
    }

    const { error } = await supabase.from(table).insert([payload]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setBody("");
      setTitle("");
      setNoticeTag(activeTab === "notices" ? "Update" : activeTab === "jimmys" ? "JIMMY" : "");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchItems();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const labels = { notices: "Notice", feedbacks: "Feedback", poems: "Poem", jimmys: "Jimmy" };
    const typeLabel = labels[activeTab] || "Item";
    
    if (!confirm(`Delete this ${typeLabel}?`)) return;
    const { error } = await supabase.from(activeTab).delete().eq("id", id);
    if (!error) fetchItems();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#E6E1CF] flex items-center justify-center p-6 font-sans tracking-tight">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-sm font-bold tracking-[0.4em] text-[#4F5D6B] uppercase opacity-80">Admin Access</h1>
            <p className="text-[10px] text-[#4F5D6B] opacity-40 uppercase tracking-widest italic">Restricted Area</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/60 outline-none focus:ring-1 focus:ring-[#B5A773]/50 transition-all text-center text-sm tracking-[0.2em]"
              placeholder="PASSWORD"
            />
            <button className="w-full py-4 bg-[#4F5D6B] text-white rounded-2xl text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-[#3A4238] transition-all shadow-sm">
              Unlock
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1E1] p-6 text-[#4F5D6B] font-sans tracking-tight relative">
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-[#3A4238] text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={16} className="text-[#B5A773]" />
          <span className="text-[10px] font-bold tracking-[0.2em]">SUCCESSFULLY SAVED</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="text-[9px] tracking-[0.3em] font-bold opacity-40 flex items-center gap-2 hover:opacity-100 transition-all uppercase">
            <ArrowLeft size={12} /> Exit Admin
          </Link>
          <div className="text-[9px] font-bold tracking-[0.3em] opacity-30 uppercase italic">m. personal space</div>
        </header>

        <div className="flex gap-2 mb-12 border-b border-[#4F5D6B]/5 pb-4 overflow-x-auto">
          {[
            { id: "notices", icon: <Megaphone size={14} />, label: "Notices" },
            { id: "jimmys", icon: <Coffee size={14} />, label: "Jimmy" },
            { id: "feedbacks", icon: <MessageSquareQuote size={14} />, label: "Feedback" },
            { id: "poems", icon: <PenLine size={14} />, label: "Poems" }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] font-bold tracking-widest uppercase whitespace-nowrap ${activeTab === tab.id ? "bg-[#5F6F7A] text-white shadow-sm" : "hover:bg-white/40 opacity-50"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/60 shadow-sm mb-20">
          <div className="mb-10">
            <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase opacity-70 flex items-center gap-2 mb-8">
              <PlusCircle size={16} className="text-[#B5A773]" /> Create New {activeTab === "jimmys" ? "Jimmy Column" : activeTab.slice(0, -1)}
            </h2>
            
            <div className="space-y-6">
              {(activeTab === "notices" || activeTab === "feedbacks" || activeTab === "jimmys") && (
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.2em] mb-2 opacity-50 uppercase">
                    {activeTab === "feedbacks" ? "Service Path" : "Tag"}
                  </label>
                  <input
                    type="text"
                    value={noticeTag}
                    onChange={(e) => setNoticeTag(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 outline-none focus:border-[#B5A773] transition-all text-sm"
                    placeholder={activeTab === "jimmys" ? "JIMMY" : "Update"}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[9px] font-bold tracking-[0.2em] mb-2 opacity-50 uppercase">
                  {activeTab === "feedbacks" ? "User Attribute" : "Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 outline-none focus:border-[#B5A773] transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold tracking-[0.2em] mb-2 opacity-50 uppercase">Content Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white/50 border border-white/60 h-40 outline-none focus:border-[#B5A773] transition-all text-sm leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-[#4F5D6B] text-white rounded-2xl text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-[#3A4238] transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Processing..." : "Save to Database"}
          </button>
        </form>

        <section className="pb-20">
          <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase opacity-70 flex items-center gap-2 mb-8">
            <List size={16} className="text-[#B5A773]" /> Entry List
          </h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white/40 p-6 rounded-3xl border border-white/60 flex justify-between items-start group hover:bg-white/60 transition-all">
                <div className="flex-1 pr-4">
                  {(activeTab === "notices" || activeTab === "jimmys") ? (
                    <div className="space-y-2">
                      <button 
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="flex gap-2 items-center w-full text-left"
                      >
                        <span className="text-[10px] font-bold text-[#4F5D6B] uppercase tracking-widest underline decoration-[#B5A773]/40 decoration-2 underline-offset-4">{item.title}</span>
                        {item.tag && <span className="text-[8px] px-2 py-0.5 bg-[#4F5D6B]/5 rounded-full opacity-50 font-bold">{item.tag}</span>}
                        <ChevronDown size={14} className={`ml-auto transition-transform opacity-30 ${expandedId === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`grid transition-all duration-300 ${expandedId === item.id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <p className="text-[13px] leading-relaxed opacity-70 whitespace-pre-wrap border-t border-[#4F5D6B]/5 pt-4">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "feedbacks" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {item.service_tag && (
                          <span className="text-[8px] bg-[#B5A773]/20 text-[#B5A773] px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                            {item.service_tag}
                          </span>
                        )}
                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">— {item.attribute}</span>
                      </div>
                      <p className="text-[13px] leading-relaxed italic opacity-80 whitespace-pre-wrap font-light">"{item.content}"</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[13px] leading-relaxed opacity-80 whitespace-pre-wrap font-light">{item.body}</p>
                      <span className="block text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">— {item.title}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-[#4F5D6B]/20 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}