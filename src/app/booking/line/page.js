"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 【実装上の注意】
 * 他のサービスページ（例: /booking/text）の Sticky Button（固定ボタン）から
 * このページを呼び出すには、そのページのリンクを以下のように書き換えてください：
 * 
 * --- 修正前（サービスページ側） ---
 * <a href={LINE_URL} target="_blank" ...> LINEで相談する </a>
 * 
 * --- 修正後（サービスページ側） ---
 * <Link href="/booking/line" className="..."> LINEで相談する </Link>
 * 
 * ※ target="_blank" は外し、Next.jsの Link コンポーネントを使用します。
 */

export default function LineBooking() {
  // 実際のLINE友だち追加URL
  const LINE_ADD_URL = "https://lin.ee/v9f0eUPk";
  // QRコード画像へのパス（public/images/lineqr1.png）
  const qrImagePath = "/images/lineqr1.png";

  return (
    // 全体の文字色を濃いグレー [#454D53] に変更し、視認性を向上
    <div className="min-h-screen bg-[#E6E1CF] text-[#454D53] font-[var(--font-sans)] tracking-tight">
      
      {/* 
          id="qr" を付与。他ページから遷移した際、
          このページの上部（QRコード）が画面内に収まるようにします。
      */}
      <div id="qr" className="max-w-xl mx-auto px-8 py-12 md:py-20">
        
        {/* ナビゲーション: 階層に合わせて「Back to Menu」に変更 */}
        <nav className="mb-12">
          <Link href="/booking" className="text-[10px] font-bold opacity-65 uppercase flex items-center gap-2 hover:opacity-100 transition-opacity tracking-[0.2em]">
            <ArrowLeft size={12}/> Back to Menu
          </Link>
        </nav>

        {/* メインビジュアル: タイトル色を深化 */}
        <header className="mb-16 text-center">
          <div className="inline-block mb-5 px-3 py-1 bg-[#B5A773]/15 text-[#B5A773] text-[9px] font-bold tracking-[0.2em] uppercase rounded-full">
            Official LINE
          </div>
          <h1 className="text-2xl font-medium leading-snug text-[#3A4238] tracking-tight mb-8">
            Counseling & Support
          </h1>
        </header>

        <main className="flex flex-col items-center">
          
          {/* QRコードエリア: デザインは維持 */}
          <div className="bg-white/40 p-1 inline-block rounded-3xl mb-12 relative border border-white/50">
            <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full -z-10"></div>
            <div className="bg-white p-6 rounded-[1.4rem] shadow-sm">
              <a href={LINE_ADD_URL} target="_blank" rel="noopener noreferrer">
                <img 
                  src={qrImagePath} 
                  alt="LINE QR Code" 
                  className="w-44 h-44 object-contain mix-blend-multiply opacity-100"
                />
              </a>
            </div>
          </div>

          {/* コンセプトメッセージ: サイト共通の opacity に調整 */}
          <div className="max-w-sm mx-auto space-y-4 text-center mb-16 text-[14px] leading-7 font-light text-[#5F6F7A]">
            <p>ここは、あなたのための「安全基地」。</p>
            <p className="opacity-80">日常のゆらぎや、心の機微に。一対一の、静かで深い対話の時間です。</p>
          </div>

          {/* ガイドセクション (How to Use): テキスト相談案のリスト形式を採用 */}
          <section className="mb-20 w-full">
            <div className="bg-white/40 backdrop-blur-sm p-8 md:p-10 rounded-[2.5rem] border border-white/60 shadow-sm space-y-6">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 flex items-center gap-2 justify-center mb-8">
                <MessageCircle size={16} /> How to Use LINE
              </h2>
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                {[
                  { title: "友だち追加", desc: "上のQRコードを読み込むか、タップして公式LINEを追加してください。" },
                  { title: "予約票の記入", desc: "メニューから「予約」をタップ。届いた予約票に予約内容をご記入ください。" },
                  { title: "ご予約の確定", desc: "内容確認後、Stripeの決済リンクをお届けします。ご入金をもって、正式に枠を確保いたします。" },
                  { title: "サポート開始", desc: "決済完了後、あなたに合わせた心地よい対話をスタートしましょう。" }
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4 text-[13px] font-light leading-relaxed">
                    <span className="text-[11px] font-bold tracking-widest text-[#B5A773] mt-0.5">0{i+1}</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-[#3A4238] uppercase tracking-wider">{f.title}</h3>
                      <p className="opacity-85 text-[#5F6F7A]">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Q&Aセクション: 共通のセクション間の余白を採用 */}
          <section className="mb-28 w-full">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-10 opacity-60 text-center">User Q & A</h2>
            
            {/* アコーディオンの文字色やボーダーを調整 */}
            <div className="space-y-1 text-[#454D53] border-t border-[#5F6F7A]/15 max-w-lg mx-auto">
              <FAQItem 
                question="相談内容のプライバシーについて" 
                answer="ご安心ください。お送りいただいた内容は厳重に管理し、あなたの同意なく第三者に開示することはありません。ここはあなたにとっての「安全基地」であることを第一に考えています。" 
              />
              {/* 他のQ&Aアイテムも同様に適用 */}
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

          {/* 
              下部アクションボタン: サイト全体の Sticky Button デザインを流用
              背景色: #A9B9A8 / 文字色: #3A4238
          */}
          <a 
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-[#A9B9A8] text-[#3A4238] px-8 py-4 rounded-full shadow-2xl hover:bg-[#3A4238] hover:text-white transition-all duration-500 scale-95 hover:scale-100 border border-[#A9B9A8]/50"
          >
            <MessageCircle size={20} fill="currentColor" className="opacity-80 group-hover:text-[#A9B9A8] transition-colors" />
            <span className="text-[14px] font-bold tracking-wider">LINEを友だち追加する</span>
            <ExternalLink size={12} className="opacity-60 ml-1" />
          </a>

          {/* セパレーター */}
          <div className="w-10 h-[1px] bg-[#5F6F7A] opacity-20 mt-20 mb-10"></div>
        </main>

        {/* footerのopacityを上げる */}
        <footer className="pb-10 text-center">
          <p className="text-[9px] tracking-[0.4em] font-bold opacity-40 uppercase italic">m. personal space &copy; 2026</p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Q&Aアイテムコンポーネント（アコーディオン形式）
 * 色調を全体のデザインシステムに統合
 */
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#5F6F7A]/15">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center text-left transition-all group"
      >
        {/* ホバー時にセージグリーン [#A9B9A8] に変化 */}
        <span className="text-[12px] font-bold opacity-85 group-hover:opacity-100 group-hover:text-[#A9B9A8] transition-colors">{question}</span>
        {isOpen ? 
          <ChevronUp size={16} className="text-[#B5A773] opacity-80" /> : 
          <ChevronDown size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        }
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-4">
              <p className="text-[12px] leading-relaxed text-[#5F6F7A] whitespace-pre-wrap font-light">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}