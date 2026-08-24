import React, { useRef } from 'react';
import { Type, Image as ImageIcon, Upload, X } from 'lucide-react';
import { InputMode } from '../types';

interface SourcePanelProps {
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  text: string;
  setText: (text: string) => void;
  image: string | null;
  setImage: (img: string | null) => void;
  imageMimeType: string | null;
  setImageMimeType: (mime: string | null) => void;
}

export default function SourcePanel({
  mode,
  setMode,
  text,
  setText,
  image,
  setImage,
  imageMimeType,
  setImageMimeType
}: SourcePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      // split base64 to get content and mime type
      const [header, data] = base64String.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      
      setImage(data);
      setImageMimeType(mime);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="h-10 px-4 border-b border-[#f3f2f1] flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold">原文文本</span>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('text')}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${
              mode === 'text' ? 'bg-[#f3f2f1] border-[#edebe9]' : 'border-transparent hover:bg-[#f3f2f1]'
            }`}
          >
            文本
          </button>
          <button
            onClick={() => setMode('image')}
            className={`text-[10px] px-2 py-1 rounded border transition-colors ${
              mode === 'image' ? 'bg-[#f3f2f1] border-[#edebe9]' : 'border-transparent hover:bg-[#f3f2f1]'
            }`}
          >
            图片
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        {mode === 'text' ? (
          <div className="h-full border border-transparent p-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在此处粘贴需要翻译的小说原文（支持超长文本）..."
              className="w-full h-full resize-none outline-none text-[#323130] text-sm leading-relaxed bg-transparent"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col text-sm leading-relaxed text-[#323130] border border-transparent p-2">
            {!image ? (
              <div 
                className="flex-1 border-2 border-dashed border-[#d1d1d1] p-8 text-center text-[#a19f9d] rounded flex flex-col items-center justify-center cursor-pointer hover:bg-[#faf9f8] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-xs">拖拽或点击上传下一章节/图片</p>
                <p className="text-[10px] mt-2 opacity-70">支持 JPG, PNG 格式</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex-1 relative flex items-center justify-center bg-[#faf9f8] rounded overflow-hidden border border-[#edebe9] p-2">
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-white rounded p-1 shadow-sm border border-[#edebe9] hover:bg-red-50 text-[#605e5d] hover:text-red-500 z-10 transition-colors"
                  title="移除图片"
                >
                  <X className="w-4 h-4" />
                </button>
                <img 
                  src={`data:${imageMimeType};base64,${image}`} 
                  alt="Source" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="mt-4 text-[10px] text-[#a19f9d] text-center">
              图片将交由具备视觉能力的 AI 提取文本并排版翻译。
            </div>
          </div>
        )}
      </div>
    </>
  );
}
