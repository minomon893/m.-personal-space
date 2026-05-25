"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, BookOpen, User, Users } from "lucide-react";

export default function RpgMenuPage() {
  const [showModal, setShowModal] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const monsters = ["blackhall.png", "dragon.png", "slime.png", "witch.png", "golem.png"];
    const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
    setBgImage(`/images/monsters/${randomMonster}`);
  }, []);

  const handleStartBattle = () => {
    router.push('/menu/rpg/setup');
  };

  return (
    <div className="min-h-screen bg-[#020502] p-4 md:p-8 flex items-center justify-center font-serif text-[#dcded8] relative overflow-hidden">
      
      {/* 背景浮遊画像 */}
      <div 
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center animate-[float_15s_ease-in-out_infinite]"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* 画面全体を覆う深い森のグラデーション */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(10,30,10,0.9)_0%,_rgba(2,5,2,1)_100%)] z-0" />

      {/* メインメニュー枠 */}
      <div className="relative z-10 w-full max-w-sm bg-[#080d08]/90 border-double border-8 border-[#7a6b4a] p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#c5a059] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            REbeLABEL
          </h1>
          <p className="text-[10px] text-[#7a6b4a] tracking-[0.5em] mt-1 uppercase">リベラベル</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleStartBattle}
            className="w-full py-4 border-2 border-[#7a6b4a] bg-[#0f1a0f] hover:bg-[#7a6b4a] hover:text-[#020502] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 font-bold tracking-wider"
          >
            <User size={20} />
            <span>一人で戦う</span>
          </button>

          <button 
            onClick={handleStartBattle}
            className="w-full py-4 border-2 border-[#7a6b4a] bg-[#0f1a0f] hover:bg-[#7a6b4a] hover:text-[#020502] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 font-bold tracking-wider"
          >
            <Users size={20} />
            <span>誰かと戦う</span>
          </button>

          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-4 border-2 border-[#dcded8] hover:bg-[#dcded8] hover:text-[#020502] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 font-bold tracking-wider"
          >
            <BookOpen size={20} />
            <span>遊び方</span>
          </button>
        </div>

        <p className="mt-12 text-[10px] text-center opacity-40 italic tracking-widest">
          君のラベルで、固定観念を討伐せよ。
        </p>
      </div>

      {/* Modal - 背景を不透明な濃い色に固定 */}
      {showModal && (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-6 z-50">
          <div className="bg-[#0a120a] border-4 border-[#7a6b4a] p-8 max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 p-1 text-[#7a6b4a] hover:text-[#c5a059]">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-[#7a6b4a] pb-2 text-[#c5a059]">遊び方</h2>
            <div className="text-sm space-y-4 leading-relaxed text-[#dcded8]">
              <p>1. 自分の「ラベル（特性）」を5つ入力します。</p>
              <p>2. モンスターが現れます。ラベルを使って攻撃しましょう。</p>
              <p>3. <strong>重要：</strong>解釈次第で「欠点」は「最強の武器」になります。</p>
              <p>4. オンラインで協力プレイも！</p>
              <p className="text-xs pt-4 italic text-[#7a6b4a]">※解釈を放棄するとダメージを受けるので注意！</p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}