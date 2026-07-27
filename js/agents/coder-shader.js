/* ============================================================
SHADER WIZARD AGENT — Writes raw GLSL fragment and vertex
shaders for React Three Fiber to create premium liquid,
distortion, and particle mesh effects.
============================================================ */

class CoderShaderAgent extends BaseAgent {
    constructor() {
        super('ShaderWizard', 'Generates hardcore mathematical GLSL WebGL shaders for R3F');

        this.config = {
            temperature: 0.62,
            maxTokens: 32768,
            maxEffects: 5,
            maxUniforms: 8,
            maxFileChars: 22000,
            headChars: 14000,
            tailChars: 3500,
        };

        this.systemPrompt = `
You are a master WebGL Shader Wizard who creates breathtaking, math-heavy visual effects for premium websites.

Write raw GLSL code wrapped in a React Three Fiber component.

SPECIALTY

* Mathematical distortion (Simplex/Perlin noise, Voronoi)
* Liquid and fluid simulations in fragment shaders
* Custom glowing particle meshes using vertex shaders
* Melting glass / chromatic aberration effects
* Interactive shader fields with mouse trail distortions

RULES

1. Think through the mathematical approach before coding.
2. Only use shaderMaterial from @react-three/drei or standard THREE.ShaderMaterial.
3. Provide valid GLSL syntax for vertexShader and fragmentShader.
4. Expose uniforms for time, mouse, resolution, and colors.
5. Output a self-contained React component that can be dropped into an existing <Canvas>.
6. Keep it highly optimized and avoid heavy branching in fragments.
7. Output only code.
8. Do not output JSON.

OUTPUT FORMAT
**File: src/components/ShaderScene.tsx**
\`\`\`tsx
import { Canvas } from '@react-three/fiber'
// ... code here ...
\`\`\`
`.trim();
    }

    detectEffectNeeds(specification = {}) {
        const blob = JSON.stringify(specification || {}).toLowerCase();

        const effects = Array.isArray(specification.shaderEffects) && specification.shaderEffects.length
            ? specification.shaderEffects.slice(0, this.config.maxEffects)
            : Array.isArray(specification.threeDEffects) && specification.threeDEffects.length
                ? specification.threeDEffects.slice(0, this.config.maxEffects)
                : ['liquid-distortion', 'soft-particles'];

        const palette = specification.colorPalette || {};
        const complexity = String(specification.complexity || 'medium');
        const siteType = String(specification.siteType || specification.siteArchetype || 'premium');
        const mood = String(specification.mood || 'cinematic');

        const needsMouse = /interactive|mouse|cursor|parallax|reactive|trail/.test(blob);
        const needsParticles = /particle|bokeh|stars|firefly|mesh/.test(blob);
        const needsLiquid = /liquid|fluid|gel|glass|melt|distortion|refraction/.test(blob);
        const needsScroll = /scroll|scrub|camera|parallax/.test(blob);

        return {
            effects,
            complexity,
            siteType,
            mood,
            needsMouse,
            needsParticles,
            needsLiquid,
            needsScroll,
            primary: palette.primary || '#7C3AED',
            secondary: palette.secondary || '#0EA5E9',
            accent: palette.accent || '#FDE68A',
            background: palette.background || '#050816',
            blob,
        };
    }

    buildPrompt(specification = {}) {
        const hints = this.detectEffectNeeds(specification);
        const motionSystems = Array.isArray(specification.motionSystems) ? specification.motionSystems : [];
        const artDirection = specification.artDirection || {};
        const qualityContract = specification.qualityContract || {};

        return `
Create a cinematic React Three Fiber shader component for a ${hints.siteType} website.

PROJECT CONTEXT
${JSON.stringify(specification || {}, null, 2)}

ART DIRECTION
${JSON.stringify(artDirection, null, 2)}

QUALITY CONTRACT
${JSON.stringify(qualityContract, null, 2)}

MOTION SYSTEMS
${motionSystems.length ? motionSystems.join(', ') : 'n/a'}

REQUIRED EFFECTS
${hints.effects.join(', ')}

PALETTE
* Primary: ${hints.primary}
* Secondary: ${hints.secondary}
* Accent: ${hints.accent}
* Background: ${hints.background}

MOOD
${hints.mood}

SHADER REQUIREMENTS

* Build a single self-contained React component for R3F.
* Include a mesh using shaderMaterial or THREE.ShaderMaterial.
* Provide uniforms for uTime, uMouse, uResolution, uColorA, uColorB, uColorC.
* Add responsive handling and smooth mouse interaction.
* Support transparent background when appropriate.
* Keep the implementation efficient and production-safe.
* If the direction calls for it, include a subtle post-processing-ready composition style, but do not depend on unavailable imports unless they are standard R3F / drei.
* Avoid heavy branching, unnecessary loops, and overly expensive noise layers.
* Prefer elegant math and readable shader code over gimmicks.

ADVANCED NOTES
${hints.needsLiquid ? '- Favor refraction, Fresnel, turbulence, soft normal perturbation, and chromatic offset.' : ''}
${hints.needsParticles ? '- Use Points or lightweight instancing only if needed, and keep counts modest.' : ''}
${hints.needsMouse ? '- Mouse input should influence distortion, velocity, or parallax in a subtle way.' : ''}
${hints.needsScroll ? '- Expose a progress uniform or prop if the scene should support scroll-linked animation.' : ''}

CRITICAL FORMAT

* Output only code.
* Do not wrap in JSON.
* Do not include commentary.
* The result must be a React component that can be dropped into an existing <Canvas>.
`.trim();
    }

    normalizeCode(code) {
        let output = String(code || '').trim();

        output = output
            .replace(/^```(?:tsx|ts|javascript|js|jsx|tsx)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        return output;
    }

    ensureEntryPoint(code) {
        const text = String(code || '');

        if (/\bexport\s+default\s+function\s+ShaderScene\b/.test(text) || /\bfunction\s+ShaderScene\b/.test(text)) {
            return text;
        }

        if (/\bexport\s+default\s+/.test(text)) {
            return text;
        }

        // If the model only returned shader snippets, wrap them in a component shell.
        return `
import * as THREE from 'three'
import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

${text}
`.trim();
    }

    validateCode(code) {
        const text = String(code || '');
        const checks = {
            hasReact: /\bimport\s+React\b|\breact\b/i.test(text),
            hasR3F: /@react-three\/fiber/.test(text),
            hasShaderMaterial: /shaderMaterial|ShaderMaterial/.test(text),
            hasVertexShader: /vertexShader\s*:/.test(text) || /const\s+vertexShader\s*=/.test(text),
            hasFragmentShader: /fragmentShader\s*:/.test(text) || /const\s+fragmentShader\s*=/.test(text),
            hasUniforms: /uniforms\s*:|uTime|uMouse|uResolution/.test(text),
        };

        return checks;
    }

    buildFallbackComponent(specification = {}) {
        const hints = this.detectEffectNeeds(specification);

        return `
import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const ShaderMaterialImpl = shaderMaterial(
{
uTime: 0,
uMouse: new THREE.Vector2(0, 0),
uResolution: new THREE.Vector2(1, 1),
uColorA: new THREE.Color('${hints.primary}'),
uColorB: new THREE.Color('${hints.secondary}'),
uColorC: new THREE.Color('${hints.accent}')
},
/* glsl */\`
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vUv = uv;
  vPosition = position;
  vec3 pos = position;

  float t = uTime * 0.35;
  float n = noise(pos.xy * 1.75 + t);
  pos.z += (n - 0.5) * 0.18;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
\`,
/* glsl */\`
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = vUv;
  vec2 mouse = uMouse;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);

  vec2 p = (uv - 0.5) * aspect;
  float len = length(p);
  float radial = smoothstep(0.75, 0.0, len);

  float n1 = noise(uv * 3.0 + uTime * 0.08);
  float n2 = noise(uv * 6.0 - uTime * 0.15);
  float ripple = sin((uv.y + uTime * 0.25) * 10.0 + n1 * 2.0) * 0.03;

  vec2 mouseOffset = (mouse - 0.5) * 0.35;
  float mouseField = smoothstep(0.5, 0.0, distance(uv, mouse));

  vec3 col = mix(uColorA, uColorB, uv.y + ripple + n1 * 0.15);
  col = mix(col, uColorC, radial * 0.55);
  col += n2 * 0.08;
  col += mouseField * vec3(0.18, 0.12, 0.25);

  float alpha = 0.92;
  alpha *= smoothstep(1.05, 0.25, len);
  alpha += mouseField * 0.08;

  gl_FragColor = vec4(col, alpha);
}
\`
);

extend({ ShaderMaterialImpl });

function ShaderPlane() {
const material = useRef();
const mesh = useRef();
const { size, viewport } = useThree();

useFrame((state, delta) => {
if (!material.current) return;
material.current.uTime = state.clock.getElapsedTime();
material.current.uMouse.lerp(
new THREE.Vector2(
(state.pointer.x + 1) * 0.5,
(state.pointer.y + 1) * 0.5
),
0.08
);
material.current.uResolution.set(size.width * Math.min(window.devicePixelRatio || 1, 2), size.height * Math.min(window.devicePixelRatio || 1, 2));
if (mesh.current) {
mesh.current.rotation.z += delta * 0.05;
mesh.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.03;
}
});

return (
<mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
<planeGeometry args={[1, 1, 128, 128]} /> <shaderMaterialImpl ref={material} transparent depthWrite={false} /> </mesh>
);
}

export default function ShaderScene() {
return <ShaderPlane />;
}
`.trim();
    }

    mergeWithFallbackIfNeeded(code, specification = {}) {
        const text = String(code || '');
        const validation = this.validateCode(text);

        if (
            validation.hasReact &&
            validation.hasR3F &&
            validation.hasShaderMaterial &&
            validation.hasVertexShader &&
            validation.hasFragmentShader &&
            validation.hasUniforms
        ) {
            return this.normalizeCode(text);
        }

        this.log('warning', 'Generated shader code is incomplete; using a safe fallback component.');
        return this.buildFallbackComponent(specification);
    }

    async execute(specification, designSystem, previousCode = {}) {
        this.log('info', 'Summoning the Shader Wizard...');

        const prompt = this.buildPrompt(specification);

        let response = '';
        try {
            response = await this.callLLM(prompt, this.systemPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
            });
        } catch (error) {
            this.log('warning', `Shader Wizard LLM call failed: ${error.message}`);
            return this.buildFallbackComponent(specification);
        }

        let code = this.extractCode(response, 'javascript');
        code = this.normalizeCode(code);
        code = this.ensureEntryPoint(code);
        code = this.mergeWithFallbackIfNeeded(code, specification);

        const finalValidation = this.validateCode(code);
        if (!finalValidation.hasShaderMaterial || !finalValidation.hasVertexShader || !finalValidation.hasFragmentShader) {
            this.log('warning', 'Shader code still looks incomplete after repair pass.');
        }

        this.log('success', `Shader scene generated: ${this.detectEffectNeeds(specification).effects.join(', ')}`);
        return code;
    }
}

if (typeof window !== 'undefined') {
    window.CoderShaderAgent = CoderShaderAgent;
}
