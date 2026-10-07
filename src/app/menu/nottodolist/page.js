"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, X, ChevronLeft, Download, Upload, Pencil, Trash2, Archive, FolderPlus, Folder } from 'lucide-react';
import Link from 'next/link';

// デフォルトの初期フォルダ一覧
const DEFAULT_FOLDERS = [
  { id: 'default-1', name: 'なんでも', color: '#e67e22', icon: '🌱', isArchived: false },
  { id: 'default-2', name: '人間関係', color: '#2980b9', icon: '👥', isArchived: false },
  { id: 'default-3', name: '仕事', color: '#27ae60', icon: '💼', isArchived: false },
  { id: 'default-4', name: '趣味', color: '#8e44ad', icon: '🎸', isArchived: false },
  { id: 'default-5', name: '学校', color: '#d35400', icon: '📚', isArchived: false },
];

export default function NotToDoPage() {
  const [entries, setEntries] = useState([]);
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [selectedFolderId, setSelectedFolderId] = useState(null); // nullは「すべて」
  
  const [newAction, setNewAction] = useState('');
  const [selectedFolderForNew, setSelectedFolderForNew] = useState('');
  
  const [showInfo, setShowInfo] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  // 削除確認用インラインモーダルステート
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null); // { type: 'entry' | 'folder', id: ... }

  // マウント時にローカルストレージから取得
  useEffect(() => {
    const savedEntries = localStorage.getItem('not_to_do_entries');
    const savedFolders = localStorage.getItem('not_to_do_folders');

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders);
      setFolders(parsedFolders);
      if (parsedFolders.length > 0) {
        setSelectedFolderForNew(parsedFolders[0].id);
      }
    } else {
      setSelectedFolderForNew(DEFAULT_FOLDERS[0].id);
    }
  }, []);

  // データ保存のヘルパー
  const saveEntriesToStorage = (updated) => {
    setEntries(updated);
    localStorage.setItem('not_to_do_entries', JSON.stringify(updated));
  };

  const saveFoldersToStorage = (updated) => {
    setFolders(updated);
    localStorage.setItem('not_to_do_folders', JSON.stringify(updated));
  };

  const exportData = () => {
    const data = JSON.stringify({ entries, folders });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nottodo_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { entries: iE, folders: iF } = JSON.parse(event.target.result);
        if (iE) saveEntriesToStorage(iE);
        if (iF) saveFoldersToStorage(iF);
        alert('データを復元しました！');
      } catch (err) { alert('ファイルの読み込みに失敗しました。'); }
    };
    reader.readAsText(file);
  };

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newAction.trim()) return;
    
    const targetFolderId = selectedFolderForNew || (folders.find(f => !f.isArchived)?.id || folders[0]?.id);

    const newEntry = { 
      id: Date.now(), 
      action: newAction, 
      is_completed: false, 
      created_at: new Date().toISOString(), 
      reflection: '', 
      tags: [], 
      nextActionType: '', 
      actionDetail: '',
      folderId: targetFolderId
    };

    saveEntriesToStorage([newEntry, ...entries]);
    setNewAction('');
  };

  const handleUpdate = (id, updatedData) => {
    const updated = entries.map(e => e.id === id ? { ...e, ...updatedData, is_completed: true } : e);
    saveEntriesToStorage(updated);
  };

  const executeDelete = () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === 'entry') {
      const updated = entries.filter(e => e.id !== deleteConfirmTarget.id);
      saveEntriesToStorage(updated);
    } else if (deleteConfirmTarget.type === 'folder') {
      const id = deleteConfirmTarget.id;
      if (folders.length <= 1) {
        alert('最低1つのフォルダが必要です。');
        setDeleteConfirmTarget(null);
        return;
      }
      const updated = folders.filter(f => f.id !== id);
      saveFoldersToStorage(updated);
    }
    setDeleteConfirmTarget(null);
  };

  const activeFolders = folders.filter(f => !f.isArchived);
  const archivedFolders = folders.filter(f => f.isArchived);
  const archivedFolderIds = new Set(archivedFolders.map(f => f.id));

  // 「すべて」表示のときも、アーカイブされたフォルダ内のレポートは除外する
  const visibleEntries = entries.filter(e => !archivedFolderIds.has(e.folderId));

  const filteredEntries = selectedFolderId === null 
    ? visibleEntries 
    : visibleEntries.filter(e => e.folderId === selectedFolderId);

  return (
    <div className="min-h-screen bg-[#dccfb0] text-[#4a4030] font-mono relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <div className="h-3/4 bg-gradient-to-b from-[#2c3e50] to-[#e67e22]" />
        <div className="h-1/4 bg-[#5d6d4e]" />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} animate={{ x: [-200, 1200] }} transition={{ repeat: Infinity, duration: 15 + i * 5, ease: "linear", delay: i * 3 }} className="absolute text-3xl" style={{ top: `${10 + i * 15}%` }}>
            {['☁️', '🚁', '✈️'][i % 3]}
          </motion.div>
        ))}
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute bottom-[20%] right-[5%] text-5xl rotate-[-10deg]">🏃‍♂️</motion.div>
      </div>

      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <nav className="flex justify-between items-center mb-8">
          <Link href="/menu" className="p-2 bg-black/5 rounded-full"><ChevronLeft /></Link>
          <div className="flex gap-2">
            <button onClick={() => setShowFolderModal(true)} className="p-3 bg-black/5 rounded-full" title="フォルダ管理">
              <Folder size={20} className="text-[#4a4030]" />
            </button>
            <button onClick={() => setShowInfo(true)} className="p-3 bg-black/5 rounded-full"><BookOpen size={20} /></button>
          </div>
        </nav>

        <header className="mb-6">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Not to do list</h1>
          <p className="text-xs opacity-60 mb-4">違和感を実験し、自分らしさの輪郭を削り出すための記録場所。</p>
          
          <div className="flex gap-2">
            <button onClick={exportData} className="flex items-center gap-1 text-[10px] bg-black/10 px-3 py-1 rounded-full"><Download size={12}/> Export</button>
            <label className="flex items-center gap-1 text-[10px] bg-black/10 px-3 py-1 rounded-full cursor-pointer">
              <Upload size={12}/> Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </header>

        {/* フォルダタブセレクター */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedFolderId === null 
                  ? 'bg-[#4a4030] text-white' 
                  : 'bg-white/40 text-[#4a4030] hover:bg-white/60 border border-white/60'
              }`}
            >
              すべて ({visibleEntries.length})
            </button>
            {activeFolders.map(folder => {
              const count = visibleEntries.filter(e => e.folderId === folder.id).length;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    selectedFolderId === folder.id 
                      ? 'text-white shadow-sm' 
                      : 'bg-white/40 text-[#4a4030] hover:bg-white/60'
                  }`}
                  style={{ 
                    backgroundColor: selectedFolderId === folder.id ? folder.color : undefined,
                    borderColor: selectedFolderId === folder.id ? folder.color : 'rgba(255,255,255,0.6)'
                  }}
                >
                  <span>{folder.icon}</span>
                  <span>{folder.name}</span>
                  <span className="text-[10px] opacity-70 ml-0.5">({count})</span>
                </button>
              );
            })}
          </div>

          {archivedFolders.length > 0 && (
            <details className="mt-2 group">
              <summary className="text-[10px] font-bold opacity-50 cursor-pointer select-none py-1 flex items-center gap-1 hover:opacity-80">
                <span className="transition-transform group-open:rotate-90">▶</span>
                アーカイブされたフォルダ ({archivedFolders.length})
              </summary>
              <div className="flex gap-2 mt-1 flex-wrap">
                {archivedFolders.map(folder => {
                  const archivedCount = entries.filter(e => e.folderId === folder.id).length;
                  return (
                    <div key={folder.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-black/10 opacity-60">
                      <span>{folder.icon}</span>
                      <span>{folder.name}</span>
                      <span className="opacity-70">({archivedCount})</span>
                      <button 
                        onClick={() => {
                          const updated = folders.map(f => f.id === folder.id ? {...f, isArchived: false} : f);
                          saveFoldersToStorage(updated);
                        }}
                        className="ml-1 hover:opacity-100 font-bold"
                        title="復元"
                      >
                        ↩
                      </button>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>

        {/* 新規登録フォーム */}
        <form onSubmit={handleAddAction} className="flex gap-2 mb-8 items-center">
          <div className="flex-1 flex gap-2 bg-white/50 rounded-lg p-1.5 border border-white">
            <select
              value={selectedFolderForNew}
              onChange={(e) => setSelectedFolderForNew(e.target.value)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer pr-1 border-r border-black/10"
            >
              {activeFolders.map(f => (
                <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
              ))}
            </select>
            <input 
              value={newAction} 
              onChange={(e) => setNewAction(e.target.value)} 
              placeholder="モヤモヤを記録しよう　例）明日の授業のプレゼン" 
              className="flex-1 bg-transparent text-sm outline-none px-1" 
            />
          </div>
          <button type="submit" className="bg-[#4a4030] text-white p-3 rounded-lg font-bold flex items-center justify-center"><Plus /></button>
        </form>

        {/* エントリー一覧 */}
        <motion.div layout className="space-y-4 mb-12">
          <AnimatePresence mode="popLayout">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-xs opacity-50">記録がまだありません</div>
            ) : (
              filteredEntries.map(e => (
                <LogItem 
                  key={e.id} 
                  entry={e} 
                  folders={folders} 
                  onUpdate={handleUpdate} 
                  onDeleteRequest={(id) => setDeleteConfirmTarget({ type: 'entry', id })} 
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <FolderModal 
        show={showFolderModal} 
        setShow={setShowFolderModal} 
        folders={folders} 
        saveFolders={saveFoldersToStorage}
        onDeleteFolderRequest={(id) => setDeleteConfirmTarget({ type: 'folder', id })}
      />
      <InfoModal show={showInfo} setShow={setShowInfo} />

      {/* インライン削除確認パネル */}
      <AnimatePresence>
        {deleteConfirmTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#dccfb0] border border-white/80 p-6 rounded-2xl max-w-xs w-full shadow-lg text-center font-mono"
            >
              <div className="text-xs font-bold mb-3 opacity-80">本当に削除しますか？</div>
              <p className="text-[11px] opacity-60 mb-5 leading-relaxed">
                {deleteConfirmTarget.type === 'entry' 
                  ? 'この記録は削除され、元に戻すことはできません。' 
                  : 'このフォルダを削除します。（中の記録は未分類になります）'}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="flex-1 py-2 bg-black/5 hover:bg-black/10 rounded-xl text-xs font-bold transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 py-2 bg-[#8c3a28] text-white hover:bg-[#7a3121] rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  削除する
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogItem({ entry, folders, onUpdate, onDeleteRequest }) {
  const [isRecording, setIsRecording] = useState(false);
  const [refl, setRefl] = useState(entry.reflection || '');
  const [tags, setTags] = useState(entry.tags || []);
  const [nextType, setNextType] = useState(entry.nextActionType || '');
  const [detail, setDetail] = useState(entry.actionDetail || '');
  const [folderId, setFolderId] = useState(entry.folderId || folders[0]?.id);

  const currentFolder = folders.find(f => f.id === entry.folderId);
  const tagsList = ['違和感', '無理感', '恥ずかしさ','孤独感', 'やけくそ','焦燥感', '期待感', '達成感'];
  const options = ["ハードルを下げる", "今は時期じゃない", "誰かに相談する", "やれることはやった"];

  return (
    <div className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm relative group">
      {currentFolder && (
        <div className="flex items-center gap-1 text-[10px] font-bold mb-2 opacity-70">
          <span>{currentFolder.icon}</span>
          <span>{currentFolder.name}</span>
        </div>
      )}

      {isRecording ? (
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg">{entry.action}</h3>
            <button onClick={() => onDeleteRequest(entry.id)} className="text-red-500/60 hover:text-red-500 p-1"><Trash2 size={16} /></button>
          </div>

          <div className="text-[10px] font-bold opacity-50 mb-1">フォルダ変更</div>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className="w-full p-2 bg-white/50 rounded-lg text-xs mb-3 outline-none border border-black/10">
            {folders.filter(f => !f.isArchived).map(f => (
              <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
            ))}
          </select>

          <div className="text-[10px] font-bold opacity-50 mb-2">感情タグ</div>
          <div className="flex flex-wrap gap-1 mb-4">
            {tagsList.map(t => (
              <button key={t} onClick={() => setTags(p => p.includes(t) ? p.filter(i => i !== t) : [...p, t])} className={`text-[9px] px-2 py-1 rounded-full border transition-colors ${tags.includes(t) ? 'bg-[#e67e22] text-white border-[#e67e22]' : 'border-black/20'}`}>{t}</button>
            ))}
          </div>
          <textarea value={refl} onChange={(e) => setRefl(e.target.value)} className="w-full p-2 bg-white/50 rounded-lg text-sm mb-4 outline-none" placeholder="振り返りメモ　例）前にも似たことあったなあ。。。" />
          
          <div className="text-[10px] font-bold opacity-50 mb-2">次のステップ</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {options.map(o => (
              <button key={o} onClick={() => setNextType(o)} className={`p-2 text-[9px] rounded-lg border transition-colors ${nextType === o ? 'bg-[#e67e22] text-white border-[#e67e22]' : 'border-black/20'}`}>{o}</button>
            ))}
          </div>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="w-full p-2 bg-white/50 rounded-lg text-sm mb-4 outline-none" placeholder="詳細　例）授業前一服いっとくか。。。" />
          <button onClick={() => { onUpdate(entry.id, { reflection: refl, tags, nextActionType: nextType, actionDetail: detail, folderId }); setIsRecording(false); }} className="w-full bg-[#4a4030] text-white py-2 rounded-lg text-xs font-bold">SAVE</button>
        </div>
      ) : entry.is_completed ? (
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-base">{entry.action}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-40">{new Date(entry.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
              <button onClick={() => onDeleteRequest(entry.id)} className="text-red-500/40 hover:text-red-500 p-1"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.tags.map(t => <span key={t} className="bg-[#e67e22]/20 text-[#e67e22] px-2 py-0.5 rounded-full text-[9px] font-bold">{t}</span>)}
          </div>
          <p className="text-sm opacity-80 bg-black/5 p-3 rounded-lg italic">"{entry.reflection}"</p>
          <div className="mt-3 text-[11px] font-bold text-[#4a4030]/60 flex items-center justify-between">
            <div>🌱 {entry.nextActionType}： <span className="font-normal opacity-70">{entry.actionDetail}</span></div>
            <button onClick={() => setIsRecording(true)} className="p-1 opacity-50 hover:opacity-100"><Pencil size={14} /></button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-base">{entry.action}</h3>
            <button onClick={() => onDeleteRequest(entry.id)} className="text-red-500/40 hover:text-red-500 p-1"><Trash2 size={14} /></button>
          </div>
          <button onClick={() => setIsRecording(true)} className="mt-3 w-full py-2 border border-dashed border-[#4a4030]/30 rounded-lg text-xs font-bold hover:bg-white/40">🎯 記録する</button>
        </div>
      )}
    </div>
  );
}

function FolderModal({ show, setShow, folders, saveFolders, onDeleteFolderRequest }) {
  const [newFolderName, setNewFolderName] = useState('');
  const [newColor, setNewColor] = useState('#e67e22');
  const [newIcon, setNewIcon] = useState('📁');

  if (!show) return null;

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const updated = [
      ...folders, 
      { id: Date.now().toString(), name: newFolderName, color: newColor, icon: newIcon, isArchived: false }
    ];
    saveFolders(updated);

    setNewFolderName('');
    setNewIcon('📁');
    setNewColor('#e67e22');
    alert(`「${newFolderName}」フォルダを作成しました！`);
  };

  const toggleArchive = (id) => {
    const updated = folders.map(f => f.id === id ? {...f, isArchived: !f.isArchived} : f);
    saveFolders(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#dccfb0] p-6 rounded-3xl max-w-md w-full relative max-h-[85vh] overflow-y-auto">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4"><X /></button>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FolderPlus className="text-[#e67e22]" size={20} /> フォルダ管理
        </h3>

        {/* 新規フォルダ作成 */}
        <form onSubmit={handleAddFolder} className="bg-white/40 p-4 rounded-2xl mb-6 border border-white/60 space-y-3">
          <div className="text-xs font-bold opacity-70">新規フォルダ追加</div>
          
          <div className="flex gap-2">
            <input 
              value={newIcon} 
              onChange={(e) => setNewIcon(e.target.value)} 
              className="w-12 bg-white/60 rounded-lg p-2 text-center text-sm outline-none border border-white" 
              placeholder="絵文字" 
            />
            <input 
              value={newFolderName} 
              onChange={(e) => setNewFolderName(e.target.value)} 
              className="flex-1 bg-white/60 rounded-lg p-2 text-sm outline-none border border-white" 
              placeholder="フォルダ名（例：仕事の違和感）" 
            />
          </div>

          <div>
            <div className="text-[10px] opacity-60 mb-1">アイコンを選ぶ:</div>
            <div className="flex flex-wrap gap-1">
              {['📁', '🌱', '👥', '💼', '🎸', '📚', '💻', '☕', '🧠', '✨', '💡', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewIcon(emoji)}
                  className={`p-1.5 rounded text-sm transition-colors ${newIcon === emoji ? 'bg-black/20 ring-1 ring-black/30' : 'bg-white/30 hover:bg-white/60'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-60">カラー:</span>
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer bg-transparent" />
            </div>
            <button type="submit" className="bg-[#4a4030] text-white px-4 py-2 rounded-lg text-xs font-bold">追加する</button>
          </div>
        </form>

        {/* フォルダ一覧・アーカイブ切り替え */}
        <div className="space-y-2">
          <div className="text-xs font-bold opacity-70 mb-2">登録済みフォルダ</div>
          {folders.map(folder => (
            <div key={folder.id} className="bg-white/60 p-3 rounded-xl border border-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg" style={{ color: folder.color }}>{folder.icon}</span>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    {folder.name}
                    {folder.isArchived && <span className="text-[9px] bg-black/10 px-1.5 py-0.5 rounded text-black/50">アーカイブ中</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => toggleArchive(folder.id)} 
                  className="text-[10px] px-2.5 py-1 bg-black/5 hover:bg-black/10 rounded-lg font-bold"
                >
                  {folder.isArchived ? '復元' : 'アーカイブ'}
                </button>
                <button onClick={() => onDeleteFolderRequest(folder.id)} className="p-1.5 text-red-500/50 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoModal({ show, setShow }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#dccfb0] p-8 rounded-3xl max-w-lg w-full relative">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4"><X /></button>
        <h3 className="font-bold mb-4">How to use</h3>
        <p className="text-sm opacity-70 leading-relaxed">違和感を実験し、自分らしさの輪郭を削り出すための記録場所です。フォルダで分類してすっきりと整理できます。</p>
      </div>
    </div>
  );
}