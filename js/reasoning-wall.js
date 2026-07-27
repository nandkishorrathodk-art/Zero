/* ============================================================
   DEEP REASONING & WEB SEARCH WALL HUD — ZERO-BUILDER Studio v4
   Real-Time Visual Thinking Panel + Live Research Cards
   ============================================================ */

class ReasoningWallHUD {
    constructor() {
        this.wallEl = null;
        this.searchWallEl = null;
        this.isVisible = false;
        this.thoughts = [];
        this.searchResults = [];
        this.init();
    }

    init() {
        this.createWallElements();
        this.bindFrameworkEvents();
    }

    createWallElements() {
        // 1. Deep Reasoning Panel
        if (!document.getElementById('deep-reasoning-wall')) {
            const panel = document.createElement('div');
            panel.id = 'deep-reasoning-wall';
            panel.className = 'hud-panel reasoning-wall-panel hidden';
            panel.innerHTML = `
                <div class="hud-header">
                    <div class="hud-title">
                        <span class="hud-badge pulse">AI BRAIN</span>
                        <i data-lucide="brain-circuit"></i>
                        <span>Deep Reasoning Engine</span>
                    </div>
                    <div class="hud-actions">
                        <button class="hud-toggle-btn" id="btn-toggle-reasoning" title="Toggle Compact/Expanded">
                            <i data-lucide="minimize-2"></i>
                        </button>
                    </div>
                </div>
                <div class="hud-body" id="reasoning-wall-body">
                    <div class="reasoning-empty">
                        <i data-lucide="sparkles"></i>
                        <p>Waiting for prompt to initiate deep reasoning sequence...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
            this.wallEl = panel;
        }

        // 2. Web Search Wall Panel
        if (!document.getElementById('web-search-wall')) {
            const searchPanel = document.createElement('div');
            searchPanel.id = 'web-search-wall';
            searchPanel.className = 'hud-panel search-wall-panel hidden';
            searchPanel.innerHTML = `
                <div class="hud-header">
                    <div class="hud-title">
                        <span class="hud-badge search-badge">LIVE SEARCH</span>
                        <i data-lucide="globe"></i>
                        <span>Web Search Wall</span>
                    </div>
                    <div class="hud-actions">
                        <span class="search-status-tag" id="search-status-tag">Idle</span>
                    </div>
                </div>
                <div class="hud-body" id="search-wall-body">
                    <div class="search-empty">
                        <p>No active web queries executed yet</p>
                    </div>
                </div>
            `;
            document.body.appendChild(searchPanel);
            this.searchWallEl = searchPanel;
        }

        // Initialize lucide icons if available
        if (window.lucide) window.lucide.createIcons();
    }

    bindFrameworkEvents() {
        // Connect to AgentFramework instance if available
        const checkAndBind = () => {
            if (window.agentFramework) {
                window.agentFramework.on('progress', (data) => this.onProgress(data));
                window.agentFramework.on('log', (data) => this.onLog(data));
                window.agentFramework.on('specReady', (spec) => this.onSpecReady(spec));
                window.agentFramework.on('stateChange', (state) => this.onStateChange(state));
            }
        };

        checkAndBind();
        document.addEventListener('DOMContentLoaded', checkAndBind);

        // Connect WebSearchSystem events
        if (window.webSearchSystem) {
            window.webSearchSystem.on('search:start', (data) => this.onSearchStart(data));
            window.webSearchSystem.on('search:complete', (data) => this.onSearchComplete(data));
        }
    }

    onStateChange(state) {
        if (this.wallEl) {
            this.wallEl.classList.remove('hidden');
        }
        this.addThought('state', `Agent State Transition → <strong>${state}</strong>`);
    }

    onProgress(data) {
        if (this.wallEl) this.wallEl.classList.remove('hidden');
        this.addThought('progress', `[${data.step.toUpperCase()}] ${data.message} (${data.percent}%)`);
    }

    onLog(data) {
        if (this.wallEl) this.wallEl.classList.remove('hidden');
        this.addThought(data.type || 'info', data.message);
    }

    onSpecReady(spec) {
        if (spec.brandStrategy) {
            this.addThought('strategy', `🎯 <strong>Brand Positioning:</strong> ${spec.brandStrategy.brand?.tagline || 'Custom Positioning'}`);
        }
        if (spec.artDirection) {
            this.addThought('art', `🎨 <strong>Art Direction Locked:</strong> ${spec.artDirection.visualMood || spec.mood || 'Custom Theme'}`);
        }
    }

    addThought(type, text) {
        const body = document.getElementById('reasoning-wall-body');
        if (!body) return;

        // Remove empty state
        const empty = body.querySelector('.reasoning-empty');
        if (empty) empty.remove();

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const item = document.createElement('div');
        item.className = `thought-item thought-${type}`;
        item.innerHTML = `
            <span class="thought-time">${time}</span>
            <span class="thought-text">${text}</span>
        `;

        body.appendChild(item);
        body.scrollTop = body.scrollHeight;

        // Keep last 40 items max
        while (body.children.length > 40) {
            body.removeChild(body.firstChild);
        }
    }

    onSearchStart(data) {
        if (this.searchWallEl) this.searchWallEl.classList.remove('hidden');
        const tag = document.getElementById('search-status-tag');
        if (tag) {
            tag.textContent = 'Searching...';
            tag.className = 'search-status-tag searching';
        }
    }

    onSearchComplete(data) {
        if (this.searchWallEl) this.searchWallEl.classList.remove('hidden');
        const tag = document.getElementById('search-status-tag');
        if (tag) {
            tag.textContent = `${data.count} Results (${data.source})`;
            tag.className = 'search-status-tag complete';
        }

        const body = document.getElementById('search-wall-body');
        if (!body) return;

        const empty = body.querySelector('.search-empty');
        if (empty) empty.remove();

        const card = document.createElement('div');
        card.className = 'search-card';
        card.innerHTML = `
            <div class="search-card-header">
                <span class="search-card-query">🔍 "${data.query}"</span>
                <span class="search-card-source">${data.source}</span>
            </div>
            <div class="search-card-results">
                ${data.results.map(r => `
                    <div class="search-result-item">
                        <a href="${r.url}" target="_blank" rel="noopener" class="result-title">${r.title}</a>
                        <p class="result-snippet">${r.snippet}</p>
                    </div>
                `).join('')}
            </div>
        `;

        body.prepend(card);
    }
}

// Auto Instantiate
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.reasoningWall = new ReasoningWallHUD());
} else {
    window.reasoningWall = new ReasoningWallHUD();
}
