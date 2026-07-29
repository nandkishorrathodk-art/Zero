/* ============================================================
   AUDIO-REACTIVE AGENT — Generates Web Audio API analysis
   bridge that feeds frequency band uniforms to Three.js shaders
   ============================================================ */

class CoderAudioAgent extends BaseAgent {
    constructor() {
        super(
            'CoderAudio',
            'Generates audio-reactive bridge: Web Audio API → shader uniforms'
        );

        this.config = {
            temperature: 0.6,
            maxTokens: 16384,
        };

        this.systemPrompt = `
You are an expert Web Audio API developer who creates audio-reactive visual bridges for Three.js scenes.

CORE TECHNIQUE — Audio Analysis → Shader Uniforms

1. AUDIO SOURCE
   - Option A: Microphone via navigator.mediaDevices.getUserMedia({ audio: true })
   - Option B: Audio file via new Audio(url) + audioContext.createMediaElementSource()
   - Option C: Simulated sine-wave fallback when no audio permission

2. ANALYSIS PIPELINE
   - AudioContext → createAnalyser()
   - analyser.fftSize = 64 (gives 32 frequency bins)
   - Uint8Array(analyser.frequencyBinCount) for frequency data
   - Each frame: analyser.getByteFrequencyData(dataArray)

3. FREQUENCY BANDS
   - Bass: average of bins 0-4 (low frequencies: kick, sub-bass)
   - Mid: average of bins 5-15 (vocals, melody, snare)
   - High: average of bins 16-31 (hi-hats, cymbals, brightness)
   - Normalize each to 0.0-1.0: band = avgBins / 255.0

4. SMOOTHING
   - Smooth with exponential lerp to prevent jitter:
   - smoothBass += (rawBass - smoothBass) * 0.12
   - Use different rates for attack (fast, 0.15) vs release (slow, 0.05)

5. OUTPUT — Uniform Bridge Object
   The audio bridge returns an object with:
   - update(): call each animation frame
   - values: { bass: 0-1, mid: 0-1, high: 0-1, volume: 0-1 }
   - connectToMaterial(shaderMaterial): auto-sets uBass, uMid, uHigh, uVolume
   - dispose(): cleanup AudioContext and streams

TEMPLATE PATTERN

function createAudioBridge(options) {
    let audioContext, analyser, source, dataArray;
    const values = { bass: 0, mid: 0, high: 0, volume: 0 };
    let isActive = false;

    async function init() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            isActive = true;
        } catch (e) {
            console.warn('Audio permission denied, using simulated audio');
            isActive = false; // Will use fallback simulation
        }
    }

    function update(time) {
        if (isActive && analyser) {
            analyser.getByteFrequencyData(dataArray);
            let bassSum = 0, midSum = 0, highSum = 0;
            for (let i = 0; i < 5; i++) bassSum += dataArray[i];
            for (let i = 5; i < 16; i++) midSum += dataArray[i];
            for (let i = 16; i < 32; i++) highSum += dataArray[i];
            const rawBass = bassSum / (5 * 255);
            const rawMid = midSum / (11 * 255);
            const rawHigh = highSum / (16 * 255);
            values.bass += (rawBass - values.bass) * 0.12;
            values.mid += (rawMid - values.mid) * 0.1;
            values.high += (rawHigh - values.high) * 0.08;
            values.volume = (values.bass + values.mid + values.high) / 3;
        } else {
            // Simulated audio fallback
            values.bass = 0.3 + Math.sin(time * 2.0) * 0.3;
            values.mid = 0.2 + Math.sin(time * 3.5 + 1.0) * 0.2;
            values.high = 0.15 + Math.sin(time * 5.0 + 2.0) * 0.15;
            values.volume = (values.bass + values.mid + values.high) / 3;
        }
    }

    function connectToMaterial(material) {
        if (material.uniforms) {
            if (material.uniforms.uBass) material.uniforms.uBass.value = values.bass;
            if (material.uniforms.uMid) material.uniforms.uMid.value = values.mid;
            if (material.uniforms.uHigh) material.uniforms.uHigh.value = values.high;
            if (material.uniforms.uVolume) material.uniforms.uVolume.value = values.volume;
        }
    }

    function dispose() {
        if (source && source.mediaStream) {
            source.mediaStream.getTracks().forEach(t => t.stop());
        }
        if (audioContext) audioContext.close();
    }

    return { init, update, values, connectToMaterial, dispose };
}

RULES

1. Output only valid JavaScript code.
2. No ES modules — use global function pattern.
3. Always include microphone fallback (simulated sine-wave).
4. Smooth values with exponential lerp — never raw jumps.
5. Provide connectToMaterial() helper for easy shader integration.
6. Provide dispose() for cleanup.
7. The bridge must work standalone — not dependent on Three.js.
8. Audio analysis runs in the same animation frame as the 3D render.
`.trim();
    }

    buildPrompt(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();
        const wantsMic = /microphone|mic|live|realtime|voice/i.test(blob);
        const wantsFile = /file|mp3|song|track|playlist/i.test(blob);

        return `
Create an audio-reactive bridge for a Three.js scene.

CONTEXT
${JSON.stringify(specification.artDirection || {}, null, 2)}

AUDIO SOURCE
${wantsMic ? '- Primary: Microphone input (getUserMedia)' : ''}
${wantsFile ? '- Primary: Audio file playback' : ''}
${!wantsMic && !wantsFile ? '- Primary: Microphone with simulated fallback' : ''}
- Always include sine-wave simulation fallback if audio is unavailable.

OUTPUT REQUIREMENTS
* Global function: createAudioBridge(options) returning { init, update, values, connectToMaterial, dispose }
* Values object: { bass: 0-1, mid: 0-1, high: 0-1, volume: 0-1 }
* Smoothed with exponential lerp (attack 0.12-0.15, release 0.05-0.08)
* connectToMaterial(mat) sets uBass, uMid, uHigh, uVolume on shader uniforms
* Proper dispose of AudioContext and media streams
* No ES modules. Output only JavaScript code.
`.trim();
    }

    buildFallback() {
        return `
function createAudioBridge(options) {
    const opts = options || {};
    let audioContext = null;
    let analyser = null;
    let source = null;
    let dataArray = null;
    let isActive = false;

    const values = { bass: 0, mid: 0, high: 0, volume: 0 };

    async function init() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.8;
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            if (opts.audioElement) {
                source = audioContext.createMediaElementSource(opts.audioElement);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                isActive = true;
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                isActive = true;
            }
        } catch (e) {
            console.warn('Audio unavailable, using simulation:', e.message);
            isActive = false;
        }
    }

    function update(time) {
        if (isActive && analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray);

            let bassSum = 0, midSum = 0, highSum = 0;
            for (let i = 0; i < 5; i++) bassSum += dataArray[i];
            for (let i = 5; i < 16; i++) midSum += dataArray[i];
            for (let i = 16; i < 32; i++) highSum += dataArray[i];

            const rawBass = bassSum / (5 * 255);
            const rawMid = midSum / (11 * 255);
            const rawHigh = highSum / (16 * 255);

            // Smooth with different attack/release
            const attackRate = 0.15;
            const releaseRate = 0.06;

            values.bass += ((rawBass > values.bass ? attackRate : releaseRate) * (rawBass - values.bass));
            values.mid += ((rawMid > values.mid ? attackRate : releaseRate) * (rawMid - values.mid));
            values.high += ((rawHigh > values.high ? attackRate : releaseRate) * (rawHigh - values.high));
        } else {
            // Simulated audio — organic sine-wave beats
            const t = time || 0;
            values.bass = 0.35 + Math.sin(t * 1.8) * 0.25 + Math.sin(t * 0.7) * 0.1;
            values.mid = 0.25 + Math.sin(t * 3.2 + 1.0) * 0.2 + Math.sin(t * 1.5 + 0.5) * 0.08;
            values.high = 0.15 + Math.sin(t * 5.5 + 2.0) * 0.12 + Math.sin(t * 2.3 + 1.2) * 0.06;
        }

        values.volume = (values.bass * 0.5 + values.mid * 0.3 + values.high * 0.2);
    }

    function connectToMaterial(material) {
        if (!material || !material.uniforms) return;
        if (material.uniforms.uBass !== undefined) material.uniforms.uBass.value = values.bass;
        if (material.uniforms.uMid !== undefined) material.uniforms.uMid.value = values.mid;
        if (material.uniforms.uHigh !== undefined) material.uniforms.uHigh.value = values.high;
        if (material.uniforms.uVolume !== undefined) material.uniforms.uVolume.value = values.volume;
    }

    function dispose() {
        if (source && source.mediaStream) {
            source.mediaStream.getTracks().forEach(function(t) { t.stop(); });
        }
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }
        audioContext = null;
        analyser = null;
        source = null;
        dataArray = null;
        isActive = false;
    }

    return { init: init, update: update, values: values, connectToMaterial: connectToMaterial, dispose: dispose, isActive: function() { return isActive; } };
}
`.trim();
    }

    validateCode(code) {
        const text = String(code || '');
        return {
            hasCreateBridge: /createAudioBridge/i.test(text),
            hasAudioContext: /AudioContext/i.test(text),
            hasAnalyser: /createAnalyser|AnalyserNode/i.test(text),
            hasFrequencyData: /getByteFrequencyData|frequencyBinCount/i.test(text),
            hasBands: /bass|mid|high/i.test(text),
            hasDispose: /dispose/i.test(text),
            hasFallback: /simulat|fallback|sine|Math\.sin/i.test(text),
        };
    }

    async execute(specification = {}, designSystem = null) {
        this.log('info', 'Creating audio-reactive bridge...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Audio bridge LLM call failed: ${error.message} — using fallback`);
            return this.buildFallback();
        }

        let code = this.extractCode(response, 'javascript');
        code = String(code || '').trim()
            .replace(/^```(?:javascript|js)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        const validation = this.validateCode(code);

        if (!validation.hasCreateBridge || !validation.hasAudioContext || !validation.hasBands) {
            this.log('warning', 'Generated audio code incomplete — using fallback');
            return this.buildFallback();
        }

        if (!validation.hasFallback) {
            this.log('warning', 'Audio code missing simulation fallback — user may get silence without mic');
        }

        this.log('success', 'Audio-reactive bridge generated');
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderAudioAgent = CoderAudioAgent;
}
