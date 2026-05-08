# app/picnic/page.js

```jsx
"use client";

import { useEffect } from "react";

export default function PicnicPage() {
  useEffect(() => {
    window.location.href = "/picnic/main";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF6E9] text-[#A1A89A]">
      loading...
    </div>
  );
}
```

---

# app/picnic/main/page.js

```jsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function PicnicMainPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const slackFont = {
    fontFamily: '"Zen Maru Gothic", "Kosugi Maru", "Meiryo", sans-serif',
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 未ログイン → setupへ
      if (!session?.user) {
        window.location.href = "/picnic/setup";
        return;
      }

      // profile取得
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // profile未作成 → setupへ
      if (!data) {
        window.location.href = "/picnic/setup";
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div
        style={slackFont}
        className="min-h-screen bg-[#EEF6E9] flex items-center justify-center text-[#A1A89A]"
      >
        loading...
      </div>
    );
  }

  return (
    <div
      style={slackFont}
      className="relative min-h-screen overflow-hidden bg-[#EEF6E9]"
    >
      {/* 空 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-8 w-28 h-10 bg-white/60 rounded-full blur-sm" />

        <div className="absolute top-24 right-10 w-20 h-8 bg-white/50 rounded-full blur-sm" />

        <div className="absolute top-40 left-1/2 w-24 h-9 bg-white/40 rounded-full blur-sm" />
      </div>

      {/* 草 */}
      <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-[#DDEFD5] rounded-t-[4rem]" />

      {/* メイン */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-14 pb-24">
        {/* プロフィール */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-[#FAF9F6] rounded-[3rem] shadow-sm flex items-center justify-center overflow-hidden border border-[#F1EFEA]">
            {profile?.icon?.startsWith("http") ? (
              <img
                src={profile.icon}
                className="w-full h-full object-cover"
                alt="icon"
              />
            ) : (
              <span className="text-4xl">{profile?.icon}</span>
            )}
          </div>

          <div className="space-y-1 mt-4">
            <p className="text-[10px] tracking-[0.3em] text-[#9AA08D] uppercase font-bold">
              {profile?.title}
            </p>

            <p className="text-[24px] text-[#5F5A52] font-bold tracking-tight">
              {profile?.nickname}
            </p>
          </div>
        </div>

        {/* コピー */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-[#6B665D] text-[24px] font-bold tracking-tight">
            今日は、どこに座る？
          </p>

          <p className="text-[#8D877D] text-[12px] leading-relaxed">
            のんびり話す人も、
            <br />
            熱く語る人も、
            <br />
            ぼーっとしてるだけの人も。
          </p>
        </div>

        {/* レジャーシートエリア */}
        <div className="relative w-full max-w-md h-[560px] mt-14">
          {/* ちょこっとーく */}
          <Link
            href="/picnic/talk"
            className="absolute left-0 top-0 w-[78%] rotate-[-5deg] bg-[#DFF2FF] rounded-[2.8rem] p-6 border border-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🫧</span>

                <div>
                  <h2 className="text-[#4B6B7D] font-black text-lg">
                    ちょこっとーく
                  </h2>

                  <p className="text-[11px] text-[#6F8A99]">
                    やさしい交流
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/60">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400"
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>

                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/60">
                  <img
                    src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=400"
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
              </div>

              <p className="text-[12px] leading-relaxed text-[#4B6B7D]">
                今日の空、きれいだった。
                <br />
                アイス溶けた。
                <br />
                そんな話をぽつりと。
              </p>
            </div>
          </Link>

          {/* オタトーーーク */}
          <Link
            href="/picnic/otaku"
            className="absolute right-0 top-52 w-[82%] rotate-[4deg] bg-[#FFE8D9] rounded-[2.8rem] p-6 border border-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>

                <div>
                  <h2 className="text-[#8F4A28] font-black text-xl tracking-tight">
                    オタトーーーク！！！
                  </h2>

                  <p className="text-[11px] text-[#B06A46]">
                    熱量歓迎
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 rounded-full bg-white/60 text-[10px] font-bold text-[#8F4A28]">
                  深夜テンション
                </div>

                <div className="px-3 py-1 rounded-full bg-white/60 text-[10px] font-bold text-[#8F4A28]">
                  考察
                </div>

                <div className="px-3 py-1 rounded-full bg-white/60 text-[10px] font-bold text-[#8F4A28]">
                  沼
                </div>
              </div>

              <p className="text-[12px] leading-relaxed text-[#7A472E]">
                “好き”を全力で語ろう。
                <br />
                深夜テンション歓迎。
                <br />
                誰かに聞いてほしい熱がある人へ。
              </p>
            </div>
          </Link>

          {/* じみコラム */}
          <Link
            href="/picnic/jimmy"
            className="absolute left-6 bottom-0 w-[72%] rotate-[-2deg] bg-[#F5EFE4] rounded-[2.8rem] p-6 border border-white/70 shadow-[0_12px_40px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">☕</span>

                <div>
                  <h2 className="text-[#6F5C4E] font-black text-lg">
                    じみコラム
                  </h2>

                  <p className="text-[11px] text-[#9A887B]">
                    Jimmyのメモ帳
                  </p>
                </div>
              </div>

              <div className="bg-white/60 rounded-2xl p-4">
                <p className="text-[11px] leading-relaxed text-[#7A685B]">
                  「サービスって、
                  <br />
                  機能じゃなくて空気感なのかもしれない」
                </p>
              </div>

              <p className="text-[12px] leading-relaxed text-[#6F5C4E]">
                管理人Jimmyの
                <br />
                制作裏話とか、
                <br />
                日常の殴り書き。
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

# フォルダ構成

```bash
app/
 └ picnic/
    ├ page.js
    ├ setup/
    │  └ page.js
    ├ main/
    │  └ page.js
    ├ talk/
    │  └ page.js
    ├ otaku/
    │  └ page.js
    └ jimmy/
       └ page.js
```
