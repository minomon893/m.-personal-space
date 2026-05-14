"use client";

import { motion } from "framer-motion";

export default function BingoBoard({ grid, progress, onToggle, isFirstOpen }) {
  return (
    <div className="w-full max-w-sm aspect-square grid grid-cols-3 gap-3">
      {grid.map((text, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.96 }}
          onClick={() => onToggle(i)}
          className={`relative p-2 text-[11px] leading-relaxed flex items-center justify-center text-center border transition-all duration-700
            ${progress[i] 
              ? 'bg-black/5 border-transparent text-stone-300' 
              : 'bg-white/90 border-stone-100 text-stone-600 shadow-sm'}`}
        >
          {text}
          
          {/* 中央マスの初回のみ演出 */}
          {i === 4 && isFirstOpen && !progress[i] && (
            <motion.div 
              animate={{ opacity: [0, 0.4, 0] }} 
              transition={{ repeat: Infinity, duration: 3 }} 
              className="absolute inset-0 bg-white" 
            />
          )}

          {/* チェック済みの印（小さな点） */}
          {progress[i] && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="absolute bottom-1 w-1 h-1 rounded-full bg-stone-300" 
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}