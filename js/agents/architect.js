/* ============================================================
   ARCHITECT AGENT — Backend infrastructure, Prisma, API routes,
   authentication, and data modeling for Next.js / SaaS projects
   ============================================================ */

class ArchitectAgent extends BaseAgent {
  constructor() {
    super(
      'Architect',
      'Designs hardcore backend infrastructure, Prisma DB schemas, and Next.js API routes'
    );

    this.config = {
      maxSourceFiles: 14,
      fallbackSourceFiles: 8,
      maxFileChars: 16000,
      headChars: 10000,
      tailChars: 3500,
      temperature: 0.25,
      maxTokens: 32768,
    };

    this.systemPrompt = `
You are a Principal Backend Architect for a top-tier SaaS development agency.

Your job is to design the best possible backend architecture, data layer, and API surface for the user's requirement.

SPECIALTIES
- Prisma ORM schema design for PostgreSQL / SQLite
- Next.js 14+ App Router API design (Route Handlers)
- Authentication and authorization flows
- Relational data modeling: one-to-many, many-to-many, self-relations, polymorphism when justified
- Multi-tenant SaaS patterns
- Zustand store definitions when state contracts are needed

RULES
1. Before outputting code, think through the architecture decisions: tables, relations, API endpoints, auth, permissions, indexes, and data flows.
2. Output only the files you changed.
3. Always include a robust prisma/schema.prisma file with relations, indexes, timestamps, and sensible defaults.
4. Provide exact Next.js route handler files when APIs are needed.
5. Provide lib/prisma.ts.
6. Use production-ready TypeScript.
7. Use proper error handling, status codes, and type safety.
8. Do not break existing conventions if prior code is present.
9. Prefer clear, maintainable backend structure over overengineering.
10. If the spec implies auth, include the auth flow and the minimum supporting files needed.

OUTPUT FORMAT
**File: prisma/schema.prisma**
\`\`\`prisma
// code here
\`\`\`

**File: lib/prisma.ts**
\`\`\`typescript
// code here
\`\`\`

**File: app/api/.../route.ts**
\`\`\`typescript
// code here
\`\`\`
    `.trim();
  }

  detectProjectType(files = {}) {
    const names = Object.keys(files);
    const isNextAppRouter = names.some((name) =>
      /^(app|src\/app)\//.test(name) || /route\.ts$/.test(name)
    );
    const isReactOnly = names.some((name) => /\.(tsx|jsx)$/.test(name));
    const isBackendExisting = names.some((name) =>
      /prisma\/schema\.prisma|lib\/prisma\.ts|middleware\.ts|auth\./.test(name)
    );

    return { isNextAppRouter, isReactOnly, isBackendExisting };
  }

  inferRequirements(specification = {}) {
    const text = JSON.stringify(specification || {}).toLowerCase();

    const flags = {
      auth: /auth|login|signup|session|token|jwt|oauth|sso|magic link/.test(text),
      roles: /role|permission|rbac|admin|staff|owner|member|team/.test(text),
      orgs: /organization|workspace|tenant|multi-tenant|company|team/.test(text),
      billing: /billing|subscription|plan|stripe|invoice|payment|checkout/.test(text),
      content: /post|comment|message|chat|feed|article|blog|cms|note/.test(text),
      files: /upload|file|asset|image|media|storage/.test(text),
      audit: /audit|log|history|activity/.test(text),
      analytics: /analytics|metric|event|tracking|dashboard/.test(text),
      realtime: /realtime|live|websocket|presence|notification/.test(text),
      apiHeavy: /api|route|endpoint|crud|rest/.test(text),
    };

    return flags;
  }

  scoreFile(name, isNextAppRouter) {
    if (isNextAppRouter) {
      const weights = [
        [/^app\/api\/.+\/route\.ts$/, 100],
        [/^src\/app\/api\/.+\/route\.ts$/, 100],
        [/prisma\/schema\.prisma$/, 95],
        [/^lib\/prisma\.ts$/, 90],
        [/^lib\/auth\.(ts|tsx)$/, 85],
        [/^middleware\.ts$/, 80],
        [/^types\/.+\.(ts|tsx)$/, 60],
        [/^lib\/.+\.(ts|tsx)$/, 55],
        [/^app\/.+\.(ts|tsx)$/, 45],
        [/\.(ts|tsx)$/, 35],
      ];

      return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
    }

    const weights = [
      [/prisma\/schema\.prisma$/, 100],
      [/^lib\/prisma\.ts$/, 90],
      [/^app\/api\/.+\/route\.ts$/, 85],
      [/\.(ts|tsx|js|jsx)$/, 35],
    ];

    return weights.reduce((score, [pattern, value]) => (pattern.test(name) ? score + value : score), 0);
  }

  selectSourceFiles(files = {}) {
    const entries = Object.entries(files);
    if (!entries.length) return {};

    const { isNextAppRouter } = this.detectProjectType(files);

    const ranked = entries
      .map(([name, content]) => ({
        name,
        content,
        score: this.scoreFile(name, isNextAppRouter),
        length: String(content ?? '').length,
      }))
      .sort((a, b) => b.score - a.score || b.length - a.length);

    const selected = ranked
      .filter((item) => item.score > 0)
      .slice(0, this.config.maxSourceFiles);

    if (selected.length) {
      return Object.fromEntries(selected.map(({ name, content }) => [name, content]));
    }

    return Object.fromEntries(entries.slice(0, this.config.fallbackSourceFiles));
  }

  smartTruncate(text) {
    const source = String(text ?? '');
    if (source.length <= this.config.maxFileChars) return source;

    return (
      source.slice(0, this.config.headChars) +
      '\n/* ... truncated for architecture pass ... */\n' +
      source.slice(-this.config.tailChars)
    );
  }

  compactFileContents(source = {}) {
    const compactSource = {};
    for (const [name, content] of Object.entries(source)) {
      compactSource[name] = this.smartTruncate(content);
    }
    return compactSource;
  }

  buildArchitectureBrief({ specification = {}, sourceFiles = {}, isNextAppRouter = true, flags = {} }) {
    const appSummary = specification?.summary || specification?.description || specification?.name || 'n/a';
    const dataModelHints = specification?.dataModel || specification?.entities || specification?.domain || {};
    const authHints = specification?.auth || specification?.authentication || {};
    const apiHints = specification?.api || specification?.routes || {};
    const qualityContract = specification?.qualityContract || {};

    const desiredOutputs = [
      'prisma/schema.prisma',
      'lib/prisma.ts',
    ];

    if (flags.auth || authHints || flags.roles || flags.orgs) {
      desiredOutputs.push('lib/auth.ts');
      desiredOutputs.push('middleware.ts');
    }

    if (flags.apiHeavy || apiHints || flags.content || flags.realtime || flags.billing || flags.analytics) {
      desiredOutputs.push('app/api/.../route.ts');
    }

    const implementationNotes = [
      '- Use Prisma models with explicit relations, indexes, unique constraints, cascading behavior only when justified, and createdAt/updatedAt timestamps.',
      '- Prefer route handlers for CRUD APIs with consistent JSON responses and correct HTTP status codes.',
      '- Include auth guards, ownership checks, and tenant scoping when the requirement implies multi-user SaaS.',
      '- If the project is multi-tenant, model workspace/organization membership and scope queries by tenant.',
      '- Keep the schema normalized, but do not over-normalize if it would hurt readability or performance.',
      '- Include helper code for shared Prisma client initialization.',
      '- When a route is ambiguous, choose the cleanest production SaaS default and state assumptions in code comments only if necessary.',
      '- Do not invent features unrelated to the requirement.',
    ];

    const fileBlocks = Object.entries(sourceFiles)
      .map(([name, body]) => `\n**File: ${name}**\n\`\`\`\n${body}\n\`\`\``)
      .join('\n');

    return `
Design the complete backend architecture, database schema, authentication strategy, and API routes for the following SaaS requirement.

PROJECT SUMMARY
${appSummary}

SPECIFICATION
${JSON.stringify(specification, null, 2)}

INFERRED NEEDS
${JSON.stringify(flags, null, 2)}

DATA MODEL HINTS
${JSON.stringify(dataModelHints, null, 2)}

AUTH HINTS
${JSON.stringify(authHints, null, 2)}

API HINTS
${JSON.stringify(apiHints, null, 2)}

QUALITY CONTRACT
${JSON.stringify(qualityContract, null, 2)}

REQUIRED OUTPUTS
${JSON.stringify(desiredOutputs, null, 2)}

ARCHITECTURE GUIDELINES
${implementationNotes.join('\n')}

FILES TO CONSIDER
${fileBlocks}

IMPORTANT
- Before code, think through tables, relations, endpoints, auth, permissions, and data flow.
- Return only updated files in the required Markdown format.
- Use production-ready TypeScript.
- Preserve any existing conventions already present in the source files.
    `.trim();
  }

  buildPrompt({ specification, sourceFiles, isNextAppRouter, flags }) {
    return this.buildArchitectureBrief({
      specification,
      sourceFiles,
      isNextAppRouter,
      flags,
    });
  }

  extractFilesFromMarkdown(responseText) {
    const text = String(responseText ?? '');
    const files = {};
    const sectionRegex = /\*\*File:\s*([^\n*]+)\*\*\s*```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g;

    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
      const fileName = match[1].trim();
      const fileBody = match[2].replace(/\s+$/, '');
      files[fileName] = fileBody;
    }

    return files;
  }

  extractParsedFiles(responseText) {
    if (typeof this.extractFiles === 'function') {
      const parsed = this.extractFiles(responseText);
      if (parsed && Object.keys(parsed).length) return parsed;
    }

    return this.extractFilesFromMarkdown(responseText);
  }

  validateUpdateSet(parsedFiles = {}, originalFiles = {}) {
    const safe = {};
    const allowedLooseFiles = [
      'prisma/schema.prisma',
      'lib/prisma.ts',
      'lib/auth.ts',
      'middleware.ts',
    ];

    for (const [name, content] of Object.entries(parsedFiles)) {
      const allowed =
        Object.prototype.hasOwnProperty.call(originalFiles, name) ||
        allowedLooseFiles.includes(name) ||
        /^app\/api\/.+\/route\.ts$/.test(name) ||
        /^src\/app\/api\/.+\/route\.ts$/.test(name) ||
        /^lib\/.+\.(ts|tsx)$/.test(name) ||
        /^types\/.+\.(ts|tsx)$/.test(name);

      const body = String(content ?? '').trim();

      if (!allowed) continue;
      if (body.length < 40) continue;

      safe[name] = body;
    }

    return safe;
  }

  async execute(specification, designSystem = null, previousCode = {}) {
    this.log('info', 'Consulting the Backend Architect...');

    const files = previousCode || {};
    const entries = Object.entries(files);

    if (!entries.length) {
      this.log('warning', 'No source files provided to architect');
    }

    const { isNextAppRouter } = this.detectProjectType(files);
    const flags = this.inferRequirements(specification);
    const sourceFiles = this.compactFileContents(this.selectSourceFiles(files));

    const prompt = this.buildPrompt({
      specification,
      sourceFiles,
      isNextAppRouter,
      flags,
    });

    let response = '';
    try {
      response = await window.llmProvider.chat([
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt },
      ]);
    } catch (error) {
      this.log('warning', `Architect LLM call failed: ${error.message}`);
      return {};
    }

    try {
      const parsed = this.extractParsedFiles(response);
      const safe = this.validateUpdateSet(parsed, files);

      this.log('success', `Architect updated ${Object.keys(safe).length} file(s)`);
      return safe;
    } catch (error) {
      this.log('warning', `Architect could not parse updates: ${error.message}`);
      return {};
    }
  }
}

window.ArchitectAgent = ArchitectAgent;