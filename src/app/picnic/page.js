"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function PicnicLandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const supabase = useMemo(() => {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(rawUrl, rawKey);
  }, []);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setHasSession(true);
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();
          if (profile) {
            setHasProfile(true);
            router.replace("/picnic/garden");
            return;
          }
        }
      } catch (e) {
        console.error("Redirect check failed:", e);
      } finally {
        setIsChecking(false);
      }
    };
    checkUserStatus();
  }, [router, supabase]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center">
        <div className="w-4 h-4 bg-[#A8C69F] rounded-full animate-ping"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#5F6F7A] pb-32 animate-in fade-in duration-1000 overflow-x-hidden selection:bg-[#A8C69F]/20">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Mochiypop+One&display=swap');
        .font-pop { font-family: 'Mochiypop One', sans-serif; }
        body { font-family: 'Zen Maru Gothic', sans-serif; letter-spacing: 0.05em; }
        .bg-dot {
          background-image: radial-gradient(#DDE6D9 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* 左上の戻るボタン */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/" className="group flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#A8C69F] hover:text-[#7A8C69] transition-colors">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
          BACK
        </Link>
      </div>

      {/* フローティング参加ボタン */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
        <button 
          onClick={() => router.push(hasProfile ? "/picnic/garden" : "/picnic/setup")}
          className="pointer-events-auto px-10 py-5 bg-[#A8C69F] text-white rounded-full text-xs font-black tracking-[0.3em] shadow-[0_10px_30px_rgba(168,198,159,0.4)] hover:translate-y-[-4px] active:translate-y-[2px] transition-all flex items-center gap-3"
        >
          {hasProfile ? "GARDENへ入る" : "ピクニックに参加"}
          <span className="text-lg">🧺</span>
        </button>
      </div>

      <div className="fixed top-0 left-0 w-full h-full bg-dot -z-10 opacity-50"></div>

      <header className="max-w-3xl mx-auto pt-32 pb-20 px-8 text-center">
        <div className="relative inline-block mb-8">
          <h1 className="font-pop text-[#A8C69F] text-3xl sm:text-4xl tracking-[0.2em]">
            m. picnic space
          </h1>
        </div>
        
        <p className="text-[11px] font-bold tracking-[0.2em] leading-relaxed opacity-70">
          ここは、あなたの日常に「しずかな繋がり」を届けるための、有料制の静かな広場。
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-8 space-y-24">
        
        {/* コンセプト */}
        <section className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-[#A8C69F]/20 rounded-full"></div>
          <h2 className="text-[10px] font-black tracking-[0.5em] text-[#A8C69F] uppercase mb-6">Concept</h2>
          <div className="space-y-4">
            <p className="text-[13px] leading-[2.2] font-bold opacity-80">
              SNSの喧騒や広告から離れて、芝生の上に座り込むような心地よさを守りたい。<br />
              一人の時間は好きだけど、世界のどこかに誰かがいる安心感がほしい。<br />
              そんな「心理的安全性の高い避難所」であり続けるために、<br />
              この場所は有料制（月額500円）を選びました。
            </p>
            <p className="text-[11px] leading-[2] opacity-60 italic">
              こじんまりと、だけどつい浮足立ってしまうような、あたたかい空間を目指しています。<br />
            </p>
          </div>
        </section>

        {/* コンテンツ紹介 */}
        <section className="space-y-10">
          <h2 className="text-[10px] font-black tracking-[0.5em] text-[#A8C69F] uppercase border-b border-[#E8EEE5] pb-4">Inside the Space</h2>
          
          <div className="space-y-16">
            <div className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-10 rounded-2xl bg-[#FFFBEB] flex items-center justify-center text-lg shadow-sm border border-amber-100/50">💬</span>
                <h3 className="text-sm font-black tracking-wider text-[#5F6F7A]">ちょこっとーく</h3>
              </div>
              <div className="space-y-3 pl-14">
                <p className="text-[12px] leading-loose opacity-70">
                  日々のなんてことない呟きを、写真と一緒に500文字にパッキングして。タイムラインを追いかける必要はありません。ふと立ち寄った時に、誰かの生活の温度を感じるための掲示板です。
                </p>
                <p className="text-[11px] leading-relaxed text-[#A8C69F] font-bold">
                  「👍・分かる・気になる・💞」の4種類のリアクションで、返信に追われないおだやかな共鳴を。
                </p>
              </div>
            </div>

            <div className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-10 rounded-2xl bg-[#F0F9FF] flex items-center justify-center text-lg shadow-sm border border-sky-100/50">🔥</span>
                <h3 className="text-sm font-black tracking-wider text-[#5F6F7A]">オタトーーーーク！！！</h3>
              </div>
              <div className="space-y-4 pl-14">
                <p className="text-[12px] leading-loose opacity-70">
                  あなたの「好き」を、全力で叫べる専用の広場。趣味のこだわりを1000文字で表明しましょう。否定のない、熱量だけが肯定される場所です。
                </p>
                <div className="bg-[#F0F9FF]/50 p-4 rounded-2xl border border-sky-100/30">
                  <p className="text-[11px] leading-relaxed text-[#5F6F7A] font-bold">
                    「ちょっと聞きにくい質問・相談」にも。
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-70 mt-1">
                    リアリアルの友達には話せないセンシティブな悩みも、お弁当（投稿）に蓋をしてそっと置いてみて。きっと誰かが答えてくれます。
                  </p>
                </div>
              </div>
            </div>

            {/* 新機能「悩Mille-feuille」の追加 */}
            <div className="group">
              <Link href="/picnic/millefeuille" className="block focus:outline-none">
                <div className="flex items-center gap-4 mb-4 group-hover:translate-x-1 transition-transform">
                  <span className="w-10 h-10 rounded-2xl bg-[#FDF2F8] flex items-center justify-center text-lg shadow-sm border border-pink-100/50">🍰</span>
                  <h3 className="text-sm font-black tracking-wider text-[#5F6F7A] group-hover:text-[#A8C69F] transition-colors flex items-center gap-2">
                    悩Mille-feuille <span className="text-[9px] bg-[#FDF2F8] text-pink-500 px-2 py-0.5 rounded-full font-bold tracking-normal border border-pink-100">NEW</span>
                  </h3>
                </div>
              </Link>
              <div className="space-y-3 pl-14">
                <p className="text-[12px] leading-loose opacity-70">
                  4つの実存的不安（死・自由・孤独・無意味）と向き合い、お悩みを次の住人へと託していく、1日1回のリレー式おしゃべり広場。重たいテーマをみんなで少しずつ重ねて、美味しいミルフィーユのように味わい深い対話へと変えていく特別な空間です。
                </p>
              </div>
            </div>

            <div className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-10 rounded-2xl bg-[#F0F7EE] flex items-center justify-center text-lg shadow-sm border border-[#DDE6D9]">🌼</span>
                <h3 className="text-sm font-black tracking-wider text-[#5F6F7A]">深まるつながり</h3>
              </div>
              <div className="space-y-3 pl-14">
                <p className="text-[12px] leading-loose opacity-70">
                  どちらの投稿もお気に入り登録が可能。友達のプロフィールはトップ画面でコレクション。大切な人の「今日のひとこと」を、迷わずすぐに確認できます。
                </p>
              </div>
            </div>

            <div className="group">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-10 rounded-2xl bg-[#FFF1F2] flex items-center justify-center text-lg shadow-sm border border-rose-100/50">📖</span>
                <h3 className="text-sm font-black tracking-wider text-[#5F6F7A]">限定コラム（じみコラム）</h3>
              </div>
              <p className="text-[12px] leading-loose opacity-70 pl-14">
                管理人や住人が綴る、ここだけの内緒の話。SNSには流せない少し真面目な話や、日々の気づき、創作の裏側など、静かに読み耽るための特別な読み物です。
              </p>
            </div>
          </div>
        </section>

        {/* ルール・安心機能 */}
        <section className="space-y-10">
          <h2 className="text-[10px] font-black tracking-[0.5em] text-[#A8C69F] uppercase border-b border-[#E8EEE5] pb-4">Safe & Rule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-[#A8C69F]">01. 一度きりのアイデンティティ</h4>
              <p className="text-[11px] leading-relaxed opacity-60">
                名前、アイコン、精度、そして肩書。ここで決めたあなたのプロフィールは、この場所での「分身」です。納得いくまで選べますが、決定した後は二度と変更できません。 容易に変えられないからこそ、その姿はあなただけの確かな証明になります。
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-[#A8C69F]">02. ブロック・通報機能</h4>
              <p className="text-[11px] leading-relaxed opacity-60">
                攻撃的な言動は控え、穏やかな時間を守りましょう。もし居心地の悪さを感じたり、ルールに反する投稿を見かけたら、「ブロック」や「通報」機能を使って自分の庭を守ってください。 適切に境界線を引くことも、心地よい交流を続けるための大切な作法です。
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-[#A8C69F]">03. 秘密の保持</h4>
              <p className="text-[11px] leading-relaxed opacity-60">
                広場の中で交わされる言葉やコラムは、この場所を共にする仲間だけのものです。誰もが安心して自分を表現できるよう、中での出来事や他人の投稿を、許可なく外（SNSなど）へ公開することは厳禁とします。
              </p>
            </div>
            {/* 新しく追加した項目 */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-[#A8C69F]">04. 消せない人生の記録</h4>
              <p className="text-[11px] leading-relaxed opacity-60">
                あなたが残した投稿やコメントは、後から消すことができません。 それは、あなたが人生を歩んできた証そのものです。数年後、ふとした時に読み返して「この時はこうだったな」と愛おしく振り返れるよう、今のあなたを記録していってください。
              </p>
            </div>
          </div>
        </section>

        {/* 料金システム */}
        <section className="bg-white rounded-[3rem] p-10 border border-[#A8C69F]/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="text-6xl">🥪</span>
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-[#A8C69F] uppercase">System</h2>
            <div className="py-4">
              <span className="text-3xl font-black text-[#5F6F7A]">¥500</span>
              <span className="text-[10px] font-bold opacity-60 ml-2">/ month</span>
            </div>
            <div className="space-y-3 px-4">
              <p className="text-[11px] leading-[1.8] font-bold text-[#7A8C69]">
                この場所が「あなたの居場所」であり続けるための、運営協力費です。
              </p>
              <ul className="text-[10px] leading-[2] opacity-60 text-left inline-block">
                <li>・広告表示は一切ありません。</li>
                <li>・すべてのコンテンツ・機能へフルアクセス可能です。</li>
                <li>・費用はサーバー維持と、より良い広場の開発に充てられます。</li>
                <li>・一ヶ月単位でいつでも自由に解約が可能です。</li>
              </ul>
            </div>
          </div>
        </section>

      </main>

      <footer className="mt-40 mb-20 text-center opacity-30">
        <p className="text-[9px] font-black tracking-[0.6em] uppercase mb-2">Pack your love in a basket</p>
        <p className="text-[8px] font-bold">© 2026 M. Picnic Project</p>
      </footer>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}