"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Trash2, 
  PlusCircle, 
  List, 
  ArrowLeft, 
  Megaphone, 
  PenLine, 
  CheckCircle2, 
  MessageSquareQuote, 
  ChevronDown, 
  Coffee,
  Grid3X3,
  Sparkles,
  Lock
} from "lucide-react";
import Link from "next/link";

// タブごとの色設定（くすみカラー ＋ 新規Mille用ホワイトテーマ）
const tabThemes = {
  notices: { primary: "#E6D5A9", bg: "#FAF4E6", text: "#8C7E55" },
  jimmys: { primary: "#D4A5A5", bg: "#FDF2F2", text: "#8C6363" },
  bingos: { primary: "#A9B2B9", bg: "#F1F3F5", text: "#636E7A" },
  feedbacks: { primary: "#A9B9A9", bg: "#F2F6F2", text: "#637A63" },
  poems: { primary: "#A9B2D4", bg: "#F2F4FD", text: "#636A8C" },
  mille_stories: { primary: "#7D7474", bg: "#FFFFFF", text: "#4A4A4A" }, // 各キャラの話（ホワイト・ストーンテーマ）
  menu_settings: { primary: "#A8A8A8", bg: "#F5F5F5", text: "#7D7474" }
};

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
  
  const [expandedId, setExpandedId] = useState(null);

  const theme = tabThemes[activeTab] || tabThemes.notices;

  const fetchItems = async () => {
    setLoading(true);
    const table = activeTab;
    
    console.log("Fetching from table:", table);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(table === "menu_settings" ? "id" : "created_at", { ascending: table === "menu_settings" });
      
    if (error) {
      console.error("Supabase Error:", error);
      setItems([]);
    } else {
      console.log("Fetched Data:", data);
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "notices") {
      setNoticeTag("Update"); 
    } else if (activeTab === "jimmys") {
      setNoticeTag("JIMMY");
    } else if (activeTab === "bingos") {
      setNoticeTag("official");
    } else if (activeTab === "mille_stories") {
      setNoticeTag("");
    } else {
      setNoticeTag(""); 
    }
    
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated, activeTab]);

  const toggleMenuStatus = async (item) => {
    const { error } = await supabase
      .from("menu_settings")
      .update({ is_enabled: !item.is_enabled })
      .eq("id", item.id);
    
    if (error) console.error("Update Error:", error);
    else fetchItems();
  };

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
    if (loading) return; 
    setLoading(true);
    
    const table = activeTab;
    let payload = {};

    if (table === "notices") {
      payload = { title, content: body, tag: noticeTag || "Update" };
    } else if (table === "feedbacks") {
      payload = { attribute: title, content: body, service_tag: noticeTag || "" };
    } else if (table === "jimmys") {
      payload = { 
        title, 
        content: body, 
        tag: noticeTag || "JIMMY",
        excerpt: body.substring(0, 80).replace(/\n/g, ' ') + (body.length > 80 ? "..." : "")
      };
    } else if (table === "bingos") {
      const lines = body.split('\n').map(line => line.trim()).filter(line => line !== "");
      const grid = Array(9).fill("");
      lines.forEach((line, idx) => { if(idx < 9) grid[idx] = line; });
      
      payload = { 
        title, 
        grid, 
        is_official: true 
      };
    } else if (table === "mille_stories") {
      payload = {
        title,
        content: body,
        tag: noticeTag || ""
      };
    } else {
      payload = { title, body };
    }

    const { error } = await supabase.from(table).insert([payload]);

    if (error) {
      alert("Database Error: " + error.message);
    } else {
      setBody("");
      setTitle("");
      setNoticeTag(
        activeTab === "notices" ? "Update" : 
        activeTab === "jimmys" ? "JIMMY" : 
        activeTab === "bingos" ? "official" : ""
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchItems();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const labels = { 
      notices: "Notice", 
      feedbacks: "Feedback", 
      poems: "Poem", 
      jimmys: "Jimmy", 
      bingos: "Bingo",
      mille_stories: "Mille Story"
    };
    if (!confirm(`Delete this ${labels[activeTab] || "Item"}?`)) return;
    const { error } = await supabase.from(activeTab).delete().eq("id", id);
    if (!error) fetchItems();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F7] flex items-center justify-center p-6 font-sans tracking-tight">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-[10px] font-black tracking-[0.4em] text-[#B59090] uppercase opacity-80">Admin Access</h1>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-[#F9EEEE] outline-none focus:border-[#EAB8B8] transition-all text-center text-sm tracking-[0.2em] text-[#7D7474]"
              placeholder="PASSWORD"
            />
            <button className="w-full py-4 bg-[#EAB8B8] text-white rounded-3xl text-[11px] font-black tracking-[0.3em] uppercase hover:opacity-80 transition-all shadow-sm">
              Unlock
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F7] p-6 text-[#7D7474] font-sans tracking-tight relative">
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-[#7D7474] text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={14} />
          <span className="text-[9px] font-black tracking-[0.2em]">SUCCESSFULLY SAVED</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="text-[9px] tracking-[0.3em] font-black text-[#B59090] opacity-60 flex items-center gap-2 hover:opacity-100 transition-all uppercase">
            <ArrowLeft size={12} /> Exit Admin
          </Link>
          <div className="text-[9px] font-black tracking-[0.3em] opacity-30 uppercase italic">Picnic Admin</div>
        </header>

        <div className="flex gap-2 mb-12 border-b border-[#F9EEEE] pb-4 overflow-x-auto no-scrollbar">
          {[
            { id: "notices", icon: <Megaphone size={14} />, label: "Notices" },
            { id: "jimmys", icon: <Coffee size={14} />, label: "Jimmy" },
            { id: "bingos", icon: <Grid3X3 size={14} />, label: "Bingo" },
            { id: "mille_stories", icon: <Sparkles size={14} />, label: "Mille" }, 
            { id: "feedbacks", icon: <MessageSquareQuote size={14} />, label: "Feedback" },
            { id: "poems", icon: <PenLine size={14} />, label: "Poems" },
            { id: "menu_settings", icon: <Lock size={14} />, label: "Menu" }
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            const tabTheme = tabThemes[tab.id];
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-[9px] font-black tracking-widest uppercase whitespace-nowrap border-2 ${isTabActive ? "border-white text-white shadow-sm" : "bg-white border-[#F9EEEE] opacity-60 text-stone-400"}`}
                style={{ 
                  backgroundColor: isTabActive ? tabTheme.primary : "white",
                  color: isTabActive ? (tab.id === "mille_stories" ? "#FFFFFF" : "white") : "#A8A29E" 
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>
      {activeTab !== "menu_settings" && (
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-8 sm:p-10 rounded-[3rem] border-2 border-white shadow-sm mb-20">
          <div className="mb-10">
            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2 mb-8" style={{ color: theme.primary }}>
              <PlusCircle size={16} /> New {activeTab === "jimmys" ? "Jimmy Column" : activeTab === "bingos" ? "Hibingo" : activeTab === "mille_stories" ? "Mille Story" : activeTab.slice(0, -1)}
            </h2>
            
            <div className="space-y-6">
              {(activeTab === "notices" || activeTab === "feedbacks" || activeTab === "jimmys" || activeTab === "bingos" || activeTab === "mille_stories") && (
                <div>
                  <label className="block text-[8px] font-black tracking-[0.2em] mb-2 opacity-40 uppercase">
                    {activeTab === "feedbacks" ? "Service Path" : activeTab === "mille_stories" ? "Category (死、自由、孤独、無意味)" : "Tag"}
                  </label>
                  <input
                    type="text"
                    value={noticeTag}
                    onChange={(e) => setNoticeTag(e.target.value)}
                    placeholder={activeTab === "mille_stories" ? "死、自由、孤独、無意味" : ""}
                    className="w-full p-4 rounded-2xl border border-[#F9EEEE] outline-none focus:border-stone-300 transition-all text-sm text-[#7D7474] placeholder-stone-300 font-medium"
                    style={{ backgroundColor: theme.bg }}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[8px] font-black tracking-[0.2em] mb-2 opacity-40 uppercase">
                  {activeTab === "feedbacks" ? "User Attribute" : "Title"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-[#F9EEEE] outline-none focus:border-stone-300 transition-all text-sm font-bold text-[#7D7474]"
                  style={{ backgroundColor: theme.bg }}
                  required
                />
              </div>

              <div>
                <label className="block text-[8px] font-black tracking-[0.2em] mb-2 opacity-40 uppercase">
                  {activeTab === "bingos" ? "Grid Content (Enter each line for 9 cells)" : "Content Body"}
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-[#F9EEEE] h-48 outline-none focus:border-stone-300 transition-all text-sm leading-relaxed text-[#7D7474]"
                  style={{ backgroundColor: theme.bg }}
                  placeholder={activeTab === "bingos" ? "Cell 1\nCell 2\nCell 3..." : ""}
                  required
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-4 text-white rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? "Processing..." : "Save to Database"}
          </button>
        </form>
      )}
        <section className="pb-20">
          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2 mb-8" style={{ color: theme.primary }}>
            <List size={16} /> Entry List
          </h2>

         <div className="space-y-4">
  {loading ? (
    <p className="text-[10px] opacity-50">Loading entries...</p>
  ) : (
    items.map((item) => (
      <div key={item.id} className="bg-white/60 p-6 rounded-[2.5rem] border border-white flex justify-between items-start group hover:bg-white transition-all shadow-sm">
        <div className="flex-1 pr-4">
          {activeTab === "menu_settings" ? (
            <div className="flex justify-between items-center w-full">
              <span className="text-[11px] font-bold text-[#7D7474] uppercase tracking-widest">{item.key}</span>
              <button 
                onClick={() => toggleMenuStatus(item)} 
                className={`px-4 py-1.5 rounded-full text-[8px] font-black transition-colors ${item.is_enabled ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
              >
                {item.is_enabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>
          ) : (
            (activeTab === "notices" || activeTab === "jimmys" || activeTab === "bingos" || activeTab === "mille_stories") ? (
              <div className="space-y-2">
                <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="flex gap-3 items-center w-full text-left">
                  <span className="text-[11px] font-bold text-[#7D7474] uppercase tracking-widest">{item.title}</span>
                  {(item.tag || item.is_official) && (
                    <span className="text-[8px] px-3 py-1 rounded-full font-black border border-[#F9EEEE]" style={{ backgroundColor: theme.bg, color: theme.primary }}>
                      {item.tag || (item.is_official ? "official" : "user")}
                    </span>
                  )}
                  <ChevronDown size={14} className={`ml-auto transition-transform opacity-30 ${expandedId === item.id ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-300 ${expandedId === item.id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="text-[12px] leading-relaxed opacity-70 whitespace-pre-wrap border-t border-[#F9EEEE] pt-4 text-[#7D7474]">
                      {activeTab === "bingos" ? item.grid?.join(" / ") : item.content}
                    </p>
                  </div>
                </div>
              </div>
            ) : activeTab === "feedbacks" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {item.service_tag && <span className="text-[8px] text-white px-2 py-0.5 rounded font-black uppercase" style={{ backgroundColor: theme.primary }}>{item.service_tag}</span>}
                  <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">— {item.attribute}</span>
                </div>
                <p className="text-[12px] leading-relaxed italic opacity-80 whitespace-pre-wrap font-medium">"{item.content}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[12px] leading-relaxed opacity-80 whitespace-pre-wrap font-medium">{item.body}</p>
                <span className="block text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">— {item.title}</span>
              </div>
            )
          )}
        </div>
        
        {activeTab !== "menu_settings" && (
          <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-200 hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    ))
  )}
</div>
        </section>
      </div>
    </div>
  );
}