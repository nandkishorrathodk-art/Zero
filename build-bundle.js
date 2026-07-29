const fs = require('fs');
const path = require('path');

const files = [
  'js/conversation-memory.js',
  'js/component-library.js',
  'js/version-control.js',
  'js/llm-provider.js',
  'js/project-brain.js',
  'js/build-workflow.js',
  'js/autonomous-studio.js',
  'js/autonomous-batcher.js',
  'js/live-browser-agent.js',
  'js/agent-framework.js',
  'js/media-generator.js',
  'js/agents/prompt-engineer.js',
  'js/agents/planner.js',
  'js/agents/researcher.js',
  'js/agents/brand-strategist.js',
  'js/agents/designer.js',
  'js/agents/coder-ui.js',
  'js/agents/coder-react.js',
  'js/agents/coder-fullstack.js',
  'js/agents/coder-3d.js',
  'js/agents/coder-shader.js',
  'js/agents/coder-gpgpu.js',
  'js/agents/coder-webgpu.js',
  'js/agents/coder-physics.js',
  'js/agents/coder-audio.js',
  'js/agents/animator.js',
  'js/agents/architect.js',
  'js/agents/reviewer.js',
  'js/agents/refiner.js',
  'js/agents/healer.js',
  'js/agents/preflight-guard.js',
  'js/agents/recovery-agent.js',
  'js/agents/bug-finder.js',
  'js/agents/project-intelligence.js',
  'js/sandbox.js',
  'js/project-intake.js',
  'js/editor.js',
  'js/preview.js',
  'js/filesystem.js',
  'js/animated-background.js',
  'js/web-search.js',
  'js/reasoning-wall.js',
  'js/visual-inspector.js',
  'js/vision-analyzer.js',
  'js/deploy.js',
  'js/app.js'
];

try {
  const root = __dirname;
  const bundle = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n;\n');
  fs.writeFileSync(path.join(root, 'js/zero.bundle.js'), bundle, 'utf8');
  console.log('Zero JS Bundle compiled successfully! (' + (bundle.length / 1024).toFixed(1) + ' KB)');
} catch (err) {
  console.error('Error building JS bundle:', err.message);
}
