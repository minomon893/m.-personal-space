"use client";

import { useState, useEffect, useMemo } from "react";

export const useSeasonTheme = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    // リアルタイムで月を同期したい場合はここでタイマーを回すことも可能ですが、
    // 基本はマウント時の判定で十分です
    setCurrentMonth(new Date().getMonth() + 1);
  }, []);

  const theme = useMemo(() => {
    // 春 (3-5月)
    if (currentMonth >= 3 && currentMonth <= 5) {
      return {
        id: 'spring',
        colors: "from-[#FDF2F4] to-[#F9FDF9]",
        accent: "#D4A5A5",
        text: "#7A6363",
        opacity: 0.25,
        label: "春のひかり"
      };
    }
    // 夏 (6-8月)
    if (currentMonth >= 6 && currentMonth <= 8) {
      return {
        id: 'summer',
        colors: "from-[#F0F4F8] to-[#FFFFFF]",
        accent: "#9BB7D4",
        text: "#5F6F7A",
        opacity: 0.15,
        label: "夏の凪"
      };
    }
    // 秋 (9-11月)
    if (currentMonth >= 9 && currentMonth <= 11) {
      return {
        id: 'autumn',
        colors: "from-[#F5F2ED] to-[#EBE4D9]",
        accent: "#A68B6D",
        text: "#635A51",
        opacity: 0.3,
        label: "秋の静寂"
      };
    }
    // 冬 (12-2月)
    return {
      id: 'winter',
      colors: "from-[#EDF0F2] to-[#D9E1E8]",
      accent: "#7A8A99",
      text: "#535D66",
      opacity: 0.2,
      label: "冬の灯火"
    };
  }, [currentMonth]);

  return theme;
};