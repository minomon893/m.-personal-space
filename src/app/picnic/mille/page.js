"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, BookOpen, X, MessageCircle } from "lucide-react";

export default function MillePage() {
  // 画面モード管理: 'plaza' (4匹の広場) | 'talk' (1対1)
  const [mode, setMode] = useState("plaza");
  // 選択中のキャラクター
  const [selectedChar, setSelectedChar] = useState(null);
  // ナレーションボックス・ステート: 'input' (入力フォーム) | 'menu' (三択) | 'story' (キャラの話)
  const [talkSubMode, setTalkSubMode] = useState("input");
  
  // 入力フォーム用
  const [issueInput, setIssueInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [narrationText, setNarrationText] = useState("");
  
  // モーダル管理
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [prevIssue, setPrevIssue] = useState(null);
  const [isPrevModalOpen, setIsPrevModalOpen] = useState(false);
  
  // 当日投稿済みロック状態 (キャラIDごとのboolean)
  const [postedToday, setPostedToday] = useState({
    endy: false,
    frida: false,
    kubotchi: false,
    yamin: false
  });

  // キャラクターストーリー進行用
  const [storyIndex, setStoryIndex] = useState(0);
  const [currentStories, setCurrentStories] = useState([]);

  // Supabaseクライアントの初期化
  const supabase = useMemo(() => {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/['"]+/g, "").replace(/\/$/, "");
    const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim().replace(/['"]+/g, "");
    return createBrowserClient(rawUrl, rawKey);
  }, []);

  // 1. キャラクターのマスター定義
  const characters = useMemo(() => ({
    endy: {
      id: "endy",
      name: "エンディー",
      type: "死の不安",
      badgeBg: "from-[#1A237E] to-[#6A1B9A]", // 静かなミッドナイトブルー〜優しいパープル
      intro: "終わりがあるからこそ、今をどう生きるかを一緒に考えよう。焦らなくていいんだよ。",
      stories: [
        "すべての物語に終わりがあるように、命にも終わりがある。それは冷たいことじゃなくて、今この瞬間の温かさを教えてくれる道標なんだよ。",
        "終わりを恐れるのは、あなたが今を一生懸命に愛そうとしている証拠。その優しい灯火を、僕はここでずっと見守っているからね。",
        "今日を無事に終えられたら、それだけで満点さ。明日が来るのを怖がらず、今はここで温かいお茶でも飲んで、ゆっくり目を閉じよう。"
      ]
    },
    frida: {
      id: "frida",
      name: "フリーダ",
      type: "自由の不安",
      badgeBg: "from-[#2E7D32] to-[#0288D1]", // 霧がかったミストグリーン〜スカイブルー
      intro: "「何でも自分で決めていい」って、時々すごく重たいよね。僕と一緒にその重さを分け合おう。",
      stories: [
        "どこへ飛んでいってもいい自由な空は、時に迷路よりも迷子になりやすい。選ばなかった選択肢を悔やむ必要はないんだよ。",
        "どの道を選んでも、それはあなただけの特別な足跡になる。正解を探すんじゃなくて、選んだ道をのんびり歩いていけばいいのさ。",
        "決めることに疲れたら、今は何も選ばないという「自由」を使おう。雨が上がるまで、羽を休めてぼーっとしていたって誰も怒らないよ。"
      ]
    },
    kubotchi: {
      id: "kubotchi",
      name: "クボッチ",
      type: "孤独の不安",
      badgeBg: "from-[#4E342E] to-[#D7CCC8]", // 温かみのあるココアブラウン〜ベージュ
      intro: "誰もが抱える心の中の、ぽっかり空いた「クボミ」。埋めようとしなくていい、僕がじっと一緒にいるよ。",
      stories: [
        "どれだけ誰かと深く繋がっていても、ふとした瞬間に訪れる孤独。それはね、あなたが自分という存在を大切に確かめている時間なんだ。",
        "僕のこのぽっかりしたクボミは、誰かの寂しさを受け止めるためにあるんだ。一人で抱えきれない夜は、ここにそっと腰掛けてね。",
        "人間はみんな、それぞれの星からやってきた旅人みたいなものさ。すれ違う瞬間に、こうして雨宿りを共にするだけでも、もう一人じゃない。"
      ]
    },
    yamin: {
      id: "yamin",
      name: "ヤーミン",
      type: "無意味の不安",
      badgeBg: "from-[#374151] to-[#FCD34D]", // 深いトワイライトグレー〜柔らかなイエロー
      intro: "「人生の意味ってなに？」って考えて、深いヤミに迷い込んじゃった？僕が優しく照らすよ。",
      stories: [
        "最初から決まっている「人生の意味」なんて、きっとどこにもない。だからこそ、今日食べた美味しいお菓子の味なんかを、意味にしていけるんだ。",
        "意味が見つからない日は、ただ息をして、雨の音を聴いているだけで大成功。世界は意味だけでできているわけじゃないからね。",
        "真っ白なキャンバスを渡されて立ち尽くす必要はないよ。意味のない落書きをのんびり楽しむような、そんな気楽さで生きていこう。"
      ]
    }
  }), []);

  // 2. 本日投稿済みかどうかのローカルチェック (2026年日付ベース)
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const updatedPostState = { endy: false, frida: false, kubotchi: false, yamin: false };
    
    Object.keys(updatedPostState).forEach((charId) => {
      const lastPost = localStorage.getItem(`mille_post_${charId}`);
      if (lastPost === todayStr) {
        updatedPostState[charId] = true;
      }
    });
    setPostedToday(updatedPostState);
  }, [mode]);

  // キャラ選択時の処理
  const handleCharClick = (charKey) => {
    const char = characters[charKey];
    setSelectedChar(char);
    setIssueInput("");
    setTalkSubMode("input"); // 最初は入力フォーム表示
    setMode("talk");
  };

  // 「広場に戻る」処理
  const handleBackToPlaza = () => {
    setTalkSubMode("exit-narration");
    setNarrationText("今日はお話出来て楽しかったよ。また来てね。");
  };

  // 前の人のお悩みを引っ張る処理
  const fetchPreviousIssue = async () => {
    if (!selectedChar) return;
    try {
      const { data, error } = await supabase
        .from("mille_issues")
        .select("message")
        .eq("character_id", selectedChar.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setPrevIssue(data[0].message);
      } else {
        setPrevIssue("まだ誰もここにお悩みを置いていっていないみたい。あなたが最初のひとりになれるよ。");
      }
      setIsPrevModalOpen(true);
    } catch (e) {
      console.error(e);
      setPrevIssue("雨のせいで、前のお手紙がうまく読めないみたい…（通信エラーが発生しました）");
      setIsPrevModalOpen(true);
    }
  };

  // お悩みを託す送信処理
  const handleSendIssue = async (e) => {
    e.preventDefault();
    if (!issueInput.trim() || !selectedChar || postedToday[selectedChar.id]) return;

    setIsSubmitting(true);
    try {
      // Supabaseにインサート
      const { error } = await supabase
        .from("mille_issues")
        .insert([{ character_id: selectedChar.id, message: issueInput }]);

      if (error) throw error;

      // ローカルストレージに本日の投稿日を記録
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`mille_post_${selectedChar.id}`, todayStr);
      
      // ロック状態を更新
      setPostedToday(prev => ({ ...prev, [selectedChar.id]: true }));
      
      // ナレーション風完了表示
      setTalkSubMode("exit-narration");
      setNarrationText(`聞かせてくれてありがとう。あなたのお悩みは「${selectedChar.name}」がしっかり次の人に引き継ぐよ。`);
      
    } catch (err) {
      alert("メッセージの送信に失敗しました。電波の良い場所で再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // キャラクターの話を聞くランダムストーリー開始
  const startStory = () => {
    if (!selectedChar) return;
    // ストーリー配列からランダムで選択、またはシャッフルしてセット
    const stories = [...selectedChar.stories];
    setCurrentStories(stories);
    setStoryIndex(0);
    setTalkSubMode("story");
  };

  // ストーリーの次へ進む・終了
  const handleStoryTap = () => {
    if (storyIndex < currentStories.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else {
      // 最後までいったらフォーム画面に戻る
      setTalkSubMode("input");
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3A34] text-[#DCE5E0] font-[var(--font-sans)] relative overflow-hidden pb-12 select-none">
      
      {/* ☂️ 全体にかかる雨のセロファン・弾ける水滴エフェクト風背景 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#232F2A]/30 to-[#19241F]/80 mix-blend-multiply" />
        {/* 縦の雨ライン */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0)_100%)] bg-[length:2px_100%] animate-pulse" />
        {/* 水滴が細かく降るようなドット背景 */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      {/* 📋 各種アニメーションスタイル定義 */}
      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes vibrate-subtle {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(1px, -1px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
        }
        .animate-character {
          animation: float-gentle 6s ease-in-out infinite;
        }
        .animate-character:hover {
          animation: vibrate-subtle 0.4s linear infinite, float-gentle 3s ease-in-out infinite;
        }
      `}</style>

      {/* ───────────────────────────────────────────
          1. ４匹の広場画面 (Plaza Mode)
         ─────────────────────────────────────────── */}
      {mode === "plaza" && (
        <div className="relative z-10 max-w-4xl mx-auto p-6 flex flex-col min-h-screen">
          
          {/* HEADER */}
          <header className="w-full flex justify-between items-center mt-4 mb-8">
            <a href="/picnic/garden" className="text-[11px] font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-all text-white/80">
              <ArrowLeft size={14}/> Back to Garden
            </a>
            <button 
              onClick={() => setIsGuideOpen(true)}
              className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all border border-white/20 text-white"
            >
              <BookOpen size={18} />
            </button>
          </header>

          {/* MAIN TITLES */}
          <div className="text-center space-y-2 my-4">
            <h1 className="text-3xl font-black tracking-widest text-[#B4C7BC] italic">悩Mille-feuille</h1>
            <p className="text-xs opacity-60 tracking-wider">死、自由、孤独、無意味とおしゃべりしよう。</p>
          </div>

          {/* 🏕️ ピクニック広場風の配置フィールド */}
          <div className="flex-1 w-full max-w-2xl mx-auto my-6 relative min-h-[400px] bg-white/5 backdrop-blur-sm rounded-[3.5rem] border border-white/10 p-8 flex flex-col justify-between shadow-2xl overflow-hidden">
            
            {/* 🏁 ギンガムチェックのピクニックシート & 湯気小物演出 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-[40%] bg-white/10 rounded-[2.5rem] rotate-1 overflow-hidden opacity-40 border border-white/10 pointer-events-none">
              <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(45deg, #374940 25%, transparent 25%, transparent 75%, #374940 75%, #374940), linear-gradient(45deg, #374940 25%, transparent 25%, transparent 75%, #374940 75%, #374940)`,
                backgroundSize: '30px 30px',
                backgroundPosition: '0 0, 15px 15px'
              }} />
              {/* キャンドル・マグの気配（絵文字で代用演出） */}
              <div className="absolute top-2 left-6 text-xl animate-bounce" style={{ animationDuration: '4s' }}>☕</div>
              <div className="absolute bottom-4 right-8 text-lg opacity-80">🕯️</div>
            </div>

            {/* 4匹のキャラクタースタンド */}
            <div className="grid grid-cols-2 gap-8 my-auto relative z-10">
              {Object.keys(characters).map((key) => {
                const char = characters[key];
                return (
                  <div 
                    key={char.id} 
                    onClick={() => handleCharClick(key)}
                    className="flex flex-col items-center justify-center cursor-pointer group relative"
                  >
                    {/* 💡 足元の暖色系ぽわんとしたランタン光演出 */}
                    <div className="absolute w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-400/30 transition-all duration-500 -bottom-4" />
                    
                    {/* キャラクターイラスト（sticker1.png固定・ふあふあ振動アニメ） */}
                    <div className="w-28 h-28 flex items-center justify-center bg-white/10 rounded-[2.5rem] p-3 shadow-md border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-white/20 animate-character">
                      <img src="/sticker1.png" alt={char.name} className="w-full h-full object-contain pointer-events-none" />
                    </div>

                    {/* タグ情報 */}
                    <div className="mt-3 text-center space-y-1">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold text-white bg-gradient-to-r ${char.badgeBg} opacity-80`}>
                        {char.type}
                      </span>
                      <h3 className="text-sm font-black tracking-wide group-hover:text-white transition-colors">{char.name}</h3>
                    </div>

                    {/* 本日投稿済みマーク */}
                    {postedToday[char.id] && (
                      <div className="absolute top-0 right-[20%] bg-amber-500 text-slate-900 text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-md rotate-12">
                        託し済
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER */}
          <footer className="w-full text-center mt-auto opacity-30 text-[9px] tracking-[0.4em] italic text-white">
            m. personal space &copy; 2026
          </footer>
        </div>
      )}

      {/* ───────────────────────────────────────────
          2. 1対1のお話し画面 (Talk Mode)
         ─────────────────────────────────────────── */}
      {mode === "talk" && selectedChar && (
        <div className="relative z-10 max-w-xl mx-auto p-6 flex flex-col min-h-screen justify-between">
          
          {/* HEADER */}
          <header className="w-full flex justify-between items-center mt-4">
            <button 
              onClick={handleBackToPlaza}
              className="text-[11px] font-bold opacity-60 uppercase flex items-center gap-2 hover:opacity-100 transition-all text-white/80"
            >
              <ArrowLeft size={14}/> 広場に戻る
            </button>
            <div className="text-[10px] tracking-[0.3em] font-black opacity-30 uppercase">Session</div>
          </header>

          {/* MAIN CONTENT AREA */}
          <div className="my-auto py-8 space-y-8 flex flex-col items-center w-full">
            
            {/* 上部不安・名前バッジ */}
            <div className="text-center space-y-2">
              <span className={`text-xs px-4 py-1.5 rounded-full font-black text-white tracking-widest bg-gradient-to-r ${selectedChar.badgeBg} shadow-lg block mx-auto w-max`}>
                {selectedChar.type}　{selectedChar.name}
              </span>
            </div>

            {/* キャラ画像表示（ぽわんとした光のベース & ふわふわアニメーション） */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute w-48 h-48 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="w-40 h-40 bg-white/10 backdrop-blur-md rounded-[3.5rem] p-4 border border-white/20 shadow-xl animate-character relative">
                <img src="/sticker1.png" alt={selectedChar.name} className="w-full h-full object-contain" />
                
                {/* 💬 吹き出しアイコンマーク（常時表示。押すとメニュー/ナレーション起動） */}
                <button 
                  onClick={() => {
                    setTalkSubMode("menu");
                    setNarrationText(`やあ、僕は${selectedChar.name}。${selectedChar.intro} 今日はどうする？`);
                  }}
                  className="absolute -bottom-1 -right-1 w-11 h-11 bg-[#B5A773] hover:bg-[#9B8E5C] text-slate-900 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white/30"
                  title="話しかける"
                >
                  <MessageCircle size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* 下部ダイナミックUIエリア (Glassmorphismですりガラス風) */}
            <div className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 shadow-2xl min-h-[180px] flex flex-col justify-center">
              
              {/* SUB-MODE A: お悩み入力フォーム */}
              {talkSubMode === "input" && (
                <div className="space-y-4">
                  {postedToday[selectedChar.id] ? (
                    <div className="text-center py-6 space-y-2">
                      <p className="text-sm font-bold text-[#B5A773]">今日のお悩みはカチッと格納されたよ。</p>
                      <p className="text-[11px] opacity-60 max-w-xs mx-auto leading-relaxed">
                        深く考えすぎて心が疲れてしまわないように。このお悩みは次の住人へと引き継がれます。また明日お話ししようね。
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendIssue} className="space-y-4">
                      <div className="relative">
                        <textarea
                          required
                          rows="3"
                          value={issueInput}
                          onChange={(e) => setIssueInput(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-transparent focus:outline-none focus:border-[#B5A773]/50 transition-all resize-none shadow-inner font-medium leading-relaxed"
                          id="issue-field"
                        />
                        {/* カスタムプレースホルダー（入力開始で消える霧のような淡いグレー） */}
                        {issueInput.length === 0 && (
                          <label htmlFor="issue-field" className="absolute top-3 left-4 text-sm text-white/30 pointer-events-none tracking-wide font-medium">
                            あなたのお悩みはなに？
                          </label>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !issueInput.trim()}
                        className="w-full py-4 bg-gradient-to-r from-[#D97706] to-[#E11D48] text-white rounded-full font-bold text-xs tracking-[0.2em] uppercase shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                      >
                        {isSubmitting ? "託しています..." : "お悩みを託す"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* SUB-MODE B: 吹き出しメニュー三選択 */}
              {talkSubMode === "menu" && (
                <div className="space-y-4">
                  <p className="text-xs leading-relaxed font-bold border-b border-white/5 pb-3 text-white/90">
                    {narrationText}
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    <button 
                      onClick={fetchPreviousIssue}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] rounded-xl text-xs font-bold text-left px-4 transition-all text-[#B4C7BC] flex items-center justify-between group"
                    >
                      <span>・前の人のお悩みを聞く</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                    <button 
                      onClick={() => setTalkSubMode("input")}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] rounded-xl text-xs font-bold text-left px-4 transition-all text-[#B4C7BC] flex items-center justify-between group"
                    >
                      <span>・自分の悩みを話す</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                    <button 
                      onClick={startStory}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] rounded-xl text-xs font-bold text-left px-4 transition-all text-[#B4C7BC] flex items-center justify-between group"
                    >
                      <span>・{selectedChar.name}の話を聞く</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-MODE C: キャラの話（タップ進行ストーリー） */}
              {talkSubMode === "story" && (
                <div 
                  onClick={handleStoryTap}
                  className="cursor-pointer space-y-4 h-full flex flex-col justify-between group select-none"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-bold leading-relaxed text-white/90 animate-in fade-in duration-300">
                      {currentStories[storyIndex]}
                    </p>
                  </div>
                  <div className="text-right pt-2 text-[9px] font-bold text-[#B5A773] tracking-widest uppercase animate-pulse">
                    {storyIndex < currentStories.length - 1 ? "TAP TO NEXT ▽" : "CLOSE ▽"}
                  </div>
                </div>
              )}

              {/* SUB-MODE D: 完了・離脱用一時ナレーションボックス */}
              {talkSubMode === "exit-narration" && (
                <div 
                  onClick={() => setMode("plaza")} 
                  className="cursor-pointer text-center py-6 space-y-4 select-none"
                >
                  <p className="text-xs font-bold leading-relaxed max-w-xs mx-auto text-white/90">
                    {narrationText}
                  </p>
                  <p className="text-[9px] font-bold text-[#B5A773] tracking-widest uppercase animate-pulse">
                    タップして広場へ戻る ▽
                  </p>
                </div>
              )}

            </div>
          </div>

          <div className="h-4" />
        </div>
      )}

      {/* ───────────────────────────────────────────
          3. モーダル類 (解説・前の人の悩み)
         ─────────────────────────────────────────── */}
      
      {/* A. ページ解説用モーダル */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsGuideOpen(false)}></div>
          <div className="relative bg-[#24312A] w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-[3rem] shadow-2xl p-6 md:p-10 no-scrollbar animate-in zoom-in-95 duration-300 border-2 border-white/10 text-white/90 text-xs leading-relaxed">
            
            <button 
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-6 right-6 text-xl opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <span className="text-3xl block mb-2">🌲</span>
              <h2 className="text-lg font-black text-[#B4C7BC] tracking-widest">悩Mille-feuille へようこそ</h2>
              <div className="h-0.5 w-8 bg-[#B4C7BC]/30 mx-auto rounded-full mt-3"></div>
            </div>

            <div className="space-y-6">
              <p className="font-bold opacity-90 leading-loose">
                ここは、私たちが生きていく中でふと胸をよぎる**「４つの実存的不安」**たちと、のんびりおしゃべりをする広場です。<br/>
                フランス菓子の「ミルフィーユ」が何層ものパイ生地を重ねて美味しくなるように、ここへ集まるみんなの小さなお悩みを重ね、繋いでいくことで、ほんの少しだけ心が軽くなる場所を目指しています。
              </p>

              <hr className="border-white/10" />

              <div className="space-y-3">
                <h3 className="font-black text-[#B4C7BC] text-sm">💬 ４つの不安と、４匹のともだち</h3>
                <p className="opacity-70">広場にたたずむ４匹は、人間なら誰しもが抱える「４つの根本的な不安」がカタチになったものです。怖い存在ではないので、気軽に話しかけてみてくださいね。</p>
                
                <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5">
                  <p><strong>・エンディー（☠️死の不安）:</strong> 終わりがあるからこそ、今をどう生きるかを一緒に考えてくれる。</p>
                  <p><strong>・フリーダ（🕊️自由の不安）:</strong> 「何でも自分で決めていい」という自由の重さに、寄り添ってくれる。</p>
                  <p><strong>・クボッチ（🕳️孤独の不安）:</strong> 誰もが抱える心の中の「ぽっかり空いたクボミ」を、じっと見守ってくれる。</p>
                  <p><strong>・ヤーミン（🌌無意味の不安）:</strong> 「人生の意味ってなに？」という深い闇（ヤミ）を、優しく照らしてくれる。</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-[#B4C7BC] text-sm">🕒 広場での過ごし方</h3>
                <p className="opacity-70"><strong>1. （キャラ名）の話を聞く:</strong> 不安にまつわるちょっとしたお話や、心が軽くなる言葉を語りかけてくれます。</p>
                <p className="opacity-70"><strong>2. 前の人のお悩みを聞く:</strong> 訪れた「前の誰か」が残していったお悩みをそっと覗き、「悩んでいるのは自分だけじゃないんだ」と確かめられます。</p>
                <p className="opacity-70"><strong>3. 自分の悩みを話す:</strong> いま抱えているモヤモヤをキャラクターに託すことができます。</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <p className="font-bold text-amber-400">⚠️ お悩みは、１日につき各キャラ「１回まで」</p>
                <p className="text-[11px] opacity-80 mt-1">実存的不安は、答えのない深い問いです。あまり考えすぎて心が疲れてしまわないよう、お悩み相談は１日１回までとなっています。</p>
              </div>

              <p className="text-[11px] opacity-60 text-center pt-2">
                一人で抱え込まず、みんなで悩みを分け合いながら、美味しいミルフィーユのように優しい時間を紡いでいきましょう。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* B. 前の人のお悩み閲覧用モーダル */}
      {isPrevModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsPrevModalOpen(false)}></div>
          <div className="relative bg-[#2D3A34] w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 border border-white/10 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div>
              <span className="text-xl">✉️</span>
              <h3 className="text-xs font-black tracking-widest text-[#B4C7BC] mt-1 uppercase">前の人が残したお悩み</h3>
            </div>
            
            <div className="bg-black/20 p-5 rounded-2xl text-left border border-white/5 max-h-[200px] overflow-y-auto no-scrollbar">
              <p className="text-xs leading-relaxed italic text-white/90">
                &ldquo; {prevIssue} &rdquo;
              </p>
            </div>

            <button 
              onClick={() => {
                setIsPrevModalOpen(false);
                setTalkSubMode("input"); // 閉じたら入力フォームが見える画面に戻る
              }}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-colors border border-white/10"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

    </div>
  );
}