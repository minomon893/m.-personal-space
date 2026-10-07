"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Rocket, PlusCircle, Sparkles, BookOpen, 
  Settings, Target, PlayCircle, TrendingUp, FlaskConical,
  ChevronDown, ChevronUp, Trash2, ListFilter
} from "lucide-react";

export default function MetacognitionPortal() {
  const [formData, setFormData] = useState({ material: "", scene: "", action: "", result: "", note: "" });
  const [logs, setLogs] = useState([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // 初回読み込み（ローカルストレージからデータ取得）
  useEffect(() => {
    const savedReports = JSON.parse(localStorage.getItem("my_metacog_reports") || "[]");
    setLogs(savedReports);
  }, []);

  // レポート作成・保存
  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!formData.material || !formData.scene || !formData.action || !formData.result) return;

    const newEntry = { 
      id: Date.now().toString(),
      material: formData.material, 
      scene: formData.scene, 
      action: formData.action, 
      result: formData.result, 
      note: formData.note,
      created_at: new Date().toISOString()
    };

    const updatedReports = [newEntry, ...logs];
    
    // 即座にステートとストレージを更新
    setLogs(updatedReports);
    localStorage.setItem("my_metacog_reports", JSON.stringify(updatedReports));
    
    // フォームのクリア
    setFormData({ material: "", scene: "", action: "", result: "", note: "" });
  };

  // ログ削除
  const handleDeleteLog = (id, e) => {
    e.stopPropagation();
    if (!confirm("この報告を削除しますか？")) return;
    const updated = logs.filter(log => log.id !== id);
    setLogs(updated);
    localStorage.setItem("my_metacog_reports", JSON.stringify(updated));
  };

  // 表示するログを制御（初期は最大3件）
  const visibleLogs = showAllLogs ? logs : logs.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#334E68] font-sans p-6 pb-20">
      <div className="max-w-md mx-auto">

        {/* ナビゲーション */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/menu" className="text-[11px] font-bold opacity-50 flex items-center gap-2 uppercase tracking-widest hover:opacity-100 transition-all">
            <ArrowLeft size={12}/> Back
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="flex flex-col items-center gap-2 mb-10 text-center">
          <Rocket size={24} className="text-[#627D98]" />
          <h1 className="text-lg font-bold tracking-[0.2em] uppercase italic text-[#243B53]">Metacognition Lab</h1>
          <p className="text-[9px] font-bold opacity-40 tracking-[0.3em]">メタ認知トリガー開発部（個人ノート）</p>
        </div>

        {/* 活動内容解説 */}
        <section className="mb-10">
          <div className="bg-white border-2 border-[#D9E2EC] rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={60} className="text-[#486581]" />
            </div>
            
            <h3 className="text-[13px] font-extrabold mb-4 flex items-center gap-2 text-[#243B53]">
              <BookOpen size={16} className="text-[#486581]" /> ラボの活動内容
            </h3>
            
            <div className="space-y-4 text-[12px] text-[#486581] leading-relaxed">
              <p>
                <strong>「メタ認知」</strong>とは、思考や感情にのまれそうな自分を「もう一人の自分」が空から客観的に眺めるスキルのことである。
              </p>
              <p>
                当ラボではメタ認知に必要不可欠な、不安や怒りと適切な距離を置く心理技術<strong>「脱フュージョン」</strong>をトレーニングする。
              </p>
              
              <div className="bg-[#F0F4F8] rounded-2xl p-4 border border-[#BCCCDC]/50">
                <p className="font-bold text-[11px] mb-2 text-[#243B53]">具体的なトレーニング例：</p>
                <ul className="space-y-3 text-[11px] border-t border-[#BCCCDC]/50 pt-3">
                  <li className="flex flex-col gap-1">
                    <span className="font-bold text-[#243B53]">【例1：不安がいっぱいになった時】</span>
                    <span>「脳内のラジオ」のつまみを回すイメージを持ち、不安な声を小さく絞る。</span>
                  </li>
                  <li className="flex flex-col gap-1">
                    <span className="font-bold text-[#243B53]">【例2：イライラが止まらない時】</span>
                    <span>空に浮かぶ雲にその気持ちを乗せて、流れていくのをただ眺める。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* フォーム */}
        <section className="mb-10">
          <div className="flex justify-between items-end mb-3 px-2">
            <h2 className="text-[10px] font-bold opacity-50 uppercase flex items-center gap-2"><PlusCircle size={10}/> New Report</h2>
          </div>
          
          <div className="bg-white border border-[#BCCCDC] rounded-2xl p-6 shadow-md">
            <form onSubmit={handleReportSubmit} className="space-y-5">
              <FormField label="Material" value={formData.material} onChange={(v)=>setFormData({...formData, material:v})} icon={<Settings size={14}/>} placeholder="素材（例：ラジオ、雲、つまみ）" />
              <FormField label="Scene" value={formData.scene} onChange={(v)=>setFormData({...formData, scene:v})} icon={<Target size={14}/>} placeholder="どんな状況・感情で？（例：不安、焦り）" />
              <FormField label="Action" value={formData.action} onChange={(v)=>setFormData({...formData, action:v})} icon={<PlayCircle size={14}/>} placeholder="どう操作する？（例：音量を下げる、見送る）" isTextarea />
              <FormField label="Result" value={formData.result} onChange={(v)=>setFormData({...formData, result:v})} icon={<TrendingUp size={14}/>} placeholder="気持ちはどう変わった？" />
              <FormField label="Bug Reporting (Optional)" value={formData.note} onChange={(v)=>setFormData({...formData, note:v})} icon={<FlaskConical size={14}/>} placeholder="バグ報告（任意）" />
              <button 
                type="submit" 
                className="w-full py-4 bg-[#486581] text-white rounded-xl font-bold text-sm hover:bg-[#334E68] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
              >
                <Rocket size={16}/> 開発報告を保存する
              </button>
            </form>
          </div>
        </section>

        {/* 報告ログ一覧（先頭に即時反映・初期3件表示） */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-4 px-2 border-b border-[#BCCCDC] pb-2">
            <h2 className="text-[11px] font-bold flex items-center gap-2 text-[#486581] uppercase tracking-wider">
              <ListFilter size={14}/> Report Logs ({logs.length})
            </h2>
          </div>

          <div className="space-y-4">
            {logs.length > 0 ? (
              <>
                {visibleLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="bg-white border border-[#BCCCDC] rounded-2xl p-5 shadow-sm relative transition-all duration-200 cursor-pointer hover:border-[#9FB3C8] select-none animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      <div className="absolute top-5 right-5 flex gap-2 z-10">
                        <button 
                          onClick={(e) => handleDeleteLog(log.id, e)} 
                          className="text-red-400 opacity-30 hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex justify-end pr-8 mb-1">
                        <div className="opacity-40 text-[#627D98]">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <LogLine icon={<Settings size={10}/>} label="Material" content={log.material} />
                        <LogLine icon={<Target size={10}/>} label="Scene" content={log.scene} />
                        
                        {/* アコーディオン表示 */}
                        {isExpanded && (
                          <div className="space-y-3 pt-3 border-t border-[#F0F4F8] animate-in fade-in duration-200">
                            <LogLine icon={<PlayCircle size={10}/>} label="Action" content={log.action} />
                            <LogLine icon={<TrendingUp size={10}/>} label="Result" content={log.result} />
                            {log.note && <LogLine icon={<FlaskConical size={10}/>} label="Bug Reporting" content={log.note} />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 3件より多い場合に展開ボタンを表示 */}
                {logs.length > 3 && (
                  <button 
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="w-full py-3 mt-2 bg-white border border-[#BCCCDC] text-[#486581] rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-[#F0F4F8] transition-all shadow-sm"
                  >
                    {showAllLogs ? (
                      <>折りたたむ <ChevronUp size={14}/></>
                    ) : (
                      <>すべての報告を表示（全 {logs.length} 件） <ChevronDown size={14}/></>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-white/50 border border-dashed border-[#BCCCDC] rounded-2xl">
                <p className="text-[11px] opacity-40 text-[#486581]">まだ報告はありません。</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

function FormField({ icon, label, placeholder, value, onChange, isTextarea = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[#627D98] flex items-center gap-2 ml-1 uppercase">{icon} {label}</label>
      {isTextarea ? (
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          rows={2} 
          placeholder={placeholder} 
          className="w-full bg-[#F0F4F8]/50 border border-[#D9E2EC] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#627D98]" 
        />
      ) : (
        <input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          type="text" 
          placeholder={placeholder} 
          className="w-full bg-[#F0F4F8]/50 border border-[#D9E2EC] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[#627D98]" 
        />
      )}
    </div>
  );
}

function LogLine({ icon, label, content }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 items-baseline">
      <span className="text-[8px] font-bold text-[#627D98] opacity-50 uppercase tracking-tighter flex items-center gap-1">{icon} {label}</span>
      <p className="text-[12px] text-[#334E68] leading-tight font-medium break-all">{content || "---"}</p>
    </div>
  );
}