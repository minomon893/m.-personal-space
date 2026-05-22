"use client";

import Link from "next/link";
import { Phone, Heart, ShieldAlert, Home, LifeBuoy, ArrowLeft, AlertCircle } from "lucide-react";

export default function SupportPage() {
  const services = [
    {
      title: "命の電話 / 心の健康相談",
      tel: "0120-783-556",
      description:
        "孤独感、不安、死にたい気持ちなどのときに。24時間・年中無休。",
      icon: <Heart size={24} className="text-[#C08A8A]" />,
      bg: "bg-[#F3E9EA]",
      border: "border-[#E6CFCF]"
    },
    {
      title: "DV相談プラス (恋人・家族)",
      tel: "0120-279-889",
      description:
        "近しい人からの身体面、精神面、金銭面での暴力に関する相談窓口です。",
      icon: <ShieldAlert size={24} className="text-[#B89A6A]" />,
      bg: "bg-[#F3EFE7]",
      border: "border-[#E6D7C3]"
    },
    {
      title: "性犯罪・性暴力被害相談 (#8103)",
      tel: "#8103",
      description:
        "痴漢・性被害などの相談。匿名可能です。",
      icon: <LifeBuoy size={24} className="text-[#7D8AA3]" />,
      bg: "bg-[#EEF0F4]",
      border: "border-[#D6DBE6]"
    },
    {
      title: "生活保護・生活困窮相談",
      tel: "0120-279-338",
      description:
        "生活・住まい・仕事の困難に関する総合窓口です。",
      icon: <Home size={24} className="text-[#7E9A86]" />,
      bg: "bg-[#EDF3EF]",
      border: "border-[#D2E0D6]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-6 text-[#5F6F7A] font-sans">
      <div className="max-w-md mx-auto pb-20">

        <Link href="/menu" className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-8">
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 rounded-full text-[10px] font-bold tracking-widest mb-4 border border-white/30">
            <AlertCircle size={12} /> EMERGENCY SUPPORT
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">
            福祉サービス案内
          </h1>

          <p className="text-[11px] font-medium opacity-70 leading-relaxed px-4">
            ひとりで抱え込まず、専門機関を頼ってください。
          </p>
        </header>

        <div className="space-y-4">
          {services.map((s, i) => (
            <div key={i} className={`p-6 rounded-[2.5rem] border ${s.border} ${s.bg}`}>
              <div className="flex gap-4 mb-5">
                <div className="p-4 bg-white/70 rounded-2xl">
                  {s.icon}
                </div>

                <div>
                  <h2 className="text-sm font-bold tracking-tight mb-1">
                    {s.title}
                  </h2>
                  <p className="text-[11px] font-medium opacity-70 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${s.tel.replace(/-/g, "")}`}
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#5F6F7A] text-[#F2F0E9] rounded-2xl font-bold tracking-wide hover:bg-[#52606A]"
              >
                <Phone size={14} />
                {s.tel} に電話
              </a>
            </div>
          ))}
        </div>

        <footer className="mt-12 p-6 bg-white/20 rounded-[2rem] border border-white/30 text-center">
          <p className="text-[10px] font-bold opacity-70 leading-relaxed">
            緊急時は 110 / 119 を使用してください
          </p>
        </footer>

      </div>
    </div>
  );
}