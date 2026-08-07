# 🛡️ Guardian Sync

> **Real-time health, fatigue & shift monitoring for shift workers and safety-critical teams.**

[![Live Website](https://img.shields.io/badge/🌐_Live_Website-Visit-0A66C2?style=for-the-badge)](https://sripurushothamanv.github.io/Guardian-sync-website/)
[![Download APK](https://img.shields.io/badge/📱_Download_APK-Latest_Release-34A853?style=for-the-badge)](https://github.com/Sripurushothamanv/Guardian-Sync-Full/releases)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=flat-square&logo=flutter&logoColor=white)](https://flutter.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)

---

## 📖 About

**Guardian Sync** is a cross-platform mobile application built with Flutter, designed to help shift workers, truck drivers, healthcare workers, and other safety-critical professionals monitor their health, manage fatigue, and stay safe. The app syncs data in real-time via a Node.js + MongoDB backend and Firebase.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Centralised overview of health metrics, shift status & alerts |
| 😴 **Sleep Tracker** | Log and analyse sleep patterns with AI-powered insights |
| ☕ **Caffeine Monitor** | Track caffeine intake and its impact on rest quality |
| 🔥 **Burnout Detection** | Early-warning burnout indicators based on work patterns |
| 🍎 **Nutrition Tracker** | Log meals and track nutritional wellness |
| 🚗 **Safe-to-Drive Check** | Real-time fatigue assessment before driving |
| 📅 **Shift Management** | Schedule, log, and manage work shifts |
| 🤖 **AI Chat Assistant** | Get personalised health and fatigue advice |
| 🎯 **Wellness Goals** | Set and track personal wellness targets |
| 📈 **Weekly Reports** | Comprehensive PDF reports of health trends |
| 🔔 **Smart Notifications** | Context-aware alerts and reminders |
| 🔄 **Recovery Tracking** | Monitor recovery between shifts |

---

## 📸 Screenshots

<!-- Add your app screenshots here. Recommended: place images in a `screenshots/` folder -->
<!-- Example format:
| Dashboard | Sleep Tracker | Shift Manager |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Sleep](screenshots/sleep.png) | ![Shifts](screenshots/shifts.png) |
-->

> 📌 **Screenshots coming soon** — Add your app screenshots to a `screenshots/` folder and update this section.

---

## 🏗️ Tech Stack

```
┌──────────────────────────────────────────┐
│              Guardian Sync               │
├──────────────┬───────────────────────────┤
│   Frontend   │  Flutter (Dart)           │
│   Auth       │  Firebase Auth            │
│   Database   │  Cloud Firestore          │
│              │  MongoDB                  │
│   Backend    │  Node.js + Express        │
│   Reports    │  PDF Generation           │
│   Voice      │  Speech-to-Text           │
└──────────────┴───────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Flutter SDK](https://flutter.dev/docs/get-started/install) (3.x+)
- [Node.js](https://nodejs.org/) (18+)
- [MongoDB](https://www.mongodb.com/) instance
- Firebase project configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sripurushothamanv/Guardian-Sync-Full.git
   cd Guardian-Sync-Full
   ```

2. **Set up the backend**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and secrets
   npm install
   node index.js
   ```

3. **Run the Flutter app**
   ```bash
   cd ..
   flutter pub get
   flutter run
   ```

---

## 📁 Project Structure

```
Guardian-Sync-Full/
├── lib/                    # Flutter app source
│   ├── main.dart           # App entry point
│   ├── app_state.dart      # Global state management
│   ├── screens/            # All app screens (20+)
│   ├── services/           # API & business logic services
│   └── widgets/            # Reusable UI components
├── server/                 # Node.js backend
│   ├── index.js            # Express API server
│   ├── firebaseService.js  # Firebase integration
│   └── authHelpers.js      # Authentication utilities
├── android/                # Android platform config
├── ios/                    # iOS platform config
├── web/                    # Web platform config
└── test/                   # Unit & widget tests
```

---

## 🌐 Website

Visit the official Guardian Sync website for more information:

🔗 **[https://sripurushothamanv.github.io/Guardian-sync-website/](https://sripurushothamanv.github.io/Guardian-sync-website/)**

---

## 📱 Download the App

Get the latest APK from GitHub Releases:

🔗 **[Download Latest Release](https://github.com/Sripurushothamanv/Guardian-Sync-Full/releases)**

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

This project is maintained by [@Sripurushothamanv](https://github.com/Sripurushothamanv).

---

<p align="center">
  Made with ❤️ using Flutter & Firebase
</p>
