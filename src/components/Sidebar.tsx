import React, { useState } from 'react';
import { Settings, Key, BookType, Sparkles } from 'lucide-react';
import { AppSettings, Provider } from '../types';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const MODELS = {
  gemini: [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  ],
  deepseek: [
    { id: 'deepseek-v4-flash', name: 'deepseek-v4-flash' },
    { id: 'deepseek-v4-pro', name: 'deepseek-v4-pro' },
  ]
};

export default function Sidebar({ settings, setSettings }: SidebarProps) {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleApiKeyChange = (provider: Provider, value: string) => {
    setSettings((prev) => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value,
      },
    }));
  };

  const handleBaseUrlChange = (provider: Provider, value: string) => {
    setSettings((prev) => ({
      ...prev,
      baseUrls: {
        ...prev.baseUrls,
        [provider]: value,
      },
    }));
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.provider,
          apiKey: settings.apiKeys[settings.provider],
          baseUrl: settings.baseUrls?.[settings.provider],
          model: settings.model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '连接失败');
      }
      setTestStatus('success');
      setTestMessage('连接成功！');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-[#edebe9] flex flex-col p-4 shrink-0 overflow-y-auto">
      <div className="mb-6 space-y-3">
        <label className="text-[11px] font-semibold text-[#605e5d] uppercase tracking-wider block mb-2">AI 模型配置</label>
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">模型厂商</label>
          <select
            value={settings.provider}
            onChange={(e) => {
              const newProvider = e.target.value as Provider;
              const newModel = newProvider === 'openai' ? 'gpt-3.5-turbo' : MODELS[newProvider as keyof typeof MODELS][0].id;
              setSettings({ ...settings, provider: newProvider, model: newModel });
              setTestStatus('idle');
              setTestMessage('');
            }}
            className="w-full text-xs p-2 border border-[#d1d1d1] rounded bg-white outline-none focus:border-[#0078d4]"
          >
            <option value="gemini">Google Gemini</option>
            <option value="deepseek">DeepSeek</option>
            <option value="openai">OpenAI 兼容 / 自定义</option>
          </select>
        </div>
        
        {settings.provider === 'openai' && (
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">自定义端点 (Base URL)</label>
            <input
              type="text"
              value={settings.baseUrls?.['openai'] || ''}
              onChange={(e) => handleBaseUrlChange('openai', e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full text-xs p-2 border border-[#d1d1d1] rounded bg-white outline-none focus:border-[#0078d4]"
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] text-gray-500 mb-1">选择模型</label>
          {settings.provider === 'openai' ? (
            <input
              type="text"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              placeholder="输入模型名称 (如 gpt-4)"
              className="w-full text-xs p-2 border border-[#d1d1d1] rounded bg-white outline-none focus:border-[#0078d4]"
            />
          ) : (
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full text-xs p-2 border border-[#d1d1d1] rounded bg-white outline-none focus:border-[#0078d4]"
            >
              {(MODELS[settings.provider as keyof typeof MODELS] || []).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <label className="text-[11px] font-semibold text-[#605e5d] uppercase tracking-wider block mb-2">API 密钥管理</label>
        
        <div>
          <label className="block text-[10px] text-gray-500 mb-1">当前厂商 API Key</label>
          <input
            type="password"
            value={settings.apiKeys[settings.provider] || ''}
            onChange={(e) => handleApiKeyChange(settings.provider, e.target.value)}
            placeholder={settings.provider === 'gemini' ? "若留空则使用默认配置" : "sk-..."}
            className="w-full text-xs p-2 border border-[#d1d1d1] rounded bg-[#faf9f8] outline-none focus:border-[#0078d4]"
          />
        </div>

        <div className="mt-2">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="w-full px-3 py-1.5 bg-[#f3f2f1] border border-[#edebe9] text-[#323130] text-[11px] font-medium rounded hover:bg-[#edebe9] transition-colors disabled:opacity-50"
          >
            {testStatus === 'testing' ? '正在测试...' : '测试连接'}
          </button>
          {testMessage && (
            <div className={`mt-2 text-[10px] p-2 rounded break-all ${testStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {testMessage}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex-1 flex flex-col">
        <label className="text-[11px] font-semibold text-[#605e5d] uppercase tracking-wider block mb-2">翻译风格预设</label>
        <textarea
          value={settings.style}
          onChange={(e) => setSettings({ ...settings, style: e.target.value })}
          placeholder="例如：专业、流畅..."
          rows={3}
          className="w-full text-xs p-2 border border-[#d1d1d1] rounded bg-[#faf9f8] resize-none outline-none focus:border-[#0078d4] mb-4"
        />

        <label className="text-[11px] font-semibold text-[#605e5d] uppercase tracking-wider block mb-2">术语表/禁忌词</label>
        <textarea
          value={settings.terminology}
          onChange={(e) => setSettings({ ...settings, terminology: e.target.value })}
          placeholder="例如：\nKing's Landing -> 君临城"
          className="w-full flex-1 min-h-[100px] text-xs p-2 border border-[#d1d1d1] rounded bg-[#faf9f8] resize-none outline-none focus:border-[#0078d4]"
        />
      </div>

      <div className="mt-4 p-3 bg-[#fff4ce] border border-[#fde7a9] rounded shrink-0">
        <p className="text-[11px] text-[#323130] leading-relaxed">
          <strong>提示：</strong> 您已开启“智能分段”，系统将自动根据空行和对话识别自然段落。
        </p>
      </div>
    </aside>
  );
}
