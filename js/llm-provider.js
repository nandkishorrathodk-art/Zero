/* ============================================================
   ZERO-BUILDER — Custom LLM Provider System
   Supports: Gemini, OpenAI, Anthropic, DeepSeek, Groq, 
             Mistral, Ollama, and any OpenAI-compatible API
   ============================================================ */

class LLMProvider {
    constructor() {
        this.providers = {
            gemini: {
                name: 'Google Gemini',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                models: [
                    { id: 'gemini-1.5-flash', name: 'Gemini 2.5 Flash (Fast & Free)' },
                    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Best Quality)' },
                    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
                ],
                format: 'gemini',
                color: '#22c55e',
            },
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                models: [
                    { id: 'gpt-4o', name: 'GPT-4o (Recommended)' },
                    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Cheaper)' },
                    { id: 'gpt-4.1', name: 'GPT-4.1' },
                    { id: 'o3-mini', name: 'o3-mini (Reasoning)' },
                ],
                format: 'openai',
                color: '#f97316',
            },
            anthropic: {
                name: 'Anthropic Claude',
                baseUrl: 'https://api.anthropic.com/v1',
                models: [
                    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recommended)' },
                    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4 (Best Quality)' },
                    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fast)' },
                ],
                format: 'anthropic',
                color: '#a855f7',
            },
            deepseek: {
                name: 'DeepSeek',
                baseUrl: 'https://api.deepseek.com/v1',
                models: [
                    { id: 'deepseek-chat', name: 'DeepSeek V3 (Recommended)' },
                    { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoning)' },
                ],
                format: 'openai-compatible',
                color: '#3b82f6',
            },
            groq: {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1',
                models: [
                    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Recommended)' },
                    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
                    { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
                ],
                format: 'openai-compatible',
                color: '#eab308',
            },
            mistral: {
                name: 'Mistral',
                baseUrl: 'https://api.mistral.ai/v1',
                models: [
                    { id: 'mistral-large-latest', name: 'Mistral Large (Best)' },
                    { id: 'codestral-latest', name: 'Codestral (Code-optimized)' },
                    { id: 'mistral-small-latest', name: 'Mistral Small (Fast)' },
                ],
                format: 'openai-compatible',
                color: '#ef4444',
            },
            ollama: {
                name: 'Ollama (Local)',
                baseUrl: 'http://localhost:11434/v1',
                models: [
                    { id: 'llama3.1', name: 'Llama 3.1' },
                    { id: 'codellama', name: 'CodeLlama' },
                    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2' },
                    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder' },
                ],
                format: 'openai-compatible',
                color: '#a78bfa',
                noApiKey: true,
            },
            custom: {
                name: 'Custom Endpoint',
                baseUrl: '',
                models: [{ id: 'custom', name: 'Custom Model' }],
                format: 'openai-compatible',
                color: '#6b7280',
            },
        };

        this.currentProvider = 'gemini';
        this.currentModel = 'gemini-1.5-flash';
        this.apiKeys = {};
        this.customBaseUrl = '';
        this.customModelName = '';
        this.tokenUsage = { total: 0, today: 0 };
        
        this._loadSettings();
    }

    /* ===== SETTINGS PERSISTENCE ===== */
    _loadSettings() {
        this.apiKeys = {};

        try {
            const saved = localStorage.getItem('zb_llm_settings');
            if (saved) {
                const s = JSON.parse(saved);
                this.currentProvider = localStorage.getItem('zb_current_provider') || s.currentProvider || 'gemini';
                this.currentModel = localStorage.getItem('zb_current_model') || s.currentModel || 'gemini-1.5-flash';
                this.apiKeys = s.apiKeys || {};
                this.customBaseUrl = s.customBaseUrl || '';
                this.customModelName = s.customModelName || '';
                this.tokenUsage = s.tokenUsage || { total: 0, today: 0 };

                // Auto-sanitize broken content-safety / nemotron / deprecated free models
                if (typeof this.customModelName === 'string') {
                    if (this.customModelName.includes('content-safety') || this.customModelName.includes('nemotron')) {
                        this.customModelName = '';
                        this.currentProvider = 'gemini';
                        this.currentModel = 'gemini-1.5-flash';
                    } else if (this.customModelName === 'meta-llama/llama-3.3-70b-instruct:free') {
                        this.customModelName = 'meta-llama/llama-3.3-70b-instruct';
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to parse LLM settings JSON:', e);
        }

        // ALWAYS recover keys from standalone localStorage backups outside try-catch
        const knownProviders = ['gemini', 'openai', 'anthropic', 'deepseek', 'groq', 'mistral', 'custom'];
        knownProviders.forEach((p) => {
            const backupKey = localStorage.getItem(`zb_key_${p}`);
            if (backupKey && backupKey.trim()) {
                this.apiKeys[p] = backupKey.trim();
            }
        });

        // Auto-heal: If provider is set to custom without a custom URL, switch to Gemini if Gemini key exists
        if (this.currentProvider === 'custom' && !this.customBaseUrl && this.apiKeys['gemini']) {
            this.currentProvider = 'gemini';
            this.currentModel = 'gemini-1.5-flash';
        }

        console.log('[LLMProvider] Initialized. Current Provider:', this.currentProvider, 'Gemini Key Present:', !!this.getApiKey('gemini'), 'Total Keys:', Object.keys(this.apiKeys));
    }

    saveSettings() {
        try {
            this.apiKeys = this.apiKeys || {};
            localStorage.setItem('zb_current_provider', this.currentProvider);
            localStorage.setItem('zb_current_model', this.currentModel);
            localStorage.setItem('zb_llm_settings', JSON.stringify({
                currentProvider: this.currentProvider,
                currentModel: this.currentModel,
                apiKeys: this.apiKeys,
                customBaseUrl: this.customBaseUrl,
                customModelName: this.customModelName,
                tokenUsage: this.tokenUsage,
            }));

            // Backup API keys individually to prevent loss
            Object.entries(this.apiKeys || {}).forEach(([p, key]) => {
                if (key && typeof key === 'string' && key.trim()) {
                    localStorage.setItem(`zb_key_${p}`, key.trim());
                }
            });
        } catch (e) {
            console.warn('Failed to save LLM settings:', e);
        }
    }

    /* ===== PROVIDER MANAGEMENT ===== */
    setProvider(providerId, modelId) {
        if (!this.providers[providerId]) throw new Error(`Unknown provider: ${providerId}`);
        this.currentProvider = providerId;
        const providerModels = this.providers[providerId].models;
        const validModel = providerModels.find(m => m.id === modelId);
        this.currentModel = validModel ? validModel.id : (providerModels[0]?.id || 'custom');
        this.saveSettings();
    }

    setApiKey(providerId, key) {
        const cleanKey = String(key || '').trim();
        this.apiKeys = this.apiKeys || {};
        this.apiKeys[providerId] = cleanKey;
        if (cleanKey) {
            localStorage.setItem(`zb_key_${providerId}`, cleanKey);
        }
        this.saveSettings();
    }

    getApiKey(providerId) {
        const id = providerId || this.currentProvider;
        let key = (this.apiKeys && this.apiKeys[id]) || localStorage.getItem(`zb_key_${id}`) || '';
        if (key && key.trim()) {
            const k = key.trim();
            // Prevent key cross-contamination between different providers
            if (id === 'gemini' && (k.startsWith('gsk_') || k.startsWith('sk-ant-') || k.startsWith('sk-or-'))) return '';
            if (id === 'groq' && (k.startsWith('AIzaSy') || k.startsWith('sk-ant-'))) return '';
            if (id === 'openai' && k.startsWith('AIzaSy')) return '';
            return k;
        }
        // Strict fallback: Only return keys matching the target provider format
        if (id === 'gemini') {
            const cand = (this.apiKeys && this.apiKeys.gemini) || localStorage.getItem('zb_key_gemini');
            if (cand && cand.trim().startsWith('AIzaSy')) return cand.trim();
        } else if (id === 'groq') {
            const cand = (this.apiKeys && this.apiKeys.groq) || localStorage.getItem('zb_key_groq');
            if (cand && cand.trim().startsWith('gsk_')) return cand.trim();
        }
        return '';
    }

    getProviderInfo() {
        return this.providers[this.currentProvider];
    }

    getModels(providerId) {
        const p = this.providers[providerId || this.currentProvider];
        return p ? p.models : [];
    }

    _isProviderReady(id) {
        const p = this.providers[id];
        if (!p) return false;
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        if (id === 'ollama') {
            // Ollama local is ONLY allowed when running on HTTP / local device, NOT on HTTPS Vercel
            return !isHttps;
        }
        const key = this.getApiKey(id);
        if (key && key.trim().length > 0) return true; // Has valid API Key
        if (id === 'custom') {
            const url = String(this.customBaseUrl || '').toLowerCase();
            const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.');
            if (isLocal && url.length > 0) return !isHttps; // Local custom server
        }
        return false;
    }

    _autoSelectActiveProvider() {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        if (this.currentProvider === 'ollama' && isHttps) {
            this.currentProvider = 'gemini';
        }
        if (this._isProviderReady(this.currentProvider)) {
            return; // Current provider is ready!
        }
        // Search for any cloud provider that IS ready with a valid API key
        for (const id of Object.keys(this.providers)) {
            if (id !== 'ollama' && this._isProviderReady(id)) {
                this.currentProvider = id;
                this.currentModel = this.providers[id].models[0]?.id || 'custom';
                this.saveSettings();
                return;
            }
        }
    }

    /* ===== CORE CHAT METHOD ===== */
    async chat(messages, options = {}) {
        this._autoSelectActiveProvider();
        const provider = this.providers[this.currentProvider];
        const apiKey = this.getApiKey(this.currentProvider);
        const model = options.model || this.currentModel;

        if (!this._isProviderReady(this.currentProvider)) {
            throw new Error(`No API key configured for ${provider ? provider.name : 'AI Provider'}. Go to Settings → AI Provider and enter your API Key.`);
        }

        switch (provider.format) {
            case 'gemini':
                return this._chatGemini(messages, model, apiKey, options);
            case 'openai':
                return this._chatOpenAI(messages, model, apiKey, this._normalizeBaseUrl(provider.baseUrl), options);
            case 'anthropic':
                return this._chatAnthropic(messages, model, apiKey, options);
            case 'openai-compatible':
                const rawUrl = this.currentProvider === 'custom' ? this.customBaseUrl : provider.baseUrl;
                const baseUrl = this._normalizeBaseUrl(rawUrl);
                if (!baseUrl) {
                    throw new Error(`No Base URL configured for ${provider.name}. Go to Settings → AI Provider and set the Custom Base URL.`);
                }
                let actualModel = this.currentProvider === 'custom' ? (this.customModelName || model) : model;
                if (!actualModel || actualModel === 'custom' || actualModel === 'meta-llama/llama-3.3-70b-instruct:free') {
                    actualModel = (baseUrl.includes('openrouter.ai')) ? 'meta-llama/llama-3.3-70b-instruct' : 'gpt-4o';
                }
                return this._chatOpenAI(messages, actualModel, apiKey, baseUrl, options);
            default:
                throw new Error(`Unknown format: ${provider.format}`);
        }
    }

    /* ===== STREAMING CHAT ===== */
    async stream(messages, options = {}, onChunk) {
        this._autoSelectActiveProvider();
        const provider = this.providers[this.currentProvider];
        const apiKey = this.getApiKey(this.currentProvider);
        const model = options.model || this.currentModel;

        if (!this._isProviderReady(this.currentProvider)) {
            throw new Error(`No API key configured for ${provider ? provider.name : 'AI Provider'}. Go to Settings → AI Provider and enter your API Key.`);
        }

        switch (provider.format) {
            case 'gemini':
                return this._streamGemini(messages, model, apiKey, options, onChunk);
            case 'openai':
                return this._streamOpenAI(messages, model, apiKey, this._normalizeBaseUrl(provider.baseUrl), options, onChunk);
            case 'anthropic':
                return this._streamAnthropic(messages, model, apiKey, options, onChunk);
            case 'openai-compatible':
                const rawUrl = this.currentProvider === 'custom' ? this.customBaseUrl : provider.baseUrl;
                const baseUrl = this._normalizeBaseUrl(rawUrl);
                if (!baseUrl) {
                    throw new Error(`No Base URL configured for ${provider.name}. Go to Settings → AI Provider and set the Custom Base URL.`);
                }
                let actualModel = this.currentProvider === 'custom' ? (this.customModelName || model) : model;
                if (!actualModel || actualModel === 'custom' || actualModel === 'meta-llama/llama-3.3-70b-instruct:free') {
                    actualModel = (baseUrl.includes('openrouter.ai')) ? 'meta-llama/llama-3.3-70b-instruct' : 'gpt-4o';
                }
                return this._streamOpenAI(messages, actualModel, apiKey, baseUrl, options, onChunk);
            default:
                throw new Error(`Unknown format: ${provider.format}`);
        }
    }

    /* ===== GOOGLE GEMINI ADAPTER ===== */
    _extractSystemPrompt(messages = [], options = {}) {
        const fromMessages = (messages || [])
            .filter((m) => m && m.role === 'system' && m.content)
            .map((m) => String(m.content).trim())
            .filter(Boolean)
            .join('\n\n');
        const fromOptions = String(options.systemPrompt || '').trim();
        if (fromMessages && fromOptions) return `${fromOptions}\n\n${fromMessages}`;
        return fromOptions || fromMessages || '';
    }

    async _chatGemini(messages, model, apiKey, options) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const contents = this._convertToGeminiFormat(messages);
        const systemPrompt = this._extractSystemPrompt(messages, options);
        
        const generationConfig = {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 32768,
            topP: options.topP || 0.95,
        };

        // JSON mode: force Gemini to return valid JSON
        if (options.json) {
            generationConfig.responseMimeType = 'application/json';
        }

        const body = {
            contents,
            generationConfig,
        };

        if (systemPrompt) {
            body.systemInstruction = { parts: [{ text: systemPrompt }] };
        }

        let retries = 0;
        const maxRetries = 3;

        while (retries <= maxRetries) {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.status === 429 && retries < maxRetries) {
                retries++;
                const errText = await response.text();
                let waitMs = 12000; // default 12s backoff for Gemini free tier
                const delayMatch = errText.match(/retryDelay"?:\s*"(\d+)s/i) || errText.match(/retry in (\d+(?:\.\d+)?)s/i);
                if (delayMatch) {
                    waitMs = Math.max(2000, Math.ceil(parseFloat(delayMatch[1]) * 1000) + 1000);
                }
                console.warn(`[LLMProvider] Gemini 429 Rate Limit hit. Waiting ${waitMs / 1000}s before retry (${retries}/${maxRetries})...`);
                await new Promise((r) => setTimeout(r, waitMs));
                continue;
            }

            if (!response.ok) {
                const err = await response.text();
                throw new Error(this._parseErrorMessage(response.status, err));
            }

            const data = await response.json();
            const parts = data.candidates?.[0]?.content?.parts || [];
            const text = this._cleanOutputText(parts.map((p) => p.text || '').join('') || '');
            if (!text && data.promptFeedback?.blockReason) {
                throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
            }
            
            this._trackTokens(text.length / 4);
            return text;
        }
    }

    async _streamGemini(messages, model, apiKey, options, onChunk) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        
        const contents = this._convertToGeminiFormat(messages);
        const systemPrompt = this._extractSystemPrompt(messages, options);
        const streamGenerationConfig = {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 32768,
        };

        // JSON mode for streaming
        if (options.json) {
            streamGenerationConfig.responseMimeType = 'application/json';
        }

        const body = {
            contents,
            generationConfig: streamGenerationConfig,
        };

        if (systemPrompt) {
            body.systemInstruction = { parts: [{ text: systemPrompt }] };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini stream error (${response.status}): ${err}`);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.slice(6));
                        const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        if (chunk) {
                            fullText += chunk;
                            if (onChunk) onChunk(chunk, fullText);
                        }
                    } catch (e) { /* skip malformed chunks */ }
                }
            }
        }

        this._trackTokens(fullText.length / 4);
        return fullText;
    }

    _convertToGeminiFormat(messages) {
        return messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));
    }

    _normalizeBaseUrl(rawUrl) {
        if (!rawUrl) return '';
        let url = String(rawUrl).trim().replace(/\/+$/, '');
        if (url.includes('openrouter.ai')) {
            if (!url.endsWith('/api/v1') && !url.endsWith('/v1')) {
                url = url.endsWith('/api') ? `${url}/v1` : `${url}/api/v1`;
            }
        } else if (url.includes('api.openai.com') && !url.endsWith('/v1')) {
            url = `${url}/v1`;
        } else if (url.includes('api.deepseek.com') && !url.endsWith('/v1')) {
            url = `${url}/v1`;
        } else if (url.includes('api.groq.com') && !url.includes('/openai/v1') && !url.includes('/v1')) {
            url = `${url}/openai/v1`;
        } else if (url.includes('api.mistral.ai') && !url.endsWith('/v1')) {
            url = `${url}/v1`;
        }
        return url;
    }

    _parseErrorMessage(status, rawText) {
        let msg = String(rawText || '').trim();
        try {
            const json = JSON.parse(msg);
            if (json.error?.message) msg = json.error.message;
            else if (json.message) msg = json.message;
            else if (json.error) msg = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
        } catch (e) {}
        if (status === 401) {
            return `Authentication Error (401): ${msg || 'Missing or invalid API Key. Please check Settings → AI Provider.'}`;
        }
        if (status === 429) {
            return `Rate Limit Exceeded (429): ${msg || 'Too many requests. Please retry after a few seconds or switch provider.'}`;
        }
        return `API error (${status}): ${msg}`;
    }

    /* ===== OPENAI / OPENAI-COMPATIBLE ADAPTER ===== */
    async _chatOpenAI(messages, model, apiKey, baseUrl, options) {
        const cleanBaseUrl = this._normalizeBaseUrl(baseUrl);
        const url = cleanBaseUrl.endsWith('/chat/completions') ? cleanBaseUrl : `${cleanBaseUrl}/chat/completions`;
        
        const systemPrompt = this._extractSystemPrompt(messages, options);
        const conversation = (messages || []).filter((m) => m && m.role !== 'system');
        const allMessages = [];
        if (systemPrompt) {
            allMessages.push({ role: 'system', content: systemPrompt });
        }
        allMessages.push(...conversation);

        const maxLimits = { gemini: 32768, openai: 16384, groq: 4096, mistral: 8192, anthropic: 8192, custom: 16384 };
        const maxTokens = Math.min(options.maxTokens || 4096, maxLimits[this.currentProvider] || 8192);

        const body = {
            model,
            messages: allMessages,
            temperature: options.temperature || 0.7,
            max_tokens: maxTokens,
        };

        // JSON mode: force structured JSON output from OpenAI / compatible providers
        if (options.json) {
            body.response_format = { type: 'json_object' };
        }

        // Truncate long message history for Groq to stay under 12,000 TPM limit
        if ((this.currentProvider === 'groq' || url.includes('groq.com')) && JSON.stringify(body).length > 22000) {
            body.messages = body.messages.map(m => {
                if (typeof m.content === 'string' && m.content.length > 7000) {
                    return { ...m, content: m.content.slice(0, 7000) + '\n...[context trimmed for model TPM limit]...' };
                }
                return m;
            });
        }

        const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.');
        if (apiKey && (apiKey.includes('•') || apiKey.includes('●'))) {
            throw new Error(`Invalid API Key Format: You entered bullet mask characters ("••••••••") instead of your real API key. Please clear the API Key box in Settings and paste your actual key (e.g. sk-or-v1-...).`);
        }
        if (!apiKey && !isLocal) {
            throw new Error(`API key missing: ${url} requires an API key. Please open Settings (⚙️) → AI Provider and enter your API Key.`);
        }

        const headers = {
            'Content-Type': 'application/json',
        };
        if (url.includes('openrouter.ai')) {
            headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4173';
            headers['X-Title'] = 'Zero-Engineer';
        }
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

        let retries = 0;
        const maxRetries = 3;
        const retryStatuses = [408, 409, 425, 429, 500, 502, 503, 504];

        while (retries <= maxRetries) {
            let response;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });
            } catch (e) {
                if (e.name === 'AbortError') {
                    throw new Error(`Network Timeout (120s): Request to ${url} timed out. Please check your network connection or try again.`);
                }
                if (window.location.protocol === 'https:' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
                    throw new Error(`Browser Security Blocked Local Connection: You are on HTTPS but trying to connect to local Ollama. Please open http://zero-ai.surge.sh (without the 's') or run Zero-Builder locally using 'node server.js'.`);
                }
                throw new Error(`Network Error: Failed to connect to ${url}. (${e.message})`);
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response.ok) {
                const errText = await response.text();

                const isTokenOrRateLimit = response.status === 429 || response.status === 402 || response.status === 413 ||
                    /Request too large|TPM|Tokens per minute|Rate limit reached|free-models-per-day|quota/i.test(errText);

                if (isTokenOrRateLimit && (url.includes('openrouter.ai') || url.includes('groq.com') || this.currentProvider === 'groq' || this.currentProvider === 'custom')) {
                    const geminiKey = this.getApiKey('gemini');
                    if (geminiKey) {
                        console.warn(`[LLMProvider] Provider '${this.currentProvider}' hit rate/token limit (${response.status}). Auto-failing over to Google Gemini 2.5 Flash...`);
                        this.currentProvider = 'gemini';
                        this.currentModel = 'gemini-1.5-flash';
                        this.saveSettings();
                        return this._chatGemini(messages, 'gemini-1.5-flash', geminiKey, options);
                    }
                }

                if (retryStatuses.includes(response.status) && retries < maxRetries) {
                    retries++;
                    let waitMs = retries * 2000;
                    const retrySecMatch = errText.match(/try again in ([0-9\.]+)s/i);
                    if (retrySecMatch && retrySecMatch[1]) {
                        const sec = parseFloat(retrySecMatch[1]);
                        if (!isNaN(sec) && sec > 0 && sec <= 35) {
                            waitMs = Math.ceil(sec * 1000) + 500;
                            console.info(`[LLMProvider] Groq rate limit active. Waiting exact ${sec}s before retry ${retries}/${maxRetries}...`);
                        }
                    } else {
                        console.warn(`[LLMProvider] Retryable status ${response.status} hit on ${url}. Retrying in ${waitMs / 1000}s (attempt ${retries}/${maxRetries})...`);
                    }
                    await new Promise((r) => setTimeout(r, waitMs));
                    continue;
                }
                if ((response.status === 404 || response.status === 400) && retries < maxRetries) {
                    const slugMatch = errText.match(/use this slug instead:\s*([a-zA-Z0-9_\-\.\/:]+)/i);
                    let suggestedModel = slugMatch ? slugMatch[1].trim() : null;
                    if (!suggestedModel && body.model && body.model.includes(':free')) {
                        suggestedModel = body.model.replace(':free', '');
                    }
                    if (suggestedModel && suggestedModel !== body.model) {
                        console.warn(`[LLMProvider] Model '${body.model}' returned ${response.status}. Auto-healing model slug to '${suggestedModel}' and retrying...`);
                        body.model = suggestedModel;
                        if (this.currentProvider === 'custom') {
                            this.customModelName = suggestedModel;
                            this.saveSettings();
                        }
                        retries++;
                        continue;
                    }
                }
                throw new Error(this._parseErrorMessage(response.status, errText));
            }

            const data = await response.json();
            const text = this._cleanOutputText(data.choices?.[0]?.message?.content || '');
            this._trackTokens(data.usage?.total_tokens || text.length / 4);
            return text;
        }
    }

    async _streamOpenAI(messages, model, apiKey, baseUrl, options, onChunk) {
        const cleanBaseUrl = this._normalizeBaseUrl(baseUrl);
        const url = cleanBaseUrl.endsWith('/chat/completions') ? cleanBaseUrl : `${cleanBaseUrl}/chat/completions`;
        
        const systemPrompt = this._extractSystemPrompt(messages, options);
        const conversation = (messages || []).filter((m) => m && m.role !== 'system');
        const allMessages = [];
        if (systemPrompt) {
            allMessages.push({ role: 'system', content: systemPrompt });
        }
        allMessages.push(...conversation);

        const maxLimits = { gemini: 32768, openai: 16384, groq: 8192, mistral: 8192, anthropic: 8192, custom: 16384 };
        const maxTokens = Math.min(options.maxTokens || 4096, maxLimits[this.currentProvider] || 8192);

        const body = {
            model,
            messages: allMessages,
            temperature: options.temperature || 0.7,
            max_tokens: maxTokens,
            stream: true,
        };

        // JSON mode for streaming
        if (options.json) {
            body.response_format = { type: 'json_object' };
        }

        const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168.');
        if (apiKey && (apiKey.includes('•') || apiKey.includes('●'))) {
            throw new Error(`Invalid API Key Format: You entered bullet mask characters ("••••••••") instead of your real API key. Please clear the API Key box in Settings and paste your actual key.`);
        }
        if (!apiKey && !isLocal) {
            throw new Error(`API key missing: ${url} requires an API key. Please open Settings (⚙️) → AI Provider and enter your API Key.`);
        }

        const headers = {
            'Content-Type': 'application/json',
        };
        if (url.includes('openrouter.ai')) {
            headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4173';
            headers['X-Title'] = 'Zero-Engineer';
        }
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

        let retries = 0;
        const maxRetries = 3;
        const retryStatuses = [408, 409, 425, 429, 500, 502, 503, 504];

        while (retries <= maxRetries) {
            let response;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });
            } catch (e) {
                if (e.name === 'AbortError') {
                    throw new Error(`Network Timeout (120s): Request to ${url} timed out. Please check your network connection or try again.`);
                }
                if (window.location.protocol === 'https:' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
                    throw new Error(`Browser Security Blocked Local Connection: You are on HTTPS but trying to connect to local Ollama. Please open http://zero-ai.surge.sh (without the 's') or run Zero-Builder locally using 'node server.js'.`);
                }
                throw new Error(`Network Error: Failed to connect to ${url}. (${e.message})`);
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response.ok) {
                const errText = await response.text();

                const isTokenOrRateLimit = response.status === 429 || response.status === 402 || response.status === 413 ||
                    /Request too large|TPM|Tokens per minute|Rate limit reached|free-models-per-day|quota/i.test(errText);

                if (isTokenOrRateLimit && (url.includes('openrouter.ai') || url.includes('groq.com') || this.currentProvider === 'groq' || this.currentProvider === 'custom')) {
                    const geminiKey = this.getApiKey('gemini');
                    if (geminiKey) {
                        console.warn(`[LLMProvider] Provider '${this.currentProvider}' hit rate/token limit (${response.status}). Auto-failing over to Google Gemini 2.5 Flash...`);
                        this.currentProvider = 'gemini';
                        this.currentModel = 'gemini-1.5-flash';
                        this.saveSettings();
                        return this._streamGemini(messages, 'gemini-1.5-flash', geminiKey, options, onChunk);
                    }
                }

                const isNonRetryableRateLimit = (response.status === 429 || response.status === 402) &&
                    (errText.includes('free-models-per-day') || errText.includes('credits') || errText.includes('quota') || errText.includes('payment'));

                if (retryStatuses.includes(response.status) && retries < maxRetries && !isNonRetryableRateLimit) {
                    retries++;
                    let waitMs = retries * 2000;
                    const retrySecMatch = errText.match(/try again in ([0-9\.]+)s/i);
                    if (retrySecMatch && retrySecMatch[1]) {
                        const sec = parseFloat(retrySecMatch[1]);
                        if (!isNaN(sec) && sec > 0 && sec <= 35) {
                            waitMs = Math.ceil(sec * 1000) + 500;
                            console.info(`[LLMProvider] Groq rate limit active. Waiting exact ${sec}s before streaming retry ${retries}/${maxRetries}...`);
                        }
                    } else {
                        console.warn(`[LLMProvider] Retryable status ${response.status} hit on ${url}. Retrying in ${waitMs / 1000}s (attempt ${retries}/${maxRetries})...`);
                    }
                    await new Promise((r) => setTimeout(r, waitMs));
                    continue;
                }

                if ((response.status === 404 || response.status === 400) && retries < maxRetries) {
                    const slugMatch = errText.match(/use this slug instead:\s*([a-zA-Z0-9_\-\.\/:]+)/i);
                    let suggestedModel = slugMatch ? slugMatch[1].trim() : null;
                    if (!suggestedModel && body.model && body.model.includes(':free')) {
                        suggestedModel = body.model.replace(':free', '');
                    }
                    if (suggestedModel && suggestedModel !== body.model) {
                        console.warn(`[LLMProvider] Model '${body.model}' returned ${response.status}. Auto-healing model slug to '${suggestedModel}' and retrying...`);
                        body.model = suggestedModel;
                        if (this.currentProvider === 'custom') {
                            this.customModelName = suggestedModel;
                            this.saveSettings();
                        }
                        retries++;
                        continue;
                    }
                }
                throw new Error(this._parseErrorMessage(response.status, errText));
            }
            throw new Error(`Stream error (${response.status}): ${err}`);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const json = JSON.parse(line.slice(6));
                        const chunk = json.choices?.[0]?.delta?.content || '';
                        if (chunk) {
                            fullText += chunk;
                            if (onChunk) onChunk(chunk, fullText);
                        }
                    } catch (e) { /* skip */ }
                }
            }
        }

        this._trackTokens(fullText.length / 4);
        return fullText;
    }

    /* ===== ANTHROPIC ADAPTER ===== */
    async _chatAnthropic(messages, model, apiKey, options) {
        const url = 'https://api.anthropic.com/v1/messages';
        const systemPrompt = this._extractSystemPrompt(messages, options);
        // Anthropic rejects role:"system" inside messages — keep only user/assistant turns.
        const conversation = (messages || [])
            .filter((m) => m && m.role !== 'system')
            .map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));
        
        const body = {
            model,
            max_tokens: options.maxTokens || 32768,
            messages: conversation,
        };

        // JSON mode for Anthropic: append instruction to system and prefill assistant
        if (options.json) {
            const jsonSuffix = '\n\nYou MUST respond with valid JSON only. No markdown fences, no commentary, no explanation. Output raw JSON.';
            body.system = (systemPrompt ? systemPrompt + jsonSuffix : jsonSuffix.trim());
            // Anthropic prefill technique: start assistant turn with '{'
            conversation.push({ role: 'assistant', content: '{' });
            body.messages = conversation;
        } else if (systemPrompt) {
            body.system = systemPrompt;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic error (${response.status}): ${err}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        this._trackTokens(data.usage?.input_tokens + data.usage?.output_tokens || text.length / 4);
        return text;
    }

    async _streamAnthropic(messages, model, apiKey, options, onChunk) {
        const url = 'https://api.anthropic.com/v1/messages';
        const systemPrompt = this._extractSystemPrompt(messages, options);
        const conversation = (messages || [])
            .filter((m) => m && m.role !== 'system')
            .map((m) => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));
        
        const body = {
            model,
            max_tokens: options.maxTokens || 32768,
            stream: true,
            messages: conversation,
        };

        // JSON mode for Anthropic streaming
        if (options.json) {
            const jsonSuffix = '\n\nYou MUST respond with valid JSON only. No markdown fences, no commentary, no explanation. Output raw JSON.';
            body.system = (systemPrompt ? systemPrompt + jsonSuffix : jsonSuffix.trim());
            conversation.push({ role: 'assistant', content: '{' });
            body.messages = conversation;
        } else if (systemPrompt) {
            body.system = systemPrompt;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Anthropic stream error (${response.status}): ${err}`);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.slice(6));
                        if (json.type === 'content_block_delta') {
                            const chunk = json.delta?.text || '';
                            if (chunk) {
                                fullText += chunk;
                                if (onChunk) onChunk(chunk, fullText);
                            }
                        }
                    } catch (e) { /* skip */ }
                }
            }
        }

        this._trackTokens(fullText.length / 4);
        return fullText;
    }

    /* ===== CLEANING OUTPUT & ERROR PARSING ===== */
    _parseErrorMessage(status, rawText) {
        const text = String(rawText || '');
        if (/Tokens per day|TPD|Limit 100000|rate limit reached for model/i.test(text)) {
            return `Groq Account Daily Limit Reached (100,000 TPD). Groq has blocked requests for 44 minutes. Please open Settings (⚙️) → AI Provider, select "Google Gemini", and enter your free Gemini API Key from https://aistudio.google.com/app/apikey.`;
        }
        if (/Tokens per minute|TPM|Limit 12000/i.test(text)) {
            return `Groq Per-Minute Token Limit Hit (12,000 TPM). Please wait 30 seconds or switch to Google Gemini in Settings (⚙️).`;
        }
        try {
            const json = JSON.parse(text);
            if (json.error?.message) return `API Error (${status}): ${json.error.message}`;
        } catch { }
        return `API Error (${status}): ${text.slice(0, 250)}`;
    }

    _cleanOutputText(text) {
        let output = String(text || '');
        // Strip <think>...</think> reasoning blocks from DeepSeek R1 / Reasoning LLMs
        output = output.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        return output;
    }

    /* ===== TOKEN TRACKING ===== */
    _trackTokens(count) {
        const todayStr = new Date().toDateString();
        if (this.lastTokenDay !== todayStr) {
            this.tokenUsage.today = 0;
            this.lastTokenDay = todayStr;
        }
        this.tokenUsage.total += Math.round(count);
        this.tokenUsage.today += Math.round(count);
        this.saveSettings();
    }

    getTokenUsage() {
        return { ...this.tokenUsage };
    }

    /* ===== CONNECTION TEST ===== */
    async testConnection() {
        try {
            const result = await this.chat(
                [{ role: 'user', content: 'Say "OK" and nothing else.' }],
                { maxTokens: 10, temperature: 0 }
            );
            return { success: true, message: `Connected! Response: ${result.trim()}` };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }
}

// Global instance
window.llmProvider = new LLMProvider();
