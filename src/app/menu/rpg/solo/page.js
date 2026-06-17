"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MonsterDisplay from "./components/MonsterDisplay";

const MONSTER_CONFIG = {
  witch: { name: "恋愛魔女リティ", context: "好きな人ができた！どうする？", initial: "あら、迷える勇者さんね。私の心、覗いてみる？" },
  dragon: { name: "承認欲求ドラゴン", context: "SNSで炎上した！どうする？", initial: "グオォォ！誰が一番輝いているか教えてやる！" },
  slime: { name: "自己否定スライム", context: "仕事で失敗した！どうする？", initial: "ぶよぶよ…どうせ私なんて、何もできないよ…" },
  blackhall: { name: "不安ブラックホールマン", context: "第一志望の面談！どうする？", initial: "飲み込まれるがいい…お前の不安も、希望も全て！" },
  golem: { name: "完璧主義ゴーレム", context: "テスト勉強全然出来てない！どうする？", initial: "不完全なものは許さん。私の強固な壁を越えてみろ。" },
};

// コンポーネントの中身をここに移動
function SoloBattleContent() {
  const searchParams = useSearchParams();
  const monsterKey = searchParams.get("monster") || "witch";
  const monster = MONSTER_CONFIG[monsterKey] || MONSTER_CONFIG.witch;
  
  const [hand, setHand] = useState([]);
  const [monsterHp, setMonsterHp] = useState(150);
  const [playerHp, setPlayerHp] = useState(100);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [interpretation, setInterpretation] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [damageBadge, setDamageBadge] = useState(null);
  const [displayedText, setDisplayedText] = useState("");
  const [narration, setNarration] = useState("");
  
  const [battleLog, setBattleLog] = useState([]);
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    const savedHand = localStorage.getItem("battleHand");
    setHand(savedHand ? JSON.parse(savedHand) : ['臆病', '真面目', '飽き性', '嫉妬深い', '人見知り']);
  }, []);

  useEffect(() => {
    if (!narration) {
      let i = 0;
      setDisplayedText("");
      const timer = setInterval(() => {
        setDisplayedText((prev) => prev + (aiResponse?.monsterReaction || monster.initial).charAt(i));
        i++;
        if (i >= (aiResponse?.monsterReaction || monster.initial).length) clearInterval(timer);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [monster, aiResponse, narration]);

  const handleAttack = async () => {
    if (!selectedLabel || !interpretation) return;
    setLoading(true);

    const baseCounterDamage = Math.floor(Math.random() * 6) + 10;
    
    try {
      const response = await fetch('/menu/rpg/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: selectedLabel, interpretation, monsterKey }),
      });
      const result = await response.json();
      
      const currentDamage = Number(result.monsterDamage) || 0;
      const newLog = { label: selectedLabel, damage: currentDamage, interpretation };
      const updatedLog = [...battleLog, newLog];
      setBattleLog(updatedLog);

      let finalPlayerDamage = baseCounterDamage;
      let effectMessage = "";

      if (result.effect === "手札破壊") {
        const randomIdx = Math.floor(Math.random() * hand.length);
        setHand(hand.filter((_, i) => i !== randomIdx));
        effectMessage = "手札が1枚燃やされた…！";
      } else if (result.effect === "デバフ") {
        effectMessage = "次のターンの被ダメージが2倍になるデバフを受けた！";
      } else if (result.effect === "固定ダメージ") {
        finalPlayerDamage += 5;
        effectMessage = "回避不能な強烈な一撃！";
      }

      setNarration(`${monster.name}の攻撃！プレイヤーに${finalPlayerDamage}ダメージ！\n${effectMessage}`);
      setPlayerHp(h => Math.max(0, h - finalPlayerDamage));

      setIsShaking(true);
      setAiResponse(result);
      setMonsterHp(h => Math.max(0, h - currentDamage));
      setDamageBadge(currentDamage > 0 ? `-${currentDamage}` : "MISS");
      
      const newHand = hand.filter(l => l !== selectedLabel);
      setHand(newHand);
      setSelectedLabel(null);
      setInterpretation("");

      setTimeout(() => {
        setDamageBadge(null);
        setNarration("");
      }, 2500);
      
      if (monsterHp - currentDamage <= 0 || playerHp - finalPlayerDamage <= 0 || newHand.length === 0) {
        if (monsterHp - currentDamage <= 0) {
          const totalDamage = updatedLog.reduce((sum, log) => sum + log.damage, 0);
          const mvp = updatedLog.reduce((prev, curr) => (prev.damage > curr.damage ? prev : curr));
          setFinalResult({ totalDamage, mvp });
        }
        setGameOver(true);
      }
    } catch (error) {
      console.error("AI判定エラー:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  if (gameOver) {
    const isWin = monsterHp <= 0;
    const isEscaped = hand.length === 0 && monsterHp > 0;
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e6e1cf] p-8 flex flex-col items-center justify-center font-mono">
        {isWin ? (
          <div className="text-center animate-in fade-in zoom-in duration-1000">
            <h2 className="text-3xl font-bold mb-8 text-[#8b5cf6]">討伐成功！</h2>
            <div className="border border-[#333] p-6 space-y-4 text-left w-full max-w-sm">
              <p>総ダメージ: <span className="text-[#8b5cf6] font-bold">{finalResult?.totalDamage}</span></p>
              <p>MVPラベル: <span className="text-[#B5A773] font-bold">{finalResult?.mvp.label}</span></p>
              <p>最大火力解釈: <span className="text-sm italic text-gray-400">"{finalResult?.mvp.interpretation}"</span></p>
            </div>
          </div>
        ) : (
          <h2 className="text-3xl font-bold mb-8 text-[#8b5cf6]">
            {isEscaped ? "撤退..." : "ゲームオーバー..."}
          </h2>
        )}
        {isEscaped && <p className="text-xl mb-4">武器がなくなった。。。一回逃げよう！</p>}
        <button onClick={() => window.location.href = '/menu/rpg'} className="mt-8 px-6 py-2 border border-[#8b5cf6]">リストへ戻る</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e6e1cf] p-6 font-mono">
      <Link href="/menu/rpg" className="flex items-center gap-2 text-[10px] uppercase opacity-50 mb-8"><ArrowLeft size={12} /> Back to List</Link>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 p-4 border-t border-b border-[#B5A773] bg-[#1a1a1a]">
          <h2 className="text-lg font-bold text-[#B5A773] tracking-widest uppercase">Quest Subject</h2>
          <p className="text-xl mt-2 font-bold">「{monster.context}」</p>
        </div>

        <div className="flex justify-between mb-8 border-b border-[#333] pb-4 font-bold">
          <div className="text-[#8b5cf6]">MONSTER: {monsterHp}</div>
          <div className="text-[#8b5cf6]">PLAYER: {playerHp}</div>
        </div>
        
        <div className="relative w-full flex items-center justify-center min-h-[200px] mb-6">
          <MonsterDisplay monsterKey={monsterKey} isShaking={isShaking} />
          {damageBadge && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-red-500 text-5xl font-extrabold animate-ping drop-shadow-lg">{damageBadge}</div>
            </div>
          )}
        </div>

        <div className="my-6 p-4 border border-[#333] bg-transparent min-h-[100px]">
          {!narration && <p className="text-[#8b5cf6] font-bold text-sm mb-2">{monster.name}</p>}
          <p className="text-sm leading-relaxed">{narration || displayedText}</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {hand.map(label => (
            <button key={label} onClick={() => setSelectedLabel(label)} className={`p-2 border text-[11px] ${selectedLabel === label ? 'border-purple-500 bg-purple-900' : 'border-[#333]'}`}>{label}</button>
          ))}
        </div>
        {selectedLabel && (
          <div className="border border-[#444] p-4 bg-[#111]">
            <textarea className="w-full bg-black p-3 border border-[#333] text-white text-sm" value={interpretation} onChange={e => setInterpretation(e.target.value)} placeholder="そのラベルをどうつかう？" rows={3} />
            <button onClick={handleAttack} disabled={loading} className="w-full mt-4 py-3 bg-[#8b5cf6] text-black font-bold">{loading ? "..." : "攻撃"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ここでSuspenseで囲んでエクスポートするのが解決の鍵です
export default function SoloBattle() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-10">Loading Battle...</div>}>
      <SoloBattleContent />
    </Suspense>
  );
}