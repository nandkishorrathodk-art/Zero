/* ============================================================
   WEB SEARCH SYSTEM — ZERO-BUILDER Studio v5
   Multi-Source Web Search System: Tavily + DuckDuckGo HTML +
   Wikipedia fallback, with events, dedupe, cancellation,
   result normalization, and safer offline behavior
   ============================================================ */

class WebSearchSystem {
    constructor(options = {}) {
        this.options = {
            historyLimit: 50,
            maxResults: 5,
            enableTavily: true,
            enableDuckDuckGo: true,
            enableWikipedia: true,
            ...options,
        };

        this.listeners = new Map();
        this.isSearching = false;
        this.activeSearchId = null;
        this.activeController = null;
        this.history = [];
    }

    /* =========================
       Event system
       ========================= */
    on(event, callback) {
        if (typeof callback !== 'function') return () => { };
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    once(event, callback) {
        const off = this.on(event, (data) => {
            off();
            callback(data);
        });
        return off;
    }

    off(event, callback) {
        const bucket = this.listeners.get(event);
        if (!bucket) return;
        bucket.delete(callback);
        if (bucket.size === 0) this.listeners.delete(event);
    }

    emit(event, data) {
        const bucket = this.listeners.get(event);
        if (!bucket || bucket.size === 0) return;

        for (const callback of bucket) {
            try {
                callback(data);
            } catch (error) {
                console.error(`[WebSearchSystem:${event}] listener error`, error);
            }
        }
    }

    /* =========================
       Public API
       ========================= */
    async search(query, options = {}) {
        const normalizedQuery = String(query || '').trim();
        if (!normalizedQuery) {
            throw new Error('Search query cannot be empty');
        }

        // Cancel any currently running search so the newest request wins.
        this.cancel();

        const searchId = `search_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.activeSearchId = searchId;
        this.activeController = new AbortController();
        this.isSearching = true;

        const startedAt = Date.now();
        const startedAtIso = new Date(startedAt).toISOString();

        this.emit('search:start', {
            id: searchId,
            query: normalizedQuery,
            timestamp: startedAtIso,
            source: 'system',
        });

        const providerOrder = this._resolveProviderOrder(options);
        const maxResults = Number.isFinite(options.maxResults) ? options.maxResults : this.options.maxResults;

        let results = [];
        let source = 'Offline fallback';

        try {
            for (const provider of providerOrder) {
                if (this._isCancelled(searchId)) break;

                try {
                    const providerResults = await provider.run(normalizedQuery, {
                        ...options,
                        maxResults,
                        signal: this.activeController.signal,
                    });

                    if (Array.isArray(providerResults) && providerResults.length) {
                        results = providerResults;
                        source = provider.name;
                        break;
                    }
                } catch (error) {
                    this.emit('search:provider-error', {
                        id: searchId,
                        provider: provider.name,
                        query: normalizedQuery,
                        message: error?.message || String(error),
                    });
                }
            }

            if (!results.length) {
                results = this._offlineFallback(normalizedQuery);
                source = 'Offline knowledge fallback';
            }

            results = this._normalizeResults(results, normalizedQuery, maxResults);
            results = this._dedupeResults(results);

            const entry = {
                id: searchId,
                query: normalizedQuery,
                source,
                count: results.length,
                results,
                timestamp: startedAtIso,
                durationMs: Date.now() - startedAt,
            };

            this._pushHistory(entry);

            this.emit('search:complete', entry);

            return entry;
        } finally {
            if (this.activeSearchId === searchId) {
                this.isSearching = false;
                this.activeSearchId = null;
                this.activeController = null;
            }
        }
    }

    cancel() {
        if (this.activeController) {
            try {
                this.activeController.abort();
            } catch {
                // ignore
            }
        }
        this.isSearching = false;
        this.activeSearchId = null;
        this.activeController = null;
        this.emit('search:cancel', {
            timestamp: new Date().toISOString(),
        });
    }

    clearHistory() {
        this.history = [];
        this.emit('history:clear', {
            timestamp: new Date().toISOString(),
        });
    }

    getHistory() {
        return [...this.history];
    }

    getLastSearch() {
        return this.history[0] || null;
    }

    /* =========================
       Provider resolution
       ========================= */
    _resolveProviderOrder(options) {
        const preferred = String(options.preferredSource || '').toLowerCase();
        const providers = [];

        const tavilyKey = this._getTavilyKey();
        const tavilyEnabled = this.options.enableTavily && tavilyKey && preferred !== 'duckduckgo' && preferred !== 'wikipedia';
        const ddgEnabled = this.options.enableDuckDuckGo && preferred !== 'wikipedia';
        const wikiEnabled = this.options.enableWikipedia;

        if (tavilyEnabled) {
            providers.push({
                name: 'Tavily API',
                run: (q, opts) => this._searchTavily(q, tavilyKey, opts),
            });
        }

        if (ddgEnabled) {
            providers.push({
                name: 'DuckDuckGo HTML',
                run: (q, opts) => this._searchDuckDuckGo(q, opts),
            });
        }

        if (wikiEnabled) {
            providers.push({
                name: 'Wikipedia',
                run: (q, opts) => this._searchWikipedia(q, opts),
            });
        }

        // Allow explicit preferred source to be first.
        if (preferred === 'tavily' && tavilyEnabled) {
            providers.sort((a, b) => (a.name === 'Tavily API' ? -1 : b.name === 'Tavily API' ? 1 : 0));
        } else if (preferred === 'duckduckgo' && ddgEnabled) {
            providers.sort((a, b) => (a.name === 'DuckDuckGo HTML' ? -1 : b.name === 'DuckDuckGo HTML' ? 1 : 0));
        } else if (preferred === 'wikipedia' && wikiEnabled) {
            providers.sort((a, b) => (a.name === 'Wikipedia' ? -1 : b.name === 'Wikipedia' ? 1 : 0));
        }

        return providers;
    }

    _getTavilyKey() {
        try {
            return localStorage.getItem('zb_tavily_key') || '';
        } catch {
            return '';
        }
    }

    _isCancelled(searchId) {
        return this.activeSearchId !== searchId || this.activeController?.signal?.aborted;
    }

    /* =========================
       Tavily
       ========================= */
    async _searchTavily(query, apiKey, options = {}) {
        const body = {
            api_key: apiKey,
            query,
            search_depth: options.searchDepth || 'advanced',
            include_answer: options.includeAnswer !== false,
            max_results: options.maxResults || this.options.maxResults,
            include_images: Boolean(options.includeImages),
        };

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: options.signal,
        });

        if (!response.ok) {
            throw new Error(`Tavily HTTP error ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : [];

        return results.map((r, index) => ({
            title: r.title || `Result ${index + 1}`,
            url: r.url || '#',
            snippet: r.content || r.snippet || r.raw_content || '',
            score: typeof r.score === 'number' ? r.score : 0.9,
            source: 'tavily',
        }));
    }

    /* =========================
       DuckDuckGo HTML
       ========================= */
    async _searchDuckDuckGo(query, options = {}) {
        // Lite/HTML endpoint is more scrape-friendly than the standard page.
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            method: 'GET',
            signal: options.signal,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });

        if (!response.ok) {
            throw new Error(`DuckDuckGo HTTP error ${response.status}`);
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const items = [];

        const anchors = Array.from(doc.querySelectorAll('a.result__a'));
        for (const anchor of anchors.slice(0, options.maxResults || this.options.maxResults)) {
            const title = this._cleanText(anchor.textContent);
            const url = anchor.href || '#';
            const result = anchor.closest('.result');
            const snippetEl = result?.querySelector('.result__snippet');
            const snippet = this._cleanText(snippetEl?.textContent || '');

            items.push({
                title: title || 'Search Result',
                url,
                snippet,
                score: 0.82,
                source: 'duckduckgo',
            });
        }

        return items;
    }

    /* =========================
       Wikipedia
       ========================= */
    async _searchWikipedia(query, options = {}) {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        const response = await fetch(searchUrl, {
            method: 'GET',
            signal: options.signal,
        });

        if (!response.ok) {
            throw new Error(`Wikipedia HTTP error ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data?.query?.search) ? data.query.search : [];

        if (!items.length) return [];

        const selected = items.slice(0, options.maxResults || this.options.maxResults);
        const results = [];

        for (const item of selected) {
            const title = item.title || 'Wikipedia Result';
            const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;

            results.push({
                title,
                url: pageUrl,
                snippet: this._cleanText(item.snippet || ''),
                score: 0.78,
                source: 'wikipedia',
            });
        }

        return results;
    }

    /* =========================
       Normalization / dedupe
       ========================= */
    _normalizeResults(results, query, maxResults) {
        const q = String(query || '').toLowerCase();
        const seen = new Set();
        const normalized = [];

        for (const result of results || []) {
            if (!result) continue;

            const title = this._cleanText(result.title || 'Search Result');
            const url = String(result.url || '#').trim();
            const snippet = this._cleanText(result.snippet || result.content || '');
            const source = String(result.source || 'unknown').toLowerCase();

            const signature = `${title.toLowerCase()}|${url}`;
            if (seen.has(signature)) continue;
            seen.add(signature);

            normalized.push({
                title,
                url,
                snippet,
                score: this._scoreResult({ title, snippet, source }, q, result.score),
                source,
            });
        }

        normalized.sort((a, b) => b.score - a.score);

        return normalized.slice(0, maxResults);
    }

    _dedupeResults(results) {
        const seen = new Set();
        const out = [];

        for (const result of results || []) {
            const sig = `${String(result.title || '').toLowerCase()}|${String(result.url || '').toLowerCase()}`;
            if (seen.has(sig)) continue;
            seen.add(sig);
            out.push(result);
        }

        return out;
    }

    _scoreResult(result, query, baseScore = 0) {
        const title = String(result.title || '').toLowerCase();
        const snippet = String(result.snippet || '').toLowerCase();
        const source = String(result.source || '').toLowerCase();

        let score = typeof baseScore === 'number' ? baseScore : 0.5;

        const terms = query.split(/\s+/).filter(Boolean);
        for (const term of terms) {
            if (title.includes(term)) score += 0.12;
            if (snippet.includes(term)) score += 0.06;
        }

        if (source === 'tavily') score += 0.08;
        if (source === 'duckduckgo') score += 0.04;
        if (source === 'wikipedia') score += 0.02;

        if (title.length < 80) score += 0.02;
        if (snippet.length > 20) score += 0.02;

        return score;
    }

    /* =========================
       Offline fallback
       ========================= */
    _offlineFallback(query) {
        const safeQuery = String(query || '').trim();
        return [
            {
                title: `Modern Best Practices: ${safeQuery}`,
                url: 'https://developer.mozilla.org',
                snippet: `Curated reference pattern for ${safeQuery}. Uses semantic markup, modern ESM, responsive layout, and performance-first CSS architecture.`,
                score: 0.95,
                source: 'knowledge-base',
            },
        ];
    }

    /* =========================
       History
       ========================= */
    _pushHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > this.options.historyLimit) {
            this.history.length = this.options.historyLimit;
        }
    }

    /* =========================
       Utils
       ========================= */
    _cleanText(text) {
        return String(text || '')
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

// Global Singleton
window.webSearchSystem = new WebSearchSystem();