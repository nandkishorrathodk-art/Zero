export class ChatModule {
    constructor(container) {
        this.container = container;
        this.stateManager = container.get('stateManager');
        this.framework = container.get('framework');
        this.ui = container.get('ui');
        this.errorHandler = container.get('errorHandler');
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const sendBtn = document.getElementById('chat-send');
        const chatInput = document.getElementById('chat-input');

        sendBtn?.addEventListener('click', () => this.handleChatSend());
        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleChatSend();
            }
        });
    }

    async handleChatSend() {
        if (this.stateManager.get('isGenerating')) return;

        const input = document.getElementById('chat-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        this.appendMessage('user', text);
        this.stateManager.set('isGenerating', true);
        
        try {
            // Trigger generation
            if (this.framework) {
                const requirements = Array.from(this.stateManager.get('selectedRequirements'));
                const prompt = `${text}\nRequirements: ${requirements.join(', ')}`;
                await this.framework.execute(prompt);
            }
        } catch (e) {
            this.errorHandler.handle(e, 'Chat Generation');
        } finally {
            this.stateManager.set('isGenerating', false);
        }
    }

    appendMessage(role, text) {
        const history = [...this.stateManager.get('chatHistory')];
        history.push({ role, text, timestamp: Date.now() });
        this.stateManager.set('chatHistory', history);
        
        // Render to UI safely
        const messages = document.getElementById('chat-messages');
        if (messages) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ws-message ${role}`;
            // Use TextNode for safety
            msgDiv.appendChild(document.createTextNode(text));
            messages.appendChild(msgDiv);
            messages.scrollTop = messages.scrollHeight;
        }
    }
}
