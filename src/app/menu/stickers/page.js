"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Smile } from "lucide-react";
import Image from "next/image";

export default function LineStickersPage() {
  const stickers = [
    {
      title: "もっちりとした人 第３弾",
      url: "https://store.line.me/stickershop/product/33714167/ja",
      image: "/images/sticker3.png",
      isNew: true
    },
    {
      title: "もっちりとした人 第２弾",
      url: "https://store.line.me/stickershop/product/27267753/ja",
      image: "/images/sticker2.png",
      isNew: false
    },
    {
      title: "もっちりとした人 第１弾",
      url: "https://store.line.me/stickershop/product/27257978/ja",
      image: "/images/sticker1.png",
      isNew: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#DED9C4] p-6 font-sans text-[#525B64]">
      <div className="max-w-md mx-auto">

        {/* BACK */}
        <Link
          href="/menu"
          className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-10 hover:opacity-100 transition"
        >
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        {/* HEADER */}
        <header className="mb-12">
          <h1 className="text-xl font-bold tracking-[0.2em] mb-3 uppercase italic">
            LINE Stickers
          </h1>
          <p className="text-[11px] opacity-60 leading-relaxed">
            もっちりとした人 シリーズ
          </p>
        </header>

        {/* GRID */}
        <div className="grid gap-4">
          {stickers.map((sticker, index) => (
            <a
              key={index}
              href={sticker.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/40 border border-white/30 rounded-[2rem] overflow-hidden hover:bg-white/60 transition-all shadow-sm group"
            >

              {/* IMAGE */}
              <div className="aspect-video bg-white/30 flex items-center justify-center p-6 relative">
                
                {sticker.isNew && (
                  <span className="absolute top-4 right-4 bg-[#A89D78] text-white text-[8px] px-2 py-0.5 rounded font-bold tracking-widest">
                    NEW
                  </span>
                )}

                <div className="relative w-full h-full">
                  <Image
                    src={sticker.image}
                    alt={sticker.title}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* TEXT */}
              <div className="p-5 flex items-center justify-between border-t border-white/20">
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/60 rounded-xl text-[#A89D78]">
                    <Smile size={16} />
                  </div>

                  <h2 className="text-[13px] font-bold tracking-tight">
                    {sticker.title}
                  </h2>
                </div>

                <ExternalLink
                  size={12}
                  className="opacity-20 group-hover:opacity-60 transition"
                />
              </div>

            </a>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="mt-20 mb-10 text-center opacity-30 text-[9px] tracking-widest uppercase">
          &copy; 2026 Minori Yofu
        </footer>

      </div>
    </div>
  );
}