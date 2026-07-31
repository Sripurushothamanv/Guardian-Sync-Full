# Guardian-Sync Full: Unified Mobile App & Web System

Guardian-Sync is a complete, real-time healthcare worker fatigue monitoring and readiness tracking platform combining a **Flutter Mobile App** and a **React Web Application** backed by a shared **Google Firebase** infrastructure (`guardian-sync-4694f`).

## 📁 Repository Structure

```
Guardian-Sync-Full/
├── mobile/       # Flutter Android & iOS Mobile Application
├── website/      # React Web Application (Vite + Tailwind/CSS)
└── .github/      # Automated GitHub Pages Deployment Workflow
```

## ✨ Key Features

- **Shared Firebase Authentication**: Unified accounts across mobile app and web app.
- **Persistent Session Storage**: Stays signed in across app restarts and browser refreshes.
- **Silent Background Token Auto-Refresh**: Auto-refreshes tokens seamlessly without forcing logouts.
- **Real-Time Fatigue & Readiness Index (0–100)**: Evaluates sleep debt, awake hours, shift impact, and caffeine half-life decay.
- **Safe-To-Drive Safety Checks**: Intelligent alerts (`SAFE`, `CAUTION`, `UNSAFE`).
- **AI Voice & Text Assistant**: Real-time context-aware wellness advisor.
- **Automated Live Deployment**: Automatic deployment to GitHub Pages on push to `main`.
