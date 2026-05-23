"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LabelSetupPage() {
  const [selectedLabels, setSelectedLabels] = useState([]);
  const router = useRouter();

  const labelOptions = [
    '真面目', '飽き性', '人見知り', '嫉妬深い', '臆病', 
    '楽観的', '完璧主義', '好奇心旺盛', '直感的', '慎重'
  ];

  const toggleLabel = (label) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else if (selectedLabels.length < 5) {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleStart = () => {
    if (selectedLabels.length === 5) {
      localStorage.setItem("battleHand", JSON.stringify(selectedLabels));
      // バトルへ直行せず、探索画面へ遷移
      router.push(`/menu/rpg/explore`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-[#E6E1CF] font-mono flex flex-col items-center">
      <h2 className="text-2xl mb-8 text-[#B5A773] uppercase tracking-widest italic">
        勇者の刻印を5つ装備せよ ({selectedLabels.length}/5)
      </h2>
      
      <p className="mb-8 opacity-70 text-sm italic">
        「その特性が、この過酷な旅路で君を守る剣となるだろう...」
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
        {labelOptions.map(label => (
          <button 
            key={label}
            onClick={() => toggleLabel(label)}
            className={`p-4 border transition-all ${
              selectedLabels.includes(label) 
                ? 'bg-[#B5A773] text-black border-[#B5A773] shadow-[0_0_15px_rgba(181,167,115,0.5)]' 
                : 'border-[#333] hover:border-[#B5A773]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button 
        onClick={handleStart}
        disabled={selectedLabels.length !== 5}
        className="w-full max-w-sm py-4 border-2 border-[#B5A773] hover:bg-[#B5A773] hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#E6E1CF] font-bold"
      >
        冒険の旅へ出る
      </button>
    </div>
  );
}