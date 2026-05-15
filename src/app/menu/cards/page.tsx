"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, X, RefreshCw, Swords, ShieldAlert, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ==========================================
// 1. 型定義 ＆ ゲームデータ
// ==========================================
type CardType = "maximum" | "minimum";

interface GameCard {
  id: string;
  pairId: number;
  type: CardType;
  theme: string;
  title: string;
  hoverText: string;
  bgClass: string;
}

interface PairData {
  id: number;
  theme: string;
  title: string;
  dialogue: { speaker: "maximum" | "minimum"; text: string }[];
  narration: string;
}

const PAIRS_DATA: PairData[] = [
  {
    id: 1,
    theme: "恐怖への態度",
    title: "勇敢 (Courage)",
    dialogue: [
      { speaker: "minimum", text: "無理無理、怖いって！リスクしかないじゃん。ここでじっとして気配を消すのが一番安全だよぉ……。" },
      { speaker: "maximum", text: "ハァ？ビビってんじゃねえよ！考える前に突っ込め！死ぬ時は前のめりだろオラァ！" }
    ],
    narration: "ただ生存しているだけの「息をする肉塊（臆病）」と、学習能力ゼロで突っ込む「ただの動く標的（無謀）」が衝突しました。恐怖に怯える脳を理性で殴りつけ、大義のためにコントロールする真の『勇敢』をその貧弱な灰色の脳細胞に刻み込みなさい。"
  },
  {
    id: 2,
    theme: "肉体的な快楽",
    title: "節制 (Temperance)",
    dialogue: [
      { speaker: "minimum", text: "食事も性欲もただのノイズ。私は一切の快楽を断ち、無機質なマシーンとして生きるのだ。" },
      { speaker: "maximum", text: "カァーーッ！人生一回ポッキリ！美味いもん浴びるほど食って、本能のままに溺れ狂おうぜぇ！" }
    ],
    narration: "機能停止した「ただの鉄屑（無感覚）」と、欲望の汁に塗れた「ただの野生動物（放縦）」が目を合わせました。快楽を全否定する冷酷さも、本能に首輪を握らせる家畜さもどちらも等しく愚かです。健康的に生を謳歌する『節制』を学びなさい。"
  },
  {
    id: 3,
    theme: "日常の金銭感覚",
    title: "寛大さ (Generosity)",
    dialogue: [
      { speaker: "minimum", text: "1円たりとも社会に還元したくない。割り勘は1円単位だし、他人のための金なんてドブに捨てるのと同じ。" },
      { speaker: "maximum", text: "宵越しの銭は持たねえ！ある分だけ全部奢るし、欲しいもの全部買う！リボ払い枠まだあるし！" }
    ],
    narration: "1円の重みに脳を支配された「しみったれたドケチ」と、破滅に向かって全力疾走する「リボ払い依存の自爆兵」が和解しかけています。出すべき相手に、適切な量を、適切なタイミングで投資する『寛大さ』がなければ、あなたの財布も人間関係も一生スカスカのままです。"
  },
  {
    id: 4,
    theme: "巨額の富の使い道",
    title: "豪気 (Magnificence)",
    dialogue: [
      { speaker: "minimum", text: "大きな文化プロジェクト？予算は極限まで削れ！見た目がショボくなろうが、安上がりならそれでいい。" },
      { speaker: "maximum", text: "俺の財力を見よ！全面金ピカ、超ド派手なビルを建てて俺の名前をデカデカ出するぞ！趣味悪くても目立てば勝ち！" }
    ],
    narration: "せっかくの予算をドブに捨てる「見窄らしいド根暗」と、センスが中学生で止まっている「成金趣味の下品バカ」の泥仕合。社会の幸福や豊かな文化のために、ドカンと粋に大金を使う『豪気』の美学。あなたには一生縁のなさそうな高尚な概念ですね。"
  },
  {
    id: 5,
    theme: "大きな名誉への態度",
    title: "矜持 (Magnanimity)",
    dialogue: [
      { speaker: "minimum", text: "私なんてただのゴミです……大きな挑戦なんて滅相もない。一生日陰で縮こまって生きていきます。" },
      { speaker: "maximum", text: "実績？そんなもん後からついてくるわ！俺こそが世界の中心、ひれ伏せ！もっと俺を称えろ！" }
    ],
   narration: "実力があるのに責任から逃げ回る「社会のウジ虫（卑屈）」と、中身がゼロのくせに態度だけは王様の「ハリボテ風船（虚栄）」。自分の正当な能力を冷徹に自覚し、それにふさわしい誇りと責任を背負うのが『矜持』です。いつまで認知を歪ませているのですか？"
  },
  {
    id: 6,
    theme: "日常的な名誉欲",
    title: "適切な野心 (Right Ambition)",
    dialogue: [
      { speaker: "minimum", text: "評価されること自体を完全に放棄した。頑張るだけ無駄。評価シートは全部白紙で出すわ。" },
      { speaker: "maximum", text: "あいつを蹴落としてでも出世してやる！上司へのおべっかも同僚の足引っ張りも、使える手段は全部使う！" }
    ],
    narration: "生きている意味が見当たらない「向上心ゼロの泥人形」と、他者を踏み台にすることしか頭にない「権力欲の亡者」。他人の評価に一喜一憂せず、程よいモチベーションで己の道を地道に歩む『適切な野心』。これが欠けているから心がいつまでも荒むのです。"
  },
  {
    id: 7,
    theme: "怒りの感情",
    title: "温厚 (Patience)",
    dialogue: [
      { speaker: "minimum", text: "どんなに理不尽に虐げられても、ニコニコして耐えます……。怒るなんてエネルギーの無駄ですから……。" },
      { speaker: "maximum", text: "あ？今俺の前に一歩出たな？ムカつくんだよ！全員まとめて秒でブチのめしてやるからそこに並べ！" }
    ],
    narration: "尊厳を自らドブに捨てる「奴隷根性の意気地なし」と、触るもの全てを爆破する「脳みそ導火線のチンパンジー」。滅太なことではキレず、しかし不条理に対しては正当に牙を剥く『温厚（適切な怒り）』こそが、理性を保った大人の証明です。"
  },
  {
    id: 8,
    theme: "自己表現・真実味",
    title: "誠実 (Truthfulness)",
    dialogue: [
      { speaker: "minimum", text: "いえ、私なんてただの一般人ですから……（凄まじい実績を隠しながら過度に謙遜して相手に気を遣わせる）" },
      { speaker: "maximum", text: "昔はちょっとヤバい組織の幹部でさぁ、年収も数億あってさぁ（秒でバレる嘘で盛りまくる大言壮語）" }
    ],
    narration: "相手に余計な気を遣わせる「計算高いハイパー卑下」と、息を吸うようにハッタリをかます「大言壮語のホラ吹き」。己の実績を盛ることも下げることもなく、ありのままを冷徹に提示する『誠実』さ。それが一番認知のコストがかからないということに気づきなさい。"
  },
  {
    id: 9,
    theme: "ユーモア・遊び心",
    title: "機知 (Wittiness)",
    dialogue: [
      { speaker: "minimum", text: "冗談は業務の効率を低下させます。その発言のデータソースは？……フハッ、何が面白いんですか？" },
      { speaker: "maximum", text: "ウケるなら何でもアリだろお前ら！おい、こいつのコンプレックス弄り倒そうぜ！生配信で暴露しちゃえ！" }
    ],
    narration: "存在自体がディストピアな「場を凍らせるクソ真面目」と、倫理観が崩壊している「一線越えの悪ふざけ野郎」。誰も傷つけず、しかし確実に脳のコリをほぐす極上のスパイス『機知』。これを発揮することこそが、最高峰の知性のお遊びです。"
  },
  {
    id: 10,
    theme: "社交性・お付き合い",
    title: "友愛 (Friendliness)",
    dialogue: [
      { speaker: "minimum", text: "他人は全員敵。馴れ合うな、話しかけるな。話しかけられたらとりあえずトゲのある言い方で威嚇するわ。" },
      { speaker: "maximum", text: "あ義様！さすがです！一生ついていきます！もうおっしゃる通り！嫌わないでぇ、何でも言うこと聞くからぁ！" }
    ],
    narration: "殻に引きこもって毒を吐くだけの「愛想の悪い偏屈トゲウオ」と、プライドを完全に犬に食わせた「おべっか太鼓持ち」。相手を尊重しつつも、決して媚びへつらうことなく、対等で心地よい距離感を維持する『友愛』をインストールしなさい。"
  },
  {
    id: 11,
    theme: "他人の境遇への感情",
    title: "義憤 (Righteous Indignation)",
    dialogue: [
      { speaker: "minimum", text: "あいつ成功したの？チッ、ムカつくから裏で悪評流しとこ。あ、別の人が不幸になった？飯が美味いなぁ！" },
      { speaker: "maximum", text: "他人の成功が羨ましすぎて夜も眠れない……！いや、逆に他人の悲劇に過剰に同調して、自分のメンタルが完全に崩壊した……！" }
    ],
    narration: "他人の不幸でしかエネルギーを補給できない「歪んだ嫉盗モンスター」と、他人の人生に無断泥酔して勝手に自滅する「共感過剰のメンヘラ」。悪が栄えれば正しく怒り、善が苦しめば静かに寄り添い、筋の通った『義憤』の軸を脳内に叩き込みなさい。"
  }
];

const CARDS_POOL: Omit<GameCard, "id">[] = [
  // 1
  { pairId: 1, type: "minimum", theme: "恐怖への態度", title: "臆病", hoverText: "怖い、無理、絶対失敗する！挑戦なんて愚か者のすること。部屋の隅で丸くなって嵐が過ぎ去るのを待つのが正解！", bgClass: "bg-gradient-to-br from-sky-600 to-sky-900 border-cyan-400 text-white shadow-cyan-500/30" },
  { pairId: 1, type: "maximum", theme: "恐怖への態度", title: "無謀", hoverText: "勝算？そんなもん突っ込んでから考えろ！ブレーキを踏む奴は全員チキンだ！ノーガードで崖から飛び降りろ！", bgClass: "bg-gradient-to-br from-rose-600 to-rose-950 border-rose-400 text-white shadow-rose-500/30" },
  // 2
  { pairId: 2, type: "minimum", theme: "肉体的な快楽", title: "無感覚", hoverText: "美味しいものを食べて感動するなんて精神の弛み。睡眠も栄養摂取もただの生存コスト。感情を殺せ。", bgClass: "bg-gradient-to-br from-slate-600 to-slate-900 border-slate-400 text-white shadow-slate-500/30" },
  { pairId: 2, type: "maximum", theme: "肉体的な快楽", title: "放縦", hoverText: "理屈はいらねえ、脳汁を出せ！限界まで食って飲んで、欲望の赴くままに暴れ回るぞ！明日死んでも後悔なし！", bgClass: "bg-gradient-to-br from-orange-600 to-orange-950 border-orange-400 text-white shadow-orange-500/30" },
  // 3
  { pairId: 3, type: "minimum", theme: "日常の金銭感覚", title: "ケチ", hoverText: "お祝い金？募金？出すわけないじゃん。他人にお金を使うのは、自分の生命力を削り取られる致命的なエラーだよ。", bgClass: "bg-gradient-to-br from-teal-600 to-teal-950 border-teal-400 text-white shadow-teal-500/30" },
  { pairId: 3, type: "maximum", theme: "日常の金銭感覚", title: "浪費", hoverText: "うおー！お金持ってる感覚が気持ちいい！給料日だし全額ギャンブルかハイブランドにつぎ込んでスッキリしようぜ！", bgClass: "bg-gradient-to-br from-amber-500 to-amber-900 border-amber-300 text-white shadow-amber-500/30" },
  // 4
  { pairId: 4, type: "minimum", theme: "巨額の富の使い道", title: "しみったれ", hoverText: "数億円の予算がある大事業？でもトイレットペーパーの質は下げろ！とにかくみすぼらしくても削れるだけ削る！", bgClass: "bg-gradient-to-br from-zinc-600 to-zinc-900 border-zinc-400 text-white shadow-zinc-500/30" },
  { pairId: 4, type: "maximum", theme: "巨額の富の使い道", title: "下品・成金", hoverText: "どうだこの金ピカの時計！最高に悪趣味だろ！これみよがしに財力を見せつけて、周りを圧倒してやるわ！", bgClass: "bg-gradient-to-br from-yellow-500 to-yellow-900 border-yellow-300 text-white shadow-yellow-500/30" },
  // 5
  { pairId: 5, type: "minimum", theme: "大きな名誉への態度", title: "卑屈", hoverText: "私なんて大役を務めたら世界が滅びます……。才能？無いです。お願いだから責任のないポジションへ落として……。", bgClass: "bg-gradient-to-br from-cyan-600 to-cyan-950 border-cyan-300 text-white shadow-cyan-500/30" },
  { pairId: 5, type: "maximum", theme: "大きな名誉への態度", title: "虚栄", hoverText: "実績？実力？そんなもんハッタリでどうにでもなるわ！中身スカスカでも、世界一の天才のフリをしてチヤホヤされろ！", bgClass: "bg-gradient-to-br from-fuchsia-600 to-fuchsia-950 border-fuchsia-400 text-white shadow-fuchsia-500/30" },
  // 6
  { pairId: 6, type: "minimum", theme: "日常的な名誉欲", title: "無野心", hoverText: "誰かに認められたいとか1ミリも思わない。サボれるなら最低の評価でいい。プライドなんてゴミ箱に捨てた。", bgClass: "bg-gradient-to-br from-blue-600 to-blue-950 border-blue-400 text-white shadow-blue-500/30" },
  { pairId: 6, type: "maximum", theme: "日常的な名誉欲", title: "野心過剰", hoverText: "同僚の手柄は俺のもの、俺のミスは部下のもの！どんな手を使ってでも出世階段を駆け上がってやる……！", bgClass: "bg-gradient-to-br from-red-600 to-red-950 border-red-400 text-white shadow-red-500/30" },
  // 7
  { pairId: 7, type: "minimum", theme: "怒りの感情", title: "意気地なし", hoverText: "理不尽に怒鳴られても、私が悪いんですって笑顔で謝れば丸く収まります。怒るなんて野蛮なこと、私にはできません。", bgClass: "bg-gradient-to-br from-emerald-600 to-emerald-950 border-emerald-400 text-white shadow-emerald-500/30" },
  { pairId: 7, type: "maximum", theme: "怒りの感情", title: "短気・激昂", hoverText: "あ？今目が合ったよな？俺を舐めてんのか？すべての思い通りにならない出来事は、怒号と暴力で叩き潰すのみ！", bgClass: "bg-gradient-to-br from-orange-500 to-orange-900 border-orange-400 text-white shadow-orange-500/30" },
  // 8
  { pairId: 8, type: "minimum", theme: "自己表現・真実味", title: "過度な謙遜", hoverText: "いえいえ！今回のプロジェクト成功はただのバグです！私はただ呼吸をしていただけの下等生物ですので……。", bgClass: "bg-gradient-to-br from-indigo-600 to-indigo-950 border-indigo-400 text-white shadow-indigo-500/30" },
  { pairId: 8, type: "maximum", theme: "自己表現・真実味", title: "大言壮語", hoverText: "俺が本気出せば、Googleなんて3日で買収できるからね。インフルエンサーの知り合いも山ほどいるし？（大嘘）", bgClass: "bg-gradient-to-br from-purple-600 to-purple-950 border-purple-400 text-white shadow-purple-500/30" },
  // 9
  { pairId: 9, type: "minimum", theme: "ユーモア・遊び心", title: "不風流・無骨", hoverText: "冗談を言う暇があるならコードを書け。私の前で笑うな。そのジョークの社会的実用性を30字以内で説明してください。", bgClass: "bg-gradient-to-br from-stone-600 to-stone-950 border-stone-400 text-white shadow-stone-500/30" },
  { pairId: 9, type: "maximum", theme: "ユーモア・遊び心", title: "悪ふざけ", hoverText: "ギャハハ！こいつの失敗まじウケる！もっと煽り散らかして、みんなの前で恥かかせて笑いモノにしようぜ！", bgClass: "bg-gradient-to-br from-pink-600 to-pink-950 border-pink-400 text-white shadow-pink-500/30" },
  // 10
  { pairId: 10, type: "minimum", theme: "社交性・お付き合い", title: "偏屈・不機嫌", hoverText: "他人は全員ゴミ。馴れ合う奴は知能が低い。挨拶されたら舌打ちで返すのが俺のデフォルトスタイル。", bgClass: "bg-gradient-to-br from-violet-600 to-violet-950 border-violet-400 text-white shadow-violet-500/30" },
  { pairId: 10, type: "maximum", theme: "社交性・お付き合い", title: "おべっか", hoverText: "先輩！今日も世界一カッコいいです！先輩の言うことなら白でも黒になります！見捨てないで、何でもします！", bgClass: "bg-gradient-to-br from-rose-500 to-rose-900 border-rose-400 text-white shadow-rose-500/30" },
  // 11
  { pairId: 11, type: "minimum", theme: "他人の境遇への感情", title: "悪意・妬み", hoverText: "他人の成功は全部親のガチャか不正のおかげ。不幸になったニュースを見る瞬間だけが、俺の脳を癒す極上のサプリ。", bgClass: "bg-gradient-to-br from-lime-600 to-lime-950 border-lime-400 text-white shadow-lime-500/30" },
  { pairId: 11, type: "maximum", theme: "他人の境遇への感情", title: "過剰引きずり", hoverText: "隣の人の愚痴を聞したら涙が止まらない……。世界中の悲しい出来事すべて私のせいに思えてきて、もう病気になりそう……。", bgClass: "bg-gradient-to-br from-fuchsia-600 to-fuchsia-950 border-fuchsia-400 text-white shadow-fuchsia-500/30" }
];

// ==========================================
// 2. タイピングエフェクト用コンポーネント
// ==========================================
function TypewriterText({ text, speed = 30, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) {
          const t = setTimeout(() => onComplete(), 50);
          return () => clearTimeout(t);
        }
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

// ==========================================
// 3. メインゲームコンポーネント
// ==========================================
export default function MmMidGame() {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<GameCard | null>(null);
  
  // モーダル管理用
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeEventPair, setActiveEventPair] = useState<PairData | null>(null);
  const [eventStep, setEventStep] = useState<"dialogue0" | "dialogue1" | "narration" | "complete">("dialogue0");

  const generateRandomPairs = () => {
    // 全体のユニークなpairIdを取得してシャッフル
    const allPairIds = Array.from(new Set(CARDS_POOL.map((c) => c.pairId)));
    const shuffledPairIds = [...allPairIds].sort(() => Math.random() - 0.5);
    // ランダムに3つのペアIDを抽出
    const selectedPairIds = shuffledPairIds.slice(0, 3);
    
    // 選ばれたIDのそれぞれから、minimumとmaximumを厳密に1枚ずつ抽出する
    const filteredCards: Omit<GameCard, "id">[] = [];
    selectedPairIds.forEach((pid) => {
      const minCard = CARDS_POOL.find((c) => c.pairId === pid && c.type === "minimum");
      const maxCard = CARDS_POOL.find((c) => c.pairId === pid && c.type === "maximum");
      if (minCard) filteredCards.push(minCard);
      if (maxCard) filteredCards.push(maxCard);
    });
    
    // 完全に揃った6枚をシャッフルして配置
    const gameBoardCards = filteredCards
      .map((c, i) => ({ ...c, id: `card-${i}-${Math.random()}` }))
      .sort(() => Math.random() - 0.5);

    setCards(gameBoardCards);
    setSelectedCards([]);
    setMatchedPairIds([]);
    setHoveredCard(null);
  };

  useEffect(() => {
    generateRandomPairs();
    if (!localStorage.getItem("mm_game_initialized")) {
      localStorage.setItem("mm_game_initialized", "true");
      localStorage.setItem("mm_matched_history", JSON.stringify([]));
    }
  }, []);

  const handleCardClick = (card: GameCard) => {
    if (selectedCards.length >= 2 || selectedCards.some((c) => c.id === card.id) || matchedPairIds.includes(card.pairId)) return;

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    if (newSelection.length === 2) {
      if (newSelection[0].pairId === newSelection[1].pairId && newSelection[0].type !== newSelection[1].type) {
        const pairData = PAIRS_DATA.find((p) => p.id === newSelection[0].pairId);
        setTimeout(() => {
          if (pairData) {
            setActiveEventPair(pairData);
            setEventStep("dialogue0");
            
            const history = JSON.parse(localStorage.getItem("mm_matched_history") || "[]");
            if (!history.includes(pairData.id)) {
              history.push(pairData.id);
              localStorage.setItem("mm_matched_history", JSON.stringify(history));
            }
          }
          setMatchedPairIds((prev) => [...prev, newSelection[0].pairId]);
          setSelectedCards([]);
        }, 600);
      } else {
        setTimeout(() => setSelectedCards([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-zinc-100 flex flex-col items-center justify-center p-6 font-mono selection:bg-yellow-400 selection:text-black relative">
      
      {/* 左上：メニューに戻るボタン */}
      <div className="absolute top-6 left-6 z-40">
        <Link 
          href="/menu" 
          className="flex items-center space-x-2 px-4 py-2 bg-slate-950 border-2 border-slate-700 hover:border-yellow-400 rounded-xl text-slate-400 hover:text-yellow-400 text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>メニューに戻る</span>
        </Link>
      </div>

      {/* 右上：操作系ボタン */}
      <div className="absolute top-6 right-6 flex items-center space-x-4 z-40">
        <button
          onClick={generateRandomPairs}
          className="p-3 bg-slate-950 border-2 border-slate-700 hover:border-cyan-400 rounded-xl transition-all active:scale-95 group text-slate-400 hover:text-cyan-400 shadow-md"
          title="試練を再抽選（リロード）"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-3 bg-slate-950 border-2 border-slate-700 hover:border-pink-400 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-pink-400 shadow-md"
          title="解説書を開く"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </div>

      {/* ヘッダーエリア */}
      <header className="text-center mb-8 max-w-xl z-20 relative">
        <div className="inline-flex items-center space-x-2 text-xs bg-yellow-400/10 border-2 border-yellow-400 px-3 py-1 rounded-full text-yellow-400 font-bold mb-3 tracking-widest uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <Swords className="w-3.5 h-3.5" />
          <span>COGNITIVE TUNING RPG v1.2</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-yellow-400 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-2">
          MAXIMUM <span className="text-pink-500 font-black">VS</span> MINIMUM
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed font-sans font-semibold">
          脳内に巣食う11種の「過剰（MAX）」と「不足（MIN）」の極端バカ共をマッチングさせ、アリストテレスが提唱した至高の黄金比『中庸（メソテース）』へと調和させる精神矯正ボード。
        </p>
      </header>

      {/* メインゲーム盤面 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl w-full mb-8 z-20 relative">
        {cards.map((card) => {
          const isSelected = selectedCards.some((c) => c.id === card.id);
          const isMatched = matchedPairIds.includes(card.pairId);

          return (
            <div
              key={card.id}
              className="relative h-44 perspective group"
              onMouseEnter={() => !isMatched && !isSelected && setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="w-full h-full duration-500 transform-style"
                animate={{ rotateY: isSelected || isMatched ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* カード表面：紅白レトロポップデザイン */}
                <div
                  className="absolute inset-0 bg-rose-600 border-4 border-white rounded-xl flex flex-col items-center justify-center cursor-pointer backface-hidden group-hover:scale-[1.02] transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden"
                  onClick={() => handleCardClick(card)}
                >
                  {/* 赤いドットパターン背景 */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: "radial-gradient(#ffffff 20%, transparent 20%)",
                      backgroundSize: "10px 10px",
                    }}
                  />
                  
                  {/* 中央の紅白装飾 */}
                  <div className="relative w-16 h-16 bg-white rotate-45 flex items-center justify-center shadow-lg border-2 border-rose-200">
                    <div className="w-10 h-10 bg-rose-600 flex items-center justify-center -rotate-45">
                       <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* 上下の白い帯ライン */}
                  <div className="absolute top-0 w-full h-2 bg-white/40" />
                  <div className="absolute bottom-0 w-full h-2 bg-white/40" />
                </div>

                {/* カード裏面：バグキャラ顕現状態 */}
                <div
                  className={`absolute inset-0 border-4 rounded-xl flex flex-col p-4 justify-between backface-hidden rotateY-180 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${card.bgClass}`}
                >
                  <div className="absolute inset-0.5 border-2 border-white/10 rounded-lg pointer-events-none" />
                  <div className="flex justify-between items-start z-10">
                    <span className="text-[9px] bg-slate-950 border-2 border-white/20 px-1.5 py-0.5 rounded font-black tracking-tight">
                      {card.type === "maximum" ? "💥 OVER" : "💧 LACK"}
                    </span>
                  </div>
                  <div className="text-center my-auto z-10">
                    <h3 className="text-xl font-black tracking-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)]">{card.title}</h3>
                  </div>
                  <div className="flex justify-between items-center text-[8px] opacity-70 font-black tracking-widest z-10">
                    <span>⚠️ COGNITIVE</span>
                    <span>UNCURED</span>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* 吹き出しウィンドウエリア */}
      <div className="h-28 max-w-2xl w-full flex items-center justify-center border-4 border-slate-700 bg-slate-950 rounded-xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] z-20 relative">
        <AnimatePresence mode="wait">
          {hoveredCard ? (
            <motion.div
              key={hoveredCard.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start space-x-3 w-full"
            >
              <div className={`font-black px-2 py-1 border-2 text-[10px] rounded shrink-0 tracking-tighter shadow-[2px_2px_0px_rgba(0,0,0,1)] ${hoveredCard.type === "maximum" ? "bg-rose-950 border-rose-500 text-rose-400" : "bg-sky-950 border-sky-500 text-sky-400"}`}>
                {hoveredCard.type === "maximum" ? "過剰の歪み" : "不足の歪み"}
              </div>
              <div className="text-xs text-slate-200 w-full leading-relaxed font-sans font-semibold">
                <TypewriterText text={hoveredCard.hoverText} speed={10} />
              </div>
            </motion.div>
          ) : (
            <p className="text-xs text-slate-400 text-center leading-relaxed font-sans font-semibold">
              カードを選択してペアを暴き、深層心理に潜む歪んだ本音を調和させてください。
            </p>
          )}
        </AnimatePresence>
      </div>

      {/* 遊び方説明モーダル */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border-4 border-slate-700 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-yellow-400 border-2 border-slate-700 p-1 rounded-lg transition-colors bg-slate-950"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-pink-400 border-b-4 border-slate-800 pb-3 mb-4">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-xl font-black tracking-wider">中庸大冒険システムガイド</h2>
              </div>

              <div className="space-y-4 text-xs text-slate-200 leading-relaxed font-sans font-semibold">
                <p>
                  人間の認知は常に、極端なバグである<strong className="text-rose-400">「やりすぎる過剰（最大）」</strong>か、あるいは<strong className="text-sky-400">「逃げ出す不足（最小）」</strong>の罠にハマり、自滅ループを繰り返すように設計されています。
                </p>
                <p>
                  古代ギリシャの哲学者アリストテレスは、最も強靭で美しい生き方として、その両極端を排除するのではなく、互いに衝突させて最適な調和点を導き出す<strong className="text-yellow-400 font-bold">『中庸（Virtue）』</strong>の概念を定義しました。
                </p>
                
                <div className="bg-slate-950 border-2 border-slate-800 p-4 rounded-xl font-mono space-y-2.5 text-slate-300 shadow-inner">
                  <div className="font-bold text-pink-400 flex items-center space-x-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>【タスク・シミュレーション】</span>
                  </div>
                  <div className="text-[11px] leading-relaxed font-sans font-semibold">
                    1. 盤面のカードをめくり、同じテーマを宿す<span className="text-rose-400">💥OVER</span>と<span className="text-sky-400">💧LACK</span>を探し出してください。<br />
                    2. 完全なペアを引き合わせた瞬間、脳内での和解イベント（認知矯正プロセス）が強制起動します。<br />
                    3. 両極端なバグ共が醜いツンデレ対話を行った後、真ん中にある美しい「正解」が導き出されます。
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="mt-6 w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-xl text-xs tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,1)] active:scale-98 transition-all border-2 border-pink-400"
              >
                了解（精神のバグを観測する）
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 和解イベント ＆ 毒舌ナレーション モーダル */}
      <AnimatePresence>
        {activeEventPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 font-mono"
          >
            <div className="max-w-2xl w-full flex flex-col space-y-6 z-10">
              <div className="text-center">
                <span className="text-[10px] text-yellow-400 font-bold bg-yellow-400/10 px-4 py-1.5 rounded-full border-2 border-yellow-400 tracking-widest uppercase animate-pulse shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  ⚡ SYNAPTIC CRASH: 認知の歪みが激突中 ⚡
                </span>
                <h2 className="text-sm font-black text-slate-400 mt-3 tracking-widest">CATEGORY: {activeEventPair.theme}</h2>
              </div>

              {/* キャラクターの対話エリア */}
              <div className="space-y-4 min-h-[160px] flex flex-col justify-center bg-slate-900 border-4 border-slate-700 p-4 rounded-2xl shadow-inner">
                {/* 会話ステップ1：ミニマム */}
                {(eventStep === "dialogue0" || eventStep === "dialogue1" || eventStep === "narration" || eventStep === "complete") && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start space-x-3">
                    <div className="bg-sky-600 border-2 border-sky-300 text-white font-black px-2.5 py-1 rounded text-[10px] shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">💧 LACK</div>
                    <div className="bg-slate-950 border-2 border-sky-500/30 p-3 rounded-xl rounded-tl-none text-xs max-w-md text-slate-200 leading-relaxed shadow-md font-sans font-semibold">
                      <TypewriterText
                        text={activeEventPair.dialogue[0].text}
                        speed={18}
                        onComplete={() => {
                          if (eventStep === "dialogue0") setEventStep("dialogue1");
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* 会話ステップ2：マキシマム */}
                {(eventStep === "dialogue1" || eventStep === "narration" || eventStep === "complete") && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start space-x-3 justify-end">
                    <div className="bg-slate-950 border-2 border-rose-500/30 p-3 rounded-xl rounded-tr-none text-left text-xs max-w-md text-slate-200 leading-relaxed shadow-md font-sans font-semibold">
                      <TypewriterText
                        text={activeEventPair.dialogue[1].text}
                        speed={18}
                        onComplete={() => {
                          if (eventStep === "dialogue1") {
                            setTimeout(() => setEventStep("narration"), 400);
                          }
                        }}
                      />
                    </div>
                    <div className="bg-rose-600 border-2 border-rose-300 text-white font-black px-2.5 py-1 rounded text-[10px] shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">💥 OVER</div>
                  </motion.div>
                )}
              </div>

              {/* 会話ステップ3：毒舌ナレーション */}
              <div className="h-36">
                <AnimatePresence mode="wait">
                  {(eventStep === "narration" || eventStep === "complete") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-slate-950 border-4 border-slate-700 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] relative rounded-xl"
                    >
                      <div className="absolute -top-3.5 left-4 bg-slate-700 px-2 py-0.5 text-[8px] font-black text-slate-200 uppercase tracking-widest rounded border-2 border-slate-500">
                        SYSTEM JUDGEMENT
                      </div>
                      <p className="text-cyan-400 font-semibold leading-relaxed text-xs md:text-sm font-sans">
                        <TypewriterText
                          text={activeEventPair.narration}
                          speed={15}
                          onComplete={() => setEventStep("complete")}
                        />
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 獲得ボタン */}
              {eventStep === "complete" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-2 text-center"
                >
                  <button
                    onClick={() => setActiveEventPair(null)}
                    className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all active:scale-98 text-base tracking-widest border-4 border-slate-950 flex items-center justify-center space-x-3 group relative overflow-hidden"
                  >
                    <Trophy className="w-6 h-6" />
                    <span>美徳 【 {activeEventPair.title} 】 を精神に刻み込む</span>
                    <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* オールクリア画面 */}
      {matchedPairIds.length === 3 && !activeEventPair && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center mt-4 bg-slate-950 border-4 border-emerald-500 p-6 rounded-2xl max-w-md w-full shadow-[4px_4px_0px_rgba(0,0,0,1)] z-20 relative"
        >
          <div className="w-12 h-12 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-emerald-400 font-black text-base mb-2 tracking-wide">🎉 STAGE CLEAR: 精神の調和完了</p>
          <p className="text-slate-300 text-xs mb-5 font-sans font-semibold leading-relaxed">
            展開された極端なバグ思考の相殺に成功しました。脳内のノイズは完全に一掃され、フラットな認知領域が確保されました。
          </p>
          <button
            onClick={generateRandomPairs}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs tracking-widest transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:scale-95 border-2 border-slate-950"
          >
            次の3つの試練をロードする
          </button>
        </motion.div>
      )}
    </div>
  );
}