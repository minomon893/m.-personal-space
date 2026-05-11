"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Edit3, Heart, Target, Sparkles, Trophy, Download } from "lucide-react";
import { toPng } from 'html-to-image';

export default function HighContrastProfilePage() {
  const [isEditing, setIsEditing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef(null);

  // 初期データ構造
  const initialData = {
    date: { y: "2026", m: "05", d: "06" },
    basic: { name: "", sexuality: "", mbti: "", birthday: "", anniversary: "", charms: "", title: "", future: "" },
    fillIn: { morningNight: "", sleep: "", smartphone: "", exercise: "", likes: "", dislikes: "", mine: "", depression: "", moodUp: "", benefit: "", oneWord: "", motto: "" },
    interests: { fashion: 50, sports: 50, love: 50, work: 50, hobby: 50, food: 50 },
    history: "",
    hexagon: [
      { label: "爪の長さ", val: 3 },
      { label: "喧嘩時のLINEの長さ", val: 3 },
      { label: "旅行時のガチャガチャの回数", val: 3 },
      { label: "しょうもない怪我の回数", val: 3 },
      { label: "動物大好き度", val: 3 },
      { label: "独り言の回数", val: 3 }
    ],
    eval: { 
      self: ["", "", ""], 
      others: ["", "", ""] 
    },
    episodes: { pride: "", happy: "", angry: "", gaveUp: "", secret: "" },
    choice: { 
      emotion: "", 
      rest: "", 
      logic: "", 
      action: "",
      comm: "",
      location: "",
      order: ""
    },
    freeSpace: ""
  };

  const [data, setData] = useState(initialData);

  // 初回読み込み
  useEffect(() => {
    const savedData = localStorage.getItem("my_profile_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // 初期構造とマージして、キー不足によるエラーを防ぐ
        setData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load profile data", e);
      }
    }
  }, []);

  // データ変更時に保存
  useEffect(() => {
    if (data !== initialData) {
      localStorage.setItem("my_profile_data", JSON.stringify(data));
    }
  }, [data]);

  const handleDownloadFull = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      const link = document.createElement('a');
      link.download = `profile_${data.date.y}${data.date.m}${data.date.d}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('保存失敗', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setData(prev => {
      let newState = { ...prev };
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const handleRankChange = (type, index, value) => {
    const newList = [...data.eval[type]];
    newList[index] = value;
    handleChange(`eval.${type}`, newList);
  };

  const handleHexChange = (index, field, value) => {
    const newHex = [...data.hexagon];
    newHex[index][field] = value;
    setData({ ...data, hexagon: newHex });
  };

  const selfPlaceholders = ["自立している", "やさしい", "かわいい、など"];
  const currentPlaceholders = ["自分でお金を稼いでいる", "人の気持ちを想像する", "好きな服を見るとテンションが上がる、など"];

  return (
    <div className="min-h-screen bg-[#E5E2DA] p-2 md:p-4 text-[#222222] font-sans antialiased overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6 px-2 gap-4">
          <Link href="/menu" className="flex items-center gap-2 text-[10px] md:text-[11px] font-black tracking-widest uppercase text-[#4A4A4A]">
            <ArrowLeft size={14} strokeWidth={3} /> <span className="hidden sm:inline">Return to Menu</span>
          </Link>
          
          <div className="flex gap-2">
            {/* Viewモードの時だけ表示 */}
            {!isEditing && (
              <button onClick={handleDownloadFull} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white border-2 border-[#222222] text-[#222222] px-4 py-2.5 rounded-full shadow-lg disabled:opacity-50">
                <Download size={14} /> {isGenerating ? '...' : 'SAVE IMAGE'}
              </button>
            )}
            
            <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-[#222222] text-[#FFFFFF] px-6 py-2.5 rounded-full shadow-xl">
              {isEditing ? (
                <><Eye size={14} /> Switch to View Mode</>
              ) : (
                <><Edit3 size={14} /> Switch to Edit Mode</>
              )}
            </button>
          </div>
        </div>

        {/* Main Profile Sheet */}
        <div ref={printRef} className="bg-[#FFFFFF] shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-16 border-t-8 border-[#222222] box-border w-full">
          
          <header className="mb-12 md:mb-20 text-center">
            <div className="inline-block border-b-4 border-[#222222] pb-4 mb-4">
              <h1 className="text-2xl md:text-5xl font-black tracking-tighter flex items-center justify-center gap-3">
                <Sparkles size={24} className="text-[#FFD700]" />
                MY PROFILE <span className="text-[#2222221A]">/</span> 自己分析
              </h1>
            </div>
            <p className="text-[10px] font-mono font-bold text-[#888888] tracking-[0.3em]">Last Updated: {data.date.y}.{data.date.m}.{data.date.d}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 md:gap-y-24">
            
            {/* 01: Identification */}
            <Section title="01" en="IDENTIFICATION" jp="基本情報">
              <Input label="Name / 名前" value={data.basic.name} placeholder="名前を入力" onChange={v => handleChange('basic.name', v)} isEditing={isEditing} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Sex / 性別" value={data.basic.sexuality} placeholder="セクシュアリティでもOK" onChange={v => handleChange('basic.sexuality', v)} isEditing={isEditing} />
                <Input label="MBTI / 16タイプ" value={data.basic.mbti} placeholder="ESFJ、 INTP、など" onChange={v => handleChange('basic.mbti', v)} isEditing={isEditing} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Birthday / 誕生日" value={data.basic.birthday} placeholder="YYYY.MM.DD" onChange={v => handleChange('basic.birthday', v)} isEditing={isEditing} />
                <Input label="Anniv / 記念日" value={data.basic.anniversary} placeholder="YYYY.MM.DD (◯◯の日)" onChange={v => handleChange('basic.anniversary', v)} isEditing={isEditing} />
              </div>
              <Input label="Charm Points / 推しポイント" value={data.basic.charms} placeholder="片側にしかできないえくぼ、仲のいい人専用の愛嬌、つるつるのかかと、など" onChange={v => handleChange('basic.charms', v)} isEditing={isEditing} />
              <Input label="Future Design / 将来設計" value={data.basic.future} isArea={true} placeholder="異国のスイーツを食べる、もう一回△△に旅行に行く、▢▢の資格を取る、など" onChange={v => handleChange('basic.future', v)} isEditing={isEditing} />
            </Section>

            {/* 02: Personal Bits */}
            <Section title="02" en="PERSONAL BITS" jp="穴埋め紹介">
              <div className="space-y-6 bg-[#F9F9F9] p-6 md:p-10 rounded-[2rem] border-2 border-[#2222220A]">
                <div className="grid grid-cols-2 gap-6">
                  <MiniInput label="朝型 or 夜型" value={data.fillIn.morningNight} onChange={v => handleChange('fillIn.morningNight', v)} isEditing={isEditing} />
                  <MiniInput label="睡眠時間" value={data.fillIn.sleep} onChange={v => handleChange('fillIn.sleep', v)} isEditing={isEditing} />
                </div>
                <MiniInput label="すきなこと、人" value={data.fillIn.likes} onChange={v => handleChange('fillIn.likes', v)} isEditing={isEditing} />
                <MiniInput label="きらいなこと、人" value={data.fillIn.dislikes} onChange={v => handleChange('fillIn.dislikes', v)} isEditing={isEditing} />
                <MiniInput label="地雷（NG）" value={data.fillIn.mine} onChange={v => handleChange('fillIn.mine', v)} isEditing={isEditing} />
                <MiniInput label="機謙を取るには" value={data.fillIn.moodUp} onChange={v => handleChange('fillIn.moodUp', v)} isEditing={isEditing} />
                <MiniInput label="自分を一言で" value={data.fillIn.oneWord} onChange={v => handleChange('fillIn.oneWord', v)} isEditing={isEditing} />
              </div>
            </Section>

            {/* 03: Interests */}
            <Section title="03" en="INTERESTS" jp="興味度パーセンテージ">
              <div className="space-y-10 pt-2">
                {[
                  { k: 'fashion', l: 'FASHION / ファッション' },
                  { k: 'sports', l: 'SPORTS / スポーツ' },
                  { k: 'love', l: 'LOVE / 恋愛' },
                  { k: 'work', l: 'WORK / 仕事' },
                  { k: 'hobby', l: 'HOBBY / 趣味' },
                  { k: 'food', l: 'FOOD / 食' }
                ].map(({ k, l }) => (
                  <div key={k} className="relative">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[12px] font-black text-[#222222]">{l}</span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        data.interests[k] < 0 ? 'bg-red-100 text-red-600' : 
                        data.interests[k] > 100 ? 'bg-yellow-400 text-black' : 'bg-[#222222] text-[#FFFFFF]'
                      }`}>
                        {data.interests[k]}%
                      </span>
                    </div>
                    <input 
                      type="range" min="-20" max="120" step="1"
                      value={data.interests[k]} 
                      onChange={(e) => handleChange(`interests.${k}`, parseInt(e.target.value))} 
                      disabled={!isEditing} 
                      className="w-full h-3 bg-[#22222214] appearance-none cursor-pointer accent-[#222222] rounded-full [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-[#222222] [&::-webkit-slider-thumb]:rounded-full" 
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* 04: Hexagon Chart */}
            <Section title="04" en="HEXAGON" jp="自分ヘキサゴン">
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-bold text-[#888888] mb-6 bg-[#F5F5F5] px-4 py-1 rounded-full italic">
                  「3が平均」として自分を評価しよう！
                </p>
                <RadarChart data={data.hexagon} />
                {isEditing && (
                  <div className="grid grid-cols-1 gap-6 w-full bg-[#F5F5F5] p-6 md:p-8 rounded-[2rem] mt-8 border-2 border-[#2222220A]">
                    {data.hexagon.map((item, i) => (
                      <div key={i} className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-[12px] font-black">
                          <div className="flex items-center gap-2 text-[#222222] flex-1">
                            <Edit3 size={14} className="text-[#888888]" />
                            <input 
                              className="bg-[#FFFFFF] border border-[#2222221A] focus:border-[#222222] outline-none w-full px-3 py-1.5 rounded-lg shadow-sm" 
                              value={item.label} 
                              onChange={e => handleHexChange(i, 'label', e.target.value)}
                            />
                          </div>
                          <span className="font-mono ml-4 bg-[#222222] text-white px-2 py-0.5 rounded text-[11px]">{item.val}/6</span>
                        </div>
                        <input 
                          type="range" min="0" max="6" step="1" 
                          value={item.val} 
                          onChange={e => handleHexChange(i, 'val', parseInt(e.target.value))} 
                          className="w-full h-3 accent-[#222222] cursor-pointer appearance-none bg-[#22222214] rounded-full [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-[#222222] [&::-webkit-slider-thumb]:rounded-full shadow-inner" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* 05: Evaluation */}
            <div className="md:col-span-2">
              <Section title="05" en="STORYLINE" jp="遍歴と自己定義">
                <Input 
                  label="過去に沼ったコンテンツ" 
                  value={data.history} 
                  isArea={true} 
                  placeholder={"ダンゴムシ集め（小学校低学年）など"}
                  onChange={v => handleChange('history', v)} 
                  isEditing={isEditing} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                  <RankingSection 
                    title="なりたい自分" 
                    icon={<Heart size={16} className="text-[#EF4444]" />} 
                    type="self" 
                    items={data.eval.self} 
                    placeholders={selfPlaceholders}
                    onUpdate={handleRankChange} 
                    isEditing={isEditing} 
                  />
                  <RankingSection 
                    title="今の自分との共通点" 
                    icon={<Target size={16} className="text-[#3B82F6]" />} 
                    type="others" 
                    items={data.eval.others} 
                    placeholders={currentPlaceholders}
                    onUpdate={handleRankChange} 
                    isEditing={isEditing} 
                  />
                </div>
              </Section>
            </div>

            {/* 06: Values */}
            <Section title="06" en="VALUES" jp="二者択一">
              <div className="grid grid-cols-1 gap-6 pt-2">
                <Choice label="感情表現は" left="大きめ" right="控えめ" active={data.choice.emotion} onSelect={v => handleChange('choice.emotion', v)} isEditing={isEditing} />
                <Choice label="疲れたときは" left="遊ぶ" right="休む" active={data.choice.rest} onSelect={v => handleChange('choice.rest', v)} isEditing={isEditing} />
                <Choice label="思考回路は" left="論理的" right="人情的" active={data.choice.logic} onSelect={v => handleChange('choice.logic', v)} isEditing={isEditing} />
                <Choice label="トラブル時は" left="考える" right="まず動く" active={data.choice.action} onSelect={v => handleChange('choice.action', v)} isEditing={isEditing} />
                <Choice label="コミュニケーションでは" left="聞く側" right="話す側" active={data.choice.comm} onSelect={v => handleChange('choice.comm', v)} isEditing={isEditing} />
                <Choice label="住むなら" left="都会" right="田舎" active={data.choice.location} onSelect={v => handleChange('choice.location', v)} isEditing={isEditing} />
                <Choice label="注文は" left="冒険" right="安定" active={data.choice.order} onSelect={v => handleChange('choice.order', v)} isEditing={isEditing} />
              </div>
            </Section>

            {/* 07: Free Space */}
            <div>
              <Section title="07" en="FREE JOURNAL" jp="フリースペース">
                <div className="bg-[#222222] p-6 md:p-10 shadow-2xl min-h-[200px] rounded-[1.5rem] md:rounded-[2rem]">
                  {isEditing ? (
                    <textarea className="w-full bg-transparent text-[#FFFFFF] text-[14px] leading-relaxed focus:outline-none min-h-[160px] resize-none border-none" placeholder="自由に書いてください..." value={data.freeSpace} onChange={e => handleChange('freeSpace', e.target.value)} />
                  ) : (
                    <p className="text-[#FFFFFF] text-[14px] leading-relaxed whitespace-pre-wrap">{data.freeSpace || "NO RECORDS FOUND."}</p>
                  )}
                </div>
              </Section>
            </div>
          </div>

          <footer className="mt-16 md:mt-32 pt-8 border-t border-[#2222220D] flex flex-col md:flex-row justify-between items-center gap-4 text-[#22222266]">
            <span className="text-[9px] font-black tracking-[0.4em] uppercase text-center">PRIVATE MAPPING JOURNAL</span>
            <span className="text-[9px] font-mono font-bold">© {data.date.y} ARCHIVE</span>
          </footer>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}

// --- Internal Components ---

function Section({ title, en, jp, children }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3 border-l-4 border-[#222222] pl-4">
        <span className="text-xl md:text-2xl font-black font-mono leading-none">{title}</span>
        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-widest text-[#222222] uppercase leading-none mb-1">{en}</span>
          <span className="text-[12px] font-bold text-[#22222266] leading-none">{jp}</span>
        </div>
      </div>
      <div className="px-1">{children}</div>
    </section>
  );
}

function RankingSection({ title, icon, type, items, placeholders, onUpdate, isEditing }) {
  return (
    <div className="w-full">
      <p className="text-[12px] font-black mb-4 uppercase flex items-center gap-2">{icon} {title}</p>
      <div className="space-y-3">
        {items.map((val, i) => (
          <div key={i} className="flex items-center gap-4 bg-[#F5F5F5] p-4 rounded-xl border border-[#22222205]">
            {isEditing ? (
              <input 
                className="flex-1 bg-transparent border-b border-[#2222221A] text-[14px] font-black outline-none focus:border-[#222222] pb-1 placeholder:text-[#22222233]" 
                value={val} 
                onChange={e => onUpdate(type, i, e.target.value)} 
                placeholder={placeholders[i] || `項目 ${i+1}`}
              />
            ) : (
              <span className="text-[14px] font-black">{val || "---"}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ data }) {
  const size = 300;
  const center = size / 2;
  const radius = 85;

  // 数値を丸めるヘルパー関数
  const fix = (num) => Number(num.toFixed(4));

  const points = data.map((item, i) => {
    const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
    const x = fix(center + radius * (item.val / 6) * Math.cos(angle));
    const y = fix(center + radius * (item.val / 6) * Math.sin(angle));
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto overflow-visible">
      {[1, 2, 3, 4, 5, 6].map(step => (
        <polygon key={step} points={data.map((_, i) => {
          const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
          const px = fix(center + radius * (step/6) * Math.cos(angle));
          const py = fix(center + radius * (step/6) * Math.sin(angle));
          return `${px},${py}`;
        }).join(" ")} fill="none" stroke="#222222" strokeWidth={1} strokeOpacity={0.1} />
      ))}
      <polygon points={points} fill="#222222" fillOpacity={0.15} stroke="#222222" strokeWidth={3} strokeLinejoin="round" />
      {data.map((item, i) => {
        const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
        const x = fix(center + (radius + 35) * Math.cos(angle));
        const y = fix(center + (radius + 35) * Math.sin(angle));
        return (
          <text key={i} x={x} y={y} textAnchor="middle" className="text-[10px] font-black fill-[#222222]" dominantBaseline="middle">
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}

function Input({ label, value, onChange, isEditing, isArea = false, placeholder }) {
  return (
    <div className="mb-6 w-full">
      <p className="text-[10px] font-black mb-2 uppercase text-[#888888]">{label}</p>
      {isEditing ? (
        isArea ? (
          <textarea className="w-full bg-[#FBFBFB] border-b-2 border-[#2222221A] py-2 px-3 text-[14px] font-bold min-h-[80px] rounded-t-lg outline-none focus:border-[#222222] resize-none placeholder:text-[#22222233]" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        ) : (
          <input className="w-full bg-[#FBFBFB] border-b-2 border-[#2222221A] py-2 px-3 text-[14px] font-bold rounded-t-lg outline-none focus:border-[#222222] placeholder:text-[#22222233]" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        )
      ) : (
        <p className="text-[14px] font-bold py-2 border-b-2 border-transparent min-h-[30px] whitespace-pre-wrap">{value || "---"}</p>
      )}
    </div>
  );
}

function MiniInput({ label, value, onChange, isEditing }) {
  return (
    <div className="flex flex-col gap-2 mb-2">
      <span className="text-[10px] font-black text-[#888888] uppercase tracking-wider">{label}</span>
      {isEditing ? (
        <input 
          className="bg-[#FFFFFF] border border-[#2222221A] text-[14px] font-black py-2 px-3 rounded-lg outline-none focus:border-[#222222] shadow-sm transition-all" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
        />
      ) : (
        <span className="text-[15px] font-black min-h-[24px] pl-1">{value || "---"}</span>
      )}
    </div>
  );
}

function Choice({ label, left, right, active, onSelect, isEditing }) {
  return (
    <div className="w-full">
      <p className="text-[10px] font-black text-[#888888] mb-3 uppercase tracking-wider">{label}</p>
      <div className="flex gap-2">
        {[left, right].map(opt => (
          <button key={opt} onClick={() => onSelect(opt)} disabled={!isEditing} className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all ${active === opt ? 'bg-[#222222] text-[#FFFFFF]' : 'bg-[#FFFFFF] border border-[#2222221A] text-[#2222224D]'}`}>{opt}</button>
        ))}
      </div>
    </div>
  );
}