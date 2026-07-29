# Zero-Builder Deployment & Hosting Guide

This guide explains how to manage, start, update, and teardown **Zero-Builder** hosted on Surge.sh, Vercel, or locally.

---

## 🌐 Live Domains
- **Surge:** [zero-pro.surge.sh](https://zero-pro.surge.sh)
- **Vercel:** [zero-qtnn.vercel.app](https://zero-qtnn.vercel.app)
- **GitHub:** [github.com/nandkishorrathodk-art/Zero](https://github.com/nandkishorrathodk-art/Zero)

---

## 🚀 Commands Cheat Sheet

### 1. Build Bundle
Compile all JS source files into `js/zero-builder.bundle.js`:
```bash
node build-bundle.js
```

### 2. Deploy to Surge
Publish the latest local code changes:
```bash
npx surge . zero-pro.surge.sh
```

### 3. Deploy to Vercel
Push to GitHub — Vercel auto-deploys from `main` branch:
```bash
git add -A && git commit -m "update" && git push origin main
```

### 4. Teardown Surge Site
```bash
npx surge teardown zero-pro.surge.sh
```

### 5. List All Live Surge Domains
```bash
npx surge list
```

### 6. Run Locally (Development)
```bash
node server.js
```
- Local URL: [http://localhost:4173](http://localhost:4173)
- Stop: Press `Ctrl + C`

---

## 💡 Troubleshooting (Browser Caching)
If deployed changes don't appear:
1. **Hard Refresh:** `Ctrl + F5` or `Ctrl + Shift + R`
2. **Incognito:** `Ctrl + Shift + N` → visit the domain
