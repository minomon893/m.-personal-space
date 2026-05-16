"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Heart, CheckCircle, Mail } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const formData = new FormData(e.target);
    
    // Web3Formsのアクセスキー
    formData.append("access_key", "e19318c0-ba7c-4e5f-a23a-9de3d87939a6"); 

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert("送信に失敗しました。");
      }
    } catch (error) {
      alert("エラーが発生しました。ネットワーク環境を確認してください。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#5F6F7A] flex flex-col items-center font-[var(--font-sans)]">
      
      {/* HEADER */}
      <header className="w-full max-w-md flex justify-between items-center mt-6 mb-16">
        {/* テキストを Back to Top に変更し、トップページへの遷移を維持しました */}
        <Link href="/" className="text-[11px] font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-all">
          <ArrowLeft size={14}/> Back to Top
        </Link>
        <span className="text-[10px] tracking-[0.3em] font-bold opacity-30 uppercase">Contact</span>
      </header>

      <main className="w-full max-w-md space-y-10 mb-20">
        
        {/* CONTACT FORM SECTION */}
        <section className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-sm font-bold flex items-center justify-center gap-2">
              <MessageSquare size={16} className="text-[#B5A773]" /> Contact & Feedback
            </h2>
            <div className="bg-[#B5A773]/10 p-5 rounded-[2rem] border border-[#B5A773]/20 mx-2 text-left">
              <p className="text-[11px] leading-relaxed">
                お仕事のご依頼、サイトへの感想、メッセージはこちらから。<br /><br />
                <span className="text-[#8e8154] font-bold inline-flex items-center gap-1.5">
                  <CheckCircle size={10} /> お悩み相談について
                </span><br />
                具体的なカウンセリングをご希望の方は
                <Link href="/booking" className="underline underline-offset-2 hover:text-[#B5A773] font-bold"> 予約ページ </Link>
                より承っております。
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="bg-white/50 p-10 rounded-[2.5rem] text-center space-y-4 border border-white/50 animate-in fade-in duration-500">
              <Heart className="mx-auto text-[#B5A773]" size={24} />
              <p className="text-xs font-bold tracking-wider leading-relaxed">
                メッセージを受け付けました。<br />ありがとうございます。
              </p>
              <button 
                onClick={() => setSubmitted(false)} 
                className="text-[10px] underline underline-offset-4 opacity-50 hover:opacity-100 transition-all"
              >
                別のメッセージを送る
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 px-2">
              {/* スパム対策: ハニーポット */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
              
              <input type="hidden" name="from_name" value="m. personal space" />
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold opacity-40 uppercase ml-1">Type / 種類</label>
                <select name="subject" className="w-full bg-white/40 border border-white/50 rounded-2xl px-4 py-3.5 text-[13px] text-[#5F6F7A] focus:outline-none focus:border-[#B5A773]/40 appearance-none shadow-sm">
                  <option>お仕事に関するご依頼・相談</option>
                  <option>サイトへのフィードバック</option>
                  <option>メッセージ</option>
                  <option>その他</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold opacity-40 uppercase ml-1">Your Email / 返信用メールアドレス</label>
                <input required type="email" name="email" placeholder="example@mail.com" className="w-full bg-white/40 border border-white/50 rounded-2xl px-4 py-3 text-[13px] text-[#5F6F7A] focus:outline-none focus:border-[#B5A773]/40 shadow-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold opacity-40 uppercase ml-1">Message / 内容</label>
                <textarea required name="message" rows="5" placeholder="内容を入力してください..." className="w-full bg-white/40 border border-white/50 rounded-3xl px-5 py-4 text-[13px] text-[#5F6F7A] focus:outline-none focus:border-[#B5A773]/40 transition-all resize-none shadow-sm" />
              </div>

              <button 
                type="submit" 
                disabled={isSending}
                className="w-full py-5 bg-[#5F6F7A] text-[#F2F0E9] rounded-full shadow-lg flex items-center justify-center gap-3 hover:bg-[#52606A] active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {isSending ? <span className="text-xs animate-pulse">Sending...</span> : (
                  <>
                    <Mail size={16} />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase">Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="mt-auto pb-10 text-[9px] tracking-[0.4em] opacity-40 italic">
        m. personal space &copy; 2026
      </footer>

    </div>
  );
}