"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const ADJECTIVES = ["ねぼすけな", "忙しない", "あいくるしい", "うたたねの", "たそがれの", "名無しの", "ただの", "まどろみの", "おめかしした", "雨上がりの", "のんびり屋の", "きらきらした", "風に吹かれた", "おセンチな", "日向ぼっこ中の", "夢見がちな", "すったもんだな", "ちょっと浮かれた", "考えすぎの", "悟りを開いた", "挙動不審な", "崖っぷちの", "二度寝が趣味の", "明日から本気出す", "謎に包まれた", "世紀末な", "低燃費な", "圧倒的な", "物憂げな", "無邪気な", "旅する", "おなかがすいた", "限界を迎えた", "都会に染まった", "山に籠もりたい", "徹夜明けの", "推しに生かされた", "情緒不安定な", "日暮れ時の", "星を数える", "木漏れ日の", "月夜の", "凍てついた", "灼熱の", "ぼんやりした", "お人好しな", "意地っ張りな", "寂しがりな", "自信満々な", "不器用な", "慌てん坊な", "聞き上手な", "毒舌な", "バズり待ちの", "通知が止まらない", "課金が止まらない", "常にミュートの", "Wi-Fiを求める", "映えを狙う", "ROM専 of the year", "封印された", "選ばれし", "異世界から来た", "伝説の", "呪われた", "転生した", "見習いの", "いにしえの", "聖なる", "洗濯物に囲まれた", "領収書に追われる", "納豆を練る", "靴下を片方なくした", "半額シールを待つ", "三日坊主の", "二度寝がデフォの", "筋肉痛の", "定時で帰りたい"];
const NOUNS = ["クラゲ", "シマエナガ", "野良うさぎ", "カピバラ", "犬", "猫", "たんぽぽ", "アブラムシ", "深海魚", "ピザ", "タピオカ", "パクチー", "クリームソーダ", "担々麺", "塩おむすび", "牛乳", "プロテイン", "駄菓子", "シャンパン", "吟遊詩人", "通りすがり", "隠れファン", "権兵衛", "副業ライター", "幽霊部員", "永久幹事", "自称・賢者", "世話焼き", "不審者（自称）", "赤ちゃん", "箱推し", "古参", "遺骨", "夢女子", "二次元住人", "解釈の鬼", "考察厨", "塊", "砂時計"];

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("profile"); 
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [nickname, setNickname] = useState("");
  const [previewUrl, setPreviewUrl] = useState(""); 
  const [iconFile, setIconFile] = useState(null); // 追加：実際のファイルを保持

  const [titleAdj, setTitleAdj] = useState(ADJECTIVES[0]);
  const [titleNoun, setTitleNoun] = useState(NOUNS[0]);
  const [isAdjSpinning, setIsAdjSpinning] = useState(false);
  const [isNounSpinning, setIsNounSpinning] = useState(false);

  const supabase = useMemo(() => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const cleanUrl = rawUrl.trim().replace(/['"]+/g, "").replace(/\/+$/, "");
    const cleanKey = rawKey.trim().replace(/['"]+/g, "");
    if (!cleanUrl || !cleanKey) return null;
    return createBrowserClient(cleanUrl, cleanKey);
  }, []);

  const slackFont = { fontFamily: '"Zen Maru Gothic", sans-serif' };

  useEffect(() => {
    const savedProfile = localStorage.getItem("picnic_user_profile");
    if (savedProfile) {
      router.replace("/picnic/garden");
    } else {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let adjInterval, nounInterval;
    if (isAdjSpinning) adjInterval = setInterval(() => setTitleAdj(ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]), 80);
    if (isNounSpinning) nounInterval = setInterval(() => setTitleNoun(NOUNS[Math.floor(Math.random() * NOUNS.length)]), 80);
    return () => { clearInterval(adjInterval); clearInterval(nounInterval); };
  }, [isAdjSpinning, isNounSpinning]);

  const uploadIcon = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIconFile(file); // 追加：ファイルオブジェクトを保存

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const currentUserId = crypto.randomUUID();
      const finalTitle = `${titleAdj}${titleNoun}`;
      let finalIconPath = previewUrl || "🌸"; 

      // --- 画像がある場合は Storage へアップロード ---
      if (iconFile && supabase) {
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `${currentUserId}/avatar-${Date.now()}.${fileExt}`;
        const BUCKET_NAME = "avatars"; // 事前にSupabaseで作成したパブリックバケット名

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, iconFile);

        if (uploadError) throw uploadError;

        // 公開URLを取得して保存用のパスにする
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        
        finalIconPath = publicUrl;
      }

      const profileData = {
        id: currentUserId,
        nickname: nickname || "名無しの住人",
        icon: finalIconPath, 
        avatar_url: finalIconPath, // どちらのカラム名でも対応できるように両方入れる
        title: finalTitle,
        updated_at: new Date().toISOString(),
      };

      // 1. ローカル保存
      localStorage.setItem("picnic_user_profile", JSON.stringify(profileData));

      // 2. Supabase保存
      if (supabase) {
        try {
          await supabase.from("profiles").upsert(profileData);
        } catch (dbError) {
          console.warn("Supabase backup skipped:", dbError);
        }
      }

      // 3. 庭へ移動
      window.location.href = "/picnic/garden";
    } catch (error) {
      console.error("Critical Save Error:", error);
      alert(`保存中にエラーが発生しました。もう一度お試しください。`);
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div style={slackFont} className="min-h-screen bg-[#F2F0E9] flex items-center justify-center text-[#B5A773] opacity-50 italic text-[10px] tracking-[0.3em] uppercase animate-pulse">
      Preparing your identity...
    </div>
  );

  return (
    <div style={slackFont} className="min-h-screen bg-[#F2F0E9] p-8 flex flex-col items-center justify-center text-[#5F6F7A]">
      {step === "profile" ? (
        <div className="w-full max-w-xs space-y-12 animate-in fade-in duration-500">
          <header className="space-y-2 text-center">
            <h2 className="text-[#94A684] font-black tracking-tight text-xl">住人登録をする</h2>
            <p className="text-[10px] text-[#B5A773] font-bold tracking-widest uppercase italic">Who are you in M. picnic?</p>
          </header>
          
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className={`w-32 h-32 bg-white rounded-[3.5rem] shadow-sm flex items-center justify-center text-3xl overflow-hidden border border-white transition-all group-active:scale-95 group-hover:shadow-md`}>
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="icon" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="opacity-20 text-4xl">＋</span>
                    <span className="text-[9px] text-[#B5A773] font-black uppercase tracking-widest">Icon</span>
                  </div>
                )}
              </div>
              <input type="file" className="hidden" onChange={uploadIcon} accept="image/*" />
            </label>
          </div>

          <div className="space-y-6">
            <div className="border-b-2 border-white pb-2 text-center">
              <input 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                className="w-full bg-transparent text-center focus:outline-none text-[#5F6F7A] text-lg font-black placeholder:text-[#B5A773]/40 placeholder:font-normal" 
                placeholder="おなまえを入力" 
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAdjSpinning(!isAdjSpinning)} className={`flex-1 py-3 rounded-2xl text-[11px] font-black border transition-all ${isAdjSpinning ? 'bg-[#94A684] border-[#94A684] text-white animate-pulse' : 'bg-white border-white text-[#B5A773]'}`}>
                {titleAdj}
              </button>
              <button onClick={() => setIsNounSpinning(!isNounSpinning)} className={`flex-1 py-3 rounded-2xl text-[11px] font-black border transition-all ${isNounSpinning ? 'bg-[#94A684] border-[#94A684] text-white animate-pulse' : 'bg-white border-white text-[#B5A773]'}`}>
                {titleNoun}
              </button>
            </div>
            <p className="text-[9px] text-[#B5A773] text-center font-bold tracking-widest opacity-60">
              タップして言葉を止めてください。
            </p>
          </div>

          <button 
            onClick={() => {
              if(!nickname) return alert("おなまえを入力してください");
              setStep("terms");
            }} 
            className="w-full py-5 bg-[#94A684] text-white rounded-[2rem] text-[14px] font-black shadow-lg shadow-[#94A684]/20 active:scale-95 transition-all tracking-[0.1em]"
          >
            次へ進む
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-8 animate-in slide-in-from-right-4 duration-500">
          <header className="space-y-2 text-center">
            <h2 className="text-[#94A684] font-black tracking-tight text-xl">ピクニックの約束</h2>
            <p className="text-[10px] text-[#B5A773] font-bold tracking-widest uppercase italic">Picnic Rules</p>
          </header>

          <div className="bg-white/60 p-8 rounded-[3rem] shadow-sm text-[11px] text-[#5F6F7A] space-y-7 leading-loose border border-white text-left">
            <div className="space-y-5">
              <div className="flex gap-3">
                <span className="shrink-0 text-[#B5A773]">🌱</span>
                <p><span className="font-black">このままのあなたで：</span> プロフィールは後から変えられません。今のあなたの気分で決めて、そのままで過ごしてみてください。</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 text-[#B5A773]">🌱</span>
                <p><span className="font-black">あしあとを残す：</span> ここでの言葉は、いつか振り返った時の大切なきろく。原則として消さずに、そのまま置いておいてくださいね。</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 text-[#B5A773]">🌱</span>
                <p><span className="font-black">心地よい距離感：</span> 勧誘や宣伝、出会い目的の利用はお控えください。誰もが深呼吸できるような場所を、一緒に作りましょう。</p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 text-[#B5A773]">🌱</span>
                <p><span className="font-black">大切なお約束：</span> ルールを守れない場合は、お別れが必要になることもあります。</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => setShowConfirm(true)} className="w-full py-5 bg-[#B5A773] text-white rounded-[2rem] font-black shadow-lg shadow-[#B5A773]/20 active:scale-95 transition-all tracking-widest">
              同意して確定する
            </button>
            <button onClick={() => setStep("profile")} className="w-full text-[10px] text-[#B5A773] font-black tracking-widest uppercase underline underline-offset-8 decoration-[#B5A773]/30">
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-[#F2F0E9]/95 backdrop-blur-md flex items-center justify-center p-8 z-50 animate-in fade-in duration-300">
          <div className="w-full max-w-xs text-center space-y-8">
            <div className="space-y-4">
              <p className="font-black text-[#5F6F7A] text-lg">この内容で登録します</p>
              <div className="bg-white py-10 rounded-[4rem] shadow-xl border border-white flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-[#F2F0E9] rounded-[2.8rem] flex items-center justify-center overflow-hidden border border-[#F2F0E9] shadow-inner">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" /> : <span className="text-4xl">🌸</span>}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-[#B5A773] font-black tracking-[0.2em] uppercase">{titleAdj}{titleNoun}</p>
                  <p className="text-2xl text-[#5F6F7A] font-black tracking-tight">{nickname}</p>
                </div>
              </div>
              <p className="text-[10px] text-[#94A684] font-black tracking-tighter">
                ※これ以降、名前とアイコンは変更できません。
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleFinalSave} 
                disabled={isSaving}
                className="py-5 bg-[#94A684] text-white rounded-[2rem] font-black shadow-xl shadow-[#94A684]/20 active:scale-95 transition-transform tracking-[0.3em] text-[15px]"
              >
                {isSaving ? "準備中..." : "これで決定！"}
              </button>
              <button onClick={() => setShowConfirm(false)} className="py-2 text-[11px] text-[#B5A773] font-black uppercase tracking-[0.4em]">
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}