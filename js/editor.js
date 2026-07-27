/* ============================================================
   CODE EDITOR — CodeMirror 5 integration with multi-file
   tabs, syntax highlighting, and live preview sync
   ============================================================ */

class CodeEditor {
    constructor(containerEl, tabsEl) {
        this.container = containerEl;
        this.tabsContainer = tabsEl;
        this.files = {};
        this.activeFile = null;
        this.editor = null;
        this.onChangeCallback = null;
        this._init();
    }

    _init() {
        if (typeof CodeMirror === 'undefined') {
            console.warn('CodeMirror CDN unavailable — using native textarea fallback');
            const textarea = document.createElement('textarea');
            textarea.className = 'fallback-editor-textarea';
            textarea.style.cssText = 'width:100%; height:100%; background:#09090b; color:#f4f4f5; font-family:monospace; border:none; padding:16px; outline:none; resize:none; font-size:14px; line-height:1.6;';
            textarea.placeholder = '<!-- Enter a prompt to generate code -->';
            if (this.container) {
                this.container.innerHTML = '';
                this.container.appendChild(textarea);
            }
            this.editor = {
                getValue: () => textarea.value,
                setValue: (v) => { textarea.value = v; },
                setOption: () => {},
                getHistory: () => null,
                setHistory: () => {},
                clearHistory: () => {},
                refresh: () => {},
                getCursor: () => ({ line: 0, ch: 0 }),
                setCursor: () => {},
                getScrollInfo: () => ({ left: 0, top: 0 }),
                scrollTo: () => {},
                focus: () => textarea.focus(),
                on: (evt, fn) => {
                    if (evt === 'change') {
                        textarea.addEventListener('input', fn);
                    }
                }
            };
            let debounceTimer = null;
            this.editor.on('change', () => {
                if (this.activeFile && this.files[this.activeFile]) {
                    this.files[this.activeFile].content = this.editor.getValue();
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => this._triggerChange(), 500);
                }
            });
            return;
        }

        // Initialize CodeMirror
        this.editor = CodeMirror(this.container, {
            value: '<!-- Enter a prompt to generate code -->',
            mode: 'htmlmixed',
            theme: 'material-darker',
            lineNumbers: true,
            lineWrapping: false,
            autoCloseBrackets: true,
            autoCloseTags: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            indentWithTabs: false,
            styleActiveLine: true,
            scrollbarStyle: 'native',
            extraKeys: {
                'Ctrl-S': () => this._triggerChange(),
                'Cmd-S': () => this._triggerChange(),
                'Ctrl-/': 'toggleComment',
                'Cmd-/': 'toggleComment',
            },
        });

        // Debounced change handler
        let debounceTimer = null;
        this.editor.on('change', () => {
            if (this.activeFile && this.files[this.activeFile]) {
                this.files[this.activeFile].content = this.editor.getValue();
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => this._triggerChange(), 500);
            }
        });
    }

    /* ===== FILE MANAGEMENT ===== */
    setFiles(filesMap) {
        this.files = {};
        for (const [name, content] of Object.entries(filesMap)) {
            this.files[name] = {
                content: content,
                mode: this._getMode(name),
                history: null,
            };
        }
        this._renderTabs();
        // Open the first file
        const firstFile = Object.keys(this.files)[0];
        if (firstFile) this.openFile(firstFile);
    }

    openFile(filename) {
        if (!this.files[filename]) return;

        // Save current file's history
        if (this.activeFile && this.files[this.activeFile]) {
            this.files[this.activeFile].history = this.editor.getHistory();
        }

        this.activeFile = filename;
        const file = this.files[filename];

        // Set content and mode
        this.editor.setValue(file.content);
        this.editor.setOption('mode', file.mode);

        // Restore history if available
        if (file.history) {
            this.editor.setHistory(file.history);
        } else {
            this.editor.clearHistory();
        }

        this.editor.refresh();
        this._updateTabs();
    }

    getFile(filename) {
        return this.files[filename]?.content || '';
    }

    getAllFiles() {
        const result = {};
        for (const [name, data] of Object.entries(this.files)) {
            result[name] = data.content;
        }
        return result;
    }

    addFile(filename, content = '') {
        this.files[filename] = {
            content,
            mode: this._getMode(filename),
            history: null,
        };
        this._renderTabs();
        this.openFile(filename);
    }

    removeFile(filename) {
        if (!this.files[filename]) return;
        delete this.files[filename];
        if (this.activeFile === filename) {
            const remaining = Object.keys(this.files);
            this.activeFile = remaining[0] || null;
            if (this.activeFile) this.openFile(this.activeFile);
        }
        this._renderTabs();
    }

    updateFile(filename, content) {
        if (this.files[filename]) {
            this.files[filename].content = content;
            if (this.activeFile === filename) {
                const cursor = this.editor.getCursor();
                const scroll = this.editor.getScrollInfo();
                this.editor.setValue(content);
                this.editor.setCursor(cursor);
                this.editor.scrollTo(scroll.left, scroll.top);
            }
        } else {
            this.addFile(filename, content);
        }
    }

    /* ===== TABS ===== */
    _renderTabs() {
        if (!this.tabsContainer) return;
        this.tabsContainer.innerHTML = '';

        for (const filename of Object.keys(this.files)) {
            const tab = document.createElement('div');
            tab.className = `tab ${filename === this.activeFile ? 'active' : ''}`;
            tab.dataset.file = filename;

            const icon = this._getFileIcon(filename);
            tab.innerHTML = `
                <i data-lucide="${icon}" class="tab-icon"></i>
                <span>${filename}</span>
            `;

            tab.addEventListener('click', () => this.openFile(filename));
            this.tabsContainer.appendChild(tab);
        }

        // Re-initialize lucide icons for new tabs
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    _updateTabs() {
        const tabs = this.tabsContainer?.querySelectorAll('.tab') || [];
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.file === this.activeFile);
        });
    }

    _getMode(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const modeMap = {
            'html': 'htmlmixed',
            'htm': 'htmlmixed',
            'css': 'css',
            'js': 'javascript',
            'json': 'application/json',
            'xml': 'xml',
            'svg': 'xml',
        };
        return modeMap[ext] || 'htmlmixed';
    }

    _getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'html': 'file-code',
            'htm': 'file-code',
            'css': 'palette',
            'js': 'file-json',
            'json': 'file-json',
            'svg': 'image',
            'png': 'image',
            'jpg': 'image',
        };
        return iconMap[ext] || 'file';
    }

    /* ===== CHANGE CALLBACK ===== */
    onChange(callback) {
        this.onChangeCallback = callback;
    }

    _triggerChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback(this.getAllFiles());
        }
    }

    /* ===== UTILITY ===== */
    refresh() {
        this.editor?.refresh();
    }

    getValue() {
        return this.editor?.getValue() || '';
    }

    setValue(val) {
        this.editor?.setValue(val);
    }

    focus() {
        this.editor?.focus();
    }
}

window.CodeEditor = CodeEditor;
