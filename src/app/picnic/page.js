"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function PicnicPage() {
  const router = useRouter();
  // すぐに見れるように loading を false に、userをダミーで埋める
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ id: "guest-user-id" });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // アクセス制限を一旦スキップ
    /* 
    async function checkAccess() {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        router.replace("/subscription");
        return;
      }

      const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select("is_subscribed")
        .eq("id", authUser.id)
        .single();

      if (subError || !sub?.is_subscribed) {
        router.replace("/subscription");
      } else {
        setUser(authUser);
        setLoading(false);
      }
    }
    checkAccess();
    */
  }, [router, supabase]);

  // ローディング画面は表示されない
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F0E9] flex items-center justify-center">
        <p className="text-[10px] tracking-[0.4em] opacity-40 animate-pulse">CHECKING ACCESS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0E9] p-8 text-[#5F6F7A]">
      <header className="w-full max-w-md mx-auto text-center mt-12 mb-16">
        <Link href="/" className="inline-block mb-8 opacity-40 hover:opacity-100 transition-opacity text-[10px] tracking-widest">
          ← BACK TO HOME
        </Link>
        <h1 className="text-3xl italic mb-3 text-[#B5A773]">
          M. <span className="font-light">picnic space</span>
        </h1>
        <div className="inline-block px-3 py-1 bg-[#B5A773]/10 rounded-full text-[9px] text-[#B5A773] tracking-widest font-bold">
          FREE PREVIEW
        </div>
      </header>

      <main className="w-full max-w-sm mx-auto space-y-8">
        <div className="bg-white/60 rounded-[2.5rem] p-10 border border-white shadow-sm text-center">
          <p className="text-[13px] leading-loose opacity-80">
            おかえりなさい。<br />
            現在、プレビュー期間中につき、どなたでもご覧いただけます。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
           <div className="p-8 border-2 border-dashed border-[#B5A773]/20 rounded-[2rem] text-center">
              <p className="text-[11px] opacity-40 tracking-wider">
                認証チェックをスキップ中... <br />
                どなたでもアクセス可能です。
              </p>
           </div>
        </div>
      </main>

      <footer className="mt-24 pb-12 text-center opacity-30 text-[9px] italic tracking-widest">
        &copy; 2026 m. personal space
      </footer>
    </div>
  );
}