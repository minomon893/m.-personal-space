"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabase";
import { 
  BookOpen, 
  Plus, 
  X, 
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Heart,
  Lock,
  Edit2,
  Trash2
} from "lucide-react";
import Link from "next/link";

const getSeasonTheme = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return { name: "spring", colors: "from-[#FDF2F4] to-[#F9FDF9]", accent: "#D4A5A5", text: "#7A6363", glow: "rgba(212, 165, 165, 0.4)" };
  if (month >= 6 && month <= 8) return { name: "summer", colors: "from-[#F0F4F8] to-[#FFFFFF]", accent: "#9BB7D4", text: "#5F6F7A", glow: "rgba(155, 183, 212, 0.4)" };
  if (month >= 9 && month <= 11) return { name: "autumn", colors: "from-[#F5F2ED] to-[#EBE4D9]", accent: "#A68B6D", text: "#635A51", glow: "rgba(166, 139, 109, 0.4)" };
  return { name: "winter", colors: "from-[#EDF0F2] to-[#D9E1E8]", accent: "#7A8A99", text: "#535D66", glow: "rgba(122, 138, 153, 0.4)" };
};

const BINGO_EMOJIS = {
  "official-0": ["🌿", "☁️", "🍀"],
  "official-1": ["☀️", "🍞", "☕", "🌤️"],
  "official-2": ["🌙", "✨", "🕯️", "💤"],
  "default": ["🫧", "🕊️", "🍃","✉️"]
};

const BINGO_MESSAGES = ["いい感じです。", "一列そろいましたね。", "いい調子です。"];

const OFFICIAL_BINGOS = [
  {
    id: "official-0",
    title: "日々ンゴ",
    is_official: true,
    grid: [
      "起きる", "朝ごはん", "歩く",
      "できることから", "お風呂入る", "髪ちゃんと乾かす",
      "夜ごはん", "明日すること確認", "寝る"
    ]
  },
  {
    id: "official-1",
    title: "朝のゆとり日々ンゴ",
    is_official: true,
    grid: [
      "起きる時にうにゃーーと伸びをしてみる", "朝ごはんにスープを飲む", "パンのにおいを嗅ぐ",
      "歯磨き後の歯を舌でなぞってみる", "朝風呂してみる", "目を瞑って太陽の方を向いてみる",
      "Tシャツを素べく畳んでみる", "いらないものを一つ捨てる", "使ってなかったものを使ってみる"
    ]
  },
  {
    id: "official-2",
    title: "夜の癒やし日々ンゴ",
    is_official: true,
    grid: [
      "スマホで雨音を流しながら眠る", "歌詞を見ながら一曲聴いてみる", "いい香りのアイテムをゲットする",
      "お気に入りの曲を一曲流す間だけ家事", "余洗いをちゃんとしてみる", "誰かにボイスメッセージを送ってみる",
      "自分の好きな食材の旬を調べる", "挨拶したことない人に挨拶してみる", "目を瞑って太陽の方を向いてみる"
    ]
  }
];

export default function BingoPage() {
  const [theme, setTheme] = useState(getSeasonTheme());
  const [bingos, setBingos] = useState(OFFICIAL_BINGOS);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [progress, setProgress] = useState(Array(9).fill(false));
  const [favorites, setFavorites] = useState([]); 
  const [showIntro, setShowIntro] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [bingoEffect, setBingoEffect] = useState(false);
  const [messageIdx, setMessageIdx] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [userId, setUserId] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newGrid, setNewGrid] = useState(Array(9).fill(""));
  const [activeInputIdx, setActiveInputIdx] = useState(0);

  const currentBingo = bingos[selectedIdx];
  const isOfficial = currentBingo?.id.toString().startsWith('official-') || currentBingo?.is_official === true;

  const currentEmojis = useMemo(() => {
    return BINGO_EMOJIS[currentBingo?.id] || BINGO_EMOJIS["default"];
  }, [currentBingo]);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: bData } = await supabase.from('bingos').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (bData) {
      setBingos([...OFFICIAL_BINGOS, ...bData]);
    }
    const { data: fData } = await supabase.from('favorites-bingo').select('content').eq('user_id', user.id);
    if (fData) {
      setFavorites(fData.map(f => f.content));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (currentBingo && userId) {
      const fetchProgress = async () => {
        const { data } = await supabase.from('progress').select('checked, updated_at').eq('bingo_id', currentBingo.id).eq('user_id', userId).single();
        const currentProgress = data?.checked || Array(9).fill(false);
        setProgress(currentProgress);
        if (currentProgress.every(v => v) && data?.updated_at) {
          const lastUpdate = new Date(data.updated_at).getTime();
          const now = new Date().getTime();
          if (now - lastUpdate < 24 * 60 * 60 * 1000) {
            setIsLocked(true);
          } else {
            setIsLocked(false);
          }
        } else {
          setIsLocked(false);
        }
      };
      fetchProgress();
    }
  }, [currentBingo, userId]);

  const checkBingoCount = (p) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.filter(line => line.every(i => p[i])).length;
  };

  const toggleCell = async (i) => {
    if (isLocked || !userId) return;
    const newProgress = [...progress];
    const prevCount = checkBingoCount(progress);
    newProgress[i] = !newProgress[i];
    const newCount = checkBingoCount(newProgress);
    setProgress(newProgress);

    if (newCount > prevCount) {
      setBingoEffect(true);
      setMessageIdx((prev) => (prev + 1) % BINGO_MESSAGES.length);
      setTimeout(() => setBingoEffect(false), 3500);
    }

    if (newProgress.every(v => v)) {
      setTimeout(() => setShowReward(true), 1000);
      setIsLocked(true);
    }

    await supabase.from('progress').upsert({
      user_id: userId,
      bingo_id: currentBingo.id,
      checked: newProgress,
      updated_at: new Date().toISOString()
    });
  };

  const toggleFavorite = async (e, text) => { 
    e.stopPropagation();
    if (!userId) return;
    const isFav = favorites.includes(text);
    if (isFav) {
      setFavorites(favorites.filter(f => f !== text));
      await supabase.from('favorites-bingo').delete().eq('user_id', userId).eq('content', text);
    } else {
      setFavorites([...favorites, text]);
      await supabase.from('favorites-bingo').insert({ user_id: userId, content: text });
    }
  };

  const handleSaveBingo = async () => {
    if (!userId || !newTitle.trim() || !newGrid.every(val => val.trim().length > 0)) return;

    if (editingId) {
      const { data } = await supabase.from('bingos').update({
        title: newTitle.trim(),
        grid: newGrid.map(v => v.trim())
      }).eq('id', editingId).eq('user_id', userId).select().single();

      if (data) {
        const updatedBingos = bingos.map(b => b.id === editingId ? data : b);
        setBingos(updatedBingos);
      }
    } else {
      const { data } = await supabase.from('bingos').insert({
        user_id: userId,
        title: newTitle.trim(),
        grid: newGrid.map(v => v.trim()),
        is_official: false 
      }).select().single();

      if (data) {
        setBingos([...OFFICIAL_BINGOS, data, ...bingos.filter(b => !b.id.toString().startsWith('official-'))]);
        setSelectedIdx(OFFICIAL_BINGOS.length);
      }
    }
    resetForm();
  };

  const handleDeleteBingo = async () => {
    if (isOfficial || !currentBingo || !userId) return;
    if (confirm("この日々ンゴを削除してもよろしいですか？")) {
      await supabase.from('bingos').delete().eq('id', currentBingo.id).eq('user_id', userId);
      await supabase.from('progress').delete().eq('bingo_id', currentBingo.id).eq('user_id', userId);
      const newBingos = bingos.filter(b => b.id !== currentBingo.id);
      setBingos(newBingos);
      setSelectedIdx(0);
    }
  };

  const openEdit = () => {
    if (isOfficial) return; 
    setEditingId(currentBingo.id);
    setNewTitle(currentBingo.title);
    setNewGrid([...currentBingo.grid]);
    setShowCreate(true);
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setNewTitle("");
    setNewGrid(Array(9).fill(""));
  };

  const insertFavorite = (text) => {
    const next = [...newGrid];
    next[activeInputIdx] = text;
    setNewGrid(next);
    if (activeInputIdx < 8) setActiveInputIdx(activeInputIdx + 1);
  };

  const canSave = newTitle.trim().length > 0 && newGrid.every(v => v.trim().length > 0);

  return (
    <main className={`min-h-screen bg-gradient-to-b ${theme.colors} transition-colors duration-[2000ms] flex flex-col items-center overflow-hidden font-sans relative`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`${selectedIdx}-${i}`}
            initial={{ top: -50, left: `${Math.random() * 100}%` }}
            animate={{ top: "110%", rotate: 360 }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
            className="absolute text-2xl opacity-30"
          >
            {currentEmojis[i % currentEmojis.length]}
          </motion.div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.12] mix-blend-multiply" 
           style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }} />

      <div className="w-full flex justify-between items-center px-6 pt-8 z-50">
        <Link href="/menu" className="p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/60 text-stone-500 hover:bg-white transition-all shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <button onClick={() => setShowIntro(true)} className="p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/60 text-stone-500 hover:bg-white transition-all shadow-sm">
          <BookOpen size={18} />
        </button>
      </div>

      <div className="w-full z-40 pt-4 pb-4 px-6 text-center">
          <h1 className="w-full text-center text-xl font-light tracking-[0.4em] opacity-80 mb-6" style={{ color: theme.text }}>日々ンゴ</h1>
          <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar pb-2 snap-x max-w-md mx-auto">
            {bingos.map((b, i) => (
              <motion.button
                key={b.id}
                onClick={() => setSelectedIdx(i)}
                className={`min-w-[110px] px-4 py-2.5 rounded-2xl border transition-all duration-500 snap-center text-center
                  ${selectedIdx === i ? `bg-white shadow-lg border-white scale-105` : 'bg-white/20 border-transparent opacity-40 scale-95'}`}
              >
                <p className="text-[10px] font-bold truncate opacity-80" style={{ color: theme.text }}>{b.title}</p>
              </motion.button>
            ))}
          </div>
      </div>

      <div className="flex-1 w-full max-w-sm px-6 pt-4 pb-20 z-10 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {currentBingo && (
            <motion.div 
              key={currentBingo.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="w-full aspect-square grid grid-cols-3 gap-4 relative"
            >
              {currentBingo.grid.map((text, i) => (
                <motion.div
                  key={i}
                  whileTap={!isLocked ? { scale: 0.94 } : {}}
                  onClick={() => toggleCell(i)}
                  role="button"
                  className={`relative p-3 text-[11px] leading-relaxed flex items-center justify-center text-center border transition-all duration-700 rounded-[2rem] outline-none
                    ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
                    ${progress[i] 
                      ? `bg-black/[0.05] border-transparent text-stone-300 shadow-inner` 
                      : `bg-white/80 border-white shadow-xl text-stone-600`}`}
                >
                  <button 
                    onClick={(e) => toggleFavorite(e, text)}
                    className="absolute top-3 right-3 z-20 outline-none"
                  >
                    <Heart 
                      size={14} 
                      className={favorites.includes(text) ? "fill-red-300 text-red-400" : "text-stone-300 opacity-60"} 
                    />
                  </button>
                  <span className="relative z-10 font-medium px-1 pointer-events-none">{text}</span>
                </motion.div>
              ))}
              
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[2px] rounded-[2.5rem] z-30 pointer-events-none">
                  <div className="bg-white/90 p-4 rounded-full shadow-lg">
                    <Lock size={24} className="text-stone-400" />
                  </div>
                  <p className="mt-4 text-[10px] text-stone-500 font-bold tracking-widest bg-white/80 px-4 py-2 rounded-full shadow-sm">明日また遊べます</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-16 mt-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {bingoEffect && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-1 text-sm italic font-serif"
                style={{ color: theme.text }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>{BINGO_MESSAGES[messageIdx]}</span>
                </div>
                <span className="text-[9px] opacity-40 tracking-widest uppercase">Self-compassion</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto flex flex-wrap justify-center gap-6">
          <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 text-[10px] text-stone-400 hover:text-stone-600 transition-colors tracking-[0.2em] uppercase">
            <Plus size={12} /> New
          </button>
          
          {!isOfficial && (
            <>
              <button onClick={openEdit} className="flex items-center gap-2 text-[10px] text-stone-400 hover:text-stone-600 transition-colors tracking-[0.2em] uppercase">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={handleDeleteBingo} className="flex items-center gap-2 text-[10px] text-red-300 hover:text-red-400 transition-colors tracking-[0.2em] uppercase">
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}

          <button 
            disabled={isLocked}
            onClick={async () => {
             if (isLocked || !userId) return;
             if (confirm("進捗をリセットしますか？")) {
               await supabase.from('progress').delete().eq('bingo_id', currentBingo.id).eq('user_id', userId);
               setProgress(Array(9).fill(false));
             }
            }} 
            className={`flex items-center gap-2 text-[10px] transition-colors tracking-[0.2em] uppercase ${isLocked ? 'text-stone-200' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-stone-900/20 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white/95 w-full max-w-sm rounded-[2.5rem] shadow-2xl relative border border-white overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold tracking-widest" style={{ color: theme.text }}>
                    {editingId ? "日々ンゴを編集" : "オリジナル日々ンゴ"}
                  </h3>
                  <button onClick={resetForm} className="text-stone-400"><X size={20} /></button>
                </div>
                
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ビンゴのタイトルを入力"
                  className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-[12px] mb-4 outline-none"
                />

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {newGrid.map((val, i) => (
                    <div key={i} className="aspect-square relative">
                      <textarea
                        onFocus={() => setActiveInputIdx(i)}
                        value={val}
                        onChange={(e) => {
                          const next = [...newGrid];
                          next[i] = e.target.value;
                          setNewGrid(next);
                        }}
                        placeholder={`${i + 1}`}
                        className={`w-full h-full p-2 text-[10px] bg-white border rounded-xl resize-none outline-none flex items-center justify-center text-center leading-tight
                          ${activeInputIdx === i ? 'border-stone-400 ring-1 ring-stone-100' : 'border-stone-100'}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <p className="text-[9px] text-stone-400 mb-3 tracking-widest uppercase flex items-center gap-2">
                    <Heart size={10} className="fill-stone-300 text-stone-300" /> Favorites
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 no-scrollbar">
                    {favorites.length > 0 ? (
                      favorites.map((fav, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertFavorite(fav)}
                          className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-100 rounded-full text-[10px] text-stone-500"
                        >
                          {fav}
                        </button>
                      ))
                    ) : (
                      <p className="text-[10px] text-stone-300 italic">お気に入りはまだありません</p>
                    )}
                  </div>
                </div>

                 <button 
                  onClick={handleSaveBingo}
                  disabled={!canSave}
                  className="w-full py-4 rounded-2xl text-white text-[12px] font-bold tracking-widest shadow-lg transition-all active:scale-95 disabled:bg-stone-200"
                  style={{ backgroundColor: !canSave ? '#e5e7eb' : '#FADDE1' }} 
                >
                  {editingId ? "更新する" : "保存してはじめる"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ... 以降のモーダルコンポーネントは変更なしのため省略 ... */}
      <AnimatePresence>
        {showIntro && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/10 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white/95 w-full max-w-sm rounded-[2.5rem] shadow-2xl relative border border-white overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-8 overflow-y-auto no-scrollbar">
                  <h3 className="text-sm font-bold mb-6 tracking-widest text-center" style={{ color: theme.text }}>📖 日々ンゴについて</h3>
                  <div className="text-[11px] leading-[2] text-stone-500 font-light space-y-6">
                    <p className="text-center">
                      日々ンゴは、<br/>
                      小さな行動を3×3に並べたビンゴです。<br/><br/>
                      その日の気分や状態に合わせて選びます。
                    </p>
                    <div className="space-y-2">
                      <p className="font-bold border-b border-stone-100 pb-1">1. 日々ンゴを選ぶ</p>
                      <p>その時の状態に近いものを選びます。</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold border-b border-stone-100 pb-1">2. マスを押す</p>
                      <p>マスを押すと、その行動が記録されます。</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold border-b border-stone-100 pb-1">3. 一列そろう</p>
                      <p>縦・横・斜めで一列そろうと、<br/>小さな演出が表示されます。</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold border-b border-stone-100 pb-1">4. 全マス埋まる</p>
                      <p>9マスすべて埋まると、<br/>ご褒美を入力する画面が表示されます。<br/><br/>入力後、その日々ンゴは一時的にロックされます。</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold border-b border-stone-100 pb-1">お気に入り</p>
                      <p>マス右上の♡で保存できます。作成時に利用可能です。</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold border-b border-stone-100 pb-1">オリジナル日々ンゴ</p>
                      <p>自分で作成・編集・削除が可能です。</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowIntro(false)} className="w-full py-5 bg-stone-50 text-[10px] font-bold tracking-widest text-stone-400 border-t border-stone-100">閉じる</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReward && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/60 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 w-full max-w-sm rounded-[3rem] shadow-2xl border border-stone-100 text-center">
              <Sparkles className="mx-auto mb-6 text-yellow-400" size={32} />
              <h2 className="text-lg font-light mb-2" style={{ color: theme.text }}>全マス達成しました。<br/>ご褒美は何にしますか？</h2>
              <input 
                type="text" 
                value={rewardText}
                onChange={(e) => setRewardText(e.target.value)}
                placeholder="例：美味しいアイスを食べる"
                className="w-full bg-stone-50 border-none rounded-2xl px-5 py-4 text-[12px] mb-8 outline-none"
              />
              <button 
                onClick={() => { setShowReward(false); setRewardText(""); }}
                className="w-full py-4 rounded-2xl text-white text-[12px] font-bold shadow-lg"
                style={{ backgroundColor: theme.accent }}
              >
                入力を完了する
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}