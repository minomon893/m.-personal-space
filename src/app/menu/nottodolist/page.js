"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, X, ChevronLeft, Trophy, Download, Upload, Pencil } from 'lucide-react';
import Link from 'next/link';

export default function NotToDoPage() {
  const [entries, setEntries] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [newAction, setNewAction] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentFeelings, setCurrentFeelings] = useState('');

  // マウント時に一度だけ取得
  useEffect(() => {
    const savedEntries = localStorage.getItem('not_to_do_entries');
    const savedTrophies = localStorage.getItem('not_to_do_trophies');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedTrophies) setTrophies(JSON.parse(savedTrophies));
  }, []);

  const exportData = () => {
    const data = JSON.stringify({ entries, trophies });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nottodo_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { entries: iE, trophies: iT } = JSON.parse(event.target.result);
        if (iE) {
          setEntries(iE);
          localStorage.setItem('not_to_do_entries', JSON.stringify(iE));
        }
        if (iT) {
          setTrophies(iT);
          localStorage.setItem('not_to_do_trophies', JSON.stringify(iT));
        }
        alert('データを復元しました！');
      } catch (err) { alert('ファイルの読み込みに失敗しました。'); }
    };
    reader.readAsText(file);
  };

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newAction.trim()) return;
    const newEntry = { 
      id: Date.now(), 
      action: newAction, 
      is_completed: false, 
      created_at: new Date().toISOString(), 
      reflection: '', 
      tags: [], 
      nextActionType: '', 
      actionDetail: '' 
    };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('not_to_do_entries', JSON.stringify(updatedEntries));
    setNewAction('');
  };

  const handleUpdate = (id, updatedData) => {
    const updated = entries.map(e => e.id === id ? { ...e, ...updatedData, is_completed: true } : e);
    setEntries(updated);
    localStorage.setItem('not_to_do_entries', JSON.stringify(updated));
    if ((updated.filter(e => e.is_completed).length) % 5 === 0) setShowCelebration(true);
  };

  const saveTrophy = () => {
    const newTrophy = { id: Date.now(), feelings: currentFeelings, created_at: new Date().toISOString() };
    const updatedTrophies = [newTrophy, ...trophies];
    setTrophies(updatedTrophies);
    localStorage.setItem('not_to_do_trophies', JSON.stringify(updatedTrophies));
    setShowCelebration(false);
    setCurrentFeelings('');
  };

  return (
    <div className="min-h-screen bg-[#dccfb0] text-[#4a4030] font-mono relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="h-3/4 bg-gradient-to-b from-[#2c3e50] to-[#e67e22]" />
        <div className="h-1/4 bg-[#5d6d4e]" />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} animate={{ x: [-200, 1200] }} transition={{ repeat: Infinity, duration: 15 + i * 5, ease: "linear", delay: i * 3 }} className="absolute text-3xl" style={{ top: `${10 + i * 15}%` }}>
            {['☁️', '🚁', '✈️'][i % 3]}
          </motion.div>
        ))}
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute bottom-[20%] right-[5%] text-5xl rotate-[-10deg]">🏃‍♂️</motion.div>
      </div>

      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <nav className="flex justify-between items-center mb-8">
          <Link href="/menu" className="p-2 bg-black/5 rounded-full"><ChevronLeft /></Link>
          <button onClick={() => setShowInfo(true)} className="p-3 bg-black/5 rounded-full"><BookOpen size={20} /></button>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Not to do list</h1>
          <p className="text-xs opacity-60 mb-4">違和感を実験し、自分らしさの輪郭を削り出すための記録場所。</p>
          <div className="flex gap-2">
            <button onClick={exportData} className="flex items-center gap-1 text-[10px] bg-black/10 px-3 py-1 rounded-full"><Download size={12}/> Export</button>
            <label className="flex items-center gap-1 text-[10px] bg-black/10 px-3 py-1 rounded-full cursor-pointer">
              <Upload size={12}/> Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </header>

        <form onSubmit={handleAddAction} className="flex gap-2 mb-8">
          <input value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="例）派手な服を着てみる" className="flex-1 bg-white/50 rounded-lg p-3 outline-none border border-white" />
          <button type="submit" className="bg-[#4a4030] text-white px-6 rounded-lg font-bold"><Plus /></button>
        </form>

        <motion.div layout className="space-y-4 mb-12">
          <AnimatePresence mode="popLayout">
            {entries.map(e => <LogItem key={e.id} entry={e} onUpdate={handleUpdate} />)}
          </AnimatePresence>
        </motion.div>
      </div>

      <CelebrationModal show={showCelebration} setShow={setShowCelebration} saveTrophy={saveTrophy} currentFeelings={currentFeelings} setCurrentFeelings={setCurrentFeelings} />
      <InfoModal show={showInfo} setShow={setShowInfo} />
    </div>
  );
}

function LogItem({ entry, onUpdate }) {
  const [isRecording, setIsRecording] = useState(false);
  const [refl, setRefl] = useState(entry.reflection || '');
  const [tags, setTags] = useState(entry.tags || []);
  const [nextType, setNextType] = useState(entry.nextActionType || '');
  const [detail, setDetail] = useState(entry.actionDetail || '');

  const tagsList = ['違和感', '無理感', '恥ずかしさ', '新しい発見', 'ざわつき'];
  const options = ["ハードルを下げる", "今は時期じゃない", "誰かに聞く", "満足！"];

  return (
    <div className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm">
      {isRecording ? (
        <div>
          <h3 className="font-bold text-lg mb-3">{entry.action}</h3>
          <div className="text-[10px] font-bold opacity-50 mb-2">当てはまる感情</div>
          <div className="flex flex-wrap gap-1 mb-4">
            {tagsList.map(t => (
              <button key={t} onClick={() => setTags(p => p.includes(t) ? p.filter(i => i !== t) : [...p, t])} className={`text-[9px] px-2 py-1 rounded-full border transition-colors ${tags.includes(t) ? 'bg-[#e67e22] text-white border-[#e67e22]' : 'border-black/20'}`}>{t}</button>
            ))}
          </div>
          <textarea value={refl} onChange={(e) => setRefl(e.target.value)} className="w-full p-2 bg-white/50 rounded-lg text-sm mb-4 outline-none" placeholder="心はどう動いた？" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            {options.map(o => (
              <button key={o} onClick={() => setNextType(o)} className={`p-2 text-[9px] rounded-lg border transition-colors ${nextType === o ? 'bg-[#e67e22] text-white border-[#e67e22]' : 'border-black/20'}`}>{o}</button>
            ))}
          </div>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="w-full p-2 bg-white/50 rounded-lg text-sm mb-4 outline-none" placeholder="具体的にどうしたか記録しよう" />
          <button onClick={() => { onUpdate(entry.id, { reflection: refl, tags, nextActionType: nextType, actionDetail: detail }); setIsRecording(false); }} className="w-full bg-[#4a4030] text-white py-2 rounded-lg text-xs font-bold">SAVE</button>
        </div>
      ) : entry.is_completed ? (
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-base">{entry.action}</h3>
            <span className="text-[10px] opacity-40">{new Date(entry.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.tags.map(t => <span key={t} className="bg-[#e67e22]/20 text-[#e67e22] px-2 py-0.5 rounded-full text-[9px] font-bold">{t}</span>)}
          </div>
          <p className="text-sm opacity-80 bg-black/5 p-3 rounded-lg italic">"{entry.reflection}"</p>
          <div className="mt-3 text-[11px] font-bold text-[#4a4030]/60 flex items-center justify-between">
            <div>🌱 {entry.nextActionType}： <span className="font-normal opacity-70">{entry.actionDetail}</span></div>
            <button onClick={() => setIsRecording(true)} className="p-1 opacity-50 hover:opacity-100"><Pencil size={14} /></button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-bold text-base">{entry.action}</h3>
          <button onClick={() => setIsRecording(true)} className="mt-3 w-full py-2 border border-dashed border-[#4a4030]/30 rounded-lg text-xs font-bold">🎯 記録する</button>
        </div>
      )}
    </div>
  );
}

function CelebrationModal({ show, setShow, saveTrophy, currentFeelings, setCurrentFeelings }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#dccfb0] p-8 rounded-3xl max-w-sm w-full text-center">
        <Trophy size={60} className="mx-auto text-[#e67e22] mb-4" />
        <textarea value={currentFeelings} onChange={(e) => setCurrentFeelings(e.target.value)} className="w-full p-3 rounded-lg mb-4" placeholder="今の気持ちを刻む" />
        <button onClick={saveTrophy} className="w-full py-3 bg-[#e67e22] text-white rounded-xl font-bold">COLLECT</button>
      </div>
    </div>
  );
}

function InfoModal({ show, setShow }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#dccfb0] p-8 rounded-3xl max-w-lg w-full relative">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4"><X /></button>
        <h3 className="font-bold mb-4">How to use</h3>
        <p className="text-sm opacity-70 leading-relaxed">違和感を実験し、自分らしさの輪郭を削り出すための記録場所です。</p>
      </div>
    </div>
  );
}