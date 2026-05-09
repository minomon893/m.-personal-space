"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 修正ポイント: 本番URLを直接指定して、auth/callbackを経由させる
        emailRedirectTo: `https://m-personal-space.vercel.app/auth/callback`,
        flowType: 'pkce',
      },
    });

    if (error) {
      setMessage("エラーが発生しました: " + error.message);
    } else {
      setMessage("ログインメールを送信しました。メール内のリンクを「長押ししてコピー」し、このブラウザのURL欄に貼り付けて開いてください。");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-8 text-[#5F6F7A] flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-white/45 rounded-[2.5rem] p-10 border border-white/40 shadow-sm text-center">
        <h1 className="text-2xl italic mb-6 text-[#B5A773]">Login</h1>
        <p className="text-[11px] mb-8 opacity-70 leading-relaxed">
          メールアドレスを入力してください。<br />
          あなた専用のログインリンクをお送りします。
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white/60 border border-white/20 text-[13px] focus:outline-none focus:border-[#B5A773]/50 transition-all placeholder:opacity-30"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#B5A773] text-white rounded-2xl text-[12px] font-bold tracking-[0.2em] shadow-lg shadow-[#B5A773]/20 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "送信中..." : "ログインリンクを受け取る"}
          </button>
        </form>

        {message && (
          <div className="mt-8 p-4 bg-white/30 rounded-xl">
            <p className="text-[10px] text-[#B5A773] font-bold leading-relaxed">{message}</p>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-[#B5A773]/10">
          <Link href="/" className="text-[10px] opacity-40 hover:opacity-100 hover:text-[#B5A773] transition-all tracking-widest">
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}