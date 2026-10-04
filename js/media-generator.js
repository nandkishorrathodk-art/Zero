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
            'gemini': { endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent', model: 'gemini-2.5-flash-image' },
            'stability': { endpoint: 'https://api.stability.ai/v2beta/stable-image/generate/sd3', model: 'sd3-large' },
        };
    }

    static CINEMATIC_ASSETS = {
        'luxury': {
            videos: [
                'https://assets.mixkit.co/videos/preview/mixkit-reflection-of-a-watch-on-a-black-table-41484-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-black-and-gold-particles-floating-28701-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-clock-moving-fast-41476-large.mp4'
            ],
            images: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1920&q=85'
            ]
        },
        'beverage': {
            videos: [
                'https://assets.mixkit.co/videos/preview/mixkit-pouring-a-drink-into-a-glass-with-ice-42435-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-bubbles-in-a-carbonated-drink-41434-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-espresso-pouring-into-a-glass-cup-41517-large.mp4'
            ],
            images: [
                'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1920&q=85'
            ]
        },
        'automotive': {
            videos: [
                'https://assets.mixkit.co/videos/preview/mixkit-headlights-of-a-car-in-the-night-42472-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-a-city-at-night-41551-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-tunnel-lights-passing-by-in-a-car-41549-large.mp4'
            ],
            images: [
                'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1920&q=85'
            ]
        },
        'tech': {
            videos: [
                'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-data-31911-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-blue-laser-lines-grid-31656-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-31742-large.mp4'
            ],
            images: [
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1920&q=85'
            ]
        },
        'fashion': {
            videos: [
                'https://assets.mixkit.co/videos/preview/mixkit-model-walking-on-a-runway-41480-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-with-sunglasses-in-a-studio-41474-large.mp4'
            ],
            images: [
                'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85'
            ]
        },
        'architecture': {
            videos: [
                'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-modern-city-skyscrapers-41553-large.mp4'
            ],
            images: [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=85'
            ]
        },
        'cinematic': {
            videos: [
                'https://assets.mixkit.co/videos/preview/mixkit-smoke-moving-in-slow-motion-in-the-dark-41472-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-golden-dust-particles-moving-in-the-air-41432-large.mp4',
                'https://assets.mixkit.co/videos/preview/mixkit-liquid-mercury-bubbles-slow-motion-41487-large.mp4'
            ],
            images: [
                'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1920&q=85',
                'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85'
            ]
        }
    };

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

        if (provider === 'gemini' && apiKey) {
            try {
                return await this._generateWithGemini(item, apiKey);
            } catch (e) {
                console.warn('[MediaGenerator] Gemini image generation failed, falling back:', e.message);
            }
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

    /* ===== GOOGLE GEMINI (Nano Banana / gemini-2.5-flash-image) ===== */
    async _generateWithGemini(item, apiKey) {
        const cfg = this.imageProviders.gemini;
        const response = await fetch(`${cfg.endpoint}?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: this._enhancePrompt(item.prompt, item.style) }] }],
                generationConfig: { responseModalities: ['IMAGE'] },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini Image API error ${response.status}: ${errText.slice(0, 200)}`);
        }

        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p) => p.inlineData || p.inline_data);
        const inline = imagePart?.inlineData || imagePart?.inline_data;
        if (!inline?.data) throw new Error('Gemini returned no image data');

        return {
            type: 'image',
            url: `data:${inline.mimeType || inline.mime_type || 'image/png'};base64,${inline.data}`,
            format: 'base64',
            prompt: item.prompt,
            provider: 'gemini-image',
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

    /* ===== PLACEHOLDERS / CURATED 4K MEDIA ===== */
    _resolveCategory(prompt) {
        const text = String(prompt || '').toLowerCase();
        if (/beverage|drink|coffee|tea|wine|beer|bar|cocktail|water|soda|cup|pour|juice|liquid|cafe/i.test(text)) return 'beverage';
        if (/watch|jewelry|luxury|gold|perfume|diamond|silk|elegance|gem|prestige|timepiece/i.test(text)) return 'luxury';
        if (/car|auto|motor|vehicle|drive|speed|mechanic|supercar|porsche|ferrari|bmw|racing|engine/i.test(text)) return 'automotive';
        if (/ai|tech|code|cyber|software|saas|cloud|app|data|crypto|robot|neural|matrix|digital|future|quantum/i.test(text)) return 'tech';
        if (/fashion|apparel|clothing|shoe|sneaker|model|streetwear|wear|runway|dress|outfit/i.test(text)) return 'fashion';
        if (/architecture|interior|villa|building|home|real-estate|house|space|minimal|loft|concrete/i.test(text)) return 'architecture';
        return 'cinematic';
    }

    _getPlaceholderImage(item) {
        const cat = this._resolveCategory(item.prompt || item.usage || '');
        const pool = MediaGenerator.CINEMATIC_ASSETS[cat] || MediaGenerator.CINEMATIC_ASSETS['cinematic'];
        const images = pool.images;
        const hash = Math.abs(String(item.id || item.usage || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
        const imgUrl = images[hash % images.length] || images[0];
        return {
            type: 'image',
            url: imgUrl,
            format: 'url',
            prompt: item.prompt || `Cinematic 4K ${cat} visual`,
            provider: 'cinematic-curated',
            isPlaceholder: false,
        };
    }

    _getPlaceholderVideo(item) {
        const cat = this._resolveCategory(item.prompt || item.usage || '');
        const pool = MediaGenerator.CINEMATIC_ASSETS[cat] || MediaGenerator.CINEMATIC_ASSETS['cinematic'];
        const videos = pool.videos;
        const posters = pool.images;
        const hash = Math.abs(String(item.id || item.usage || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0));
        const vUrl = videos[hash % videos.length] || videos[0];
        const pUrl = posters[0];
        return {
            type: 'video',
            url: vUrl,
            poster: pUrl,
            format: 'url',
            prompt: item.prompt || `Cinematic ${cat} video loop`,
            provider: 'cinematic-curated',
            isPlaceholder: false,
        };
    }

    autoPopulateKit(specification) {
        const title = specification.title || '';
        const desc = specification.description || specification.userPrompt || '';
        const cat = this._resolveCategory(`${title} ${desc}`);
        return {
            videos: [
                { id: 'hero_video', prompt: `Cinematic ${cat} hero video loop`, usage: 'hero', style: 'cinematic' },
                { id: 'scrub_video', prompt: `Scroll-scrubbed ${cat} showcase video`, usage: 'scroll-scrub', style: 'cinematic' }
            ],
            images: [
                { id: 'hero_poster', prompt: `Ultra-realistic 4K ${cat} hero poster`, usage: 'hero-poster', style: 'photorealistic' },
                { id: 'product_1', prompt: `Masterpiece ${cat} product angle 1`, usage: 'product', style: 'photorealistic' },
                { id: 'product_2', prompt: `Masterpiece ${cat} product angle 2`, usage: 'product', style: 'photorealistic' },
                { id: 'product_3', prompt: `Masterpiece ${cat} product angle 3`, usage: 'product', style: 'photorealistic' },
                { id: 'ambient_bg', prompt: `Cinematic atmospheric texture ${cat}`, usage: 'background', style: 'cinematic' }
            ]
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
