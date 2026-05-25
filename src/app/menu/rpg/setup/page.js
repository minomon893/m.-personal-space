"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, X } from "lucide-react";

export default function LabelSetupPage() {
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [availablePool, setAvailablePool] = useState([
    '真面目', '飽き性', '人見知り', '嫉妬深い', '臆病', 
    '楽観的', '完璧主義', '好奇心旺盛', '直感的', '慎重',
    '天邪鬼', '情に厚い', '冷徹', '夢想家', 'おっちょこちょい',
    '毒舌', 'マイペース', '野心家', '自虐的', '優柔不断'
  ]);
  const [displayedLabels, setDisplayedLabels] = useState(
    ['真面目', '飽き性', '人見知り', '嫉妬深い', '臆病', '楽観的', '完璧主義', '好奇心旺盛', '直感的', '慎重']
  );
  const router = useRouter();

  // シャッフル機能
  const shuffleLabels = () => {
    const allLabels = [
      '真面目', '飽き性', '人見知り', '嫉妬深い', '臆病', '楽観的', '完璧主義', '好奇心旺盛', '直感的', '慎重',
      '天邪鬼', '情に厚い', '冷徹', '夢想家', 'おっちょこちょい', '毒舌', 'マイペース', '野心家', '自虐的', '優柔不断'
    ];
    // すでに選ばれているものを除外
    const filtered = allLabels.filter(l => !selectedLabels.includes(l));
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setDisplayedLabels(shuffled.slice(0, 10));
  };

  const equipLabel = (label) => {
    if (selectedLabels.length < 5) {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const removeLabel = (index) => {
    setSelectedLabels(selectedLabels.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (selectedLabels.length === 5) {
      localStorage.setItem("battleHand", JSON.stringify(selectedLabels));
      router.push(`/menu/rpg/explore`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-[#E6E1CF] font-mono flex flex-col items-center relative">
      <button 
        onClick={() => router.push('/menu/rpg')}
        className="absolute top-8 left-8 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <ArrowLeft size={20} />
        <span>TOP</span>
      </button>

      <h2 className="text-2xl mt-12 mb-4 text-[#B5A773] uppercase tracking-widest italic">
        勇者の刻印を5つ装備せよ
      </h2>

      {/* 手札スロット */}
      <div className="flex gap-2 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-14 h-20 border-2 border-[#333] flex items-center justify-center bg-[#111]">
            {selectedLabels[i] ? (
              <button onClick={() => removeLabel(i)} className="text-[10px] p-1 break-words text-[#B5A773]">
                {selectedLabels[i]} <X size={10} className="inline" />
              </button>
            ) : <span className="opacity-20 text-xs">枠</span>}
          </div>
        ))}
      </div>

      {/* シャッフルボタン */}
      <button onClick={shuffleLabels} className="mb-6 flex items-center gap-2 text-sm text-[#B5A773] hover:underline">
        <RefreshCw size={16} /> ラベルを入れ替える
      </button>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
        {displayedLabels.map(label => (
          <button 
            key={label}
            onClick={() => equipLabel(label)}
            disabled={selectedLabels.includes(label) || selectedLabels.length >= 5}
            className="p-4 border border-[#333] hover:border-[#B5A773] transition-all disabled:opacity-20"
          >
            {label}
          </button>
        ))}
      </div>

      <button 
        onClick={handleStart}
        disabled={selectedLabels.length !== 5}
        className="w-full max-w-sm py-4 border-2 border-[#B5A773] hover:bg-[#B5A773] hover:text-black disabled:opacity-30 font-bold"
      >
        冒険の旅へ出る
      </button>
    </div>
  );
}