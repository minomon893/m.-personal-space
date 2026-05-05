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
    date: { y: "2026", m: "05", d: "04" },
    basic: { name: "", sexuality: "", mbti: "", birthday: "", anniversary: "", annivDetail: "", charms: "", title: "", future: "" },
    fillIn: { morningNight: "", sleep: "", smartphone: "", exercise: "", likes: "", dislikes: "", mine: "", depression: "", moodUp: "", benefit: "", oneWord: "", motto: "" },
    interests: { fashion: 50, sports: 50, love: 50, work: 50, hobby: 50, food: 50, custom: 50, customLabel: "" },
    history: "",
    ifTravel: "",
    ifShopping: "",
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
        pixelRatio: 3,
        backgroundColor: '#FFFFFF',
        style: {
          padding: '80px',
          margin: '0',
          borderRadius: '2.5rem',
          boxSizing: 'border-box'
        }
      });
      const link = document.createElement('a');
      link.download = `full_profile_${data.date.y}${data.date.m}${data.date.d}.png`;
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
    <div className="min-h-screen bg-[#E5E2DA] p-4 text-[#222222] font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-2">
          <Link href="/menu" className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-[#4A4A4A] hover:text-[#000000] transition-all">
            <ArrowLeft size={14} strokeWidth={3} /> Return to Menu
          </Link>
          
          <div className="flex gap-3">
            {!isEditing && (
              <button onClick={handleDownloadFull} disabled={isGenerating} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-white border-2 border-[#222222] text-[#222222] px-6 py-3 rounded-full shadow-xl hover:bg-[#222222] hover:text-white transition-all disabled:opacity-50">
                <Download size={16} /> {isGenerating ? 'SAVING...' : 'SAVE PNG'}
              </button>
            )}
            <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-[#222222] text-[#FFFFFF] px-10 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">
              {isEditing ? <><Eye size={16} /> View Mode</> : <><Edit3 size={16} /> Edit Mode</>}
            </button>
          </div>
        </div>

        <div id="profile-container" ref={printRef} className="bg-[#FFFFFF] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-8 md:p-16 relative border-t-8 border-[#222222] overflow-visible box-border">
          <header className="mb-24 text-center">
            <div className="inline-block border-b-4 border-[#222222] pb-6 mb-6">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-4">
                <Sparkles size={32} className="text-[#FFD700]" />
                MY PROFILE <span className="text-[#2222221A]">/</span> 自己分析
              </h1>
            </div>
            <p className="text-[12px] font-mono font-bold text-[#888888] uppercase tracking-[0.4em]">Last Updated: {data.date.y}.{data.date.m}.{data.date.d}</p>
          </header>

          <div className="grid md:grid-cols-2 gap-x-24 gap-y-24">
            <Section title="01" en="IDENTIFICATION" jp="基本情報">
              <Input label="Name / 名前" value={data.basic.name} placeholder="名前を入力" onChange={v => handleChange('basic.name', v)} isEditing={isEditing} />
              <div className="grid grid-cols-2 gap-8">
                <Input label="Sexuality / セクシュアリティ" value={data.basic.sexuality} placeholder="性自認等" onChange={v => handleChange('basic.sexuality', v)} isEditing={isEditing} />
                <Input label="MBTI / 性格診断" value={data.basic.mbti} placeholder="ENFPなど" onChange={v => handleChange('basic.mbti', v)} isEditing={isEditing} />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <Input label="Birthday / 誕生日" value={data.basic.birthday} placeholder="MM.DD" onChange={v => handleChange('basic.birthday', v)} isEditing={isEditing} />
                <div className="flex flex-col">
                  <Input label="Anniversary / 記念日" value={data.basic.anniversary} placeholder="MM.DD" onChange={v => handleChange('basic.anniversary', v)} isEditing={isEditing} />
                  <div className="flex items-center gap-2 -mt-4 bg-[#F8F8F8] px-2 py-1 rounded">
                    <span className="text-[10px] font-black text-[#22222266] uppercase">Note:</span>
                    <input className="text-[10px] font-bold bg-transparent border-b-2 border-[#2222221A] focus:outline-none focus:border-[#222222] flex-1" placeholder="メモを入力..." value={data.basic.annivDetail} onChange={e => handleChange('basic.annivDetail', e.target.value)} disabled={!isEditing} />
                  </div>
                </div>
              </div>
              <Input label="Charm Points / 推しポイント" value={data.basic.charms} placeholder="自分の好きなところ" onChange={v => handleChange('basic.charms', v)} isEditing={isEditing} />
              <Input label="Current Title / 今の肩書き" value={data.basic.title} placeholder="肩書き" onChange={v => handleChange('basic.title', v)} isEditing={isEditing} />
              <Input label="Future Design / 将来設計" value={data.basic.future} isArea={true} placeholder="将来の設計図..." onChange={v => handleChange('basic.future', v)} isEditing={isEditing} />
            </Section>

            <Section title="02" en="PERSONAL BITS" jp="穴埋め紹介">
              <div className="space-y-5 bg-[#F9F9F9] p-8 rounded-3xl border border-[#22222208]">
                <div className="grid grid-cols-2 gap-6">
                  <MiniInput label="朝型 or 夜型" placeholder="回答" value={data.fillIn.morningNight} onChange={v => handleChange('fillIn.morningNight', v)} isEditing={isEditing} />
                  <MiniInput label="睡眠時間" placeholder="回答" value={data.fillIn.sleep} onChange={v => handleChange('fillIn.sleep', v)} isEditing={isEditing} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <MiniInput label="スマホ時間" placeholder="回答" value={data.fillIn.smartphone} onChange={v => handleChange('fillIn.smartphone', v)} isEditing={isEditing} />
                  <MiniInput label="運動時間" placeholder="回答" value={data.fillIn.exercise} onChange={v => handleChange('fillIn.exercise', v)} isEditing={isEditing} />
                </div>
                <MiniInput label="すきなこと" value={data.fillIn.likes} onChange={v => handleChange('fillIn.likes', v)} isEditing={isEditing} />
                <MiniInput label="きらいなこと" value={data.fillIn.dislikes} onChange={v => handleChange('fillIn.dislikes', v)} isEditing={isEditing} />
                <MiniInput label="地雷（NG）" value={data.fillIn.mine} onChange={v => handleChange('fillIn.mine', v)} isEditing={isEditing} />
                <MiniInput label="おちこむと..." value={data.fillIn.depression} onChange={v => handleChange('fillIn.depression', v)} isEditing={isEditing} />
                <MiniInput label="機嫌を取るには" value={data.fillIn.moodUp} onChange={v => handleChange('fillIn.moodUp', v)} isEditing={isEditing} />
                <MiniInput label="仲良し特典" value={data.fillIn.benefit} onChange={v => handleChange('fillIn.benefit', v)} isEditing={isEditing} />
                <MiniInput label="自分を一言で" value={data.fillIn.oneWord} onChange={v => handleChange('fillIn.oneWord', v)} isEditing={isEditing} />
                <MiniInput label="モットー" value={data.fillIn.motto} onChange={v => handleChange('fillIn.motto', v)} isEditing={isEditing} />
              </div>
            </Section>

            <Section title="03" en="INTERESTS" jp="興味度パーセンテージ">
              <div className="space-y-10 pt-4 px-2">
                {[
                  { k: 'fashion', l: 'ファッション' },
                  { k: 'sports', l: 'スポーツ' },
                  { k: 'love', l: '恋愛' },
                  { k: 'work', l: '仕事' },
                  { k: 'hobby', l: '趣味' },
                  { k: 'food', l: '食' },
                  { k: 'custom', l: '' }
                ].map(({ k, l }) => (
                  <div key={k} className="relative">
                    <div className="flex justify-between items-center mb-4">
                      {k === 'custom' ? (
                        <input className="text-[11px] font-black bg-transparent border-b-2 border-[#2222221A] w-32" placeholder="項目名" value={data.interests.customLabel} onChange={e => handleChange('interests.customLabel', e.target.value)} disabled={!isEditing} />
                      ) : (
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#222222]">{k} <span className="text-[#888888] ml-2">/ {l}</span></span>
                      )}
                      <span className="text-[12px] font-mono font-bold bg-[#222222] text-[#FFFFFF] px-2 py-0.5 rounded">{data.interests[k]}%</span>
                    </div>
                    <div className="relative h-2 flex items-center">
                      <div className="absolute w-full h-[4px] bg-[#22222214] rounded-full" />
                      <input type="range" min="0" max="100" value={data.interests[k]} onChange={(e) => handleChange(`interests.${k}`, e.target.value)} disabled={!isEditing} className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer accent-[#222222]" />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="04" en="HEXAGON GRID" jp="自分ヘキサゴン">
              <div className="flex flex-col items-center">
                <p className="text-[9px] font-bold text-[#888888] mb-8 bg-[#F0F0F0] px-3 py-1 rounded-full uppercase tracking-tighter"> 平均を３として、０から６で自分を評価！</p>
                <div className="mb-16 bg-[#FDFDFD] p-10 rounded-full border border-[#22222205]">
                  <RadarChart data={data.hexagon} />
                </div>
                {isEditing && (
                  <div className="grid grid-cols-1 gap-6 w-full bg-[#F5F5F5] p-8 rounded-3xl">
                    {data.hexagon.map((item, i) => (
                      <div key={i} className="flex flex-col">
                        <div className="flex justify-between items-center mb-2.5">
                          <input className="text-[11px] font-black bg-transparent border-b border-[#2222221A] w-32" value={item.label} onChange={e => handleHexChange(i, 'label', e.target.value)} />
                          <span className="text-[12px] font-mono font-black">{item.val} / 6</span>
                        </div>
                        <input type="range" min="0" max="6" step="1" value={item.val} onChange={e => handleHexChange(i, 'val', parseInt(e.target.value))} className="w-full h-1.5 accent-[#222222] appearance-none bg-[#2222221A] rounded-full" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <Section title="05" en="STORYLINE" jp="遍歴と評価">
              <Input label="過去に沼ったコンテンツ遍歴" value={data.history} isArea={true} placeholder="好きなもの遍歴" onChange={v => handleChange('history', v)} isEditing={isEditing} />
              <div className="grid grid-cols-2 gap-8">
                <Input label="もしも過去or未来に行くなら何をする？" value={data.ifTravel} placeholder="回答" onChange={v => handleChange('ifTravel', v)} isEditing={isEditing} />
                <Input label="今だけ好きなもの買えるなら？" value={data.ifShopping} placeholder="回答" onChange={v => handleChange('ifShopping', v)} isEditing={isEditing} />
              </div>
              <div className="mt-12 pt-12 border-t-4 border-[#222222] grid grid-cols-2 gap-10">
                <RankingSection title="自己評価（しっくり度）" icon={<Heart size={14} className="text-[#EF4444]" />} type="self" items={data.eval.self} onUpdate={handleRankChange} isEditing={isEditing} />
                <RankingSection title="他己評価（言われる度）" icon={<Target size={14} className="text-[#3B82F6]" />} type="others" items={data.eval.others} onUpdate={handleRankChange} isEditing={isEditing} />
              </div>
            </Section>

            <Section title="06" en="NARRATIVE" jp="エピソードトーク">
              <div className="space-y-8">
                <Input label="自慢したいこと" value={data.episodes.pride} onChange={v => handleChange('episodes.pride', v)} isEditing={isEditing} />
                <Input label="また味わいたい幸せ" value={data.episodes.happy} onChange={v => handleChange('episodes.happy', v)} isEditing={isEditing} />
                <Input label="許せないと思ったこと" value={data.episodes.angry} onChange={v => handleChange('episodes.angry', v)} isEditing={isEditing} />
                <div className="grid grid-cols-2 gap-8">
                  <Input label="諦めていること" value={data.episodes.gaveUp} onChange={v => handleChange('episodes.gaveUp', v)} isEditing={isEditing} />
                  <Input label="実は諦められないこと" value={data.episodes.secret} onChange={v => handleChange('episodes.secret', v)} isEditing={isEditing} />
                </div>
              </div>
            </Section>

            <Section title="07" en="VALUES" jp="二者択一">
              <div className="grid grid-cols-1 gap-10 pt-4">
                <Choice label="感情表現" left="大きめ" right="控えめ" active={data.choice.emotion} onSelect={v => handleChange('choice.emotion', v)} isEditing={isEditing} />
                <Choice label="疲れたとき" left="遊ぶ" right="休む" active={data.choice.rest} onSelect={v => handleChange('choice.rest', v)} isEditing={isEditing} />
                <Choice label="思考回路" left="論理的" right="人情的" active={data.choice.logic} onSelect={v => handleChange('choice.logic', v)} isEditing={isEditing} />
                <Choice label="明日の予定" left="決めてる" right="気分で！" active={data.choice.plan} onSelect={v => handleChange('choice.plan', v)} isEditing={isEditing} />
                <Choice label="トラブル時" left="考える" right="まず動く" active={data.choice.action} onSelect={v => handleChange('choice.action', v)} isEditing={isEditing} />
                <Choice label="スタンス" left="安定志向" right="冒険したい" active={data.choice.risk} onSelect={v => handleChange('choice.risk', v)} isEditing={isEditing} />
              </div>
            </Section>

            <Section title="08" en="FREE JOURNAL" jp="フリースペース">
              <div className="bg-[#222222] p-10 shadow-2xl min-h-[300px] rounded-[2rem]">
                {isEditing ? (
                  <textarea className="w-full bg-transparent text-[#FFFFFF] text-[15px] leading-relaxed focus:outline-none min-h-[240px] resize-none font-medium" placeholder="自由に書いてください..." value={data.freeSpace} onChange={e => handleChange('freeSpace', e.target.value)} />
                ) : (
                  <p className="text-[#FFFFFF] text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{data.freeSpace || "NO RECORDS FOUND."}</p>
                )}
              </div>
            </Section>
          </div>

          <footer className="mt-32 pt-12 border-t-2 border-[#2222220D] flex flex-col md:flex-row justify-between items-center gap-6 text-[#22222266]">
            <span className="text-[11px] font-black tracking-[0.6em] uppercase">PRIVATE MAPPING JOURNAL</span>
            <div className="flex gap-8 text-[11px] font-mono font-bold">
              <span>CORE-V3.0</span>
              <span>© 2026 ARCHIVE</span>
            </div>
          </footer>
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
}

function Section({ title, en, jp, children }) {
  return (
    <div id={`section-${title}`} className="relative bg-white p-4 rounded-3xl box-border overflow-visible">
      <div className="flex items-center gap-5 mb-12">
        <span className="text-6xl font-black text-[#2222221A] leading-none tracking-tighter">{title}</span>
        <div className="flex flex-col">
          <span className="text-[11px] font-black tracking-[0.3em] text-[#888888] uppercase leading-none mb-3">{en}</span>
          <h2 className="text-[20px] font-black text-[#222222] tracking-tighter">{jp}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function RadarChart({ data }) {
  const size = 260;
  const center = size / 2;
  const radius = 100;
  const points = data.map((item, i) => {
    const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
    const val = Math.max(0, item.val); 
    const x = center + radius * (val / 6) * Math.cos(angle);
    const y = center + radius * (val / 6) * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} className="overflow-visible">
      {[1, 2, 3, 4, 5, 6].map(step => (
        <polygon key={step} points={data.map((_, i) => {
          const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
          return `${center + radius * (step/6) * Math.cos(angle)},${center + radius * (step/6) * Math.sin(angle)}`;
        }).join(" ")} fill="none" stroke="#222222" strokeWidth={step === 6 ? 2 : 1} strokeOpacity={0.1} />
      ))}
      <polygon points={points} fill="#222222" fillOpacity={0.15} stroke="#222222" strokeWidth={4} strokeLinejoin="round" />
      {data.map((item, i) => {
        const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
        const x = center + (radius + 35) * Math.cos(angle);
        const y = center + (radius + 35) * Math.sin(angle);
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
      <p className="text-[10px] font-black mb-6 uppercase flex items-center gap-2">{icon} {title}</p>
      <div className="space-y-3">
        {items.map((val, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#F5F5F5] p-4 rounded-xl">
            <div className="min-w-[32px] flex flex-col items-center">
              <Trophy size={14} style={{ color: ranks[i].color }} />
              <span className="text-[8px] font-black text-[#22222266]">{ranks[i].label}</span>
            </div>
            {isEditing ? (
              <input className="flex-1 bg-transparent border-b border-[#2222221A] text-[12px] font-bold focus:outline-none" value={val} onChange={e => onUpdate(type, i, e.target.value)} />
            ) : (
              <span className="text-[12px] font-bold">{val || "---"}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, isEditing, isArea = false, placeholder }) {
  return (
    <div className="mb-10">
      <p className="text-[11px] font-black mb-3 uppercase tracking-wider">{label}</p>
      {isEditing ? (
        isArea ? (
          <textarea className="w-full bg-[#FBFBFB] border-b-4 border-[#2222221A] py-3 px-4 text-[14px] font-bold min-h-[100px] rounded-t-xl" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        ) : (
          <input className="w-full bg-[#FBFBFB] border-b-4 border-[#2222221A] py-3 px-4 text-[14px] font-bold rounded-t-xl" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        )
      ) : (
        <p className="text-[14px] font-bold py-3 border-b-4 border-transparent min-h-[30px]">{value || "---"}</p>
      )}
    </div>
  );
}

function MiniInput({ label, value, onChange, isEditing, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-black text-[#888888] uppercase">{label}</span>
      {isEditing ? (
        <input className="bg-[#FFFFFF] border-b-2 border-[#2222221A] text-[12px] font-black py-2 px-2 rounded-t" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <span className="text-[12px] font-black min-h-[24px]">{value || "---"}</span>
      )}
    </div>
  );
}

function Choice({ label, left, right, active, onSelect, isEditing }) {
  return (
    <div>
      <p className="text-[11px] font-black text-[#888888] mb-5 uppercase tracking-widest">{label}</p>
      <div className="flex gap-4">
        {[left, right].map(opt => (
          <button key={opt} onClick={() => onSelect(opt)} disabled={!isEditing} className={`flex-1 py-2.5 text-[12px] font-black rounded-2xl transition-all ${active === opt ? 'bg-[#222222] text-[#FFFFFF] shadow-xl' : 'bg-[#FFFFFF] border-2 border-[#2222220D] text-[#2222224D]'}`}>{opt}</button>
        ))}
      </div>
    </div>
  );
}