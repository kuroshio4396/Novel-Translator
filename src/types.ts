export type Provider = 'gemini' | 'deepseek' | 'openai';

export interface AppSettings {
  provider: Provider;
  model: string;
  apiKeys: Record<string, string>;
  baseUrls: Record<string, string>;
  style: string;
  terminology: string;
}

export type InputMode = 'text' | 'image';
