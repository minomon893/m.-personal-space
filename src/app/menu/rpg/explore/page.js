"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [text, setText] = useState("深い霧の立ち込める森を歩いている...");
  const router = useRouter();

  useEffect(() => {
    // 演出のステップ
    const steps = [
      { t: "深い霧の立ち込める森を歩いている...", d: 1000 },
      { t: "足元で小枝が折れる音がした...", d: 3000 },
      { t: "背後に冷たい気配を感じる...", d: 5000 },
      { t: "モンスターが飛び出してきた！！", d: 7000 }
    ];

    steps.forEach((step) => {
      setTimeout(() => setText(step.t), step.d);
    });

    // 演出終了後にバトルへ
    const timer = setTimeout(() => {
      // ランダムにモンスターを決定して遷移
      const monsters = ['witch', 'dragon', 'slime', 'blackhall', 'golem'];
      const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
      router.push(`/menu/rpg/solo?monster=${randomMonster}`);
    }, 8500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 font-mono text-[#E6E1CF]">
      <div className="text-6xl mb-8 animate-bounce">🌲</div>
      <p className="text-xl text-center tracking-widest">{text}</p>
      
      {/* 進行バーの演出 */}
      <div className="mt-12 w-64 h-1 bg-[#333] rounded-full overflow-hidden">
        <div className="h-full bg-[#B5A773] animate-[loading_8s_linear_forwards]"></div>
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