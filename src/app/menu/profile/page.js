"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Edit3, Heart, Target, Sparkles, Trophy, Download } from "lucide-react";
import { toPng } from 'html-to-image';

export default function HighContrastProfilePage() {
  const [isEditing, setIsEditing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef(null);

  const [data, setData] = useState({
    date: { y: "2026", m: "05", d: "05" },
    basic: { name: "", sexuality: "", mbti: "", birthday: "", anniversary: "", charms: "", title: "", future: "" },
    fillIn: { morningNight: "", sleep: "", smartphone: "", exercise: "", likes: "", dislikes: "", mine: "", depression: "", moodUp: "", benefit: "", oneWord: "", motto: "" },
    interests: { fashion: 50, sports: 50, love: 50, work: 50, hobby: 50, food: 50 },
    history: "",
    hexagon: [
      { label: "爪の長さ", val: 0 },
      { label: "喧嘩時のLINEの長さ", val: 0 },
      { label: "筋トレ継続力", val: 0 },
      { label: "しょうもない怪我の回数", val: 0 },
      { label: "彼氏大好き度", val: 0 }
    ],
    eval: { 
      self: ["", "", ""], 
      others: ["", "", ""] 
    },
    episodes: { pride: "", happy: "", angry: "", gaveUp: "", secret: "" },
    choice: { emotion: "", rest: "", logic: "", plan: "", action: "", risk: "" },
    freeSpace: ""
  });

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

  return (
    <div className="min-h-screen bg-[#E5E2DA] p-2 md:p-4 text-[#222222] font-sans antialiased overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6 px-2 gap-4">
          <Link href="/menu" className="flex items-center gap-2 text-[10px] md:text-[11px] font-black tracking-widest uppercase text-[#4A4A4A]">
            <ArrowLeft size={14} strokeWidth={3} /> <span className="hidden sm:inline">Return to Menu</span>
          </Link>
          
          <div className="flex gap-2">
            {!isEditing && (
              <button onClick={handleDownloadFull} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white border-2 border-[#222222] text-[#222222] px-4 py-2.5 rounded-full shadow-lg disabled:opacity-50">
                <Download size={14} /> {isGenerating ? '...' : 'SAVE'}
              </button>
            )}
            <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-[#222222] text-[#FFFFFF] px-6 py-2.5 rounded-full shadow-xl">
              {isEditing ? <><Eye size={14} /> View</> : <><Edit3 size={14} /> Edit</>}
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
                <Input label="Sex / 属性" value={data.basic.sexuality} placeholder="性自認等" onChange={v => handleChange('basic.sexuality', v)} isEditing={isEditing} />
                <Input label="MBTI" value={data.basic.mbti} placeholder="性格タイプ" onChange={v => handleChange('basic.mbti', v)} isEditing={isEditing} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Birthday" value={data.basic.birthday} placeholder="MM.DD" onChange={v => handleChange('basic.birthday', v)} isEditing={isEditing} />
                <Input label="Anniv." value={data.basic.anniversary} placeholder="記念日" onChange={v => handleChange('basic.anniversary', v)} isEditing={isEditing} />
              </div>
              <Input label="Charm Points / 推しポイント" value={data.basic.charms} placeholder="自分の好きなところ" onChange={v => handleChange('basic.charms', v)} isEditing={isEditing} />
              <Input label="Future Design / 将来設計" value={data.basic.future} isArea={true} placeholder="将来の設計図..." onChange={v => handleChange('basic.future', v)} isEditing={isEditing} />
            </Section>

            {/* 02: Personal Bits */}
            <Section title="02" en="PERSONAL BITS" jp="穴埋め紹介">
              <div className="space-y-4 bg-[#F9F9F9] p-5 md:p-8 rounded-3xl border border-[#22222208]">
                <div className="grid grid-cols-2 gap-4">
                  <MiniInput label="朝型 or 夜型" value={data.fillIn.morningNight} onChange={v => handleChange('fillIn.morningNight', v)} isEditing={isEditing} />
                  <MiniInput label="睡眠時間" value={data.fillIn.sleep} onChange={v => handleChange('fillIn.sleep', v)} isEditing={isEditing} />
                </div>
                <MiniInput label="すきなこと" value={data.fillIn.likes} onChange={v => handleChange('fillIn.likes', v)} isEditing={isEditing} />
                <MiniInput label="きらいなこと" value={data.fillIn.dislikes} onChange={v => handleChange('fillIn.dislikes', v)} isEditing={isEditing} />
                <MiniInput label="地雷（NG）" value={data.fillIn.mine} onChange={v => handleChange('fillIn.mine', v)} isEditing={isEditing} />
                <MiniInput label="機嫌を取るには" value={data.fillIn.moodUp} onChange={v => handleChange('fillIn.moodUp', v)} isEditing={isEditing} />
                <MiniInput label="自分を一言で" value={data.fillIn.oneWord} onChange={v => handleChange('fillIn.oneWord', v)} isEditing={isEditing} />
              </div>
            </Section>

            {/* 03: Interests */}
            <Section title="03" en="INTERESTS" jp="興味度（-20% 〜 120%）">
              <div className="space-y-8 pt-2">
                {[
                  { k: 'fashion', l: 'ファッション' },
                  { k: 'sports', l: 'スポーツ・運動' },
                  { k: 'love', l: '恋愛・パートナー' },
                  { k: 'work', l: '仕事・キャリア' },
                  { k: 'hobby', l: '趣味・遊び' },
                  { k: 'food', l: '食・グルメ' }
                ].map(({ k, l }) => (
                  <div key={k} className="relative">
                    <div className="flex justify-between items-center mb-2">
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
                      className="w-full h-1.5 bg-[#22222214] appearance-none cursor-pointer accent-[#222222] rounded-full" 
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* 04: Hexagon Chart */}
            <Section title="04" en="HEXAGON" jp="自分分析">
              <div className="flex flex-col items-center overflow-hidden">
                <RadarChart data={data.hexagon} />
                {isEditing && (
                  <div className="grid grid-cols-1 gap-4 w-full bg-[#F5F5F5] p-5 rounded-2xl mt-8">
                    {data.hexagon.map((item, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-black">
                          <span>{item.label}</span>
                          <span>{item.val}/6</span>
                        </div>
                        <input type="range" min="0" max="6" step="1" value={item.val} onChange={e => handleHexChange(i, 'val', parseInt(e.target.value))} className="w-full h-1 accent-[#222222]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* 05: Evaluation */}
            <Section title="05" en="STORYLINE" jp="遍歴と評価">
              <Input label="過去に沼ったコンテンツ" value={data.history} isArea={true} onChange={v => handleChange('history', v)} isEditing={isEditing} />
              <div className="grid grid-cols-1 gap-6 mt-8">
                <RankingSection title="自己評価（しっくり度）" icon={<Heart size={14} className="text-[#EF4444]" />} type="self" items={data.eval.self} onUpdate={handleRankChange} isEditing={isEditing} />
                <RankingSection title="他己評価（言われる度）" icon={<Target size={14} className="text-[#3B82F6]" />} type="others" items={data.eval.others} onUpdate={handleRankChange} isEditing={isEditing} />
              </div>
            </Section>

            {/* 06: Values */}
            <Section title="06" en="VALUES" jp="二者択一">
              <div className="grid grid-cols-1 gap-6 pt-2">
                <Choice label="感情表現" left="大きめ" right="控えめ" active={data.choice.emotion} onSelect={v => handleChange('choice.emotion', v)} isEditing={isEditing} />
                <Choice label="疲れたとき" left="遊ぶ" right="休む" active={data.choice.rest} onSelect={v => handleChange('choice.rest', v)} isEditing={isEditing} />
                <Choice label="思考回路" left="論理的" right="人情的" active={data.choice.logic} onSelect={v => handleChange('choice.logic', v)} isEditing={isEditing} />
                <Choice label="トラブル時" left="考える" right="まず動く" active={data.choice.action} onSelect={v => handleChange('choice.action', v)} isEditing={isEditing} />
              </div>
            </Section>

            {/* 07: Free Space */}
            <div className="md:col-span-2">
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
            <span className="text-[9px] font-mono font-bold">© 2026 ARCHIVE</span>
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
    <div className="relative w-full">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl md:text-6xl font-black text-[#2222221A] leading-none tracking-tighter">{title}</span>
        <div className="flex flex-col">
          <span className="text-[9px] font-black tracking-[0.2em] text-[#888888] uppercase">{en}</span>
          <h2 className="text-[16px] md:text-[20px] font-black text-[#222222] tracking-tighter">{jp}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function RadarChart({ data }) {
  const size = 300;
  const center = size / 2;
  const radius = 85;
  const points = data.map((item, i) => {
    const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
    const x = center + radius * (item.val / 6) * Math.cos(angle);
    const y = center + radius * (item.val / 6) * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto overflow-visible">
      {[1, 2, 3, 4, 5, 6].map(step => (
        <polygon key={step} points={data.map((_, i) => {
          const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
          return `${center + radius * (step/6) * Math.cos(angle)},${center + radius * (step/6) * Math.sin(angle)}`;
        }).join(" ")} fill="none" stroke="#222222" strokeWidth={1} strokeOpacity={0.1} />
      ))}
      <polygon points={points} fill="#222222" fillOpacity={0.15} stroke="#222222" strokeWidth={3} strokeLinejoin="round" />
      {data.map((item, i) => {
        const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
        const x = center + (radius + 28) * Math.cos(angle);
        const y = center + (radius + 28) * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" className="text-[10px] font-black fill-[#222222]" dominantBaseline="middle">
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}

function RankingSection({ title, icon, type, items, onUpdate, isEditing }) {
  const ranks = [{ label: "1st", color: "#FFD700" }, { label: "2nd", color: "#C0C0C0" }, { label: "3rd", color: "#CD7F32" }];
  return (
    <div className="w-full">
      <p className="text-[10px] font-black mb-3 uppercase flex items-center gap-2">{icon} {title}</p>
      <div className="space-y-2">
        {items.map((val, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#F5F5F5] p-3 rounded-xl">
            <Trophy size={14} style={{ color: ranks[i].color }} />
            {isEditing ? (
              <input className="flex-1 bg-transparent border-b border-[#2222221A] text-[13px] font-bold outline-none" value={val} onChange={e => onUpdate(type, i, e.target.value)} />
            ) : (
              <span className="text-[13px] font-bold">{val || "---"}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, isEditing, isArea = false, placeholder }) {
  return (
    <div className="mb-6 w-full">
      <p className="text-[10px] font-black mb-2 uppercase text-[#888888]">{label}</p>
      {isEditing ? (
        isArea ? (
          <textarea className="w-full bg-[#FBFBFB] border-b-2 border-[#2222221A] py-2 px-3 text-[14px] font-bold min-h-[80px] rounded-t-lg outline-none focus:border-[#222222] resize-none" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        ) : (
          <input className="w-full bg-[#FBFBFB] border-b-2 border-[#2222221A] py-2 px-3 text-[14px] font-bold rounded-t-lg outline-none focus:border-[#222222]" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        )
      ) : (
        <p className="text-[14px] font-bold py-2 border-b-2 border-transparent min-h-[30px] whitespace-pre-wrap">{value || "---"}</p>
      )}
    </div>
  );
}

function MiniInput({ label, value, onChange, isEditing }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-[#888888] uppercase">{label}</span>
      {isEditing ? (
        <input className="bg-[#FFFFFF] border-b border-[#2222221A] text-[12px] font-black py-1 px-1 outline-none focus:border-[#222222]" value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <span className="text-[12px] font-black min-h-[20px]">{value || "---"}</span>
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