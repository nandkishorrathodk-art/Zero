/* ============================================================
   VERSION CONTROL — Snapshots, Rollback & Code Diff Engine
   Tracks full-project version snapshots in IndexedDB / localStorage.
   Provides rollback, branch comparison, and file diffing.
   ============================================================ */

class VersionControlManager {
    constructor() {
        this.storageKey = 'zero_builder_version_snapshots_v1';
        this.maxSnapshots = 25;
        this.snapshots = this._loadSnapshots();
    }

    _loadSnapshots() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('VersionControl load failed:', e.message);
            return [];
        }
    }

    _saveSnapshots() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.snapshots));
        } catch (e) {
            console.warn('VersionControl save failed:', e.message);
        }
    }

    // Create a new snapshot of current project files
    createSnapshot({ label, prompt, files, reviewScore = null }) {
        if (!files || !Object.keys(files).length) return null;

        const versionId = 'v_' + Date.now();
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const snapshot = {
            id: versionId,
            versionNumber: this.snapshots.length + 1,
            label: label || `Version ${this.snapshots.length + 1}`,
            prompt: prompt || 'Manual Snapshot',
            timestamp,
            dateIso: new Date().toISOString(),
            files: JSON.parse(JSON.stringify(files)),
            reviewScore: reviewScore || 0,
            fileCount: Object.keys(files).length,
            totalChars: Object.values(files).join('').length
        };

        this.snapshots.unshift(snapshot);
        if (this.snapshots.length > this.maxSnapshots) {
            this.snapshots.pop();
        }

        this._saveSnapshots();
        console.log(`[VersionControl] Created snapshot ${snapshot.id} (${snapshot.label})`);
        return snapshot;
    }

    getSnapshots() {
        return this.snapshots;
    }

    getSnapshot(id) {
        return this.snapshots.find(s => s.id === id) || null;
    }

    // Compare two file versions line-by-line
    diffFiles(oldCode = '', newCode = '') {
        const oldLines = String(oldCode).split('\n');
        const newLines = String(newCode).split('\n');
        const diff = [];

        let i = 0, j = 0;
        while (i < oldLines.length || j < newLines.length) {
            if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
                diff.push({ type: 'same', line: oldLines[i] });
                i++; j++;
            } else if (j < newLines.length && (!oldLines[i] || !oldLines.includes(newLines[j]))) {
                diff.push({ type: 'add', line: newLines[j] });
                j++;
            } else if (i < oldLines.length) {
                diff.push({ type: 'remove', line: oldLines[i] });
                i++;
            }
        }

        return diff;
    }

    clearSnapshots() {
        this.snapshots = [];
        this._saveSnapshots();
    }
}

window.VersionControlManager = VersionControlManager;
