# REVIVE — Live, You Deserve It.

A full-stack starter for the REVIVE preventive-health research workspace.

## What's included

- Dashboard with empty metric and trend placeholders.
- Research feed intentionally empty until research/data is added.
- Express API for health, feed and dashboard endpoints.
- SQLite database powered by sql.js (WebAssembly), so Windows users do not need Visual Studio C++ build tools; no demo records are seeded.
- React + Vite responsive frontend.

## Requirements

- Node.js 20 or newer (Node 24 is supported)

- npm

## Run locally (Windows, macOS or Linux)

1. Clone the repository:
   ```bash
   git clone https://github.com/AVINASHTIWARI14/revive.git
   cd revive
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start frontend and backend:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173.

Vite proxies /api requests to Express at http://localhost:4000. SQLite is initialized automatically using a WebAssembly build, avoiding native compilation on Windows.

## Production build

```bash
npm run build
npm start
```

Then open http://localhost:4000.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API and database status |
| GET | `/api/feed` | Feed records (empty by default) |
| GET | `/api/dashboard` | Dashboard metric records (empty by default) |

## Project structure

```
revive/
├── server/ (Express API and SQLite setup)
├── src/ (React app and styles)
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

The feed is intentionally empty and dashboard values remain placeholders until validated data is connected. This is a development foundation, not a clinical decision-support system.
