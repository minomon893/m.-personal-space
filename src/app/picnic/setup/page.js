"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const ADJECTIVES = ["ねぼすけな", "忙しない", "あいくるしい", "うたたねの", "たそがれの", "名無しの", "ただの", "まどろみの", "おめかしした", "雨上がりの", "のんびり屋の", "きらきらした", "風に吹かれた", "おセンチな", "日向ぼっこ中の", "夢見がちな", "すったもんだな", "ちょっと浮かれた", "考えすぎの", "悟りを開いた", "挙動不審な", "崖っぷちの", "二度寝が趣味の", "明日から本気出す", "謎に包まれた", "世紀末な", "低燃費な", "圧倒的な", "物憂げな", "無邪気な", "旅する", "おなかがすいた", "限界を迎えた", "都会に染まった", "山に籠もりたい", "徹夜明けの", "推しに生かされた", "情緒不安定な", "日暮れ時の", "星を数える", "木漏れ日の", "月夜の", "凍てついた", "灼熱の", "ぼんやりした", "お人好しな", "意地っ張りな", "寂しがりな", "自信満々な", "不器用な", "慌てん坊な", "聞き上手な", "毒舌な", "バズり待ちの", "通知が止まらない", "課金が止まらない", "常にミュートの", "Wi-Fiを求める", "映えを狙う", "ROM専の", "封印された", "選ばれし", "異世界から来た", "伝説の", "呪われた", "転生した", "見習いの", "いにしえの", "聖なる", "洗濯物に囲まれた", "領収書に追われる", "納豆を練る", "靴下を片方なくした", "半額シールを待つ", "三日坊主の", "二度寝がデフォの", "筋肉痛の", "定時で帰りたい"];
const NOUNS = ["クラゲ", "シマエナガ", "野良うさぎ", "カピバラ", "犬", "猫", "たんぽぽ", "アブラムシ", "深海魚", "ピザ", "タピオカ", "パクチー", "クリームソーダ", "担々麺", "塩おむすび", "牛乳", "プロテイン", "駄菓子", "シャンパン", "吟遊詩人", "通りすがり", "隠れファン", "権兵衛", "副業ライター", "幽霊部員", "永久幹事", "自称・賢者", "世話焼き", "不審者（自称）", "赤ちゃん", "箱推し", "古参", "遺骨", "夢女子", "二次元住人", "解釈の鬼", "考察厨", "塊", "砂時計"];

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("profile"); 
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [nickname, setNickname] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [titleAdj, setTitleAdj] = useState(ADJECTIVES[0]);
  const [titleNoun, setTitleNoun] = useState(NOUNS[0]);
  const [isAdjSpinning, setIsAdjSpinning] = useState(false);
  const [isNounSpinning, setIsNounSpinning] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const slackFont = { fontFamily: '"Zen Maru Gothic", "Kosugi Maru", "Meiryo", sans-serif' };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        // すでにプロフィールがあるかチェック
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (data) {
          // すでに登録済みならメインへリダイレクト
          router.push("/picnic");
          return;
        }
      } else {
        setCurrentUser({ id: "guest-user" });
      }
      setLoading(false);
    };
    checkUser();
  }, [supabase, router]);

  useEffect(() => {
    let adjInterval, nounInterval;
    if (isAdjSpinning) adjInterval = setInterval(() => setTitleAdj(ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]), 80);
    if (isNounSpinning) nounInterval = setInterval(() => setTitleNoun(NOUNS[Math.floor(Math.random() * NOUNS.length)]), 80);
    return () => { clearInterval(adjInterval); clearInterval(nounInterval); };
  }, [isAdjSpinning, isNounSpinning]);

  const uploadIcon = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      if (!currentUser || currentUser.id === "guest-user") {
        setIconUrl(localPreview); 
        return;
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentUser.id}/icon.${fileExt}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setIconUrl(`${publicUrl}?t=${new Date().getTime()}`);
    } catch (error) {
      console.error(error);
      alert('アップロードに失敗しました。');
    } finally {
      setUploading(false);
    }
  };

  const handleFinalSave = async () => {
    const finalTitle = `${titleAdj}${titleNoun}`;
    
    if (!currentUser || currentUser.id === "guest-user") {
      // ゲストの場合はlocalStorageに一時保存して遷移（後で消える前提）
      localStorage.setItem("guest_profile", JSON.stringify({ nickname, icon: iconUrl || "🌸", title: finalTitle }));
      router.push("/picnic");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: currentUser.id, nickname, icon: iconUrl || "🌸", title: finalTitle, created_at: new Date(),
    });

    if (!error) {
      router.push("/picnic");
    } else {
      alert("保存に失敗しました。");
    }
  };

  if (loading) return <div style={slackFont} className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-[#B5A773] opacity-50">...</div>;

  if (step === "profile") {
    return (
      <div style={slackFont} className="min-h-screen bg-[#FAF9F6] p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-xs space-y-12">
          <h2 className="text-center text-[#8C8376] font-bold tracking-tight text-lg">プロフィール設定</h2>
          
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <div className={`w-28 h-28 bg-white rounded-[2.8rem] shadow-sm flex items-center justify-center text-3xl overflow-hidden border border-[#F1EFEA] transition-all ${uploading ? 'opacity-40' : ''}`}>
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="icon" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="opacity-20 text-4xl">＋</span>
                    <span className="text-[10px] text-[#C1B9AE] font-bold uppercase tracking-widest">Photo</span>
                  </div>
                )}
              </div>
              <input type="file" className="hidden" onChange={uploadIcon} accept="image/*" disabled={uploading} />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#A39C93] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-6">
            <div className="border-b border-[#E9E5DE] pb-2 text-center">
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-transparent text-center focus:outline-none text-[#70695E] font-medium placeholder:text-[#D1CCC4]" placeholder="おなまえ" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAdjSpinning(!isAdjSpinning)} className={`flex-1 py-3 rounded-2xl text-[11px] font-bold border transition-all ${isAdjSpinning ? 'bg-[#F5F3F0] border-[#E9E5DE] text-[#8C8376]' : 'bg-white border-[#F1EFEA] text-[#A39C93]'}`}>
                {titleAdj}
              </button>
              <button onClick={() => setIsNounSpinning(!isNounSpinning)} className={`flex-1 py-3 rounded-2xl text-[11px] font-bold border transition-all ${isNounSpinning ? 'bg-[#F5F3F0] border-[#E9E5DE] text-[#8C8376]' : 'bg-white border-[#F1EFEA] text-[#A39C93]'}`}>
                {titleNoun}
              </button>
            </div>
          </div>

          <button onClick={() => {
            if(!nickname) return alert("おなまえを教えてくださいね");
            if(isAdjSpinning || isNounSpinning) return alert("ルーレットを止めてください");
            setStep("terms");
          }} className="w-full py-4 bg-[#8C8376] text-[#FAF9F6] rounded-[1.5rem] text-[14px] font-bold shadow-md active:scale-95 transition-all">
            つぎへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={slackFont} className="min-h-screen bg-[#FAF9F6] p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xs space-y-8">
        <h2 className="font-bold text-center text-[#8C8376] text-lg">ピクニックの約束</h2>
        <div className="bg-white p-7 rounded-[2.5rem] shadow-sm text-[12px] text-[#8C8376] space-y-5 leading-relaxed border border-[#F1EFEA]">
          <p className="flex gap-3"><span>🌱</span><span>お名前とアイコンは、あとから変更できません。今の自分らしいものを選んでくださいね。</span></p>
          <p className="flex gap-3"><span>🌱</span><span>ここはみんなの憩いの場です。お互いを尊重し、あたたかい言葉をかけ合いましょう。</span></p>
          <p className="flex gap-3"><span>🌱</span><span>安心を守るため、住所や電話番号などの大切な個人情報は秘密にしておきましょう。</span></p>
          <p className="flex gap-3"><span>🌱</span><span>みんながのんびり過ごせるよう、宣伝や勧誘などの目的での利用はご遠慮ください。</span></p>
        </div>
        <button onClick={() => setShowConfirm(true)} className="w-full py-4 bg-[#FCE7F3] text-[#BE185D] rounded-[1.5rem] font-bold shadow-sm active:scale-95 transition-all">
          同意して確定する
        </button>
        <button onClick={() => setStep("profile")} className="w-full text-[11px] text-[#C1B9AE] underline">設定にもどる</button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-[#FAF9F6]/95 backdrop-blur-md flex items-center justify-center p-8 z-50">
          <div className="w-full max-w-xs text-center space-y-8">
            <div className="space-y-4">
              <p className="font-bold text-[#8C8376] text-lg">この内容で登録します</p>
              <div className="bg-white py-8 rounded-[3rem] shadow-sm border border-[#F1EFEA] flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-[#FAF9F6] rounded-[2.2rem] flex items-center justify-center overflow-hidden border border-[#F1EFEA]">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" /> : <span className="text-3xl">🌸</span>}
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-[#A39C93] font-bold tracking-widest uppercase">{titleAdj}{titleNoun}</p>
                  <p className="text-lg text-[#70695E] font-bold">{nickname}</p>
                </div>
              </div>
              <p className="text-[13px] text-[#8C8376] font-medium opacity-80">こちらでよろしいですか？</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleFinalSave} className="py-4 bg-[#8C8376] text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">これで決定！</button>
              <button onClick={() => setShowConfirm(false)} className="py-2 text-[12px] text-[#C1B9AE] font-medium">もうすこし考える</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}