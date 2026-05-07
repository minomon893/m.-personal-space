"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft, Download, Upload } from "lucide-react";

export default function DiaryPage() {
  const [logs, setLogs] = useState([]);
  const [percentage, setPercentage] = useState(50);
  const [text, setText] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  // グラフ制御
  const [graphPeriod, setGraphPeriod] = useState(null); 
  const [viewDate, setViewDate] = useState(new Date());

  // スクロール用リファレンス
  const logRefs = useRef({});

  // 初期読み込み
  useEffect(() => {
    const saved = localStorage.getItem("mood_logs");
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
  }, []);

  // バックアップ：書き出し
  const exportData = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `diary_backup_${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // バックアップ：読み込み
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          const confirmed = confirm("データを上書きします。よろしいですか？");
          if (confirmed) {
            setLogs(json);
            localStorage.setItem("mood_logs", JSON.stringify(json));
            alert("バックアップを復元しました");
          }
        } else {
          alert("正しい形式のファイルではありません");
        }
      } catch (err) {
        alert("読み込みに失敗しました");
      }
    };
    reader.readAsText(file);
  };

  // 全期間平均
  const getAverage = (days) => {
    if (!logs.length) return 0;
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const recent = logs.filter(log => (now - log.id) < (days * msInDay));
    
    if (recent.length === 0) return 0;
    return Math.round(recent.reduce((a, b) => a + (b.score || 0), 0) / recent.length);
  };

  /**
   * グラフデータの計算 (リアルタイム反映ロジック)
   */
  const graphData = useMemo(() => {
    if (!graphPeriod) return [];

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    if (graphPeriod === "month") {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const targetKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayLogs = logs.filter(l => {
          const d = new Date(l.id);
          const logKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return logKey === targetKey;
        });

        const avg = dayLogs.length 
          ? dayLogs.reduce((sum, log) => sum + log.score, 0) / dayLogs.length 
          : 0;

        return { label: `${day}`, score: avg, hasData: dayLogs.length > 0, dateKey: targetKey };
      });
    }

    if (graphPeriod === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      return months.map((m, i) => {
        const monthLogs = logs.filter(l => {
          const d = new Date(l.id);
          return d.getFullYear() === year && d.getMonth() === i;
        });

        const avg = monthLogs.length 
          ? monthLogs.reduce((sum, log) => sum + log.score, 0) / monthLogs.length 
          : 0;

        return { 
          label: m, 
          score: avg, 
          hasData: monthLogs.length > 0, 
          firstLogIdInMonth: monthLogs.length > 0 ? monthLogs[monthLogs.length - 1].id : null 
        };
      });
    }
    return [];
  }, [logs, graphPeriod, viewDate]);

  // 期間移動
  const movePeriod = (step) => {
    const next = new Date(viewDate);
    if (graphPeriod === "month") next.setMonth(next.getMonth() + step);
    if (graphPeriod === "year") next.setFullYear(next.getFullYear() + step);
    setViewDate(next);
  };

  // 保存
  const handleSave = () => {
    const now = new Date();
    const newLog = {
      id: Date.now(),
      date: now.toLocaleDateString("ja-JP"), 
      time: now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      score: percentage,
      comment: text.trim(),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem("mood_logs", JSON.stringify(updated));
    
    setText("");
    setPercentage(50);
    setViewDate(new Date());
  };

  // グラフクリック時に日記へスクロール
  const handleBarClick = (data) => {
    if (!data.hasData) return;
    setShowLogs(true);
    
    setTimeout(() => {
      let targetElement = null;

      if (graphPeriod === "month") {
        const [y, m, d] = data.dateKey.split("-");
        const formattedDate = `${parseInt(y)}/${parseInt(m)}/${parseInt(d)}`;
        targetElement = logRefs.current[formattedDate];
      } else if (graphPeriod === "year") {
        targetElement = document.getElementById(`log-${data.firstLogIdInMonth}`);
      }

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        const originalBg = targetElement.style.backgroundColor;
        targetElement.style.backgroundColor = "rgba(181, 167, 115, 0.2)";
        setTimeout(() => { targetElement.style.backgroundColor = originalBg; }, 1500);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#E7ECF1] p-8 text-[#4F5F6A] font-sans">
      <div className="max-w-md mx-auto">
        <Link className="text-[10px] tracking-[0.2em] opacity-60 flex items-center gap-2 mb-6 hover:opacity-100 transition-opacity" href="/">
          <ArrowLeft size={12}/> BACK TO MENU
        </Link>

        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#4F5F6A] uppercase">
            Condition <span className="font-light opacity-60 italic">Diary</span>
          </h1>
          <div className="h-[1px] w-12 bg-[#4F5F6A] opacity-20 mt-2" />
        </header>

        {/* STATS BUTTONS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => { setGraphPeriod(graphPeriod === "month" ? null : "month"); setViewDate(new Date()); }}
            className={`p-5 rounded-3xl border transition-all ${graphPeriod === "month" ? "bg-[#B5A773] border-[#B5A773] text-white shadow-md scale-[1.02]" : "bg-white/60 border-white/40"}`}
          >
            <p className={`text-[9px] uppercase tracking-widest mb-1 font-bold ${graphPeriod === "month" ? "text-white/70" : "opacity-50"}`}>Monthly</p>
            <span className="text-2xl font-light">{getAverage(30)}%</span>
          </button>

          <button
            onClick={() => { setGraphPeriod(graphPeriod === "year" ? null : "year"); setViewDate(new Date()); }}
            className={`p-5 rounded-3xl border transition-all ${graphPeriod === "year" ? "bg-[#B5A773] border-[#B5A773] text-white shadow-md scale-[1.02]" : "bg-white/60 border-white/40"}`}
          >
            <p className={`text-[9px] uppercase tracking-widest mb-1 font-bold ${graphPeriod === "year" ? "text-white/70" : "opacity-50"}`}>Yearly</p>
            <span className="text-2xl font-light">{getAverage(365)}%</span>
          </button>
        </div>

        {/* CHART AREA */}
        {graphPeriod && (
          <div className="mb-8 p-6 bg-white/50 rounded-[2.5rem] border border-white shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => movePeriod(-1)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><ChevronLeft size={18} /></button>
              <div className="text-center">
                <p className="text-[11px] font-bold tracking-[0.1em] text-[#4F5F6A]">
                  {graphPeriod === "month" ? `${viewDate.getFullYear()} / ${viewDate.getMonth() + 1}` : `${viewDate.getFullYear()}`}
                </p>
              </div>
              <button onClick={() => movePeriod(1)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><ChevronRight size={18} /></button>
            </div>

            <div className="flex items-end justify-between h-32 gap-[2px] px-1">
              {graphData.map((data, i) => (
                <div 
                  key={i} 
                  className={`flex-1 flex flex-col items-center h-full group ${data.hasData ? "cursor-pointer" : ""}`}
                  onClick={() => handleBarClick(data)}
                >
                  <div className="relative w-full h-full flex items-end">
                    <div 
                      style={{ height: data.hasData ? `${data.score}%` : '4%' }}
                      className={`w-full rounded-full transition-all duration-700 ease-out ${
                        data.hasData 
                          ? 'bg-[#B5A773]' 
                          : 'bg-black/5'
                      } ${data.hasData ? "group-hover:opacity-80" : ""}`}
                    />
                    {data.hasData && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[8px] bg-[#4F5F6A] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold">
                        {Math.round(data.score)}%
                      </div>
                    )}
                  </div>
                  <span className={`text-[6px] mt-2 font-mono ${data.hasData ? 'opacity-100 font-bold text-[#4F5F6A]' : 'opacity-20'}`}>
                    {data.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INPUT FORM */}
        <div className="bg-white/70 p-8 rounded-[3rem] border border-white shadow-sm mb-6">
          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">Entry Condition</span>
            <span className="text-4xl font-light text-[#4F5F6A] tracking-tighter">{percentage}<span className="text-sm ml-1">%</span></span>
          </div>
          
          <input
            type="range"
            value={percentage}
            onChange={(e) => setPercentage(+e.target.value)}
            className="w-full h-1.5 bg-[#D1D9E0] rounded-lg appearance-none cursor-pointer accent-[#6D7A86] mb-8"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling? / 今日のメモ"
            className="w-full h-24 p-5 bg-white/50 rounded-2xl border border-white focus:outline-none text-sm shadow-inner resize-none"
          />
          
          <button
            onClick={handleSave}
            className="w-full mt-6 py-4 rounded-2xl bg-[#6D7A86] text-white text-[11px] font-bold tracking-[0.3em] shadow-xl shadow-[#6D7A86]/20 active:scale-[0.96] transition-all"
          >
            SAVE REPORT
          </button>
        </div>

        {/* HISTORY */}
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full py-4 text-[10px] uppercase tracking-[0.4em] text-[#B5A773] font-bold flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
        >
          <RotateCcw size={12} /> {showLogs ? "Close History" : "View History"}
        </button>

        {showLogs && (
          <div className="mt-4 space-y-3 pb-2 animate-in slide-in-from-bottom-4 duration-500">
            {logs.map((log) => (
              <div 
                key={log.id} 
                id={`log-${log.id}`}
                ref={(el) => (logRefs.current[log.date] = el)}
                className="p-6 rounded-[2rem] bg-white/40 border border-white flex justify-between items-center shadow-sm transition-all duration-300"
              >
                <div className="flex-1 px-2">
                  <p className="text-[11px] font-bold">{log.date} <span className="ml-2 opacity-30 font-normal">{log.time}</span></p>
                  {log.comment && <p className="text-xs italic opacity-60 mt-1 leading-relaxed">{log.comment}</p>}
                </div>
                <div className="ml-4 px-4 py-2 bg-white rounded-2xl shadow-sm border border-black/5">
                  <p className="text-lg font-light text-[#B5A773]">{log.score}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BACKUP CONTROLS */}
        <div className="mt-12 mb-20 flex justify-center gap-8 border-t border-[#4F5F6A]/10 pt-8">
          <button 
            onClick={exportData}
            className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-[#4F5F6A] opacity-40 hover:opacity-100 transition-opacity"
          >
            <Download size={14} /> EXPORT
          </button>
          
          <label className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-[#4F5F6A] opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
            <Upload size={14} /> IMPORT
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}