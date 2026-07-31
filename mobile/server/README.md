# Guardian Sync Server

This folder contains a Node.js + Express backend that connects to Firebase Firestore and exposes the endpoints used by the Flutter app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file:
   ```bash
   copy .env.example .env
   ```
3. (Optional) Set your Firebase Project ID or Service Account key in `.env`:
   ```env
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   Or on Windows PowerShell:
   ```powershell
   ./run.ps1
   ```

## Notes

- Uses Firebase Firestore for database storage with instant local development fallback support.
- For local testing on Android emulator, point the Flutter app to `http://10.0.2.2:5000/api`.
- The server exposes health checks at `/health` and auth/data routes under `/api`.

