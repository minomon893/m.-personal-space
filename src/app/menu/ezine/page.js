"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export default function EzinePage() {
  const [selectedEzine, setSelectedEzine] = useState(null);
  const [showReader, setShowReader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (showReader) {
      const handleContextMenu = (e) => e.preventDefault();
      const handleKeyDown = (e) => {
        if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
          e.preventDefault();
        }
      };
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showReader]);

  const ezines = [
    { 
      id: 1, 
      title: "Aren’t We Out of Touch?", 
      vol: "Vol.01", 
      image: "/images/ezine1.jpg", 
      color: "bg-[#1A1A1A]", 
      textColor: "text-white",
      pdfUrl: "/pdfs/ezine1.pdf",
      description: "忙しい現代人が忘れがちな「今ココ」の感覚を思い出させてくれる一冊。心理学的なアプローチから、自分自身とのつながりを取り戻すためのヒントを綴っています。"
    },
    { id: 2, vol: "Vol.02", title: "Coming Soon", color: "bg-[#D1C9B8]", textColor: "text-[#8D7A66]", isEmpty: true },
    { id: 3, vol: "Vol.03", title: "Coming Soon", color: "bg-[#D1C9B8]", textColor: "text-[#8D7A66]", isEmpty: true },
    { id: 4, vol: "Vol.04", title: "Coming Soon", color: "bg-[#D1C9B8]", textColor: "text-[#8D7A66]", isEmpty: true },
  ];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(ezines.length / itemsPerPage);
  const currentItems = ezines.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#E6E1CF] p-6 text-[#5F6F7A] select-none font-sans">
      <style jsx global>{`
        @media print { body { display: none !important; } }
      `}</style>

      <div className="max-w-md mx-auto">
        
        <Link href="/menu" className="text-[10px] tracking-[0.2em] font-bold opacity-40 uppercase flex items-center gap-2 mb-10 hover:opacity-80 transition-all">
          <ArrowLeft size={12} /> Back to Menu
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-lg font-serif font-light tracking-[0.3em] italic mb-3 opacity-80">Psychology Ezine</h1>
          <p className="text-[9px] opacity-40 tracking-[0.4em] uppercase font-bold">心理学の知見と実践ツールのアーカイブ</p>
        </div>

        <div className="relative mb-6 pt-4">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[110%] h-12 rounded-t-xl border-b-[4px] border-[#8D7A66] z-20 shadow-md opacity-95 pointer-events-none"
               style={{ backgroundImage: 'linear-gradient(90deg, #94A8B5 50%, #DED1A5 50%)', backgroundSize: '60px 100%' }}>
          </div>

          <div className="bg-[#9B8876] p-5 pt-12 pb-10 rounded-xl shadow-xl border-b-[10px] border-[#7D6B5A] relative z-10">
            <div className="grid grid-cols-4 gap-3">
              {currentItems.map((ezine) => (
                <button 
                  key={ezine.id} 
                  disabled={ezine.isEmpty}
                  onClick={() => setSelectedEzine(ezine)}
                  className={`relative group/book text-left ${ezine.isEmpty ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className={`aspect-[3/4.5] ${ezine.color} rounded-sm shadow-sm border-l-[2.5px] border-black/5 overflow-hidden flex flex-col items-center justify-center transition-all duration-500 ${!ezine.isEmpty && 'group-hover/book:-translate-y-2 group-hover/book:shadow-lg'}`}>
                    {ezine.image ? (
                      <img src={ezine.image} alt={ezine.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-1 flex flex-col items-center">
                        <span className={`text-[5px] opacity-40 mb-1 font-bold ${ezine.textColor}`}>{ezine.vol}</span>
                        <span className={`text-[6px] font-bold leading-tight text-center opacity-20 uppercase tracking-tighter ${ezine.textColor}`}>{ezine.title}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-8 mb-12">
            <button onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} disabled={currentPage === 0} className={`p-1 rounded-full transition-all ${currentPage === 0 ? 'opacity-10' : 'opacity-40 hover:opacity-100'}`}><ChevronLeft size={18} /></button>
            <span className="text-[9px] font-bold tracking-[0.3em] opacity-30">{currentPage + 1} / {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} disabled={currentPage === totalPages - 1} className={`p-1 rounded-full transition-all ${currentPage === totalPages - 1 ? 'opacity-10' : 'opacity-40 hover:opacity-100'}`}><ChevronRight size={18} /></button>
          </div>
        )}

        <div className="mt-24 px-4 text-center">
          <div className="max-w-[280px] mx-auto space-y-2">
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-70 font-light">
              このEzineは、私自身の学びを
            </p>
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-70 font-light">
              ひとつずつ形にした記録です。
            </p>
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-70 font-light pt-3">
              私の活動を面白いと感じて、
            </p>
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-70 font-light">
              応援したいと思ってくださる方に
            </p>
            <p className="text-[11px] leading-relaxed tracking-[0.15em] opacity-70 font-light">
              届けることができれば幸いです。
            </p>
            <div className="pt-10">
              <p className="text-[8px] tracking-[0.4em] font-bold opacity-30 uppercase italic">m. personal space</p>
            </div>
          </div>
        </div>

        {selectedEzine && !showReader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#4A3F35]/40 backdrop-blur-sm">
            <div className="bg-[#F4F1E9] w-full max-w-xs rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 relative animate-in zoom-in duration-200">
              <button onClick={() => setSelectedEzine(null)} className="absolute top-6 right-6 text-[#5F6F7A]/50 hover:text-[#5F6F7A] transition-colors"><X size={20} /></button>
              <div className="p-10">
                <div className={`aspect-[3/4] w-28 rounded mx-auto mb-8 shadow-2xl border-l-[4px] border-black/10 ${selectedEzine.color}`}>
                   {selectedEzine.image && <img src={selectedEzine.image} className="w-full h-full object-cover" />}
                </div>
                <h2 className="text-center text-sm font-bold text-[#5F6F7A] mb-2 tracking-tight">{selectedEzine.title}</h2>
                
                {/* ￥0 / Free 表記に変更 */}
                <p className="text-center text-[10px] text-[#B5A773] font-bold tracking-[0.3em] mb-8 uppercase italic flex items-center justify-center gap-1 opacity-70">
                   ￥0 / Free
                </p>
                
                <p className="text-[11px] leading-relaxed opacity-60 mb-10 border-y border-[#5F6F7A]/10 py-6 font-light text-justify italic">
                  {selectedEzine.description}
                </p>
                <button 
                  onClick={() => setShowReader(true)}
                  className="w-full py-4 bg-[#5F6F7A] text-white rounded-2xl font-bold text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-[#4A5D6B] transition-all shadow-xl shadow-[#5F6F7A]/20"
                >
                  <BookOpen size={14} /> 購入して読む
                </button>
              </div>
            </div>
          </div>
        )}

        {showReader && selectedEzine && (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center p-5 bg-[#1A1A1A] text-white border-b border-white/5">
              <div className="flex flex-col">
                <span className="text-[8px] tracking-[0.3em] uppercase opacity-40 mb-0.5">{selectedEzine.vol}</span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-light">{selectedEzine.title}</span>
              </div>
              <button onClick={() => setShowReader(false)} className="flex items-center gap-2 text-[9px] font-bold tracking-[0.2em] opacity-60 hover:opacity-100 transition-all">
                EXIT <X size={16} />
              </button>
            </div>
            <div className="flex-1 w-full bg-[#222]">
              <iframe 
                src={`${selectedEzine.pdfUrl}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-none"
                title="E-Zine Viewer"
              />
            </div>
          </div>
        )}

      </div>
      
      <div className="h-24"></div>
    </div>
  );
}