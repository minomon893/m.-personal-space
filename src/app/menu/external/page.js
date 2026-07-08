"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Heart,
  Sparkles,
  Compass
} from "lucide-react";

export default function ExternalSourcesPage() {
  const sources = [
    {
      category: "Personality",
      icon: <Sparkles size={16} className="text-[#5F6F7A]" />,
      title: "16Personalities",
      description:
        "人間の性格を１６のタイプに分類。",
      url: "https://www.16personalities.com/ja/性格診断テスト",
      label: "性格診断"
    },
    {
      category: "Career",
      icon: <Compass size={16} className="text-[#5F6F7A]" />,
      title: "マイナビ 適職診断",
      description:
        "やりたいことと出来ることからキャリアの方向性を探る。",
      url: "https://job.mynavi.jp/27/pc/forward/forwardLowerGradeMatch/index",
      label: "キャリア"
    },
    {
      category: "Psychology",
      icon: <Sparkles size={16} className="text-[#5F6F7A]" />,
      title: "よんぴた（４タイプ判定）",
      description:
        "書籍『人生の法則』を元にした欲求タイプ分類。",
      url: "https://yonpita.streamlit.app/",
      label: "心理"
    },
    {
      category: "Mental Health",
      icon: <ShieldCheck size={16} className="text-[#5F6F7A]" />,
      title: "つらチェック",
      description:
        "心の状態を可視化するセルフチェック。",
      url: "https://shinitori.net/check/tsura-check/",
      label: "ケア"
    },
    {
      category: "Identity",
      icon: <Compass size={16} className="text-[#5F6F7A]" />,
      title: "セクシュアリティ診断",
      description:
        "アイデンティティ理解のためのガイド。",
      url: "https://jobrainbow.jp/discover_sexualities/",
      label: "多様性"
    }
  ];

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-6 text-[#5F6F7A] font-sans">
      <div className="max-w-md mx-auto">

        <Link
          href="/menu"
          className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-10"
        >
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        <header className="mb-12">
          <h1 className="text-xl font-bold tracking-[0.2em] mb-3 italic">
            External Sources
          </h1>

          <p className="text-[11px] opacity-60 leading-relaxed">
            自己理解のための外部リソース集
          </p>
        </header>

        <div className="space-y-4">
          {sources.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/35 border border-white/30 p-6 rounded-[2rem] hover:bg-white/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/40 rounded-xl">
                    {item.icon}
                  </div>
                  <span className="text-[9px] font-bold tracking-widest opacity-50 uppercase">
                    {item.category}
                  </span>
                </div>

                <ExternalLink size={14} className="opacity-20" />
              </div>

              <h2 className="text-sm font-bold mb-2 flex items-center gap-2">
                {item.title}
                <span className="text-[8px] px-2 py-0.5 bg-[#B5A773]/10 text-[#B5A773] rounded-full font-bold">
                  {item.label}
                </span>
              </h2>

              <p className="text-[11px] opacity-70 leading-relaxed">
                {item.description}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-16 p-6 bg-white/20 rounded-[2rem] border border-white/30">
          <p className="text-[10px] opacity-50 text-center leading-relaxed">
            外部サイトの内容は各運営元に準拠します
          </p>
        </div>

        <footer className="mt-20 mb-10 text-center opacity-30 text-[9px] tracking-widest uppercase">
          &copy; 2026 Minori Yofu
        </footer>

      </div>
    </div>
  );
}