class ResearcherAgent extends BaseAgent {
    constructor() {
        super('researcher', 'Autonomous R&D Swarm - Performs deep web research for complex technologies');
        
        this.queryPrompt = `You are the R&D Director for a $100K Website Build.
Analyze the project specification. If the project requires complex logic (like advanced WebGL shaders, R3F, 3D physics, GSAP ScrollTrigger, Web3 integrations, or complex APIs), you must formulate 2 distinct search queries to find the latest documentation and code patterns.

Output STRICT JSON:
{
    "needsResearch": true or false,
    "queries": ["query 1 (e.g., 'React Three Fiber realistic volumetric lighting code snippet 2026')", "query 2 (e.g., 'GSAP ScrollTrigger parallax pinning advanced tutorial')"],
    "reasoning": "Why this research is needed"
}`;

        this.synthesisPrompt = `You are a Senior Technical Researcher. You have performed multiple web searches for a complex project.
Read the search results below and extract the RAW CODE SNIPPETS and MODERN PATTERNS. 
Do not include marketing fluff. Throw away deprecated code.

Output a highly technical "Research Report" in Markdown format. This report will be injected directly into the Coder Agent's brain.
Structure:
# Key Discoveries
# Modern Approach / Best Practices
# Code Snippets (Highly important)
# Potential Pitfalls`;
    }

    async execute(specification, userPrompt, framework) {
        this.log('info', 'Activating Autonomous R&D Swarm...');
        const uiLog = (message, type = 'info') => {
            if (framework) framework.emit('log', { type, message });
        };
        
        let tavilyApiKey = '';
        try {
            tavilyApiKey = localStorage.getItem('zb_tavily_key') || '';
        } catch(e) {}

        if (!tavilyApiKey) {
            this.log('warning', 'Tavily API Key missing. Skipping Web Research. (Add in Settings for 1000 free requests).');
            return null;
        }

        const message = `USER PROMPT: ${userPrompt}\n\nSPECIFICATION:\n${JSON.stringify(specification, null, 2)}`;
        
        this.log('info', 'Decomposing project into research vectors...');
        uiLog('R&D Swarm: analyzing project specification...');

        const analysisResponse = await this.callLLM(message, this.queryPrompt, { temperature: 0.2, maxTokens: 8192 });
        let analysis;
        try {
            analysis = this.parseJSON(analysisResponse);
        } catch (e) {
            this.log('warning', 'Failed to parse research queries. Skipping research.');
            return null;
        }

        if (!analysis.needsResearch || !analysis.queries || analysis.queries.length === 0) {
            this.log('success', 'Standard technologies detected. No deep research required.');
            uiLog('R&D Swarm: standard stack detected. Bypassing web search.', 'success');
            return null;
        }

        this.log('info', `Swarm launched. Queries: ${analysis.queries.join(' | ')}`);
        uiLog('R&D Swarm: launching search threads...');
        
        const searchResults = [];
        for (const query of analysis.queries) {
            uiLog(`Research thread "${query}": searching Tavily...`);
            try {
                const result = await this._searchTavily(query, tavilyApiKey);
                searchResults.push({ query, data: result });
                uiLog(`Research thread "${query}": retrieved ${result.results?.length || 0} source(s).`, 'success');
            } catch (err) {
                this.log('error', `Search failed for "${query}": ${err.message}`);
                uiLog(`Research thread "${query}": ${err.message}`, 'error');
            }
        }

        if (searchResults.length === 0) {
            return null;
        }

        this.log('info', 'Synthesizing global data into Knowledge Base...');
        uiLog('R&D Swarm: synthesizing source data into a build brief...');

        const synthesisMessage = `SEARCH RESULTS:\n${JSON.stringify(searchResults, null, 2)}`;
        const report = await this.callLLM(synthesisMessage, this.synthesisPrompt, { temperature: 0.5, maxTokens: 16384 });
        
        this.log('success', 'Research Knowledge Base generated.');
        uiLog('R&D Swarm: knowledge base ready for coder agents.', 'success');
        
        return report;
    }

    async _searchTavily(query, apiKey) {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "advanced",
                include_answer: true,
                include_raw_content: true,
                max_results: 3
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    }
}

// Export globally
if (window.BaseAgent) {
    window.ResearcherAgent = ResearcherAgent;
}
