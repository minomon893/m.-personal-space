"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MonsterDisplay from "./components/MonsterDisplay";

export default function SoloBattle() {
  const monsterKey = "witch"; 

  const [hand, setHand] = useState(['臆病', '真面目', '飽き性', '嫉妬深い', '人見知り']);
  const [monsterHp, setMonsterHp] = useState(150);
  const [playerHp, setPlayerHp] = useState(100);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [interpretation, setInterpretation] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleAttack = async () => {
    if (!selectedLabel || !interpretation) return;
    
    setIsShaking(true);
    setLoading(true);

    try {
      const response = await fetch('/menu/rpg/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          label: selectedLabel, 
          interpretation: interpretation,
          monsterKey: monsterKey
        }),
      });

      const result = await response.json();
      setAiResponse(result);
      
      const newMonsterHp = Math.max(0, monsterHp - result.monsterDamage);
      const newPlayerHp = Math.max(0, playerHp - result.playerDamage);
      
      setMonsterHp(newMonsterHp);
      setPlayerHp(newPlayerHp);
      
      const newHand = hand.filter(l => l !== selectedLabel);
      setHand(newHand);
      setSelectedLabel(null);
      setInterpretation("");

      if (newMonsterHp <= 0 || newPlayerHp <= 0 || newHand.length === 0) {
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
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e6e1cf] p-8 flex flex-col items-center justify-center font-mono">
        <h2 className="text-3xl font-bold mb-8 text-[#8b5cf6]">RESULT</h2>
        <p className="text-xl mb-4">{monsterHp <= 0 ? "討伐成功！" : "ゲームオーバー..."}</p>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-2 border border-[#8b5cf6]">リトライ</button>
          <Link href="/menu" className="px-6 py-2 border border-[#333]">メニューへ</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e6e1cf] p-6 font-mono">
      <Link href="/menu" className="flex items-center gap-2 text-[10px] uppercase opacity-50 mb-8">
        <ArrowLeft size={12} /> Menu
      </Link>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-8 border-b border-[#333] pb-4 text-[#8b5cf6]">
          <div>MONSTER HP: {monsterHp}</div>
          <div>PLAYER HP: {playerHp}</div>
        </div>

        <MonsterDisplay 
          monsterKey={monsterKey} 
          isShaking={isShaking} 
          aiResponse={aiResponse} 
        />

        {/* モンスターからのフィードバックセクション */}
        {aiResponse && (
          <div className="mb-8 p-4 border border-[#8b5cf6] bg-[#1a1a1a] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-[#8b5cf6] font-bold text-xs uppercase mb-1">Monster says:</p>
            <p className="text-sm leading-relaxed italic text-[#e6e1cf]">
              "{aiResponse.monsterReaction}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 mb-8">
          {hand.map((label) => (
            <button 
              key={label}
              onClick={() => setSelectedLabel(label)}
              className={`p-2 border text-[11px] transition-colors ${selectedLabel === label ? 'border-purple-500 bg-purple-900' : 'border-[#333]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {selectedLabel && (
          <div className="border border-[#444] p-4 bg-[#111] animate-in fade-in duration-300">
            <p className="text-[#8b5cf6] mb-2 text-sm">{selectedLabel} をどう解釈する？</p>
            <textarea 
              className="w-full bg-black p-3 border border-[#333] text-white text-sm"
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              placeholder="例：臆病だからこそ相手の気持ちを繊細に察することができる..."
              rows={3}
            />
            <button 
              onClick={handleAttack}
              disabled={loading}
              className="w-full mt-4 py-3 bg-[#8b5cf6] text-black font-bold hover:bg-purple-400 disabled:opacity-50"
            >
              {loading ? "判定中..." : "解釈をぶつける"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}