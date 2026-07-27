# Zero-Builder Deployment & Hosting Guide

This guide explains how to manage, start, update, and teardown the **Zero-Builder** website hosted on Surge.sh or running locally.

---

## 🌐 Live Domain Information
- **Domain:** [zero-ai.surge.sh](http://zero-ai.surge.sh)

---

## 🚀 Commands Cheat Sheet

### 1. Update / Re-Deploy Website (Start & Sync)
Publish the latest local code changes to the live internet domain:
```bash
npx surge . zero-pro.surge.sh
```

### 2. Stop / Delete Website (Teardown)
Take down the live website so it's no longer accessible online (returns 404):
```bash
npx surge teardown zero-pro.surge.sh
```

### 3. List All Live Surge Domains
View all domains currently published under your account:
```bash
npx surge list
```

### 4. Run Locally (Offline / Development)
Start the local server for testing on your computer:
```bash
node server.js
```
- Local URL: [http://localhost:3001](http://localhost:3001)
- Stop local server: Press `Ctrl + C` in the terminal.

---

## 💡 Troubleshooting Updates (Browser Caching)
If you deploy new changes but still see the old version in your browser:
1. **Hard Refresh:** Press `Ctrl + F5` or `Ctrl + Shift + R`.
2. **Incognito Mode:** Open a new Private / Incognito window (`Ctrl + Shift + N`) and visit `http://zero-ai.surge.sh`.
