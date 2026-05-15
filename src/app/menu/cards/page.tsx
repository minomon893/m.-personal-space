"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HelpCircle } from "lucide-react";

// ==========================================
// 1. 型定義 ＆ ゲームデータ
// ==========================================
type CardType = "maximum" | "minimum";

interface GameCard {
  id: string;
  pairId: number;
  type: CardType;
  title: string;
  theme: string;
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
    theme: "タスク管理",
    title: "最善主義 (Good Enough)",
    dialogue: [
      { speaker: "minimum", text: "おいマキシマム、お前見てて息が詰まるんだよ。ちょっとその肩の力抜けよ、キモいから。" },
      { speaker: "maximum", text: "……チッ、お前に言われたくないけど、確かにこのままだと破裂しそうだわ。……じゃあ、今日だけは70点で出すか。" }
    ],
    narration: "二人のバカが妥協点を見つけたようです。60〜70点で出すのが、実は一番コスパが良いプロの技。"
  },
  {
    id: 2,
    theme: "人間関係",
    title: "境界線のある友愛 (Boundaries)",
    dialogue: [
      { speaker: "minimum", text: "おい、何でもかんでも引き受けてんじゃねえよバカ。お前が倒れたら、私のダラダラする時間が減るだろ。" },
      { speaker: "maximum", text: "……うぅ、ミニマムが初めて役に立った……。じゃあ、この案件は勇気を出して断る……！" }
    ],
    narration: "お人好しと利己主義が手を組みました。自分を守れない優しさは、ただの都合のいい奴です。"
  }
];

const CARDS_POOL: Omit<GameCard, "id">[] = [
  { pairId: 1, type: "maximum", theme: "タスク管理", title: "完璧主義", hoverText: "100点以外は全部ゴミですが？？お前、99点の提出物出して恥ずかしくないの？死ぬ気でやり直せよ！", bgClass: "bg-red-500 border-red-700 text-white" },
  { pairId: 1, type: "minimum", theme: "タスク管理", title: "締め切り破り", hoverText: "あー、めんどくさ。どうせお前が必死こいて作ったところで、誰も大して見てないって。布団戻ろうぜ？", bgClass: "bg-blue-500 border-blue-700 text-white" },
  { pairId: 2, type: "maximum", theme: "人間関係", title: "自己犠牲", hoverText: "断ったら嫌われるよぉ！お前の睡眠時間を差し出せば丸く収まるんだから、ニコニコして全部引き受けろよ！", bgClass: "bg-orange-500 border-orange-700 text-white" },
  { pairId: 2, type: "minimum", theme: "人間関係", title: "自己中心", hoverText: "他人が困ってようが知ったこっちゃねえわ。冷たい奴って思われた？だから何？お前の人生にそいつ関係ある？", bgClass: "bg-indigo-500 border-indigo-700 text-white" }
];

// ==========================================
// 2. タイピングエフェクト用コンポーネント
// ==========================================
const TypewriterText({ text, speed = 30, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
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
        if (onComplete) onComplete();
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
  
  // イベント演出用ステート
  const [activeEventPair, setActiveEventPair] = useState<PairData | null>(null);
  const [eventStep, setEventStep] = useState<"dialogue0" | "dialogue1" | "narration" | "complete">("dialogue0");

  // ゲーム初期化（シャッフル）
  useEffect(() => {
    const shuffled = [...CARDS_POOL]
      .map((c, i) => ({ ...c, id: `card-${i}-${Math.random()}` }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  const handleCardClick = (card: GameCard) => {
    if (selectedCards.length >= 2 || selectedCards.some((c) => c.id === card.id) || matchedPairIds.includes(card.pairId)) return;

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    if (newSelection.length === 2) {
      if (newSelection[0].pairId === newSelection[1].pairId && newSelection[0].type !== newSelection[1].type) {
        // ペア成立！イベント発生
        const pairData = PAIRS_DATA.find((p) => p.id === newSelection[0].pairId);
        setTimeout(() => {
          if (pairData) {
            setActiveEventPair(pairData);
            setEventStep("dialogue0");
          }
          setMatchedPairIds((prev) => [...prev, newSelection[0].pairId]);
          setSelectedCards([]);
        }, 600);
      } else {
        // 不一致なら元に戻す
        setTimeout(() => setSelectedCards([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-center p-6 font-mono selection:bg-red-500 selection:text-white">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-wider text-amber-400 mb-2">MAXIMUM ⚡ MINIMUM</h1>
        <p className="text-sm text-zinc-400">〜両極端のバカどもを和解させて中庸を導け〜</p>
      </header>

      {/* メインゲーム盤面 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full mb-8">
        {cards.map((card) => {
          const isSelected = selectedCards.some((c) => c.id === card.id);
          const isMatched = matchedPairIds.includes(card.pairId);

          return (
            <div
              key={card.id}
              className="relative h-48 perspective"
              onMouseEnter={() => !isMatched && !isSelected && setHoveredCard(card)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className="w-full h-full duration-500 transform-style"
                animate={{ rotateY: isSelected || isMatched ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* カードの表面（伏せてある状態） */}
                <div
                  className="absolute inset-0 bg-zinc-800 border-4 border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer backface-hidden hover:border-amber-400 transition-colors"
                  onClick={() => handleCardClick(card)}
                >
                  <HelpCircle className="w-12 h-12 text-zinc-600 mb-2" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{card.theme}</span>
                </div>

                {/* カードの裏面（めくった状態 / バグキャラ状態） */}
                <div
                  className={`absolute inset-0 border-4 rounded-xl flex flex-col p-4 justify-between backface-hidden rotateY-180 ${card.bgClass}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-black/30 px-2 py-0.5 rounded uppercase font-black">
                      {card.type === "maximum" ? "💥 MAX" : "💧 MIN"}
                    </span>
                    <span className="text-xs opacity-80">{card.theme}</span>
                  </div>
                  <div className="text-center my-auto">
                    <h3 className="text-xl font-extrabold tracking-tight">{card.title}</h3>
                  </div>
                  <div className="text-right text-[10px] opacity-60">SELECTABLE</div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* ホバー時の尖った吹き出しエリア */}
      <div className="h-24 max-w-2xl w-full flex items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-800/40 p-4">
        <AnimatePresence mode="wait">
          {hoveredCard ? (
            <motion.div
              key={hoveredCard.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start space-x-3 w-full"
            >
              <div className={`font-black px-3 py-1 rounded text-sm shrink-0 ${hoveredCard.bgClass.split(" ")[0]}`}>
                {hoveredCard.type === "maximum" ? "マキシマム" : "ミニマム"}
              </div>
              <div className="bg-zinc-800 border border-zinc-700 p-2 rounded-lg relative text-sm text-zinc-300 w-full">
                <TypewriterText text={hoveredCard.hoverText} speed={15} />
              </div>
            </motion.div>
          ) : (
            <p className="text-sm text-zinc-500">カードをホバーすると、脳内の醜い本音が騒ぎ出します。</p>
          )}
        </AnimatePresence>
      </div>

      {/* ==========================================
          4. 和解イベント ＆ 毒舌ナレーション モーダル
         ========================================== */}
      <AnimatePresence>
        {activeEventPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 font-mono"
          >
            <div className="max-w-2xl w-full flex flex-col space-y-8">
              <div className="text-center">
                <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                  💥 2つのバグが激突中 💧
                </span>
                <h2 className="text-xl font-bold text-zinc-400 mt-3">THEME: {activeEventPair.theme}</h2>
              </div>

              {/* キャラクターのツンデレ会話エリア */}
              <div className="space-y-4 min-h-[160px] flex flex-col justify-center">
                {/* 会話ステップ1：ミニマムのツッコミ */}
                {(eventStep === "dialogue0" || eventStep === "dialogue1" || eventStep === "narration" || eventStep === "complete") && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start space-x-3">
                    <div className="bg-blue-600 text-white font-black px-3 py-1 rounded text-sm shrink-0 shadow-lg shadow-blue-900/50">ミニマム</div>
                    <div className="bg-zinc-800 border-2 border-blue-500 p-3 rounded-xl text-sm max-w-md relative">
                      <TypewriterText
                        text={activeEventPair.dialogue[0].text}
                        speed={25}
                        onComplete={() => eventStep === "dialogue0" && setEventStep("dialogue1")}
                      />
                    </div>
                  </motion.div>
                )}

                {/* 会話ステップ2：マキシマムの渋々の納得 */}
                {(eventStep === "dialogue1" || eventStep === "narration" || eventStep === "complete") && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start space-x-3 justify-end">
                    <div className="bg-red-800 border-2 border-red-500 p-3 rounded-xl text-sm max-w-md relative text-left">
                      <TypewriterText
                        text={activeEventPair.dialogue[1].text}
                        speed={25}
                        onComplete={() => eventStep === "dialogue1" && setTimeout(() => setEventStep("narration"), 800)}
                      />
                    </div>
                    <div className="bg-red-600 text-white font-black px-3 py-1 rounded text-sm shrink-0 shadow-lg shadow-red-900/50">マキシマム</div>
                  </motion.div>
                )}
              </div>

              {/* 会話ステップ3：毒舌ナレーション画面 */}
              <div className="h-40">
                <AnimatePresence>
                  {(eventStep === "narration" || eventStep === "complete") && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full bg-zinc-950 border-4 border-zinc-700 p-4 shadow-2xl relative"
                    >
                      <div className="absolute -top-3 left-4 bg-zinc-700 px-2 py-0.5 text-xs font-black text-zinc-100 uppercase tracking-widest">
                        NARRATION
                      </div>
                      <p className="text-amber-500 font-bold leading-relaxed text-sm md:text-base">
                        <TypewriterText
                          text={activeEventPair.narration}
                          speed={30}
                          onComplete={() => setEventStep("complete")}
                        />
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 次へ進むボタン */}
              {eventStep === "complete" && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActiveEventPair(null)}
                  className="mx-auto flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black px-8 py-3 rounded-xl shadow-xl transition-all active:scale-95"
                >
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>【 {activeEventPair.title} 】を脳に刻む</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ゲームリセット */}
      {matchedPairIds.length === PAIRS_DATA.length && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center mt-6">
          <p className="text-green-400 font-bold mb-4">🎉 すべての両極端なバカどもが調和されました！</p>
          <button
            onClick={() => {
              setMatchedPairIds([]);
              setSelectedCards([]);
              const shuffled = [...CARDS_POOL]
                .map((c, i) => ({ ...c, id: `card-${i}-${Math.random()}` }))
                .sort(() => Math.random() - 0.5);
              setCards(shuffled);
            }}
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
          >
            もう一度バカを調和する
          </button>
        </motion.div>
      )}
    </div>
  );
}