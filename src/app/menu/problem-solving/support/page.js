"use client";

import Link from "next/link";
import {
  Phone,
  Heart,
  ShieldAlert,
  Home,
  LifeBuoy,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function SupportPage() {
  const services = [
    {
      title: "命の電話 / 心の健康相談",
      tel: "0120-783-556",
      description:
        "孤独感、不安、死にたい気持ちなど、心の危機を感じたときに。24時間・年中無休の窓口もあります。",
      icon: <Heart size={20} className="text-[#5F6F7A]" />,
    },
    {
      title: "DV相談プラス",
      tel: "0120-279-889",
      description:
        "パートナーからの暴力や支配関係に悩んでいる方へ。匿名相談・チャット対応あり。",
      icon: <ShieldAlert size={20} className="text-[#5F6F7A]" />,
    },
    {
      title: "性犯罪・性暴力相談（#8103）",
      tel: "#8103",
      description:
        "痴漢・性被害などの緊急相談窓口。警察相談専用ダイヤルにつながります。",
      icon: <LifeBuoy size={20} className="text-[#5F6F7A]" />,
    },
    {
      title: "生活困窮・福祉相談",
      tel: "0120-279-338",
      description:
        "仕事・住まい・お金の困りごとを総合的に支援する相談窓口です。",
      icon: <Home size={20} className="text-[#5F6F7A]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#E6E1CF] text-[#5F6F7A] font-sans px-6 py-8">
      <div className="max-w-md mx-auto pb-20">

        {/* BACK */}
        <Link
          href="/menu"
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold opacity-60 mb-10"
        >
          <ArrowLeft size={12} />
          Back to Menu
        </Link>

        {/* HEADER */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5F6F7A]/10 text-[10px] tracking-widest font-bold mb-4">
            <AlertCircle size={12} />
            Emergency Support
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">
            福祉サービス案内
          </h1>

          <p className="text-[11px] leading-relaxed opacity-70">
            ひとりで抱え込まず、専門の相談窓口につながってください。
          </p>
        </header>

        {/* CARDS */}
        <div className="space-y-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white/30 backdrop-blur-md border border-white/30 rounded-[2rem] p-6 shadow-sm"
            >
              {/* TOP */}
              <div className="flex gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-[#5F6F7A]/10">
                  {s.icon}
                </div>

                <div>
                  <h2 className="text-[13px] font-bold leading-snug">
                    {s.title}
                  </h2>
                  <p className="text-[11px] opacity-70 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>

              {/* BUTTON */}
              <a
                href={`tel:${s.tel.replace(/-/g, "")}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#5F6F7A] text-[#E6E1CF] text-xs font-bold tracking-widest hover:bg-[#4d5b66] transition"
              >
                <Phone size={14} />
                CALL {s.tel}
              </a>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="mt-12 p-5 rounded-2xl bg-[#5F6F7A]/10 border border-[#5F6F7A]/10 text-center">
          <p className="text-[10px] leading-relaxed">
            ⚠️ 緊急時は <span className="font-bold text-[#B5A773]">110 / 119</span> を優先してください
          </p>
        </footer>
      </div>
    </div>
  );
}