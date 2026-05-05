"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function SoftKotoBot() {
  const qrImagePath = "/images/lineqr.jpg";
  const lineLink = "https://lin.ee/XvFJBl9S";

  return (
    <div className="min-h-screen bg-[#C2CDC1] p-6 text-[#3A4238] select-none font-sans transition-colors duration-500">
      
      <div className="max-w-md mx-auto">
        <Link href="/menu" className="text-[10px] tracking-[0.2em] font-bold opacity-60 uppercase flex items-center gap-2 mb-10 hover:opacity-100 transition-all">
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        {/* メインビジュアル */}
        <div className="text-center mb-16">
          <h1 className="text-lg font-serif font-light tracking-[0.3em] italic mb-3 opacity-90">やわらかことぼっとくん</h1>
          <p className="text-[9px] opacity-60 tracking-[0.4em] uppercase font-bold">Assertive Communication Tool</p>
        </div>

        <main className="flex flex-col items-center">
          {/* QRコード */}
          <div className="bg-white/30 p-1 inline-block rounded-3xl mb-12 relative">
            <div className="absolute inset-0 bg-white/40 blur-2xl rounded-full -z-10"></div>
            <div className="bg-white p-6 rounded-[1.4rem] shadow-md">
              <img 
                src={qrImagePath} 
                alt="LINE QR Code" 
                className="w-44 h-44 object-contain mix-blend-multiply opacity-100"
              />
            </div>
          </div>

          {/* コンセプトメッセージ */}
          <div className="max-w-[280px] mx-auto space-y-2 text-center mb-20">
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-85 font-normal">
              「正しさ」より「調和」を大切に。
            </p>
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-85 font-normal">
              心の余裕をデザインするための
            </p>
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-85 font-normal">
              アサーティブ・ツールです。
            </p>
          </div>

          {/* 機能紹介セクション */}
          <section className="w-full space-y-12 mb-24">
            <div className="text-center">
              <span className="text-[9px] tracking-[0.4em] opacity-50 uppercase font-bold border-b border-[#3A4238]/30 pb-2">Features</span>
            </div>
            
            <div className="grid gap-8 px-2">
              {[
                { title: "アサーティブ度診断", desc: "キミの言葉の「対等さ」を100点満点でガチ採点。" },
                { title: "3段階フィードバック", desc: "良い点、おしい点、コツをズバッと引用して伝えるよ。" },
                { title: "魔法のリライト", desc: "体温を感じる、自然でやわらかい言葉に書き換えるよ。" },
                { title: "心のクセ分析", desc: "文章からキミの傾向を読み取り、愛ある一言を添えるよ。" }
              ].map((f, i) => (
                <div key={i} className="space-y-1">
                  <h3 className="text-[11px] tracking-[0.1em] font-bold opacity-80">0{i + 1} — {f.title}</h3>
                  <p className="text-[11px] leading-relaxed opacity-70 font-normal tracking-wide">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 使用例セクション */}
          <section className="w-full space-y-12 mb-24">
            <div className="text-center">
              <span className="text-[9px] tracking-[0.4em] opacity-50 uppercase font-bold border-b border-[#3A4238]/30 pb-2">Examples</span>
            </div>

            <div className="space-y-16">
              {/* 例 1 */}
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-[#8BB188] text-white text-[11px] p-4 rounded-[1.5rem] rounded-tr-none max-w-[85%] shadow-sm leading-relaxed">
                    とつぜんごめんね！最近LINEの返事が遅い気がして。。。忙しいのはわかってるんだけど、少し寂しい気持ちになることが多いんだー😭 もしいつか暇な時間あったらどうしたらいいか話し合いたい！
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/60 text-[#3A4238] text-[10px] p-5 rounded-[1.5rem] rounded-tl-none max-w-[90%] shadow-sm leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold block mb-2">【アサーティブ度🌈】85％</span>
                    <span className="font-bold block mt-3">【フィードバック💬】</span>
                    1️⃣いいね！：「少し寂しい気持ちになることが多いんだ」って自分の本音を伝えているのが素敵だよ！{"\n"}
                    2️⃣おしい！：冒頭で謝っちゃうと、キミの正当な気持ちが「悪いこと」みたいに聞こえちゃうかも。{"\n"}
                    3️⃣コツ！：前向きな理由を添えると、もっと対等な話し合いになりやすいよ！{"\n\n"}
                    <span className="font-bold block">【やわらかバージョン💌】</span>
                    お疲れ様！最近LINEの返信がゆっくりで、実はちょっと寂しく感じることがあるんだ。お互いに心地いい連絡のペースについて、相談できたら嬉しいな！{"\n\n"}
                    <span className="font-bold block">【ことぼっとくんの分析🌟】</span>
                    キミは自分の本音を言うときに「申し訳ない」って感じちゃう、遠慮しがちな配慮タイプかもしれないよ。
                  </div>
                </div>
              </div>

              {/* 例 2 */}
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-[#8BB188] text-white text-[11px] p-4 rounded-[1.5rem] rounded-tr-none max-w-[85%] shadow-sm leading-relaxed">
                    最近返事遅くない？気持ちが薄れてきたんならそう言ってよね。このままこの調子なら別に別れてもいいけど
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white/60 text-[#3A4238] text-[10px] p-5 rounded-[1.5rem] rounded-tl-none max-w-[90%] shadow-sm leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold block mb-2">【アサーティブ度🌈】35％</span>
                    <span className="font-bold block mt-3">【フィードバック💬】</span>
                    1️⃣いいね！：違和感をスルーせずに言葉にできているのは素晴らしいよ！{"\n"}
                    2️⃣おしい！：「別れてもいい」は本当は寂しいだけなのに相手を突き放す、トゲのある表現だね。{"\n"}
                    3️⃣コツ！：相手を試すような言い方ではなく、「不安なんだ」という純粋な気持ちを主語にしてみよう！{"\n\n"}
                    <span className="font-bold block">【やわらかバージョン💌】</span>
                    最近返事がゆっくりだから、少し寂しくて不安になっちゃったんだ。ボクはこれからも仲良くしたいなと思ってるんだけど、キミはどう思う？{"\n\n"}
                    <span className="font-bold block">【ことぼっとくんの分析🌟】</span>
                    「先に傷つきたくない防衛タイプ」かもしれないよ。本当はもっと大切にされたいっていうキミの優しい本音を、そのまま出しても大丈夫だよ！
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 p-6 rounded-2xl border border-white/30 shadow-sm">
              <p className="text-[10px] leading-relaxed opacity-80 font-normal text-center">
                伝えたいメッセージをそのまま送るだけ。<br />
                魔法をかけるのに5〜10秒ほどもらうけど、<br />
                のんびり待っててね。
              </p>
            </div>
          </section>

          {/* LINE リンクボタン */}
          <section className="w-full flex flex-col items-center mb-16">
            <a 
              href={lineLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-[#3A4238] text-[#C2CDC1] px-8 py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <MessageCircle size={18} className="opacity-80" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Add to LINE</span>
            </a>
            <p className="mt-4 text-[9px] opacity-40 tracking-widest uppercase">Start Conversation</p>
          </section>

          <div className="w-10 h-[1px] bg-[#3A4238] opacity-20 mb-16"></div>
        </main>

        {/* 署名 */}
        <div className="pt-10 text-center">
          <p className="text-[8px] tracking-[0.4em] font-bold opacity-40 uppercase italic">m. personal space</p>
        </div>
      </div>
      
      <div className="h-24"></div>
    </div>
  );
}