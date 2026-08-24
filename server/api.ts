import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

router.post('/translate', async (req, res) => {
    try {
      const { text, targetLang, style, terminology, provider, model, apiKey, imageBase64, imageMimeType } = req.body;
      
      // Select API Key: custom or default
      const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;
      
      if (!effectiveApiKey) {
        return res.status(400).json({ error: '未提供或未配置 API Key' });
      }
      
      let translatedText = '';
      
      if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
        
        const systemInstruction = `You are a professional novel translator. Translate the given text into ${targetLang || 'Simplified Chinese'}.
Style: ${style || 'Professional and fluent'}.
Glossary/Terminology: ${terminology || 'None provided'}.
Ensure the formatting (paragraphs, line breaks) is preserved. Do not add any extra conversational text.`;

        const contents = [];
        
        if (imageBase64) {
           contents.push({
             role: 'user',
             parts: [
               { inlineData: { data: imageBase64, mimeType: imageMimeType } },
               { text: `Extract all text from this image, preprocess and format it properly (maintaining novel chapter structure if any), and then translate it into ${targetLang || 'Simplified Chinese'}. Just provide the final translated text.` }
             ]
           });
        } else {
           contents.push({
             role: 'user',
             parts: [
               { text: text }
             ]
           });
        }

        const targetModel = model || 'gemini-2.5-pro';
        
        const response = await ai.models.generateContent({
            model: imageBase64 ? targetModel : targetModel,
            contents,
            config: {
                systemInstruction,
                temperature: 0.3,
            }
        });
        
        translatedText = response.text || '';
        
      } else if (provider === 'deepseek' || provider === 'openai') {
        const isDeepseek = provider === 'deepseek';
        let endpoint = 'https://api.deepseek.com/chat/completions';
        
        if (!isDeepseek) {
          const customUrl = req.body.baseUrl || 'https://api.openai.com/v1';
          endpoint = customUrl.endsWith('/chat/completions') ? customUrl : 
                     customUrl.endsWith('/') ? `${customUrl}chat/completions` : 
                     `${customUrl}/chat/completions`;
        }
        
        const modelName = model || (isDeepseek ? 'deepseek-chat' : 'gpt-3.5-turbo');
        
        const prompt = `You are a professional novel translator. Translate the given text into ${targetLang || 'Simplified Chinese'}.
Style: ${style || 'Professional and fluent'}.
Glossary/Terminology: ${terminology || 'None provided'}.
Ensure the formatting (paragraphs, line breaks) is preserved. Do not add any extra conversational text.\n\nText to translate:\n${text}`;
        
        if (imageBase64) {
            return res.status(400).json({ error: `当前仅 Gemini 模型支持图片识别功能。请切换模型或上传纯文本。` });
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${effectiveApiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || 'API 请求失败');
        }
        
        const data = await response.json();
        translatedText = data.choices[0].message.content;
      } else {
          return res.status(400).json({ error: '不支持的模型提供商' });
      }
      
      res.json({ translatedText });
    } catch (error: any) {
      let errorMessage = error.message || '内部服务器错误';
      
      if (typeof errorMessage === 'string' && errorMessage.includes('"error":')) {
        try {
          const jsonStart = errorMessage.indexOf('{');
          if (jsonStart !== -1) {
            const parsed = JSON.parse(errorMessage.substring(jsonStart));
            errorMessage = parsed.error?.message || errorMessage;
          }
        } catch (e) {}
      }
      
      if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
        errorMessage = '请求过于频繁或免费额度已耗尽 (Quota Exceeded)。请检查 API Key 额度或稍后再试。';
      } else if (errorMessage.includes('API key not valid')) {
        errorMessage = 'API 密钥无效 (Invalid API Key)。请在侧边栏中配置有效的 API Key。';
      }
      
      res.status(500).json({ error: errorMessage });
    }
});

router.post('/test-connection', async (req, res) => {
    try {
      const { provider, apiKey, baseUrl, model } = req.body;
      const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;
      
      if (!effectiveApiKey) {
        return res.status(400).json({ error: '未提供 API Key' });
      }

      if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
        const targetModel = model || 'gemini-2.5-flash';
        
        // Use a simple prompt to test
        await ai.models.generateContent({
          model: targetModel,
          contents: 'Test',
        });
        
        return res.json({ success: true });
      } else if (provider === 'deepseek' || provider === 'openai') {
        const isDeepseek = provider === 'deepseek';
        let endpoint = 'https://api.deepseek.com/chat/completions';
        
        if (!isDeepseek) {
          const customUrl = baseUrl || 'https://api.openai.com/v1';
          endpoint = customUrl.endsWith('/chat/completions') ? customUrl : 
                     customUrl.endsWith('/') ? `${customUrl}chat/completions` : 
                     `${customUrl}/chat/completions`;
        }
        
        const modelName = model || (isDeepseek ? 'deepseek-chat' : 'gpt-3.5-turbo');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${effectiveApiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'user', content: 'Test' }],
                max_tokens: 5
            })
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `API 请求失败: HTTP ${response.status}`);
        }
        
        return res.json({ success: true });
      } else {
        return res.status(400).json({ error: '不支持的模型提供商' });
      }
    } catch (error: any) {
      let errorMessage = error.message || '测试连接失败';
      
      if (typeof errorMessage === 'string' && errorMessage.includes('"error":')) {
        try {
          const jsonStart = errorMessage.indexOf('{');
          if (jsonStart !== -1) {
            const parsed = JSON.parse(errorMessage.substring(jsonStart));
            errorMessage = parsed.error?.message || errorMessage;
          }
        } catch (e) {}
      }
      
      if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
        errorMessage = '请求过于频繁或免费额度已耗尽 (Quota Exceeded)。请检查 API Key 额度或稍后再试。';
      } else if (errorMessage.includes('API key not valid')) {
        errorMessage = 'API 密钥无效 (Invalid API Key)。请在侧边栏中配置有效的 API Key。';
      }
      
      res.status(500).json({ error: errorMessage });
    }
});

export default router;
