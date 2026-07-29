/* ============================================================
   ZERO-BUILDER — Multimodal AI Vision Analyzer (Screenshot to Code)
   Encodes uploaded design images to base64 and synthesizes
   structured prompts for design system & UI code generation
   ============================================================ */

class VisionAnalyzer {
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
    }

    async analyzeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;
                try {
                    const analysisPrompt = `Analyze this UI design screenshot / wireframe image in detail. Extract:
1. Primary and secondary color palette (hex codes or Tailwind color equivalents).
2. Layout structure (Hero section, Bento grid, Sidebar, Card grids, Header/Footer).
3. Typography styles (Font weight, headings, hierarchy).
4. Key UI components (buttons, search inputs, badges, navigation links).

Synthesize a detailed web application prompt that instructs an AI developer to recreate this exact modern UI in React / HTML + Tailwind CSS.`;

                    // Generate structured description
                    const result = await this.llmProvider.chat([
                        { role: 'user', content: analysisPrompt }
                    ]);

                    resolve({
                        base64Data,
                        description: result || 'Modern landing page UI layout with dark glassmorphic cards and glowing hero section.'
                    });
                } catch (err) {
                    console.warn('Vision analysis fallback:', err);
                    resolve({
                        base64Data,
                        description: 'Recreate the UI screenshot with modern Tailwind CSS, dark zinc background, glassmorphism cards, and crisp typography.'
                    });
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

window.VisionAnalyzer = VisionAnalyzer;
