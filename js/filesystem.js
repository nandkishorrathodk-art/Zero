/* ============================================================
VIRTUAL FILE SYSTEM — In-memory file management with
tree view, add/rename/delete, and version history
Upgraded: rename, duplicate, history, safer rendering,
directory grouping, events, and resilient size calculation
============================================================ */

class FileSystem {
    constructor(treeEl, options = {}) {
        this.treeContainer = treeEl;
        this.options = {
            maxHistory: 20,
            sortFoldersFirst: true,
            ...options,
        };

        // files[name] = { content, size, modified, history: [] }
    this.files = {};
    this.onFileSelect = null;
    this.onFilesChange = null;
    this.onFileRename = null;
    this.onFileDelete = null;
    this.onFileAdd = null;
    this.activeFile = null;
    this.suppressEvents = false;
}

/* =============================
   Public API
   ============================= */

setFiles(filesMap = {}) {
    this.files = {};
    for (const [name, content] of Object.entries(filesMap || {})) {
        this.files[name] = this._createFileRecord(content);
    }

    // Preserve active file if possible, otherwise select first file.
    if (!this.files[this.activeFile]) {
        this.activeFile = Object.keys(this.files)[0] || null;
    }

    this.render();
    this._emitFilesChange();
}

addFile(name, content = '', select = true) {
    const fileName = this._normalizePath(name);
    if (!fileName) return false;

    const exists = !!this.files[fileName];
    const record = this._createFileRecord(content);

    if (exists) {
        this._pushHistory(fileName, this.files[fileName].content);
    }

    this.files[fileName] = record;

    if (select) {
        this.activeFile = fileName;
        this._emitSelect(fileName);
    }

    this.render();
    this._emitFilesChange();
    if (this.onFileAdd) this.onFileAdd(fileName, record.content);

    return true;
}

deleteFile(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    const deleted = this.files[fileName];
    delete this.files[fileName];

    if (this.activeFile === fileName) {
        this.activeFile = Object.keys(this.files)[0] || null;
        if (this.activeFile) this._emitSelect(this.activeFile);
    }

    this.render();
    this._emitFilesChange();
    if (this.onFileDelete) this.onFileDelete(fileName, deleted.content);

    return true;
}

renameFile(oldName, newName) {
    const from = this._normalizePath(oldName);
    const to = this._normalizePath(newName);

    if (!from || !to || from === to || !this.files[from] || this.files[to]) return false;

    const record = this.files[from];
    delete this.files[from];
    this.files[to] = record;

    if (this.activeFile === from) this.activeFile = to;

    this.render();
    this._emitFilesChange();
    if (this.onFileRename) this.onFileRename(from, to);

    return true;
}

duplicateFile(name, newName = null) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    const base = this._basename(fileName);
    const ext = this._extension(fileName);
    const dupName = this._normalizePath(newName || this._nextDuplicateName(fileName, base, ext));

    if (!dupName || this.files[dupName]) return false;

    this.files[dupName] = this._createFileRecord(this.files[fileName].content);
    this.render();
    this._emitFilesChange();
    if (this.onFileAdd) this.onFileAdd(dupName, this.files[dupName].content);

    return dupName;
}

updateFile(name, content, { preserveHistory = true, silent = false } = {}) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    if (preserveHistory) {
        this._pushHistory(fileName, this.files[fileName].content);
    }

    this.files[fileName].content = String(content ?? '');
    this.files[fileName].size = this._measureSize(this.files[fileName].content);
    this.files[fileName].modified = Date.now();

    if (!silent) {
        this.render();
        this._emitFilesChange();
    }

    return true;
}

getFilesMap() {
    const result = {};
    for (const [name, data] of Object.entries(this.files)) {
        result[name] = data.content;
    }
    return result;
}

getActiveFile() {
    return this.activeFile && this.files[this.activeFile]
        ? { name: this.activeFile, ...this.files[this.activeFile] }
        : null;
}

setActiveFile(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return false;

    this.activeFile = fileName;
    this.render();
    this._emitSelect(fileName);
    return true;
}

getFile(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return null;
    return { name: fileName, ...this.files[fileName] };
}

getHistory(name) {
    const fileName = this._normalizePath(name);
    if (!fileName || !this.files[fileName]) return [];
    return [...(this.files[fileName].history || [])];
}

undo(name) {
    const fileName = this._normalizePath(name);
    const record = fileName ? this.files[fileName] : null;
    if (!record || !record.history || !record.history.length) return false;

    const prev = record.history.pop();
    record.content = prev.content;
    record.size = this._measureSize(record.content);
    record.modified = Date.now();

    this.render();
    this._emitFilesChange();
    return true;
}

clear() {
    this.files = {};
    this.activeFile = null;
    this.render();
    this._emitFilesChange();
}

/* =============================
   Rendering
   ============================= */

render() {
    if (!this.treeContainer) return;

    const fileNames = Object.keys(this.files);
    if (fileNames.length === 0) {
        this.treeContainer.innerHTML = `
            <div class="file-tree-empty">
                <i data-lucide="folder-open" class="empty-icon"></i>
                <p>No files yet</p>
                <p class="empty-hint">Enter a prompt to generate a website</p>
            </div> `;
        this._refreshIcons();
        return;
    }

    const fragment = document.createDocumentFragment();
    const sorted = this._sortFiles(fileNames);

    let currentDir = null;

    for (const name of sorted) {
        const dir = this._dirname(name);
        if (this.options.sortFoldersFirst && dir !== currentDir) {
            currentDir = dir;
            if (dir) {
                const folderRow = document.createElement('div');
                folderRow.className = 'file-folder-label';
                folderRow.textContent = dir;
                fragment.appendChild(folderRow);
            }
        }

        const data = this.files[name];
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `file-item ${name === this.activeFile ? 'active' : ''}`;
        item.dataset.file = name;
        item.setAttribute('aria-label', `Open ${name}`);

        const icon = this._getIcon(name);
        const sizeStr = this._formatSize(data.size);

        item.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span class="file-name">${this._escapeHTML(name)}</span>
            <span class="file-size">${sizeStr}</span>
        `;

        item.addEventListener('click', () => {
            this.activeFile = name;
            this.render();
            this._emitSelect(name);
        });

        fragment.appendChild(item);
    }

    this.treeContainer.innerHTML = '';
    this.treeContainer.appendChild(fragment);
    this._refreshIcons();
}

/* =============================
   Helpers
   ============================= */

_createFileRecord(content = '') {
    const text = String(content ?? '');
    return {
        content: text,
        size: this._measureSize(text),
        modified: Date.now(),
        history: [],
    };
}

_pushHistory(name, previousContent) {
    const record = this.files[name];
    if (!record) return;

    record.history = record.history || [];
    record.history.push({
        content: String(previousContent ?? ''),
        modified: record.modified || Date.now(),
        timestamp: Date.now(),
    });

    if (record.history.length > this.options.maxHistory) {
        record.history.splice(0, record.history.length - this.options.maxHistory);
    }
}

_measureSize(text) {
    const value = String(text ?? '');
    if (typeof Blob !== 'undefined') {
        try {
            return new Blob([value]).size;
        } catch {
            return value.length * 2;
        }
    }
    if (typeof TextEncoder !== 'undefined') {
        try {
            return new TextEncoder().encode(value).length;
        } catch {
            return value.length * 2;
        }
    }
    return value.length * 2;
}

_sortFiles(fileNames) {
    const sortOrder = {
        html: 0,
        htm: 0,
        css: 1,
        scss: 1,
        sass: 1,
        js: 2,
        jsx: 2,
        ts: 2,
        tsx: 2,
        json: 3,
        md: 4,
    };

    return [...fileNames].sort((a, b) => {
        const dirA = this._dirname(a);
        const dirB = this._dirname(b);

        if (this.options.sortFoldersFirst && dirA !== dirB) {
            if (!dirA) return -1;
            if (!dirB) return 1;
            return dirA.localeCompare(dirB);
        }

        const extA = this._extension(a);
        const extB = this._extension(b);
        const orderDiff = (sortOrder[extA] ?? 99) - (sortOrder[extB] ?? 99);
        if (orderDiff !== 0) return orderDiff;

        return a.localeCompare(b);
    });
}

_getIcon(filename) {
    const ext = this._extension(filename);
    const map = {
        html: 'file-code',
        htm: 'file-code',
        css: 'palette',
        scss: 'palette',
        sass: 'palette',
        js: 'file-json',
        jsx: 'file-json',
        ts: 'file-json',
        tsx: 'file-json',
        json: 'braces',
        svg: 'image',
        png: 'image',
        jpg: 'image',
        jpeg: 'image',
        webp: 'image',
        md: 'file-text',
        txt: 'file-text',
        yml: 'settings',
        yaml: 'settings',
        prisma: 'database',
    };
    return map[ext] || 'file';
}

_formatSize(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

_basename(path) {
    return String(path || '').split('/').pop() || '';
}

_dirname(path) {
    const p = String(path || '');
    const idx = p.lastIndexOf('/');
    return idx > 0 ? p.slice(0, idx) : '';
}

_extension(path) {
    const base = this._basename(path);
    const idx = base.lastIndexOf('.');
    return idx >= 0 ? base.slice(idx + 1).toLowerCase() : '';
}

_normalizePath(path) {
    return String(path || '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/+/g, '/')
        .trim();
}

_nextDuplicateName(originalPath, base, ext) {
    const dir = this._dirname(originalPath);
    let counter = 2;

    while (counter < 1000) {
        const candidateBase = `${base}-copy${counter > 2 ? `-${counter}` : ''}`;
        const candidate = dir
            ? `${dir}/${candidateBase}${ext ? `.${ext}` : ''}`
            : `${candidateBase}${ext ? `.${ext}` : ''}`;

        if (!this.files[candidate]) return candidate;
        counter++;
    }

    return `${base}-copy.${ext || 'txt'}`;
}

_escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

_refreshIcons() {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

_emitFilesChange() {
    if (this.suppressEvents) return;
    if (typeof this.onFilesChange === 'function') {
        this.onFilesChange(this.getFilesMap());
    }
}

_emitSelect(name) {
    if (this.suppressEvents) return;
    if (typeof this.onFileSelect === 'function') {
        this.onFileSelect(name);
    }
}

/* =============================
   Batch mode
   ============================= */

beginBatch() {
    this.suppressEvents = true;
}

endBatch({ render = true } = {}) {
    this.suppressEvents = false;
    if (render) this.render();
    this._emitFilesChange();
}

}

window.FileSystem = FileSystem;
