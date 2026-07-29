/* ============================================================
   MEDIA GENERATOR — AI Image & Video Generation Module
   Supports: OpenAI DALL-E 3, Stability AI, Pexels (stock),
   Pixabay (stock), and AI video generation APIs
   ============================================================ */

class MediaGenerator {
    constructor(llmProvider) {
        this.llm = llmProvider;
        
        /* Generated assets stored as { id: { url, type, prompt } } */
        this.generatedAssets = {};

        /* Stock video/image API keys */
        this.pexelsApiKey = localStorage.getItem('zb_pexels_key') || '';
        this.stabilityApiKey = localStorage.getItem('zb_stability_key') || '';

        /* Providers that support image generation */
        this.imageProviders = {
            'openai': { endpoint: 'https://api.openai.com/v1/images/generations', model: 'dall-e-3' },
            'gemini': { endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', model: 'gemini-2.0-flash-exp' },
            'stability': { endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/sd3', model: 'sd3-large' },
        };
    }

    /* ===== MAIN: Generate all media from spec ===== */
    async generateMedia(mediaNeeds, onProgress) {
        const results = {};

        if (!mediaNeeds) return results;

        const allItems = [
            ...(mediaNeeds.images || []).map(i => ({ ...i, type: 'image' })),
            ...(mediaNeeds.videos || []).map(v => ({ ...v, type: 'video' })),
            ...(mediaNeeds.svgs || []).map(s => ({ ...s, type: 'svg' })),
        ];

        if (allItems.length === 0) return results;

        for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i];
            onProgress?.(`Generating ${item.type}: ${item.id} (${i + 1}/${allItems.length})`);

            try {
                if (item.type === 'image') {
                    results[item.id] = await this._generateImage(item);
                } else if (item.type === 'video') {
                    results[item.id] = await this._getVideo(item);
                } else if (item.type === 'svg') {
                    results[item.id] = await this._generateSVG(item);
                }
            } catch (e) {
                console.warn(`Media generation failed for ${item.id}:`, e.message);
                // Fallback to placeholder
                results[item.id] = item.type === 'image'
                    ? this._getPlaceholderImage(item)
                    : item.type === 'svg' ? this._getPlaceholderSVG(item) : this._getPlaceholderVideo(item);
            }
        }

        this.generatedAssets = { ...this.generatedAssets, ...results };
        return results;
    }

    /* ===== IMAGE GENERATION ===== */
    async _generateImage(item) {
        const provider = this.llm.currentProvider;
        const apiKey = this.llm.getApiKey();

        // Try AI image generation first
        if (provider === 'openai' && apiKey) {
            return await this._generateWithOpenAI(item, apiKey);
        }

        if (this.stabilityApiKey) {
            return await this._generateWithStability(item);
        }

        // Fallback: try Pexels stock photos
        if (this.pexelsApiKey) {
            return await this._searchPexels(item, 'photos');
        }

        // Final fallback: generate a CSS gradient placeholder
        return this._getPlaceholderImage(item);
    }

    /* ===== OPENAI DALL-E 3 ===== */
    async _generateWithOpenAI(item, apiKey) {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: this._enhancePrompt(item.prompt, item.style),
                n: 1,
                size: item.usage?.includes('hero') ? '1792x1024' : '1024x1024',
                quality: 'hd',
                response_format: 'b64_json',
            }),
        });

        if (!response.ok) throw new Error(`OpenAI Image API error: ${response.status}`);
        const data = await response.json();
        const b64 = data.data[0].b64_json;

        return {
            type: 'image',
            url: `data:image/png;base64,${b64}`,
            format: 'base64',
            prompt: item.prompt,
            provider: 'openai-dalle3',
        };
    }

    /* ===== STABILITY AI ===== */
    async _generateWithStability(item) {
        const formData = new FormData();
        formData.append('prompt', this._enhancePrompt(item.prompt, item.style));
        formData.append('output_format', 'png');
        formData.append('aspect_ratio', item.usage?.includes('hero') ? '16:9' : '1:1');

        const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.stabilityApiKey}`,
                'Accept': 'image/*',
            },
            body: formData,
        });

        if (!response.ok) throw new Error(`Stability API error: ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        return {
            type: 'image',
            url: url,
            format: 'blob',
            prompt: item.prompt,
            provider: 'stability-sd3',
        };
    }

    /* ===== SVG/VECTOR GENERATION (via LLM) ===== */
    async _generateSVG(item) {
        const prompt = `Return ONLY valid SVG XML code for this request: ${item.prompt}. 
Make it modern, minimalist, and use a viewBox. Do not include markdown formatting or explanation, just the raw <svg>...</svg> string.`;
        
        try {
            const response = await this.llm.chat([{ role: 'user', content: prompt }], { temperature: 0.7 });
            let svgStr = response; // chat returns the string directly
            if (svgStr.includes('<svg')) {
                svgStr = svgStr.substring(svgStr.indexOf('<svg'), svgStr.lastIndexOf('</svg>') + 6);
            } else {
                throw new Error("Invalid SVG generated");
            }
            
            const encodedSvg = encodeURIComponent(svgStr);
            const dataUri = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
            
            return {
                url: dataUri,
                type: 'svg',
                prompt: item.prompt,
                provider: 'llm-direct',
            };
        } catch (e) {
            console.warn('SVG generation failed:', e);
            throw e;
        }
    }

    _getPlaceholderSVG(item) {
        const svgStr = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#333">Logo</text></svg>`;
        return {
            url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`,
            type: 'svg',
            prompt: item.prompt,
            provider: 'placeholder',
        };
    }

    /* ===== PEXELS STOCK (Free) ===== */
    async _searchPexels(item, mediaType = 'photos') {
        const query = this._extractSearchQuery(item.prompt);
        const endpoint = mediaType === 'videos'
            ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`
            : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

        const response = await fetch(endpoint, {
            headers: { 'Authorization': this.pexelsApiKey },
        });

        if (!response.ok) throw new Error(`Pexels API error: ${response.status}`);
        const data = await response.json();

        if (mediaType === 'videos' && data.videos?.length > 0) {
            const video = data.videos[0];
            const file = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
            return {
                type: 'video',
                url: file.link,
                format: 'url',
                prompt: item.prompt,
                provider: 'pexels-stock',
                poster: video.image,
            };
        }

        if (data.photos?.length > 0) {
            return {
                type: 'image',
                url: data.photos[0].src.original,
                format: 'url',
                prompt: item.prompt,
                provider: 'pexels-stock',
            };
        }

        throw new Error('No results found on Pexels');
    }

    /* ===== VIDEO GENERATION / STOCK ===== */
    async _getVideo(item) {
        // Try Pexels stock video first (free, fast)
        if (this.pexelsApiKey) {
            try {
                return await this._searchPexels(item, 'videos');
            } catch (e) { /* continue to fallback */ }
        }

        // Fallback: generate a CSS animated background as a "video"
        return this._getPlaceholderVideo(item);
    }

    /* ===== PLACEHOLDERS ===== */
    _getPlaceholderImage(item) {
        // Generate a beautiful SVG placeholder with gradients
        const colors = this._getPlaceholderColors(item.style);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
                </linearGradient>
                <radialGradient id="g2" cx="30%" cy="40%" r="50%">
                    <stop offset="0%" style="stop-color:${colors[1]};stop-opacity:0.4" />
                    <stop offset="100%" style="stop-color:transparent;stop-opacity:0" />
                </radialGradient>
            </defs>
            <rect width="1920" height="1080" fill="url(#g1)" />
            <rect width="1920" height="1080" fill="url(#g2)" />
            <circle cx="600" cy="400" r="200" fill="${colors[1]}" opacity="0.15" />
            <circle cx="1400" cy="600" r="300" fill="${colors[2]}" opacity="0.1" />
        </svg>`;

        const b64 = btoa(unescape(encodeURIComponent(svg)));

        return {
            type: 'image',
            url: `data:image/svg+xml;base64,${b64}`,
            format: 'svg-base64',
            prompt: item.prompt,
            provider: 'placeholder',
            isPlaceholder: true,
        };
    }

    _getPlaceholderVideo(item) {
        // Return CSS animation instructions instead of actual video
        return {
            type: 'video',
            url: '',
            format: 'css-animation',
            prompt: item.prompt,
            provider: 'css-placeholder',
            isPlaceholder: true,
            cssCode: `
                background: linear-gradient(-45deg, #0a0a0f, #1a1a2e, #0a0a0f, #16213e);
                background-size: 400% 400%;
                animation: gradientShift 15s ease infinite;
            `,
        };
    }

    _getPlaceholderColors(style) {
        const palettes = {
            'photorealistic': ['#0a0a1a', '#1a1a3e', '#0f0f2e'],
            'illustration': ['#1a0a2e', '#2d1b4e', '#0a1e3e'],
            'abstract': ['#0f0f1e', '#1e0a3e', '#0a2e1e'],
            '3d-render': ['#0a0a0f', '#1a0a2e', '#0a1a2e'],
            'cinematic': ['#0a0a0f', '#1a1a1a', '#0f0a1a'],
        };
        return palettes[style] || palettes['abstract'];
    }

    /* ===== HELPERS ===== */
    _enhancePrompt(prompt, style) {
        const styleInstructions = {
            'photorealistic': 'Ultra-realistic, 8K, cinematic lighting, professional photography, no text, no watermarks',
            'illustration': 'Modern digital illustration, clean lines, vibrant colors, professional quality',
            'abstract': 'Abstract, artistic, gradient colors, minimal, modern design, no text',
            '3d-render': '3D rendered, octane render, cinema 4D, photorealistic materials, studio lighting',
        };
        return `${prompt}. ${styleInstructions[style] || styleInstructions['abstract']}. Suitable for a premium website.`;
    }

    _extractSearchQuery(prompt) {
        // Extract key nouns for stock search
        const stopWords = ['a', 'an', 'the', 'with', 'for', 'and', 'or', 'in', 'on', 'at', 'to', 'of', 'is', 'premium', 'website', 'hero', 'background', 'matching', 'image', 'photo'];
        return prompt.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .filter(w => w.length > 2 && !stopWords.includes(w))
            .slice(0, 4)
            .join(' ');
    }

    /* ===== INJECT MEDIA INTO FILES ===== */
    injectMediaIntoFiles(files, assets) {
        if (!assets || Object.keys(assets).length === 0) return files;

        const updated = { ...files };

        for (const [id, asset] of Object.entries(assets)) {
            if ((asset.type === 'image' || asset.type === 'svg') && asset.url) {
                // Replace placeholder references in all files
                for (const filename of Object.keys(updated)) {
                    if (typeof updated[filename] !== 'string') continue;

                    // Replace {{media:id}} placeholders
                    updated[filename] = updated[filename].replace(
                        new RegExp(`\\{\\{media:${id}\\}\\}`, 'g'),
                        asset.url
                    );

                    // Replace generic image placeholders
                    updated[filename] = updated[filename].replace(
                        new RegExp(`PLACEHOLDER_IMAGE_${id.toUpperCase()}`, 'g'),
                        asset.url
                    );
                }
            }

            if (asset.type === 'video' && asset.format === 'url' && asset.url) {
                for (const filename of Object.keys(updated)) {
                    if (typeof updated[filename] !== 'string') continue;
                    updated[filename] = updated[filename].replace(
                        new RegExp(`\\{\\{media:${id}\\}\\}`, 'g'),
                        asset.url
                    );
                }
            }
        }

        return updated;
    }

    /* ===== SETTINGS ===== */
    saveSettings() {
        localStorage.setItem('zb_pexels_key', this.pexelsApiKey);
        localStorage.setItem('zb_stability_key', this.stabilityApiKey);
    }
}

window.MediaGenerator = MediaGenerator;
