"use client";

import Link from "next/link";

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#F2F0E9] p-8 text-[#5F6F7A] flex flex-col items-center font-[var(--font-sans)]">
      {/* HEADER */}
      <header className="w-full max-w-md text-center mt-12 mb-16">
        <Link href="/" className="inline-block mb-8 opacity-60 hover:opacity-100 transition-opacity text-xs tracking-widest">
          ← BACK TO HOME
        </Link>
        <h1 className="text-3xl italic mb-3 text-[#B5A773]">
          M. <span className="font-light">picnic space</span>
        </h1>
        <p className="text-[10px] tracking-[0.2em] opacity-70 uppercase leading-relaxed">
          自分の部屋をちょっと飛び出して、<br />
          みんなとゆるく繋がる場所
        </p>
      </header>

      {/* CONCEPT CARD */}
      <section className="w-full max-w-sm bg-white/50 rounded-[2.5rem] p-8 border border-white/60 shadow-sm mb-12">
        <p className="text-[13px] leading-loose opacity-90 text-center">
          「一人の時間は大切だけど、たまには誰かの気配を感じたい」<br />
          そんな時にふらっと立ち寄れるピクニック広場のようなメンバーシップです。<br />
          日常の小さな「好き」や「気づき」を、<br />
          飾らない言葉で共有しましょう。
        </p>
      </section>

      {/* PLANS / CONTENT */}
      <div className="w-full max-w-sm space-y-6 mb-20">
        <h2 className="text-center text-[11px] font-bold tracking-[0.4em] opacity-40 uppercase mb-8">Contents</h2>
        
        {/* Contents List */}
        {[
          { title: "ちょこっとーく", desc: "タイムライン形式のつぶやき場。リアクションで温かく反応し合えます。" },
          { title: "オタトーーーーク！！！", desc: "写真なし・返信1回。熱量をさらけ出す、気を遣わない趣味の場。" },
          { title: "限定コラム", desc: "管理人の内緒の話や、日々の気づきを綴るここだけの読み物。" }
        ].map((item, index) => (
          <div key={index} className="flex gap-4 items-start p-4 border-b border-[#B5A773]/20">
            <span className="text-[#B5A773] text-lg font-serif">0{index + 1}</span>
            <div>
              <h3 className="text-sm font-bold mb-1">{item.title}</h3>
              <p className="text-[11px] opacity-70 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* JOIN BUTTON (Placeholder) */}
      <div className="w-full max-w-xs text-center">
        <p className="text-[10px] mb-6 opacity-60 tracking-wider">Monthly Support / ¥500</p>
        <button 
          className="w-full py-5 bg-[#B5A773] text-white rounded-2xl text-[12px] font-bold tracking-[0.2em] shadow-lg shadow-[#B5A773]/30 hover:opacity-90 transition-all hover:-translate-y-0.5"
          onClick={() => alert("決済機能は準備中です")}
        >
          メンバーシップに参加する
        </button>
        <p className="mt-6 text-[9px] opacity-40 leading-relaxed">
          ※いつでも解約可能です。いただいた応援は、<br />
          この場所の維持・運営に大切に活用させていただきます。
        </p>
      </div>

      {/* FOOTER */}
      <footer className="mt-auto py-12 opacity-30 text-[9px] italic tracking-widest">
        &copy; 2026 m. personal space
      </footer>
    </div>
  );
}