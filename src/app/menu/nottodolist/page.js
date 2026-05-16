"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, X, MessageCircle, ChevronLeft, Trophy } from 'lucide-react';
import { supabase } from "../../../lib/supabase";
import Link from 'next/link';

export default function NotToDoPage() {
  const [entries, setEntries] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [newAction, setNewAction] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentFeelings, setCurrentFeelings] = useState('');
  const [selectedTrophy, setSelectedTrophy] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setIsLoading(true);
    const { data: logData } = await supabase
      .from('not_to_do_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    const { data: trophyData } = await supabase
      .from('not_to_do_trophies')
      .select('*')
      .order('created_at', { ascending: true });

    if (logData) {
      setEntries(logData);
      localStorage.setItem('not_to_do_cache', JSON.stringify(logData));
    }
    if (trophyData) setTrophies(trophyData);
    setIsLoading(false);
  }

  async function handleAddAction(e) {
    if (e) e.preventDefault();
    if (!newAction.trim()) return;

    const { data, error } = await supabase
      .from('not_to_do_logs')
      .insert([{ action: newAction, is_completed: false }])
      .select().single();

    if (!error && data) {
      setEntries([data, ...entries]);
      setNewAction('');
    }
  }

  async function handleUpdateReflection(id, reflection, tags) {
    const { error } = await supabase
      .from('not_to_do_logs')
      .update({ reflection, tags, is_completed: true })
      .eq('id', id);

    if (!error) {
      const updatedEntries = entries.map(e => 
        e.id === id ? { ...e, reflection, tags, is_completed: true } : e
      );
      setEntries(updatedEntries);

      const newCompletedCount = updatedEntries.filter(e => e.is_completed).length;
      if (newCompletedCount > 0 && newCompletedCount % 5 === 0) {
        setTimeout(() => setShowCelebration(true), 1000);
      }
    }
  }

  async function saveTrophy() {
    const { data, error } = await supabase
      .from('not_to_do_trophies')
      .insert([{ feelings: currentFeelings }])
      .select().single();

    if (!error && data) {
      setTrophies([...trophies, data]);
      setShowCelebration(false);
      setCurrentFeelings('');
    }
  }

  const completedCount = entries.filter(e => e.is_completed).length;
  const currentProgressCount = completedCount % 5;
  const progressPercent = (currentProgressCount === 0 && completedCount > 0 && !showCelebration && trophies.length < Math.floor(completedCount / 5)) 
    ? 100 
    : (currentProgressCount / 5) * 100;

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#4A4A4A] font-sans selection:bg-stone-200 relative overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-40 bg-[#F7F7F7]/80 backdrop-blur-sm">
        <Link href="/menu" className="p-2 hover:opacity-50 transition-opacity">
          <ChevronLeft size={22} strokeWidth={1.5} />
        </Link>
        <button 
          onClick={() => setShowInfo(true)} 
          className="p-2 border border-stone-300 rounded-full hover:bg-stone-100 transition-all shadow-sm"
        >
          <BookOpen size={20} strokeWidth={1.5} />
        </button>
      </nav>

      {/* Identity Area */}
      <div className="fixed right-4 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-8 z-0">
        <div className="relative w-32 h-64 md:w-40 md:h-80 flex items-end justify-center">
          <div className="absolute inset-0 bg-amber-100/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 w-full h-full overflow-hidden" style={{ clipPath: 'url(#human-mask)' }}>
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 30, damping: 15 }}
              className="w-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-200 absolute bottom-0 shadow-[0_0_30px_rgba(251,191,36,0.6)]"
            />
          </div>
          <svg className="w-full h-full text-stone-200 fill-current opacity-90 relative z-10" viewBox="0 0 24 24">
            <defs>
              <clipPath id="human-mask">
                <path d="M12,2c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S10.9,2,12,2z M10.5,7h3c1.1,0,2,0.9,2,2v5.5h-1.5V22h-4v-7.5H8.5V9C8.5,7.9,9.4,7,10.5,7z" />
              </clipPath>
            </defs>
            <path d="M12,2c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S10.9,2,12,2z M10.5,7h3c1.1,0,2,0.9,2,2v5.5h-1.5V22h-4v-7.5H8.5V9C8.5,7.9,9.4,7,10.5,7z" 
              fill="none" stroke="#D6D3D1" strokeWidth="0.2" />
          </svg>
          <div className="absolute -bottom-6 w-full text-center">
             <p className="text-[8px] tracking-[0.4em] uppercase opacity-40 font-medium">Core Progress</p>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-3 max-w-[160px] min-h-[40px] px-2 pb-1">
            {trophies.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.2, y: -5 }}
                onClick={() => setSelectedTrophy(t)}
                className="text-amber-500 drop-shadow-sm cursor-pointer"
              >
                <Trophy size={18} fill="currentColor" fillOpacity={0.2} />
              </motion.button>
            ))}
          </div>
          <div className="w-32 md:w-40 h-[2px] bg-stone-300 rounded-full shadow-sm" />
          <div className="w-28 md:w-36 h-[4px] mt-[2px] bg-stone-200/50 rounded-full" />
          <p className="text-[8px] mt-2 tracking-[0.3em] uppercase opacity-30">Achievements</p>
        </div>
      </div>

      <header className="max-w-xl mx-auto pt-28 px-6 pb-12 relative z-10">
        <h1 className="text-2xl md:text-3xl font-serif tracking-widest mb-2 italic">Not to do list</h1>
        <p className="text-[11px] md:text-[12px] uppercase tracking-[0.3em] opacity-40 leading-relaxed">
          Recording the feeling of not being yourself.
        </p>
      </header>

      <main className="max-w-xl mx-auto px-6 space-y-12 pb-32 relative z-10">
        <section className="bg-white p-6 md:p-8 border border-[#E5E5E5] shadow-sm">
          <p className="text-[10px] mb-4 tracking-widest opacity-60 italic">まずは、やってみることを決める</p>
          <form onSubmit={handleAddAction} className="flex gap-4">
            <input 
              type="text" 
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="例：あえて苦手な色の服を着る"
              className="flex-1 bg-transparent border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
            <button type="submit" className="p-2 hover:bg-stone-50 transition-colors">
              <Plus size={20} strokeWidth={1} />
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <h2 className="text-[10px] tracking-[0.2em] uppercase opacity-40">Observation Logs</h2>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {entries.map((entry) => (
                <LogItem key={entry.id} entry={entry} onUpdate={handleUpdateReflection} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="text-center max-w-sm w-full space-y-8">
              <motion.div 
                animate={{ rotateY: 360, scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex justify-center text-amber-400"
              >
                <Trophy size={80} strokeWidth={1} />
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-white font-serif italic text-lg tracking-widest">Congratulations.</h2>
                <p className="text-stone-400 text-xs leading-loose">おめでとう。あなたが変わろうとした証です。</p>
              </div>
              <div className="space-y-4 bg-white/5 p-6 rounded-sm">
                <p className="text-[10px] text-stone-500 uppercase tracking-widest">How do you feel now?</p>
                <textarea 
                  value={currentFeelings}
                  onChange={(e) => setCurrentFeelings(e.target.value)}
                  placeholder="今の気持ちを台座に刻みましょう"
                  className="w-full bg-transparent border-b border-white/20 text-white text-sm py-2 focus:outline-none focus:border-amber-400 resize-none h-20"
                />
                <button 
                  onClick={saveTrophy}
                  className="w-full py-3 bg-amber-500 text-stone-900 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-amber-400 transition-colors"
                >
                  Collect Trophy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trophy Detail View */}
      <AnimatePresence>
        {selectedTrophy && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedTrophy(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-stone-100/95 backdrop-blur-md"
          >
            <motion.div className="relative flex flex-col items-center">
              <Trophy size={100} className="text-amber-500 mb-6 drop-shadow-lg" strokeWidth={1} fill="currentColor" fillOpacity={0.1} />
              <div className="bg-stone-800 px-8 py-6 rounded-sm shadow-2xl text-center max-w-xs border-t-4 border-amber-600">
                <p className="text-amber-200/50 text-[9px] mb-2 font-serif italic uppercase tracking-widest">
                  {new Date(selectedTrophy.created_at).toLocaleDateString()}
                </p>
                <p className="text-white text-[13px] leading-relaxed font-sans italic">
                  "{selectedTrophy.feelings || "静かな変化の記録"}"
                </p>
              </div>
              <p className="mt-8 text-[10px] uppercase tracking-widest opacity-30 italic cursor-pointer">Tap to return</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-100/90 backdrop-blur-sm">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white border border-stone-200 p-8 md:p-10 max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowInfo(false)} className="absolute top-6 right-6 opacity-30 hover:opacity-100 transition-opacity">
                <X size={20} strokeWidth={1} />
              </button>
              
              <div className="space-y-8">
                <header className="border-b border-stone-100 pb-6">
                  <h3 className="text-[15px] font-serif italic tracking-[0.1em] mb-2">Not to do list について</h3>
                  <p className="text-[11px] opacity-50 tracking-wider">〜自分らしさの輪郭を描く、逆説の実験室〜</p>
                </header>

                <div className="text-[12px] leading-relaxed space-y-6 opacity-80 text-stone-600">
                  <p>
                    「自分らしさ」を見つけるのは難しいけれど、「これじゃない！」という違和感は、私たちの体が教えてくれる最も信頼できるシグナルです。
                    このページは、あえて「自分らしくない選択」をすることで、その裏側に隠れているあなたの理想や、本当に大切にしたい価値観を浮かび上がらせるための場所です。
                  </p>

                  <section className="space-y-3 bg-stone-50 p-4 rounded-sm">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">How to use</h4>
                    <ul className="space-y-2">
                      <li><span className="font-bold text-stone-800">らしくない選択:</span> 普段の自分なら選ばない行動を、あえて実験的に選んでみる。</li>
                      <li><span className="font-bold text-stone-800">違和感をキャッチ:</span> その時に生じる「恥ずかしさ」や「無理してる感」を、心のシグナルとして観察する。</li>
                      <li><span className="font-bold text-stone-800">シグナルを貯める:</span> ログを貯めていくことで、右側のインジケーターが満たされ、あなたの「無理のない形」が少しずつ見えてきます。</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">この実験の良さ</h4>
                    <ul className="space-y-2">
                      <li><span className="font-bold text-stone-800">無責任を肯定する:</span> 「こんなの私じゃない」と手放すことは、自分への誠実さです。</li>
                      <li><span className="font-bold text-stone-800">正解を探さない:</span> 何が正解か分からなくても、「これではない」を減らすだけで心は軽くなります。</li>
                      <li><span className="font-bold text-stone-800">余白を作る:</span> 合わない役割を置いていくことで、今のあなたが自然に収まるための「余白」が生まれます。</li>
                    </ul>
                  </section>

                  <p className="italic pt-4 border-t border-stone-100 text-center opacity-60">
                    「これじゃない」というシグナルの先に、あなたが少しだけ楽にいられる場所が見つかります。
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogItem({ entry, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [reflection, setReflection] = useState(entry.reflection || '');
  const [selectedTags, setSelectedTags] = useState(entry.tags || []);
  const tagsList = ['違和感', '無理感', '恥ずかしさ', '新しい発見', 'ざわつき'];

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 border border-white p-5 md:p-7 backdrop-blur-sm hover:border-stone-300 transition-all shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium tracking-tight">{entry.action}</span>
        <span className="text-[10px] opacity-30 italic font-serif">{new Date(entry.created_at).toLocaleDateString('ja-JP').replace(/\//g, '.')}</span>
      </div>

      {!entry.is_completed && !isEditing ? (
        <button onClick={() => setIsEditing(true)} className="text-[11px] flex items-center gap-2 opacity-40 hover:opacity-100"><MessageCircle size={13} /> 観察結果を記録する</button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(isEditing ? tagsList : entry.tags || []).map(tag => (
              <button key={tag} disabled={!isEditing} onClick={() => toggleTag(tag)} className={`text-[9px] px-2 py-0.5 border rounded-full transition-colors ${selectedTags.includes(tag) ? 'bg-stone-800 text-white border-stone-800' : 'border-stone-200 text-stone-500'}`}>{tag}</button>
            ))}
          </div>
          {isEditing ? (
            <div className="space-y-3">
              <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="その時、心はどう動きましたか？" className="w-full bg-transparent border-b border-stone-100 py-2 text-[13px] focus:outline-none min-h-[80px] resize-none" />
              <div className="flex justify-end gap-4 items-center">
                <button onClick={() => setIsEditing(false)} className="text-[10px] uppercase opacity-40">Cancel</button>
                <button onClick={() => { onUpdate(entry.id, reflection, selectedTags); setIsEditing(false); }} className="text-[10px] uppercase underline underline-offset-8 decoration-stone-200 hover:decoration-stone-800">Save Discovery</button>
              </div>
            </div>
          ) : (
            <p className="text-[12px] leading-relaxed opacity-60 whitespace-pre-wrap">{entry.reflection}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}