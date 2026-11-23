# 🕵️‍♂️ RED STRING — Mystery Investigation Lab

> **"Every clue connects. Every truth has a cost."**

**RED STRING** is a complete, full-stack, interactive detective game. Players step into the shoes of an investigator to solve mysterious incidents by examining suspects, discovering hidden evidence, and connecting clues on an interactive virtual corkboard using red strings. Once they have a theory, they make an accusation and get scored based on their detective work.

The application features a Node.js/Express backend for game logic, API routing, and scoring, alongside a dynamic React/Vite frontend featuring a premium cinematic dark theme. It also includes an AI-powered Case Generator to create infinite new mysteries!

---

## ✨ Features

- **3 Hardcoded Mysteries:** Fully fleshed-out cases (Easy, Medium, Hard) with distinct suspects, alibis, motives, secrets, and logical solutions.
- **Custom Case Generator:** A built-in form that generates infinite, playable cases on the fly using a local template engine (or an optional OpenAI API key).
- **Interactive Investigation Board:** A draggable corkboard where players connect evidence using interactive SVG red strings. Connections follow the cards when moved.
- **Dynamic Scoring & Detective Ranks:** Players are scored based on correct accusations, supporting evidence, and board connections. Using hints deducts points.
- **Persistent Progress:** Game state, discovered evidence, board layouts, and completed cases are saved in the browser's `localStorage`. Progress survives page refreshes.
- **Cinematic UI:** Dark charcoal theme, crimson accents, glowing buttons, a flashlight cursor effect, and ambient audio (generated via the Web Audio API).
- **Case Management:** Reset cases to replay them, or permanently delete custom-generated cases.
- **Backend Security:** The actual solutions (culprits and motives) are kept securely on the server and are only revealed via the API if the player makes a correct accusation.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (v18)
- Vite
- React Router (v6)
- Vanilla CSS3 (Custom properties, Flexbox/Grid)
- SVG for red string connections

**Backend:**
- Node.js
- Express.js
- REST APIs
- File System (`fs`) for saving custom cases

**Data:**
- Local JSON files (No database setup required)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended) - [Download here](https://nodejs.org/)
- **npm** (comes packaged with Node.js)
- **Git** (for cloning the repository)

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/RED-STRING.git
cd RED-STRING
```

### 2. Install dependencies
This project uses a root `package.json` to manage both the frontend and backend. Run the custom install script from the root folder:

```bash
npm install
npm run install:all
```
*(This installs the root `concurrently` dependency, the backend Express dependencies, and the frontend React/Vite dependencies in one go.)*

### 3. Start the application
Run the development server from the root folder:

```bash
npm run dev
```

### 4. Open the game
- **Frontend:** Open your browser and go to [http://localhost:5173](http://localhost:5173)
- **Backend API:** The Express server runs on [http://localhost:5000](http://localhost:5000)

---

## 🎮 How to Play

1. **Home Screen:** Click **New Investigation** to view the Case Archive.
2. **Investigation Phase:** Click **Investigate** on suspects to read their alibis and secrets. Click **Investigate** on locked evidence cards to discover clues.
3. **The Board:** Click **Open Investigation Board**. Drag cards around and click one card, then another, to draw a red string between them. (Connections are saved automatically).
4. **Hints:** Stuck? Use the hint system on the investigation page, but beware—each hint deducts 50 points from your final score.
5. **Accusation:** Go to the Accusation screen. Select the culprit, tick the evidence that proves their guilt, write your theory, and submit. The game will reveal if you were right and show your final Detective Rank!

---

## 🧠 Custom Case Generator (AI)

You can generate infinite new cases via the **Generate** page in the navigation bar.

**How it works:**
- **Default (Offline):** The backend uses a local template engine (`server/services/caseGenerator.js`) to mix and match locations, suspects, evidence, and solutions. This works 100% offline.
- **Real AI (Optional):** If you want to use OpenAI to write the case text dynamically, create a `.env` file in the `server/` directory and add your API key:
  ```env
  OPENAI_API_KEY=sk-your-api-key-here
  ```
  Restart the server. If the key is present, the backend will automatically use the OpenAI API instead of the local templates.

---

## 📁 Project Structure

```text
RED-STRING/
│
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, SuspectCard, Board, etc.)
│   │   ├── pages/          # Main routes (Home, Cases, Investigation, Board, Results, Generate)
│   │   ├── services/       # API fetch helpers
│   │   ├── App.jsx         # Router configuration
│   │   └── style.css       # Global styling & themes
│   └── vite.config.js      # Vite proxy config to port 5000
│
├── server/                 # Node.js/Express Backend
│   ├── controllers/        # Logic for API endpoints
│   ├── data/               # cases.js (Hardcoded) & customCases.json (Generated)
│   ├── routes/             # Express routers (caseRoutes, gameRoutes, generateRoutes)
│   ├── services/           # caseGenerator.js (AI/Local logic)
│   └── server.js           # Express entry point
│
└── package.json            # Root scripts (concurrently, install:all)
```

---

## 🐛 Troubleshooting

- **Port 5000 or 5173 already in use:** Ensure no other React or Node processes are running in the background. You can kill them using Task Manager or `npx kill-port 5000`.
- **Vite Proxy Errors:** Make sure the backend server is running in the `[0]` terminal tab. The frontend proxies `/api` requests to `http://localhost:5000`.
- **esbuild error on Windows:** If Vite fails to start, run `cd client && npm install-scripts approve esbuild && cd ..`, then try `npm run dev` again.
- **BOM errors (JSON parse errors):** If you manually edited JSON files in Windows PowerShell, they might contain a Byte Order Mark (BOM). Ensure you save them as UTF-8 without BOM.

---
*Created as a Full-Stack Mini Project. Enjoy the investigation!*