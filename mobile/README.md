# Guardian Sync - Mobile Application

A cross-platform Flutter mobile application for health, fatigue, and shift monitoring connected to a Node.js + MongoDB backend.

## Database & Backend Synchronization

The **Mobile App** connects to the Node.js + Express backend server located in the `server/` directory:
- **Backend location:** `server/index.js`
- **Database:** MongoDB (`MONGO_URI`)
- **API Base URL:** Configured in `lib/app_state.dart` via `API_BASE_URL`.

When data (such as shift logs, fatigue metrics, or user updates) is entered on the Mobile app, it is saved in your MongoDB database and synced across devices.

## Website

The Guardian Sync website is maintained in a separate repository: [Guardian-sync-website](https://github.com/Sripurushothamanv/Guardian-sync-website)
