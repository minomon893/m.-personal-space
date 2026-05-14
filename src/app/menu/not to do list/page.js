"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Info } from 'lucide-react';

export default function NotToDoPage() {
  const [entries, setEntries] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#4A4A4A] font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="max-w-xl mx-auto pt-20 px-6 pb-12">
        <h1 className="text-2xl font-serif tracking-widest mb-2 italic">Not to do list</h1>
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-40">
          Recording the feeling of not being yourself.
        </p>
      </header>

      <main className="max-w-xl mx-auto px-6 space-y-12 pb-32">
        {/* 入力セクション */}
        <section className="bg-white p-8 border border-[#E5E5E5] shadow-sm">
          <p className="text-[10px] mb-4 tracking-widest opacity-60 italic">まずは、やってみることを決める</p>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="例：あえて苦手な色の服を着る"
              className="flex-1 bg-transparent border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-800 transition-colors"
            />
            <button className="p-2 hover:bg-stone-50 transition-colors">
              <Plus size={20} strokeWidth={1} />
            </button>
          </div>
        </section>

        {/* ログリスト */}
        <section className="space-y-6">
          <h2 className="text-[10px] tracking-[0.2em] uppercase opacity-40">Observation Logs</h2>
          <div className="space-y-4">
            {/* Entry Item Example */}
            <motion.div 
              className="bg-white/60 border border-white p-6 backdrop-blur-sm group hover:border-stone-300 transition-all cursor-pointer"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium">行きたくない場所に行ってみる</span>
                <span className="text-[10px] opacity-30 italic">2026.05.14</span>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {['無理感', '恥ずかしさ'].map(tag => (
                  <span key={tag} className="text-[9px] px-2 py-1 border border-stone-200 text-stone-500 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-relaxed opacity-60">
                「やっぱり、ここには自分の居場所がない」とはっきりわかった。
                拒絶ではなく、解像度が上がった感覚。
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 思想のガイド */}
      <footer className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-6 py-3 border border-stone-200 shadow-xl rounded-full flex items-center gap-4 pointer-events-auto">
          <Info size={14} className="opacity-40" />
          <p className="text-[10px] tracking-widest opacity-60">やってから、考える。</p>
        </div>
      </footer>
    </div>
  );
}