/* ============================================================
   JARVIS LLM BRIDGE — dependency-free chat client
   Speaks to whichever provider the user configured. The API key
   arrives per-request from the browser (stored in localStorage)
   and is never written to disk.
   ============================================================ */

const https = require('node:https');

function post(urlString, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const payload = JSON.stringify(body);
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 400) {
            return reject(new Error(`LLM request failed (${res.statusCode}): ${data.slice(0, 400)}`));
          }
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`LLM returned non-JSON: ${data.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(120000, () => req.destroy(new Error('LLM request timed out')));
    req.write(payload);
    req.end();
  });
}

/* Maps the app's provider settings to a single chat call. */
class JarvisProvider {
  constructor({ provider = 'gemini', model, apiKey, baseUrl }) {
    this.provider = provider;
    this.model = model;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async chat(messages, options = {}) {
    if (!this.apiKey) throw new Error('No API key. Add one in the Jarvis settings panel.');
    switch (this.provider) {
      case 'gemini':
        return this._gemini(messages, options);
      case 'anthropic':
        return this._anthropic(messages, options);
      default:
        return this._openaiCompatible(messages, options);
    }
  }

  async _gemini(messages, options) {
    const model = this.model || 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const body = {
      contents,
      generationConfig: { temperature: options.temperature ?? 0.2, maxOutputTokens: options.maxTokens || 1500 },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };
    const json = await post(url, {}, body);
    const parts = json?.candidates?.[0]?.content?.parts || [];
    return parts.map((p) => p.text || '').join('').trim();
  }

  async _anthropic(messages, options) {
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const rest = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
    const json = await post(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01' },
      { model: this.model || 'claude-3-5-sonnet-latest', system, messages: rest, max_tokens: options.maxTokens || 1500, temperature: options.temperature ?? 0.2 }
    );
    return (json?.content || []).map((c) => c.text || '').join('').trim();
  }

  async _openaiCompatible(messages, options) {
    const base = String(this.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const url = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
    const json = await post(
      url,
      { Authorization: `Bearer ${this.apiKey}` },
      { model: this.model || 'gpt-4o', messages, temperature: options.temperature ?? 0.2, max_tokens: options.maxTokens || 1500 }
    );
    return String(json?.choices?.[0]?.message?.content || '').trim();
  }
}

module.exports = { JarvisProvider };
