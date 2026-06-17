"use client";

import React from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 md:p-20 text-[#5F6F7A] font-[var(--font-sans)] leading-relaxed">
      <div className="max-w-3xl mx-auto">
        
        {/* ヘッダー */}
        <nav className="mb-12">
          <a href="/" className="text-[11px] font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-all">
            <ArrowLeft size={14}/> Back to Top
          </a>
        </nav>

        <header className="mb-16 border-b border-[#5F6F7A]/10 pb-8">
          <div className="flex items-center gap-3 mb-4 text-[#B5A773]">
            <ShieldCheck size={24} />
            <h1 className="text-2xl font-medium tracking-tight">利用規約 / プライバシーポリシー</h1>
          </div>
          <p className="text-[12px] opacity-60">
            本規約は、m. personal space（以下「当方」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。ご利用前に必ずご一読ください。
          </p>
        </header>

        <div className="space-y-12 text-[14px]">
          
          {/* 第1条 */}
          <section className="space-y-4">
            <h2 className="font-bold text-[#4A5568]">第1条（本サービスの性質）</h2>
            <p className="opacity-80">
              1. 本サービスは、心理学の知見に基づいた自己理解および行動変容の支援を目的とするものであり、医療行為ではありません。<br />
              2. 精神疾患の治療、診断を目的としたご利用はできません。現在通院中の方は、主治医の判断を優先してください。
            </p>
          </section>

          {/* 第2条 */}
          <section className="space-y-4">
            <h2 className="font-bold text-[#4A5568]">第2条（利用について）</h2>
            <p className="opacity-80">
              本サービスは、当方の発信するコンテンツを通じて、どなたでも自由に利用できるものとします。
            </p>
          </section>

          {/* 第3条 */}
          <section className="space-y-4">
            <h2 className="font-bold text-[#4A5568]">第3条（禁止事項）</h2>
            <p className="opacity-80">
              ユーザーは本サービスの利用にあたり、以下の行為を行ってはなりません。<br />
              ・提供されたコンテンツ（文章、図表、データ等）の無断転載、二次配布、商用利用<br />
              ・当方または第三者に対する誹謗中傷や公序良俗に反する行為
            </p>
          </section>

          {/* 第4条 */}
          <section className="space-y-4">
            <h2 className="font-bold text-[#4A5568]">第4条（免責事項）</h2>
            <p className="opacity-80">
              本サービスの効果には個人差があります。本サービスを利用したことによる結果、および行動の最終的な決定については、ユーザー自身の責任において行うものとし、当方は一切の責任を負いません。
            </p>
          </section>

          {/* 第5条（個人情報の取扱い） */}
          <section className="space-y-4">
            <h2 className="font-bold text-[#4A5568]">第5条（個人情報の取扱い）</h2>
            <p className="opacity-80">
              1. 取得した個人情報（氏名、メールアドレス、相談内容等）は、本サービスの提供および本人への連絡以外の目的で使用することはありません。<br />
              2. 法令に基づく開示要請があった場合を除き、第三者に個人情報を開示することはありません。
            </p>
          </section>

        </div>

        <footer className="mt-24 pt-8 border-t border-[#5F6F7A]/10 text-center space-y-2">
          <p className="text-[10px] tracking-widest opacity-40 uppercase">m. personal space</p>
          <p className="text-[10px] opacity-40">制定：2026年5月10日</p>
        </footer>
      </div>
    </div>
  );
}