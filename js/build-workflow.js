/* ============================================================
   BUILD WORKFLOW — executable product plan and quality gates
   ============================================================ */

class BuildWorkflow {
    create(specification = {}, userPrompt = '') {
        const framework = specification.framework || 'vanilla';
        const fullstack = framework === 'fullstack-nextjs';
        const product = /webapp|dashboard|admin|portal|saas|crm|marketplace/i.test(`${specification.siteType} ${specification.siteArchetype} ${userPrompt}`);
        const routes = (specification.pages || []).map(page => page.path || page.id).filter(Boolean);
        const stages = [
            { id: 'contract', name: 'Product contract', owner: 'planner', output: ['requirements', 'routes', 'states', 'quality bar'], gate: 'Every requested surface has a named route or section.' },
            { id: 'system', name: 'Design system', owner: 'designer', output: ['tokens', 'type scale', 'spacing', 'interaction rules'], gate: 'One coherent visual language covers every surface.' },
            ...(fullstack ? [{ id: 'foundation', name: 'Application foundation', owner: 'architect', output: ['package', 'database schema', 'API contracts', 'auth boundary'], gate: 'Data models and API endpoints agree.' }] : []),
            { id: 'surfaces', name: product ? 'Product surfaces' : 'Website narrative', owner: fullstack ? 'coder-fullstack' : framework === 'react-vite' ? 'coder-react' : 'coder-ui', output: product ? ['routes', 'navigation', 'core states', 'reusable components'] : ['hero', 'story sections', 'responsive layout', 'signature interaction'], gate: 'Primary user journey is complete, not just visually present.' },
            { id: 'integration', name: 'Integration pass', owner: 'animator + preflight', output: ['interactions', 'responsive behavior', 'media', 'reduced motion'], gate: 'No broken links, missing imports, or dead primary actions.' },
            { id: 'verification', name: 'Quality verification', owner: 'reviewer + bug-finder', output: ['review report', 'static fixes', 'remaining risks'], gate: 'Critical issues are fixed or explicitly surfaced.' }
        ];
        return {
            id: `build-${Date.now().toString(36)}`, mode: product || fullstack ? 'product' : 'experience', framework,
            objective: specification.title || String(userPrompt).slice(0, 120), routes,
            entities: (specification.dbModels || []).map(model => model.name).filter(Boolean), stages,
            constraints: { preserveContracts: true, noPlaceholderStates: true, responsive: true, accessible: true, completeFilesOnly: true },
            definitionOfDone: [
                'The requested primary journey works end-to-end.',
                'Every route has loading, empty, error, and success behavior where relevant.',
                'Shared components and tokens are reused instead of duplicated.',
                'The final build passes preflight and review gates.'
            ],
            createdAt: Date.now()
        };
    }

    checkpoint(workflow, stageId, files) {
        if (!workflow) return null;
        let targetWorkflow = workflow;
        let targetStageId = stageId;
        let targetFiles = files;

        if (typeof workflow === 'string') {
            targetStageId = workflow;
            targetFiles = typeof stageId === 'object' && stageId !== null ? stageId : {};
            targetWorkflow = null;
        }

        const stages = Array.isArray(targetWorkflow?.stages) ? targetWorkflow.stages : [];
        const stage = stages.find(item => item && item.id === targetStageId);
        const checkpoint = {
            stage: targetStageId,
            name: stage?.name || targetStageId,
            fileCount: Object.keys(targetFiles || {}).length,
            timestamp: Date.now(),
            status: 'completed'
        };
        if (targetWorkflow) {
            targetWorkflow.checkpoints = [...(targetWorkflow.checkpoints || []).filter(item => item && item.stage !== targetStageId), checkpoint];
        }
        return checkpoint;
    }
}

window.BuildWorkflow = BuildWorkflow;
