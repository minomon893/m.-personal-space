"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  User,
  Lock,
  BookOpen,
  Sun,
  HomeIcon,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MenuPage() {
  const [hasNewNotice, setHasNewNotice] = useState(false);
  const [menuSettings, setMenuSettings] = useState({});

  useEffect(() => {
    // お知らせのチェック
    const checkNewNotices = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('id')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const readNotices = JSON.parse(localStorage.getItem("metacog_read_notices") || "[]");
        const hasUnread = data.some(notice => !readNotices.includes(notice.id));
        setHasNewNotice(hasUnread);
      }
    };

    // メニュー公開状態の取得
    const fetchSettings = async () => {
      const { data } = await supabase.from('menu_settings').select('key, is_enabled');
      if (data) {
        const settingsMap = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.is_enabled }), {});
        setMenuSettings(settingsMap);
      }
    };

    checkNewNotices();
    fetchSettings();
  }, []);

  // 設定が存在しない場合はデフォルトで true (表示) とする判定
  const isEnabled = (key) => menuSettings[key] !== false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D0D9DF] via-[#E6E1CF] via-[#F2EBD4] to-[#2C3E50] p-6 text-[#5F6F7A] font-[var(--font-sans)] transition-colors duration-500">
      <div className="max-w-md mx-auto">

        {/* BACK */}
        <Link
          href="/"
          className="text-[10px] tracking-widest font-bold opacity-60 uppercase flex items-center gap-2 mb-12 hover:opacity-100 transition-all hover:-translate-x-1"
        >
          <ArrowLeft size={12} /> Back to Top
        </Link>

        {/* TITLE */}
        <h1 className="text-2xl font-[var(--font-serif)] font-medium tracking-[0.35em] mb-16 text-center italic opacity-90">
          Main Menu
        </h1>

        <div className="space-y-14">

          {/* PROBLEM SOLVING (Mid-day area) */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <Sparkles size={10} /> Problem Solving
            </h2>

            <div className="grid gap-4">
              <div className="hidden">
                <Link href={isEnabled('rpg') ? "/menu/rpg" : "#"}>
                  <MenuButton title="REbeLABEL" subtitle="性格解釈RPG" isDisabled={!isEnabled('rpg')} />
                </Link>
              </div>
              <Link href={isEnabled('bot') ? "/menu/bot" : "#"}>
                <MenuButton title="やわらかことぼっとくん" subtitle="アサーティブ変換ツール" isDisabled={!isEnabled('bot')} />
              </Link>
              <div className="hidden">
              <Link href={isEnabled('cards') ? "/menu/cards" : "#"}>
                <MenuButton title="MAXIMUM vs MINIMUM" subtitle="中庸選択トレーニング" isDisabled={!isEnabled('cards')} />
              </Link>
              </div>
              <div className="hidden">
                <Link href={isEnabled('metacognition') ? "/menu/metacognition" : "#"}>
                  <MenuButton title="メタ認知トリガー開発部" subtitle="交流型脱フュージョントレーニング" isDisabled={!isEnabled('metacognition')} />
                </Link>
              </div>
              <Link href={isEnabled('support') ? "/menu/support" : "#"}>
                <MenuButton title="福祉サービス案内" subtitle="緊急・DV・生活困窮の窓口" isDisabled={!isEnabled('support')} />
              </Link>
            </div>
          </section>

          {/* SELF UNDERSTANDING (Afternoon area) */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <User size={10} /> Self Understanding
            </h2>

            <div className="grid gap-4">
              <Link href={isEnabled('profile') ? "/menu/profile" : "#"}>
                <MenuButton title="プロフィール帳" subtitle="自分を整理" isDisabled={!isEnabled('profile')} />
              </Link>
              <Link href={isEnabled('bingo') ? "/menu/bingo" : "#"}>
                <MenuButton title="日々ンゴ" subtitle="感覚を観測する" isDisabled={!isEnabled('bingo')} />
              </Link>
              <div className="hidden">
                <Link href={isEnabled('nottodolist') ? "/menu/nottodolist" : "#"}>
                  <MenuButton title="Not to do list" subtitle="違和感を記録する" isDisabled={!isEnabled('nottodolist')} />
                </Link>
              </div>
              <Link href={isEnabled('external') ? "/menu/external" : "#"}>
                <MenuButton 
                  title="外部ソース" 
                  subtitle="MBTI / 適職診断 / 4ぴた / つらチェック / セクシュアリティ診断" 
                  isDisabled={!isEnabled('external')}
                />
              </Link>
            </div>
          </section>

          {/* CONTENT (Evening area) */}
          <section>
            <h2 className="text-[10px] tracking-[0.2em] font-bold opacity-40 mb-5 border-b border-[#5F6F7A]/20 pb-1 uppercase flex items-center gap-2">
              <BookOpen size={10} /> Original Content
            </h2>

            <div className="grid gap-4">
              <Link href={isEnabled('poem') ? "/menu/poem" : "#"}>
                <MenuButton title="Free a poem" subtitle="今日のおまもり" isDisabled={!isEnabled('poem')} />
              </Link>
              <div className="hidden">
                <Link href={isEnabled('ezine') ? "/menu/ezine" : "#"}>
                  <MenuButton title="Ezine" subtitle="Support / ¥500~" highlight isDisabled={!isEnabled('ezine')} />
                </Link>
              </div>
              <Link href={isEnabled('stickers') ? "/menu/stickers" : "#"}>
                <MenuButton title="LINE Stamp" subtitle="もっちりとした人シリーズ" isDisabled={!isEnabled('stickers')} />
              </Link>
              <div className="hidden">
                <Link href={isEnabled('web') ? "/menu/web" : "#"}>
                  <MenuButton title="Web site" subtitle="フリー素材 / 話し合いタイプ診断 / AI作曲ツール" isDisabled={!isEnabled('web')} />
                </Link>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-28 mb-12 text-center text-white/20 text-[9px] tracking-[0.4em] uppercase">
          &copy; 2026 m. personal space
        </footer>
      </div>
    </div>
  );
}

function MenuButton({ title, subtitle, isSmall = false, highlight = false, isDisabled = false, onClick }) {
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={`w-full ${
        isSmall ? "py-4" : "py-6"
      } px-7 border rounded-2xl transition-all duration-300 text-left relative overflow-hidden shadow-sm shadow-black/[0.01]
      ${
        isDisabled 
          ? "bg-black/5 border-transparent cursor-not-allowed opacity-40" 
          : "bg-white/60 border-white/40 hover:bg-white/80 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <span
            className={`${
              isSmall ? "text-xs" : "text-[15px]"
            } font-bold block mb-0.5 tracking-wide`}
          >
            {title}
          </span>

          {subtitle && (
            <span
              className={`text-[10px] tracking-wide ${
                highlight ? "text-[#B5A773] font-bold" : "opacity-50"
              } `}
            >
              {subtitle}
            </span>
          )}
        </div>
        
        {isDisabled && (
          <div className="flex flex-col items-end">
            <Lock size={12} className="opacity-40 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Coming Soon</span>
          </div>
        )}
      </div>
    </button>
  );
}