"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [text, setText] = useState("深い霧の立ち込める森を歩いている...");
  const router = useRouter();

  useEffect(() => {
    // ランダムなナレーション候補
    const narrations = [
      "底知れぬ悪意が、この森を支配している...",
      "腐敗した空気が、肺を侵食していく...",
      "何者かの視線が、闇の奥からこちらを狙っている...",
      "禁忌の領域に、足を踏み入れてしまったようだ..."
    ];
    const randomNarration = narrations[Math.floor(Math.random() * narrations.length)];

    const steps = [
      { t: "深い霧の立ち込める森を歩いている...", d: 0 },
      { t: randomNarration, d: 3000 },
      { t: "モンスターが飛び出してきた！！", d: 6000 }
    ];

    steps.forEach((step) => {
      setTimeout(() => setText(step.t), step.d);
    });

    const timer = setTimeout(() => {
      const monsters = ['witch', 'dragon', 'slime', 'blackhall', 'golem'];
      const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
      router.push(`/menu/rpg/solo?monster=${randomMonster}`);
    }, 8500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050202] flex flex-col items-center justify-center p-8 font-mono text-[#d10000] relative overflow-hidden">
      {/* 禍々しい背景演出 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(40,0,0,0.8)_0%,_rgba(5,2,2,1)_100%)] z-0 animate-pulse" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl mb-8 animate-pulse text-white drop-shadow-[0_0_15px_rgba(209,0,0,0.8)]">💀</div>
        <p className="text-xl text-center tracking-[0.2em] uppercase font-bold animate-pulse text-[#ff3333]">
          {text}
        </p>
        
        {/* 進行バー */}
        <div className="mt-12 w-64 h-1 bg-[#200000] rounded-full overflow-hidden border border-[#500000]">
          <div className="h-full bg-[#ff0000] shadow-[0_0_10px_#ff0000] animate-[loading_8s_linear_forwards]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}