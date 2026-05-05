"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

export default function LineBooking() {
  const lineUrl = "https://lin.ee/v9f0eUPk";
  const qrImagePath = "/images/lineqr1.png"; // public/images/lineqr1.png に保存されている前提

  return (
    <div className="min-h-screen bg-[#E5E1DA] p-6 text-[#4A4947] select-none font-sans transition-colors duration-500">
      
      <div className="max-w-md mx-auto">
        {/* ナビゲーション */}
        <Link href="/booking" className="text-[10px] tracking-[0.2em] font-bold opacity-60 uppercase flex items-center gap-2 mb-10 hover:opacity-100 transition-all">
          <ArrowLeft size={12} /> Back to Booking
        </Link>

        {/* メインビジュアル */}
        <div className="text-center mb-16">
          <h1 className="text-lg font-serif font-light tracking-[0.3em] mb-3 opacity-90">Official LINE</h1>
          <p className="text-[9px] opacity-60 tracking-[0.4em] uppercase font-bold">Counseling & Support</p>
        </div>

        <main className="flex flex-col items-center">
          {/* QRコードエリア */}
          <div className="bg-white/30 p-1 inline-block rounded-3xl mb-12 relative">
            <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full -z-10"></div>
            <div className="bg-white p-6 rounded-[1.4rem] shadow-md">
              <a href={lineUrl} target="_blank" rel="noopener noreferrer">
                <img 
                  src={qrImagePath} 
                  alt="LINE QR Code" 
                  className="w-44 h-44 object-contain mix-blend-multiply opacity-100"
                />
              </a>
            </div>
          </div>

          {/* コンセプトメッセージ */}
          <div className="max-w-[280px] mx-auto space-y-2 text-center mb-16">
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-85">
              ここは、あなたのための「安全基地」。
            </p>
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-85">
              日常のゆらぎや、心の機微に。
            </p>
          </div>

          {/* ガイドセクション（How to Use） */}
          <section className="w-full space-y-10 mb-20 flex flex-col items-center">
            <div className="text-center w-full">
              <span className="inline-block text-[9px] tracking-[0.4em] opacity-50 uppercase font-bold border-b border-[#4A4947]/30 pb-2">
                How to Use
              </span>
            </div>
            
            <div className="grid gap-10 px-2 w-full justify-items-center">
              {[
                { 
                  title: "友だち追加", 
                  desc: "上のQRコードを読み込むか、\nタップして公式LINEを追加してください。" 
                },
                { 
                  title: "予約票の記入", 
                  desc: "メニューから「予約」をタップ。\n届いた予約票に予約内容をご記入ください。" 
                },
                { 
                  title: "ご予約の確定", 
                  desc: "内容確認後、Stripeの決済リンクをお届けします。\nご入金をもって、正式に枠を確保いたします。" 
                },
                { 
                  title: "サポート開始", 
                  desc: "決済完了後、あなたに合わせた\n心地よい対話をスタートしましょう。" 
                }
              ].map((f, i) => (
                <div key={i} className="space-y-2 text-center max-w-[280px]">
                  <h3 className="text-[11px] tracking-[0.1em] font-bold opacity-80 uppercase">
                    STEP 0{i + 1} — {f.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed opacity-70 whitespace-pre-wrap">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Q&Aセクション */}
          <section className="w-full space-y-8 mb-20">
            <div className="text-center">
              <span className="text-[9px] tracking-[0.4em] opacity-50 uppercase font-bold border-b border-[#4A4947]/30 pb-2">Q & A</span>
            </div>
            
            <div className="space-y-1">
              <FAQItem 
                question="相談内容のプライバシーについて" 
                answer="ご安心ください。お送りいただいた内容は厳重に管理し、あなたの同意なく第三者に開示することはありません。ここはあなたにとっての「安全基地」であることを第一に考えています。" 
              />
              <FAQItem 
                question="決済のタイミングについて" 
                answer="私からStripeの決済リンクをお送りした後、48時間以内（または相談予定日の前日まで）のお支払いをお願いしております。入金が確認できた時点で、正式に予約確定となります。" 
              />
              <FAQItem 
                question="相談の「質」や「回数」について" 
                answer="行動分析学の視点から、今の状況を整理し「明日から試せる小さな工夫」を一緒に見つけていきます。一度でスッキリされる方もいれば、継続して伴走を希望される方もいらっしゃいます。ご自身のペースで決めていただいて大丈夫です。" 
              />
              <FAQItem 
                question="診断や医療行為について" 
                answer="当サービスは診断や治療を行う医療行為ではありません。日常的な悩みや、より心地よく過ごすための行動変容をサポートするものです。通院中の方は、主治医の先生にご相談の上でご利用いただくことをおすすめします。" 
              />
              <FAQItem 
                question="写真や資料の送付について" 
                answer="はい、3枚までであれば可能です。ただし、正確な状況把握とあなた自身の言葉を大切にしたいため、LINEのトーク画面のスクリーンショットなど「文字が含まれる画像」の送付はお断りしております。" 
              />
              <FAQItem 
                question="送る文字数に制限はありますか？" 
                answer="基本の規定文字数はメニューにより異なります。詳細は各メニューをご確認ください。超過する場合は、一律で500文字ごとに500円の追加料金を頂戴するか、規定内に収めてから再送信していただく形となります。" 
              />
              <FAQItem 
                question="予約確定後のキャンセルはできますか？" 
                answer={`申し訳ございませんが、お支払い完了後の返金は承っておりません。その代わり、以下のような形で「相談の持ち越し」が可能です。\n\n■ リアルタイムテキスト相談の場合\n前日までにご連絡いただければ、改めて日程振替をさせていただきます。\n\n■ それ以外のメニューの場合\n期限はございません。お支払い完了後、あなたが本当に相談したいことができたタイミングでメッセージをお送りください。`} 
              />
            </div>
          </section>

          {/* 下部アクションボタン */}
          <a 
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#4A4947] text-white rounded-full text-center text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            LINEで相談をはじめる <ExternalLink size={12} />
          </a>

          <div className="w-10 h-[1px] bg-[#4A4947] opacity-20 mt-20 mb-10"></div>
        </main>

        <div className="pb-10 text-center">
          <p className="text-[8px] tracking-[0.4em] font-bold opacity-40 uppercase italic">m. personal space &copy; 2026</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Q&Aアイテムコンポーネント（アコーディオン形式）
 */
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#4A4947]/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center text-left transition-all group"
      >
        <span className="text-[11px] font-bold opacity-80 group-hover:opacity-100">{question}</span>
        {isOpen ? <ChevronUp size={14} className="opacity-40" /> : <ChevronDown size={14} className="opacity-40" />}
      </button>
      {isOpen && (
        <div className="pb-5 animate-in fade-in slide-in-from-top-1 duration-300">
          <p className="text-[11px] leading-relaxed opacity-70 whitespace-pre-wrap">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}