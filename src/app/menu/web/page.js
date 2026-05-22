"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Image, Users, Building, AlertCircle } from "lucide-react";

export default function WebPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D0D9DF] via-[#E6E1CF] via-[#F2EBD4] to-[#2C3E50] p-6 text-[#5F6F7A] font-[var(--font-sans)] transition-colors duration-500">
      <div className="max-w-md mx-auto">

        {/* BACK */}
        <Link
          href="/menu"
          className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-12 hover:opacity-100 transition-all hover:-translate-x-1"
        >
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        {/* TITLE */}
        <h1 className="text-2xl font-[var(--font-serif)] font-medium tracking-[0.35em] mb-4 text-center italic opacity-90">
          Web site
        </h1>
        <p className="text-[10px] tracking-[0.2em] uppercase opacity-40 text-center mb-16">
          External Project Hub
        </p>

        <div className="space-y-10">

          {/* SITE 1: ILLUSTRATION SITE */}
          <section className="bg-white/40 border border-white/30 rounded-[2rem] p-7 shadow-sm shadow-black/[0.01] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <div className="p-2 bg-white/60 rounded-xl border border-white/50">
                <Image size={18} className="text-[#5F6F7A]" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold tracking-wide">イラストサイト</h2>
                <span className="text-[9px] opacity-40 uppercase tracking-widest block font-sans">Free Illustrations</span>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed opacity-70 mb-6 pl-1">
              日々の温度や小さないとおしさを詰め込んだ、個人利用・商用利用可能なフリーイラスト素材サイトです。あなたの日常や、大切な発信の添え木になれますように。
            </p>

            <a href="https://example.com/illustration" target="_blank" rel="noopener noreferrer">
              <button className="w-full py-4 px-6 bg-white/80 border border-white/60 rounded-xl font-bold text-xs tracking-wider shadow-sm hover:bg-white hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2">
                <Globe size={13} /> サイトを訪ねる
              </button>
            </a>
          </section>

          {/* SITE 2: DISCUSSION TYPE DIAGNOSIS */}
          <section className="bg-white/40 border border-white/30 rounded-[2rem] p-7 shadow-sm shadow-black/[0.01] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <div className="p-2 bg-white/60 rounded-xl border border-white/50">
                <Users size={18} className="text-[#5F6F7A]" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold tracking-wide">話し合いタイプ診断</h2>
                <span className="text-[9px] opacity-40 uppercase tracking-widest block font-sans">Communication Dynamics</span>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed opacity-70 mb-6 pl-1">
              身近な人との関係性や、対話のクセを紐解く診断コンテンツ。自分がどんな言葉を大切にしていて、どんな対話が心地よいと感じるのか、静かに見つめ直す場所です。
            </p>

            <a href="https://example.com/diagnosis" target="_blank" rel="noopener noreferrer">
              <button className="w-full py-4 px-6 bg-white/80 border border-white/60 rounded-xl font-bold text-xs tracking-wider shadow-sm hover:bg-white hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2">
                <Globe size={13} /> 診断をはじめる
              </button>
            </a>
          </section>

          {/* SITE 3: MUSIC APARTMENT */}
          <section className="bg-white/40 border border-white/30 rounded-[2rem] p-7 shadow-sm shadow-black/[0.01] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <div className="p-2 bg-white/60 rounded-xl border border-white/50">
                <Building size={18} className="text-[#5F6F7A]" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold tracking-wide">MUSIC APARTMENT</h2>
                <span className="text-[9px] opacity-40 uppercase tracking-widest block font-sans">Residence Management</span>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed opacity-70 mb-6 pl-1">
              空っぽの土地に、新しい住民たちを迎える場所。誰が隣に住むかで、この街の空気は変わっていきます。
            </p>

            <a href="/apartment">
              <button className="w-full py-4 px-6 bg-white/80 border border-white/60 rounded-xl font-bold text-xs tracking-wider shadow-sm hover:bg-white hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2">
                <Globe size={13} /> 音楽を作る
              </button>
            </a>
          </section>

          {/* SOFT NOTICE */}
          <div className="flex gap-3 bg-white/10 p-5 rounded-2xl border border-white/15 text-[#5F6F7A]/80 backdrop-blur-sm">
            <AlertCircle size={14} className="shrink-0 mt-0.5 opacity-60" />
            <p className="text-[11px] leading-relaxed opacity-60">
              ボタンを押すと、このアプリの外側（ブラウザ）へ新しくページを開いて移動します。少しだけ景色の違う場所へ向かいますが、いつでも戻ってこられますので、どうぞのんびりとお気をつけて。
            </p>
          </div>

        </div>

        <footer className="mt-24 mb-12 text-center text-white/20 text-[9px] tracking-[0.4em] uppercase">
          &copy; 2026 m. personal space
        </footer>

      </div>
    </div>
  );
}