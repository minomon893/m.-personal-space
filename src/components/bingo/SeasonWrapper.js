"use client";

import { useMemo } from "react";

export default function SeasonWrapper({ children }) {
  const theme = useMemo(() => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "from-[#FDF2F4] to-[#F9FDF9] text-[#7A6363]"; // 春
    if (month >= 6 && month <= 8) return "from-[#F0F4F8] to-[#FFFFFF] text-[#5F6F7A]"; // 夏
    if (month >= 9 && month <= 11) return "from-[#F5F2ED] to-[#EBE4D9] text-[#635A51]"; // 秋
    return "from-[#EDF0F2] to-[#D9E1E8] text-[#535D66]"; // 冬
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme} transition-colors duration-[2000ms] relative overflow-hidden font-sans`}>
      {/* 和紙の質感を加えるオーバーレイ */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply select-none" 
           style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}