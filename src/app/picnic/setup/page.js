"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const ADJECTIVES = ["苦し紛れの", "ねぼすけな", "忙しない", "あいくるしい", "うたたねの", "たそがれの", "名無しの", "ただの", "まどろみの", "おめかしした", "雨上がりの", "のんびり屋の", "きらきらした", "風に吹かれた", "おセンチな", "日向ぼっこ中の", "夢見がちな", "すったもんだな", "ちょっと浮かれた", "季節外れの", "考えすぎの", "悟りを開いた", "挙動不審な", "崖っぷちの", "二度寝が趣味の", "明日から本気出す", "謎に包まれた", "世紀末な", "低燃費な", "圧倒的な", "物憂げな", "無邪気な", "旅する", "おなかがすいた", "限界を迎えた", "都会に染まった", "山に籠もりたい", "徹夜明けの", "推しに生かされた", "情緒不安定な", "日暮れ時の", "星を数える", "木漏れ日の", "月夜の", "凍てついた", "灼熱の", "ぼんやりした", "お人好しな", "意地っ張りな", "寂しがりな", "自信満々な", "不器用な", "慌てん坊な", "聞き上手な", "毒舌な", "バズり待ちの", "通知が止まらない", "課金が止まらない", "常にミュートの", "Wi-Fiを求める", "映えを狙う", "ROM専 of the year", "封印された", "選ばれし", "異世界から来た", "伝説の", "呪われた", "転生した", "見習いの", "いにしえの", "聖なる", "洗濯物に囲まれた", "領収書に追われる", "納豆を練る", "靴下を片方なくした", "半額シールを待つ", "三日坊主の", "二度寝がデフォの", "筋肉痛の", "定時で帰りたい"];
const NOUNS = ["クラゲ", "シマエナガ", "野良うさぎ", "カピバラ", "犬", "猫", "たんぽぽ", "アブラムシ", "深海魚", "ピザ", "タピオカ", "パクチー", "クリームソーダ", "担々麺", "塩おむすび", "牛乳", "プロテイン", "駄菓子", "シャンパン", "吟遊詩人", "通りすがり", "隠れファン", "権兵衛", "鎖骨", "梅雨前線", "副業ライター", "幽霊部員", "永久幹事", "賢者", "世話焼き", "不審者", "赤ちゃん", "箱推し", "古参", "遺骨", "夢女子", "二次元住人", "解釈の鬼", "考察厨", "塊", "砂時計", "寒がり", "暑がり",];

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("profile"); 
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [nickname, setNickname] = useState("");
  const [previewUrl, setPreviewUrl] = useState(""); 
  const [iconFile, setIconFile] = useState(null);

  const [titleAdj, setTitleAdj] = useState(ADJECTIVES[0]);
  const [titleNoun, setTitleNoun] = useState(NOUNS[0]);
  const [isAdjSpinning, setIsAdjSpinning] = useState(false);
  const [isNounSpinning, setIsNounSpinning] = useState(false);

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  const slackFont = { fontFamily: '"Zen Maru Gothic", sans-serif' };

  // ログイン状態とプロフィールの有無を確認
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const savedProfile = localStorage.getItem("picnic_user_profile");

      // すでにログイン＆プロフィール済みならガーデンへ
      if (session?.user && savedProfile) {
        router.replace("/picnic/garden");
        return;
      }
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  useEffect(() => {
    let adjInterval, nounInterval;
    if (isAdjSpinning) adjInterval = setInterval(() => setTitleAdj(ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]), 80);
    if (isNounSpinning) nounInterval = setInterval(() => setTitleNoun(NOUNS[Math.floor(Math.random() * NOUNS.length)]), 80);
    return () => { clearInterval(adjInterval); clearInterval(nounInterval); };
  }, [isAdjSpinning, isNounSpinning]);

  const uploadIcon = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFinalSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. ここで初めて匿名ログインを実行
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("ユーザー作成に失敗しました。");

      const userId = user.id;
      const finalTitle = `${titleAdj}${titleNoun}`;
      let finalIconPath = previewUrl || "🌸"; 

      // 2. Storageへのアップロード (アイコンがある場合)
      if (iconFile) {
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, iconFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        
        finalIconPath = publicUrl;
      }

      // 3. データベースへ保存 (profilesテーブル)
      const profileData = {
        id: userId,
        nickname: nickname || "名無しの住人",
        icon: finalIconPath, 
        avatar_url: finalIconPath,
        title: finalTitle,
        updated_at: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from("profiles")
        .upsert(profileData);

      if (dbError) throw dbError;

      // 4. 完了フラグを保存して遷移
      localStorage.setItem("picnic_user_profile", JSON.stringify(profileData));
      window.location.href = "/picnic/garden";

    } catch (error) {
      console.error("Critical Save Error:", error);
      alert(`登録に失敗しました: ${error.message}`);
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div style={slackFont} className="min-h-screen bg-[#F2F0E9] flex items-center justify-center text-[#B5A773] italic text-[10px] animate-pulse uppercase">
      Checking Identity...
    </div>
  );

  return (
    <div style={slackFont} className="min-h-screen bg-[#F2F0E9] p-8 flex flex-col items-center justify-center">
      {step === "profile" ? (
        <div className="w-full max-w-xs space-y-12">
          <header className="text-center">
            <h2 className="text-[#94A684] font-black text-xl">住人登録をする</h2>
            <p className="text-[10px] text-[#B5A773] font-bold uppercase italic">Who are you in M. picnic?</p>
          </header>
          
          {/* アイコン選択 */}
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <div className="w-32 h-32 bg-white rounded-[3.5rem] shadow-sm flex items-center justify-center overflow-hidden border border-white">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="icon" /> : <span className="opacity-20 text-4xl">＋</span>}
              </div>
              <input type="file" className="hidden" onChange={uploadIcon} accept="image/*" />
            </label>
          </div>

          <div className="space-y-6">
            <input 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              className="w-full bg-transparent text-center border-b-2 border-white focus:outline-none text-[#5F6F7A] text-lg font-black" 
              placeholder="おなまえを入力" 
            />
            <div className="flex gap-2">
              <button onClick={() => setIsAdjSpinning(!isAdjSpinning)} className={`flex-1 py-3 rounded-2xl text-[11px] font-black border ${isAdjSpinning ? 'bg-[#94A684] text-white' : 'bg-white text-[#B5A773]'}`}>
                {titleAdj}
              </button>
              <button onClick={() => setIsNounSpinning(!isNounSpinning)} className={`flex-1 py-3 rounded-2xl text-[11px] font-black border ${isNounSpinning ? 'bg-[#94A684] text-white' : 'bg-white text-[#B5A773]'}`}>
                {titleNoun}
              </button>
            </div>
          </div>

          <button 
            onClick={() => nickname ? setStep("terms") : alert("なまえを入れてね")} 
            className="w-full py-5 bg-[#94A684] text-white rounded-[2rem] font-black"
          >
            次へ進む
          </button>
        </div>
      ) : (
        /* 約束画面 */
        <div className="w-full max-w-xs text-center space-y-8 animate-in slide-in-from-right-4 duration-500">
            <header className="space-y-2 text-center">
              <h2 className="text-[#94A684] font-black text-xl">ピクニックの約束</h2>
              <p className="text-[10px] text-[#B5A773] font-bold tracking-widest uppercase italic">Safe & Rule</p>
            </header>

            <div className="bg-white/60 p-8 rounded-[3rem] text-[11px] text-[#5F6F7A] space-y-6 leading-relaxed border border-white text-left shadow-sm">
              <div className="space-y-2">
                <p><span className="font-black text-[#A8C69F]">🌱 01. 一度きりのアイデンティティ</span></p>
                <p className="opacity-70">プロフィールは後から二度と変更できません。容易に変えられないからこそ、その姿はあなただけの確かな証明になります。</p>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-black text-[#A8C69F]">🌱 02. ブロック・通報機能</span></p>
                <p className="opacity-70">居心地の悪さを感じたら機能を使って自分の庭を守ってください。適切に境界線を引くことも、心地よい交流のための大切な作法です。</p>
              </div>

              <div className="space-y-2">
                <p><span className="font-black text-[#A8C69F]">🌱 03. 秘密の保持</span></p>
                <p className="opacity-70">中での出来事や他人の投稿を、許可なく外へ公開することは厳禁です。誰もが安心して自分を表現できる場所を共に守りましょう。</p>
              </div>

              <div className="space-y-2">
                <p><span className="font-black text-[#A8C69F]">🌱 04. 消せない人生の記録</span></p>
                <p className="opacity-70">投稿やコメントは消すことができません。数年後、ふとした時に「この時はこうだったな」と愛おしく振り返れるよう、今のあなたを記録してください。</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => setShowConfirm(true)} className="w-full py-5 bg-[#B5A773] text-white rounded-[2rem] font-black shadow-lg shadow-[#B5A773]/20 active:scale-95 transition-all">
                同意して確定する
              </button>
              <button onClick={() => setStep("profile")} className="w-full text-[10px] text-[#B5A773] font-black tracking-widest uppercase underline underline-offset-8 decoration-[#B5A773]/30">
                Edit Profile
              </button>
            </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-[#F2F0E9]/95 backdrop-blur-md flex items-center justify-center p-8 z-50">
          <div className="text-center space-y-8">
            <p className="font-black text-[#5F6F7A]">この内容で登録します</p>
            <div className="bg-white py-10 px-8 rounded-[4rem] shadow-xl flex flex-col items-center border border-white">
                <div className="w-24 h-24 bg-[#F2F0E9] rounded-[2.8rem] mb-4 overflow-hidden border border-[#F2F0E9]">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <span>🌸</span>}
                </div>
                <p className="text-[10px] text-[#B5A773] font-black tracking-widest">{titleAdj}{titleNoun}</p>
                <p className="text-2xl text-[#5F6F7A] font-black tracking-tight">{nickname}</p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleFinalSave} 
                disabled={isSaving}
                className="w-full py-5 bg-[#94A684] text-white rounded-[2rem] font-black shadow-xl shadow-[#94A684]/20 active:scale-95 transition-all"
              >
                {isSaving ? "きろく中..." : "これで決定！"}
              </button>
              <button onClick={() => setShowConfirm(false)} className="text-[11px] text-[#B5A773] font-black uppercase tracking-widest">
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}