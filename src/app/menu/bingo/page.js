"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
  Book, 
  Plus, 
  X, 
  Heart, 
  ChevronLeft, 
  Trash2, 
  RotateCcw,
  Sparkles
} from "lucide-react";

// --- 季節判定ロジック ---
const getSeasonTheme = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return { name: "spring", colors: "from-[#FDF2F4] to-[#F9FDF9]", accent: "#D4A5A5", text: "#7A6363" };
  if (month >= 6 && month <= 8) return { name: "summer", colors: "from-[#F0F4F8] to-[#FFFFFF]", accent: "#9BB7D4", text: "#5F6F7A" };
  if (month >= 9 && month <= 11) return { name: "autumn", colors: "from-[#F5F2ED] to-[#EBE4D9]", accent: "#A68B6D", text: "#635A51" };
  return { name: "winter", colors: "from-[#EDF0F2] to-[#D9E1E8]", accent: "#7A8A99", text: "#535D66" };
};

export default function BingoPage() {
  const [theme, setTheme] = useState(getSeasonTheme());
  const [bingos, setBingos] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [progress, setProgress] = useState(Array(9).fill(false));
  const [favorites, setFavorites] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [bingoEffect, setBingoEffect] = useState(false);

  const currentBingo = bingos[selectedIdx];

  // --- データ取得 ---
  const fetchData = useCallback(async () => {
    const { data: bData } = await supabase.from('bingos').select('*').order('created_at', { ascending: false });
    const { data: fData } = await supabase.from('favorites').select('*').eq('category', 'hibingo');
    const { data: lData } = await supabase.from('locks').select('locked_until').single();

    if (bData) setBingos(bData);
    if (fData) setFavorites(fData);
    if (lData && new Date(lData.locked_until) > new Date()) setIsLocked(true);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 進捗同期 ---
  useEffect(() => {
    if (currentBingo) {
      const fetchProgress = async () => {
        const { data } = await supabase.from('progress').select('checked').eq('bingo_id', currentBingo.id).single();
        setProgress(data?.checked || Array(9).fill(false));
        // 初回演出の判定（簡易的にローカルストレージ使用）
        const viewed = localStorage.getItem(`viewed_${currentBingo.id}`);
        setIsFirstOpen(!viewed);
      };
      fetchProgress();
    }
  }, [currentBingo]);

  // --- ビンゴ判定 ---
  const checkBingo = (p) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(line => line.every(i => p[i]));
  };

  // --- セル操作 ---
  const toggleCell = async (i) => {
    if (isLocked) return;
    const newProgress = [...progress];
    newProgress[i] = !newProgress[i];
    setProgress(newProgress);

    if (i === 4) {
      localStorage.setItem(`viewed_${currentBingo.id}`, "true");
      setIsFirstOpen(false);
    }

    if (checkBingo(newProgress)) {
      setBingoEffect(true);
      setTimeout(() => setBingoEffect(false), 3000);
    }

    if (newProgress.every(v => v)) setShowReward(true);

    await supabase.from('progress').upsert({
      bingo_id: currentBingo.id,
      user_id: "user_uuid", // Auth実装時は要変更
      checked: newProgress,
      updated_at: new Date()
    });
  };

  // --- リセット機能 ---
  const resetBingo = async () => {
    if (!confirm("日々ンゴを新品にしますか？")) return;
    await supabase.from('progress').delete().eq('bingo_id', currentBingo.id);
    setProgress(Array(9).fill(false));
  };

  // --- 24時間ロック実行 ---
  const submitReward = async () => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await supabase.from('locks').insert({ user_id: "user_uuid", locked_until: until });
    setIsLocked(true);
    setShowReward(false);
    alert("十分がんばったのでおやすみです。");
  };

  if (isLocked) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${theme.colors} flex items-center justify-center p-10 text-center`}>
         <div className="space-y-4 opacity-60">
            <p className="text-sm font-light tracking-widest">十分がんばったのでおやすみです。</p>
            <p className="text-[10px] uppercase">Locked for 24 hours</p>
         </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen bg-gradient-to-b ${theme.colors} transition-colors duration-[2000ms] py-12 px-6 relative flex flex-col items-center overflow-hidden font-sans`}>
      {/* 和紙テクスチャレイヤー */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply select-none" 
           style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }} />

      {/* Header */}
      <header className="z-10 mb-12 text-center">
        <h1 className="text-xl font-light tracking-[0.4em] opacity-80" style={{ color: theme.text }}>日々ンゴ</h1>
        <p className="text-[9px] tracking-widest uppercase opacity-40 mt-2" style={{ color: theme.text }}>Observation of Daily Life</p>
      </header>

      {/* Bingo Cards Slider */}
      <div className="w-full max-w-md overflow-x-auto flex gap-4 pb-10 no-scrollbar snap-x z-10">
        {bingos.map((b, i) => (
          <motion.div
            key={b.id}
            onClick={() => setSelectedIdx(i)}
            className={`min-w-[120px] p-4 bg-white/50 border backdrop-blur-sm cursor-pointer snap-center transition-all duration-500
              ${selectedIdx === i ? 'border-stone-400 shadow-md scale-105' : 'border-stone-200 opacity-40 scale-95'}`}
          >
            <p className="text-[8px] uppercase tracking-tighter mb-1 opacity-50">{b.type}</p>
            <p className="text-[11px] font-medium truncate" style={{ color: theme.text }}>{b.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Bingo Grid */}
      <AnimatePresence mode="wait">
        {currentBingo && (
          <motion.div 
            key={currentBingo.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full max-w-sm aspect-square grid grid-cols-3 gap-3 z-10"
          >
            {currentBingo.grid.map((text, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleCell(i)}
                className={`relative p-2 text-[11px] leading-relaxed flex items-center justify-center text-center border transition-all duration-700
                  ${progress[i] ? 'bg-black/5 border-transparent text-stone-300' : 'bg-white/90 border-stone-100 text-stone-600 shadow-sm'}`}
              >
                {text}
                {i === 4 && isFirstOpen && !progress[i] && (
                  <motion.div animate={{ opacity: [0, 0.4, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute inset-0 bg-white" />
                )}
                {progress[i] && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-1 w-1 h-1 rounded-full bg-stone-300" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bingo Effect Message */}
      <AnimatePresence>
        {bingoEffect && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 text-center">
            <p className="text-xs italic font-serif text-stone-400">一列そろいました。いい感じです。</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Tools */}
      <div className="mt-16 z-10 flex flex-col items-center gap-6">
        <button onClick={resetBingo} className="text-[10px] text-stone-400 flex items-center gap-2 hover:text-stone-600 transition-colors">
          <RotateCcw size={12} /> 日々ンゴを新品にする
        </button>
        
        <div className="flex gap-8">
          <button onClick={() => setShowIntro(true)} className="p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/40 shadow-sm text-stone-500 hover:bg-white transition-all"><Book size={18} /></button>
          <button onClick={() => setShowCreate(true)} className="p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/40 shadow-sm text-stone-500 hover:bg-white transition-all"><Plus size={18} /></button>
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* 1. Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateBingoModal 
            favorites={favorites} 
            onClose={() => setShowCreate(false)} 
            onSave={() => { fetchData(); setShowCreate(false); }}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* 2. Intro Modal */}
      <AnimatePresence>
        {showIntro && (
          <Modal onClose={() => setShowIntro(false)}>
            <div className="text-xs leading-loose text-stone-500 space-y-4">
              <p className="font-medium text-stone-700">日々ンゴは、小さな行動を3×3に並べたビンゴです。</p>
              <p>1. 日々ンゴを選ぶ<br/>2. マスを押して記録する<br/>3. 一列そろって演出を楽しむ<br/>4. 全達成で自分をご褒美</p>
              <div className="pt-4 border-t border-stone-100 flex items-center gap-2 opacity-60">
                <Heart size={10} /> <span>お気に入りは♡で保存できます</span>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* 3. Reward Modal */}
      <AnimatePresence>
        {showReward && (
          <Modal onClose={() => setShowReward(false)} title="全マス達成おめでとう">
            <div className="space-y-4">
              <p className="text-xs text-stone-500">今日は、自分にどんなご褒美をあげますか？</p>
              <input 
                value={rewardText} 
                onChange={(e) => setRewardText(e.target.value)}
                className="w-full border-b border-stone-200 py-2 focus:outline-none text-xs"
                placeholder="例：ちょっと高いアイスを買う"
              />
              <button 
                onClick={submitReward}
                className="w-full py-3 bg-stone-800 text-white text-[10px] tracking-widest uppercase"
              >
                送信して休む
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}

// --- サブコンポーネント: 共通モーダル ---
function Modal({ children, onClose, title }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/10 backdrop-blur-sm">
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-white p-8 w-full max-w-sm relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-300 hover:text-stone-600 transition-colors"><X size={18}/></button>
        {title && <h2 className="text-sm font-medium text-stone-700 mb-6 tracking-widest">{title}</h2>}
        {children}
      </motion.div>
    </motion.div>
  );
}

// --- サブコンポーネント: ビンゴ作成 ---
function CreateBingoModal({ favorites, onClose, onSave, theme }) {
  const [title, setTitle] = useState("");
  const [cells, setCells] = useState(Array(9).fill(""));
  
  const updateCell = (i, val) => {
    const next = [...cells];
    next[i] = val;
    setCells(next);
  };

  const handleSave = async () => {
    const grid = [...cells];
    grid[4] = "日々ンゴを見る";
    if (!title) return alert("タイトルを入力してください");
    
    await supabase.from('bingos').insert({
      title,
      grid,
      type: 'custom',
      user_id: 'user_uuid'
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className={`min-h-screen bg-gradient-to-b ${theme.colors} p-8 flex flex-col items-center`}>
        <button onClick={onClose} className="self-start mb-10 text-stone-400 hover:text-stone-700"><ChevronLeft size={24} /></button>
        
        <div className="w-full max-w-sm space-y-8">
          <input 
            placeholder="日々ンゴの名前"
            className="w-full bg-transparent border-b border-stone-300 py-3 text-lg font-light focus:outline-none"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-2 aspect-square border p-2 bg-stone-50/50">
            {cells.map((text, i) => (
              <div key={i} className="bg-white border border-stone-100 p-1 flex items-center justify-center">
                {i === 4 ? (
                  <span className="text-[8px] text-stone-300 text-center">日々ンゴを見る<br/>(固定)</span>
                ) : (
                  <textarea 
                    className="w-full h-full text-[10px] resize-none focus:outline-none text-center"
                    value={text} onChange={(e) => updateCell(i, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] tracking-widest text-stone-400 uppercase">お気に入りパレット</p>
            <div className="flex flex-wrap gap-2">
              {favorites.map(f => (
                <button key={f.id} onClick={() => {
                  const empty = cells.findIndex((c, idx) => c === "" && idx !== 4);
                  if (empty !== -1) updateCell(empty, f.text);
                }} className="px-3 py-1 bg-white border border-stone-200 text-[10px] text-stone-500 hover:border-stone-400">
                  {f.text}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="w-full py-4 bg-stone-800 text-white text-xs tracking-[0.2em] uppercase shadow-lg">
            この日々を保存する
          </button>
        </div>
      </div>
    </div>
  );
}