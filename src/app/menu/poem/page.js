"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Scroll, Sparkles, Bird } from "lucide-react";
import { supabase } from "../../../lib/supabase";

const originalPoems = [
  { text: "その水に馴染めている魚は、その水について考えない。その水に馴染めない魚だけが、その水について考え続けるのだ。", author: "武田砂鉄「べつに怒ってない」" },
  { text: "和して同ぜず", author: "論語" },
  { text: "他人の幸せは自分の不幸じゃない", author: "KUPPIE’S music" },
  { text: "歩くって少し止まるとかきますし、立ち止まる日もあなたの一歩。", author: "Unknown" },
  { text: "生き方そのものを夢にする生き方もある。", author: "魔法少女まどか☆マギカ" },
  { text: "98%の信頼", author: "渡辺和子「置かれた場所で咲きなさい」" },
  { text: "筋の通った遅さ", author: "岡潔" },
  { text: "Eat Well, Live Well.\n\n(よく食べ、よく生きる。)", author: "味の素株式会社" },
  { text: "Love is like a fart, if you push it, it's probably shit.\n\n(愛は屁のようなもの。無理に押し出そうとすれば、それはきっと糞である。)", author: "Unknown" },
  { text: "自分にしてもらいたいように、人に対してもせよ", author: "黄金律" },
  { text: "Good enough mother\n\n（ほどよい母親）", author: "DONALD WINNICOTT" },
  { text: "あー、、、このまま一生ヒマでいたいな、、、\n私ヒマが好き、、、", author: "さくらももこ" },
  { text: "Never take a person's dignity: it is worth everything to them, and nothing to you.\n\n(他人の尊厳を奪ってはいけない。それは彼らにとってのすべてであり、あなたにとっては無価値なものなのだから。)", author: "Frank Barron" },
  { text: "気づいた分だけ、世界は愛おしくなる。", author: "グッデイCM" },
  { text: "Garbage can", author: "言葉遊び" },
  { text: "理解することと感情が動かないことは必ずしも同じではない。", author: "Chappy" },
  { text: "Thank you for trying!\n\n（挑戦してくれてありがとう！)", author: "育児の定番フレーズ" },
  { text: "不自由と不幸はイコールじゃない。哀れに思われる理由はないよ。", author: "鋼の錬金術師 / アルフォンス" },
  { text: "今日の空振りは明日への素振り", author: "MOROHA" },
];

export default function PoemPage() {
  const [poem, setPoem] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [dbPoems, setDbPoems] = useState([]);

  useEffect(() => {
    const fetchPoems = async () => {
      try {
        const { data, error } = await supabase.from('poems').select('*');
        if (error) throw error;
        setDbPoems(data && data.length > 0 ? data : originalPoems);
      } catch (err) {
        setDbPoems(originalPoems);
      }
    };
    fetchPoems();
  }, []);

  const pullPoem = () => {
    if (isOpening) return;
    if (poem) {
      setPoem(null);
      return;
    }
    setIsOpening(true);
    setTimeout(() => {
      const randomPoem = dbPoems[Math.floor(Math.random() * dbPoems.length)];
      setPoem({ 
        text: randomPoem.body || randomPoem.text, 
        author: randomPoem.title || randomPoem.author || "Unknown" 
      });
      setIsOpening(false);
    }, 1800);
  };

  return (
    <div className={`min-h-screen p-8 transition-colors duration-[1500ms] ${poem ? 'bg-[#D1D5DB]' : 'bg-[#9CA3AF]'}`}>
      <div className="max-w-md mx-auto h-[90vh] flex flex-col relative">
        
        <Link href="/menu" className="text-[10px] tracking-[0.3em] font-bold opacity-40 uppercase flex items-center gap-2 mb-8 hover:opacity-100 transition-all text-[#4F5D6B]">
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        <header className="mb-12 text-center space-y-3 text-[#4F5D6B]">
          <h1 className="text-[13px] font-bold tracking-[0.2em] opacity-80">Free a poem</h1>
          <p className="text-[11px] leading-relaxed opacity-50 font-light tracking-wide">
            鳥かごの中に眠る言葉たちが、<br />
            今のあなたに必要な一節を届けてくれます。
          </p>
        </header>

        {/* 鳥かごエリア：固定位置 */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative w-64 h-[26rem] group">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-8 h-8 border-[3px] border-[#4F5D6B]/30 rounded-full" />
              <div className="w-[3px] h-6 bg-gradient-to-b from-[#4F5D6B]/40 to-transparent" />
            </div>
            
            <div className="birdcage-body relative w-full h-full border-[2.5px] border-[#4F5D6B]/60 rounded-t-[12rem] rounded-b-lg overflow-hidden bg-gradient-to-b from-white/10 to-[#4F5D6B]/10 backdrop-blur-[4px]">
              <div className="absolute inset-0 wire-grid opacity-25" />
              <div className="absolute top-[45%] left-0 w-full h-[1.5px] bg-[#4F5D6B]/20" />
              <Bird size={28} className="absolute top-[42%] left-1/2 -translate-x-1/2 opacity-10 text-[#4F5D6B]" />

              <div className="absolute bottom-6 inset-x-0 flex flex-wrap justify-center gap-1 px-8">
                {[...Array(12)].map((_, i) => (
                  <Scroll key={i} size={28} className={`text-[#C2B280] opacity-50 transition-all duration-700 ${isOpening && i === 0 ? 'animate-float-out' : ''}`} />
                ))}
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={pullPoem} disabled={isOpening} className="z-20 px-10 py-4 bg-[#4F5D6B]/90 text-[#E6E1CF] rounded-sm text-[11px] font-bold tracking-[0.4em] shadow-2xl hover:bg-[#4F5D6B] active:scale-95 transition-all">
                  {isOpening ? "" : (poem ? "Close" : "Free a poem")}
                </button>
              </div>
            </div>
          </div>

          {/* ポエム表示エリア：鳥かごに被さる絶対配置 */}
          {poem && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none p-4">
              <div className="w-full max-w-[320px] animate-scroll-unroll pointer-events-auto" onClick={pullPoem}>
                <div className="bg-[#F4F1E1] border-y border-[#C2B280]/40 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border-x-[12px] border-x-[#C2B280]/15 rounded-sm cursor-pointer hover:scale-[1.02] transition-transform">
                  <Sparkles className="absolute top-3 right-4 opacity-20 text-[#C2B280]" size={22} />
                  <p className="text-[15px] font-serif italic leading-relaxed mb-8 text-[#2D363F] whitespace-pre-wrap">{poem.text}</p>
                  <div className="flex justify-end pt-4 border-t border-[#4F5D6B]/10">
                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-60 text-[#4F5D6B]">{poem.author}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .wire-grid { background-image: linear-gradient(to right, #4F5D6B 1.5px, transparent 1.5px), linear-gradient(to bottom, #4F5D6B 1px, transparent 1px); background-size: 20px 45px; }
        @keyframes float-out { 0% { transform: translateY(0) rotate(0); opacity: 0.6; } 100% { transform: translateY(-400px) rotate(180deg); opacity: 0; } }
        @keyframes scroll-unroll { from { transform: scaleY(0); opacity: 0; filter: blur(8px); } to { transform: scaleY(1); opacity: 1; filter: blur(0); } }
        .animate-float-out { animation: float-out 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-scroll-unroll { animation: scroll-unroll 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
      `}</style>
    </div>
  );
}