import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SourcePanel from './components/SourcePanel';
import TargetPanel from './components/TargetPanel';
import { AppSettings, InputMode } from './types';
import { Play } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nova_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.provider !== 'gemini' && parsed.provider !== 'deepseek') {
          parsed.provider = 'gemini';
          parsed.model = 'gemini-3-flash-preview';
        }
        if (!parsed.baseUrls) parsed.baseUrls = {};
        return parsed;
      } catch (e) {}
    }
    return {
      provider: 'gemini',
      model: 'gemini-3-flash-preview',
      apiKeys: {
        gemini: '',
        deepseek: '',
        openai: ''
      },
      baseUrls: {
        openai: 'https://api.openai.com/v1'
      },
      style: '专业、流畅，保留小说原有氛围与断句习惯',
      terminology: ''
    };
  });

  const [mode, setMode] = useState<InputMode>(() => {
    return (localStorage.getItem('nova_mode') as InputMode) || 'text';
  });
  
  const [sourceText, setSourceText] = useState(() => {
    return localStorage.getItem('nova_sourceText') || '';
  });
  const [sourceImage, setSourceImage] = useState<string | null>(() => {
    return localStorage.getItem('nova_sourceImage') || null;
  });
  const [sourceImageMimeType, setSourceImageMimeType] = useState<string | null>(() => {
    return localStorage.getItem('nova_sourceImageMimeType') || null;
  });
  
  const [translatedText, setTranslatedText] = useState(() => {
    return localStorage.getItem('nova_translatedText') || '';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Persist state
  useEffect(() => {
    localStorage.setItem('nova_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('nova_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('nova_sourceText', sourceText);
  }, [sourceText]);

  useEffect(() => {
    localStorage.setItem('nova_translatedText', translatedText);
  }, [translatedText]);

  useEffect(() => {
    try {
      if (sourceImage) {
        localStorage.setItem('nova_sourceImage', sourceImage);
      } else {
        localStorage.removeItem('nova_sourceImage');
      }
      if (sourceImageMimeType) {
        localStorage.setItem('nova_sourceImageMimeType', sourceImageMimeType);
      } else {
        localStorage.removeItem('nova_sourceImageMimeType');
      }
    } catch (e) {
      console.warn("Could not save image to local storage due to size limits.");
    }
  }, [sourceImage, sourceImageMimeType]);

  const handleTranslate = async () => {
    setErrorMsg('');
    if (mode === 'text' && !sourceText.trim()) {
      setErrorMsg('请输入需要翻译的文本');
      return;
    }
    if (mode === 'image' && !sourceImage) {
      setErrorMsg('请上传需要翻译的图片');
      return;
    }

    setIsLoading(true);
    try {
      const currentApiKey = settings.apiKeys[settings.provider];

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: sourceText,
          targetLang: '简体中文',
          style: settings.style,
          terminology: settings.terminology,
          provider: settings.provider,
          model: settings.model,
          apiKey: currentApiKey,
          baseUrl: settings.baseUrls?.[settings.provider],
          imageBase64: mode === 'image' ? sourceImage : undefined,
          imageMimeType: mode === 'image' ? sourceImageMimeType : undefined,
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '翻译失败，请检查配置或重试');
      }

      setTranslatedText(data.translatedText);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden text-[#323130] bg-[#f3f2f1] font-sans">
      <header className="h-12 bg-white border-b border-[#edebe9] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0078d4] rounded flex items-center justify-center text-white">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <h1 className="font-semibold text-sm">NovaTranslate AI Pro</h1>
        </div>
        <div className="flex items-center gap-2">
          {errorMsg && (
            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded border border-red-100">
              {errorMsg}
            </span>
          )}
          <div className="flex items-center bg-[#f3f2f1] rounded px-3 py-1 text-xs gap-2 border border-[#edebe9]">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>API 状态: {settings.provider}</span>
          </div>
          <button
            onClick={handleTranslate}
            disabled={isLoading || (mode === 'text' && !sourceText) || (mode === 'image' && !sourceImage)}
            className="px-4 py-1.5 bg-[#0078d4] text-white text-xs font-medium rounded hover:bg-[#106ebe] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始翻译
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar settings={settings} setSettings={setSettings} />
        
        <main className="flex-1 flex overflow-hidden">
          <section className="flex-1 flex flex-col bg-white border-r border-[#edebe9]">
            <SourcePanel 
              mode={mode} 
              setMode={setMode} 
              text={sourceText} 
              setText={setSourceText}
              image={sourceImage}
              setImage={setSourceImage}
              imageMimeType={sourceImageMimeType}
              setImageMimeType={setSourceImageMimeType}
            />
          </section>
          
          <section className="flex-1 flex flex-col bg-[#fcfcfc]">
            <TargetPanel 
              translatedText={translatedText}
              setTranslatedText={setTranslatedText}
              isLoading={isLoading}
            />
          </section>
        </main>
      </div>

      <footer className="h-6 bg-[#0078d4] text-white flex items-center justify-between px-3 text-[10px] shrink-0">
        <div className="flex items-center gap-4">
          <span>NovaTranslate AI Pro Workspace</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-80">UTF-8</span>
          <span className="flex items-center gap-1">
            {isLoading && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
            {isLoading ? '正在处理中...' : '就绪'}
          </span>
        </div>
      </footer>
    </div>
  );
}
