"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Scroll, Sparkles, Bird } from "lucide-react";

export default function PoemPage() {
  const [poem, setPoem] = useState(null);
  const [isOpening, setIsOpening] = useState(false);

  const poems = [
    { text: `歩くって少し止まると書きますし、立ち止まる日もあなたの一歩。`, author: `言葉遊び` },
    { text: `生き方そのものを夢にする生き方もある。`, author: `魔法少女まどか☆マギカ` },
    { text: `気づいた分だけ、世界は愛おしくなる。`, author: `グッデイ CM` },
    { text: `98%の信頼`, author: `渡辺和子` },
    { text: `私、ヒマが好き`, author: `さくらももこ` },
    { text: `不自由と不幸はイコールじゃない。哀れに思われる理由はないよ。`, author: `鋼の錬金術師` },
    { text: `理解することと感情が動かないことは必ずしも同じではない。`, author: `Philosophical Quote` },
    { text: `和して同ぜず`, author: `論語` },
    { text: `Eat Well, Live Well.\nよく食べ、よく生きる`, author: `AJINOMOTO` },
    { text: `Garbage can\nゴミでも出来る`, author: `Metaphor` },
    { text: `Love is like a fart, if you push it, it's probably sh*t.\n愛はオナラのようなもの。無理に力めば、それはきっと〇〇〇である`, author: `Humorous Proverb` },
    { text: `Never take a person's dignity: it is worth everything to them, and nothing to you.\n人の尊厳を奪ってはいけない。それは彼らにとってのすべてであり、あなたにとっては価値のないものだから`, author: `Frank Barron` },
    { text: `The person is not a problem. The problem is a problem.\nその人が問題なのではない。問題そのものが、問題なのだ`, author: `Michael White` },
    { text: `Respect is an expression of yourself and your value.\n尊敬とは、あなた自身とその価値観の現れである`, author: `Philosophical Quote` },
    { text: `Solitude\nひとりであることを慈しむ、静かな時間`, author: `Concept` },
    { text: `Thank you for trying!\n挑戦してくれて、ありがとう！`, author: `Encouragement` }
  ];

  const pullPoem = () => {
    if (isOpening) return;
    setPoem(null);
    setIsOpening(true);
    setTimeout(() => {
      const randomPoem = poems[Math.floor(Math.random() * poems.length)];
      setPoem(randomPoem);
      setIsOpening(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#4F5D6B] font-sans selection:bg-[#C2B280]/20">
      <div className="max-w-md mx-auto h-[90vh] flex flex-col">
        
        <Link href="/menu" className="text-[10px] tracking-[0.3em] font-bold opacity-40 uppercase flex items-center gap-2 mb-12 hover:opacity-100 transition-all">
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          
          <div className="relative w-64 h-[26rem] group mb-8">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-8 h-8 border-[3px] border-[#4F5D6B]/30 rounded-full shadow-inner" />
              <div className="w-[3px] h-6 bg-gradient-to-b from-[#4F5D6B]/40 to-transparent" />
            </div>
            
            <div className="birdcage-body relative w-full h-full border-[2.5px] border-[#4F5D6B]/60 rounded-t-[12rem] rounded-b-lg overflow-hidden shadow-[0_40px_80px_rgba(79,93,107,0.2)] bg-gradient-to-b from-white/10 to-[#4F5D6B]/10 backdrop-blur-[4px]">
              <div className="absolute inset-0 wire-grid opacity-25" />
              <div className="absolute top-[45%] left-0 w-full h-[1.5px] bg-[#4F5D6B]/20 shadow-sm" />
              <Bird size={28} className="absolute top-[42%] left-1/2 -translate-x-1/2 opacity-10 text-[#4F5D6B]" strokeWidth={1} />

              <div className="absolute bottom-6 inset-x-0 flex flex-wrap justify-center gap-1 px-8">
                {[...Array(12)].map((_, i) => (
                  <Scroll 
                    key={i} 
                    size={28} 
                    className={`text-[#C2B280] opacity-50 transform transition-all duration-700
                      ${isOpening && i === 0 ? 'animate-float-out' : `rotate-${(i * 45) % 360} translate-y-${i % 3}`}
                    `}
                    strokeWidth={1}
                  />
                ))}
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={pullPoem}
                  disabled={isOpening}
                  className="z-20 px-10 py-4 bg-[#4F5D6B]/90 text-[#E6E1CF] rounded-sm text-[11px] font-bold tracking-[0.4em] shadow-2xl hover:bg-[#4F5D6B] active:scale-95 disabled:opacity-0 transition-all duration-700 outline-none border border-white/10"
                >
                  {isOpening ? "" : "Free a poem"}
                </button>
              </div>
            </div>
          </div>

          {poem && !isOpening && (
            <div className="w-full animate-scroll-unroll">
              <div className="bg-[#F4F1E1] border-y border-[#C2B280]/40 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative border-x-[12px] border-x-[#C2B280]/15 rounded-sm">
                <div className="absolute top-3 right-4 opacity-20 text-[#C2B280]">
                  <Sparkles size={22} />
                </div>
                <p className="text-[15px] font-[var(--font-serif)] italic leading-relaxed mb-8 text-[#2D363F] whitespace-pre-wrap tracking-wide">
                  {poem.text}
                </p>
                <div className="flex items-center justify-end pt-4 border-t border-[#4F5D6B]/10">
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] w-4 bg-[#C2B280]" />
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-60">
                       {poem.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .wire-grid {
          background-image: 
            linear-gradient(to right, #4F5D6B 1.5px, transparent 1.5px),
            linear-gradient(to bottom, #4F5D6B 1px, transparent 1px);
          background-size: 20px 45px;
        }
        @keyframes float-out {
          0% { transform: translateY(0) scale(1) rotate(0); opacity: 0.6; }
          30% { transform: translateY(-100px) scale(1.1) rotate(45deg); opacity: 0.8; }
          100% { transform: translateY(-400px) scale(0.5) rotate(180deg); opacity: 0; }
        }
        @keyframes scroll-unroll {
          from { transform: scaleY(0); opacity: 0; transform-origin: top; filter: blur(8px); }
          to { transform: scaleY(1); opacity: 1; transform-origin: top; filter: blur(0); }
        }
        .animate-float-out { animation: float-out 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-scroll-unroll { animation: scroll-unroll 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
      `}</style>
    </div>
  );
}