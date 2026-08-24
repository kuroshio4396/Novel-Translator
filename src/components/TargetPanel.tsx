import React from 'react';
import { Download, Edit3, Loader2 } from 'lucide-react';

interface TargetPanelProps {
  translatedText: string;
  setTranslatedText: (text: string) => void;
  isLoading: boolean;
}

export default function TargetPanel({ translatedText, setTranslatedText, isLoading }: TargetPanelProps) {
  
  const handleExport = () => {
    if (!translatedText) return;
    
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_export_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="h-10 px-4 border-b border-[#f3f2f1] flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-[#0078d4]">AI 实时译文 (已校对)</span>
        <button
          onClick={handleExport}
          disabled={!translatedText || isLoading}
          className="flex items-center gap-1 text-[10px] font-medium text-[#0078d4] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3 h-3" />
          导出为 TXT
        </button>
      </div>

      <div className="flex-1 overflow-hidden p-6 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <Loader2 className="w-8 h-8 text-[#0078d4] animate-spin mb-3" />
            <p className="text-xs font-medium text-[#605e5d] animate-pulse">AI 正在进行深度翻译与排版，请稍候...</p>
          </div>
        )}
        
        <div className="h-full border border-transparent p-2">
          <textarea
            value={translatedText}
            onChange={(e) => setTranslatedText(e.target.value)}
            placeholder="翻译结果将显示在此处，您可以直接在此进行校对修改..."
            className="w-full h-full resize-none outline-none text-[#323130] text-sm leading-relaxed bg-transparent"
            disabled={isLoading}
          />
        </div>
      </div>
    </>
  );
}
