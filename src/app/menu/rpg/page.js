"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ルーターを追加
import { X, BookOpen, User, Users } from "lucide-react";

export default function RpgMenuPage() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter(); // useRouterフックを使用

  const handleStartRandomBattle = () => {
    // 5体のモンスターからランダムに決定
    const monsters = ['witch', 'dragon', 'slime', 'blackhall', 'golem'];
    const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
    
    // 戦闘ページへモンスターキーを渡して遷移
    router.push(`/menu/rpg/solo?monster=${randomMonster}`);
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] p-6 font-mono text-[#E6E1CF]">
      <div className="max-w-md mx-auto border-4 border-[#D0D9DF] p-6 bg-[#1A252F] shadow-[8px_8px_0px_0px_rgba(208,217,223,0.3)]">
        
        <h1 className="text-3xl font-bold text-center mb-10 text-[#F2EBD4] tracking-widest uppercase italic">
          REbeLABEL
        </h1>

        <div className="space-y-6">
          {/* LinkタグからonClickボタンに変更 */}
          <button 
            onClick={handleStartRandomBattle}
            className="w-full py-4 border-2 border-[#B5A773] bg-[#3E4A56] hover:bg-[#B5A773] hover:text-[#1A252F] transition-all flex items-center justify-center gap-3"
          >
            <User size={20} />
            <span>SINGLE MODE (修行)</span>
          </button>

          <button className="w-full py-4 border-2 border-[#5F6F7A] bg-[#3E4A56] opacity-50 cursor-not-allowed flex items-center justify-center gap-3">
            <Users size={20} />
            <span>MULTI MODE (共闘)</span>
          </button>

          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-4 border-2 border-[#D0D9DF] hover:bg-[#D0D9DF] hover:text-[#1A252F] transition-all flex items-center justify-center gap-3"
          >
            <BookOpen size={20} />
            <span>遊び方</span>
          </button>
        </div>

        <p className="mt-12 text-[10px] text-center opacity-60">
          君のラベルで、固定観念を討伐せよ。
        </p>
      </div>

      {/* Modalは変更なし */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1A252F] border-4 border-[#D0D9DF] p-6 max-w-sm w-full relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 p-1 bg-[#D0D9DF] text-[#1A252F]">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 border-b-2 border-[#B5A773] pb-2 text-[#B5A773]">遊び方</h2>
            <div className="text-sm space-y-4 opacity-90 leading-relaxed">
              <p>1. 自分の「ラベル（特性）」を5つ入力します。</p>
              <p>2. モンスターが現れます。ラベルを使って攻撃しましょう。</p>
              <p>3. <strong>重要：</strong>解釈次第で「欠点」は「最強の武器」になります。</p>
              <p>4. オンラインで協力プレイも！</p>
              <p className="text-xs pt-4 italic text-[#D0D9DF]/60">※解釈を放棄するとダメージを受けるので注意！</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}