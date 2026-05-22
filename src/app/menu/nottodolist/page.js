"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, X, Trash2, Edit2, ChevronLeft, Trophy } from 'lucide-react';
import { supabase } from "../../../lib/supabase";
import Link from 'next/link';

export default function NotToDoPage() {
  const [entries, setEntries] = useState([]);
  const [newAction, setNewAction] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentFeelings, setCurrentFeelings] = useState('');

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    const { data: logs } = await supabase.from('not_to_do_logs').select('*').order('created_at', { ascending: false });
    if (logs) setEntries(logs);
  }

  async function handleAddAction(e) {
    if (e) e.preventDefault();
    if (!newAction.trim()) return;
    const { data } = await supabase.from('not_to_do_logs').insert([{ action: newAction, is_completed: false }]).select().single();
    if (data) { setEntries([data, ...entries]); setNewAction(''); }
  }

  async function handleUpdate(id, reflection, tags, nextActions) {
    const { error } = await supabase.from('not_to_do_logs').update({ reflection, tags, nextActions, is_completed: true }).eq('id', id);
    if (!error) {
      const updatedEntries = entries.map(e => e.id === id ? { ...e, reflection, tags, nextActions, is_completed: true } : e);
      setEntries(updatedEntries);
      if ((updatedEntries.filter(e => e.is_completed).length) % 5 === 0) setShowCelebration(true);
    }
  }

  async function saveTrophy() {
    await supabase.from('not_to_do_trophies').insert({ feelings: currentFeelings });
    setShowCelebration(false);
    setCurrentFeelings('');
  }

  const completedCount = entries.filter(e => e.is_completed).length;

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
          <p className="text-xs opacity-60">違和感を実験し、自分らしさの輪郭を削り出すための記録場所。</p>
        </header>

        <section className="bg-white/30 p-4 rounded-xl border border-white/50 mb-8">
          <p className="text-[10px] uppercase opacity-50 mb-2">次のトロフィーまで：{5 - (completedCount % 5)} レポート</p>
          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#e67e22]/60 rounded-full transition-all duration-500" style={{ width: `${(completedCount % 5) * 20}%` }} />
          </div>
        </section>

        <form onSubmit={handleAddAction} className="flex gap-2 mb-8">
          <input value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="例）派手な服を着てみる" className="flex-1 bg-white/50 rounded-lg p-3 outline-none border border-white" />
          <button type="submit" className="bg-[#4a4030] text-white px-6 rounded-lg font-bold"><Plus /></button>
        </form>

        <div className="space-y-4">
          {entries.map(e => <LogItem key={e.id} entry={e} onUpdate={handleUpdate} onDelete={async (id) => { await supabase.from('not_to_do_logs').delete().eq('id', id); setEntries(entries.filter(i => i.id !== id)); }} />)}
        </div>
      </div>

      <CelebrationModal show={showCelebration} setShow={setShowCelebration} saveTrophy={saveTrophy} currentFeelings={currentFeelings} setCurrentFeelings={setCurrentFeelings} />
      <InfoModal show={showInfo} setShow={setShowInfo} />
    </div>
  );
}

function LogItem({ entry, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refl, setRefl] = useState(entry.reflection || '');
  const [tags, setTags] = useState(entry.tags || []);
  const [next, setNext] = useState(entry.nextActions || []);

  const tagsList = ['違和感', '無理感', '恥ずかしさ', '新しい発見', 'ざわつき'];
  const options = ["ハードルを下げる", "今は時期じゃない", "誰かに聞く", "満足！"];

  return (
    <div className="bg-white/60 p-5 rounded-2xl border border-white cursor-pointer" onClick={() => !isEditing && entry.is_completed && setIsExpanded(!isExpanded)}>
      <div className="flex justify-between items-center">
        <h3 className={`font-bold ${entry.is_completed ? '' : 'opacity-60'}`}>{entry.action}</h3>
        <div className="flex gap-2 opacity-50" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onDelete(entry.id)}><Trash2 size={16} /></button>
          <button onClick={() => setIsEditing(!isEditing)}><Edit2 size={16} /></button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 pt-4 border-t border-black/10" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap gap-1 mb-3">
            {tagsList.map(t => <button key={t} onClick={() => setTags(prev => prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t])} className={`text-[9px] px-2 py-1 rounded-full border ${tags.includes(t) ? 'bg-[#e67e22] text-white' : 'border-black/20'}`}>{t}</button>)}
          </div>
          <textarea value={refl} onChange={(e) => setRefl(e.target.value)} className="w-full p-2 bg-white/50 rounded-lg text-sm mb-3" placeholder="心はどう動いた？" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            {options.map(o => <button key={o} onClick={() => setNext(prev => prev.includes(o) ? prev.filter(i => i !== o) : [...prev, o])} className={`p-2 text-[9px] rounded-lg border ${next.includes(o) ? 'bg-[#e67e22] text-white' : 'border-black/20'}`}>{o}</button>)}
          </div>
          <button onClick={() => { onUpdate(entry.id, refl, tags, next); setIsEditing(false); }} className="w-full bg-[#4a4030] text-white py-2 rounded-lg text-xs font-bold">SUBMIT</button>
        </div>
      ) : entry.is_completed ? (
        isExpanded ? (
          <div className="mt-4 pt-4 border-t border-black/10">
            <div className="flex gap-1 mb-2">
              {tags.map(t => <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-[#e67e22]/20 text-[#4a4030]">{t}</span>)}
            </div>
            <p className="mb-2 opacity-80 whitespace-pre-wrap text-sm">{entry.reflection}</p>
            <div className="text-[10px] opacity-60">次の一歩: {entry.nextActions?.join(', ')}</div>
          </div>
        ) : (
          <div className="mt-3 text-xs opacity-70 flex flex-col gap-1">
            <div className="flex gap-1">{entry.tags?.map(t => <span key={t} className="bg-[#e67e22]/10 px-1 rounded">{t}</span>)}</div>
            <p className="truncate">{entry.reflection || "記録なし"}</p>
          </div>
        )
      ) : (
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="mt-4 w-full py-2 border border-dashed border-[#4a4030]/30 rounded-lg text-xs opacity-50 text-center hover:opacity-100 transition-opacity">
          実践結果を記録する
        </button>
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
        <h2 className="font-black mb-4">ROUND CLEAR!</h2>
        <textarea value={currentFeelings} onChange={(e) => setCurrentFeelings(e.target.value)} placeholder="今の気持ちを刻む" className="w-full p-3 rounded-lg mb-4" />
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
        <div className="text-sm leading-relaxed opacity-70 space-y-4">
          <p>「自分らしさ」を見つけるのは難しいものですが、「これじゃない！」という違和感は、体が教えてくれる最も信頼できるシグナルです。</p>
          <p>このリストは、あえて「自分らしくない選択」をすることで、その裏側に隠れているあなたの本当に大切にしたい価値観を浮かび上がらせるための実験室です。</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>らしくない選択:</strong> 普段なら選ばない行動をあえて取ってみる。</li>
            <li><strong>違和感を観察:</strong> 「恥ずかしさ」や「無理感」を心のシグナルとして記録する。</li>
            <li><strong>シグナルを貯める:</strong> 5つの記録でトロフィーを獲得し、自分の心地よい境界線を見つける。</li>
          </ul>
          <p className="italic pt-2">「これではない」という選択肢を減らしていくことで、心は少しずつ軽くなっていきます。</p>
        </div>
      </div>
    </div>
  );
}