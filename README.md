# MyDay ✦ AI — Personal Productivity Tracker

A beautiful personal productivity tracker with AI coaching, daily journaling, target tracking, and smart weekly planning powered by Claude.

## Features

- **Daily Journal** — log your wake-up time, mood, and what you did throughout the day
- **Target Tracker** — set daily targets, tick them off, and record how long they took + what you learned
- **Session Log** — track study/work sessions with category, duration, focus score, notes, and key learnings
- **Progress Rings** — live visual progress for study time, targets, and sessions
- **Day Timeline** — auto-built chronological view of your whole day
- **History** — browse all past days with filtering
- **Stats** — heatmap, streaks, category breakdown, focus averages
- **✦ AI Coach** — powered by Claude:
  - Quick feedback on your day so far
  - End-of-day summary with achievements and improvement tips
  - Weekly insights with action plan
  - Smart Weekly Planner — upload your class timetable photo, AI builds your study schedule
  - AI Chat Coach — ongoing conversation that knows your history

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/myday-ai.git
cd myday-ai
npm install
```

### 2. Add your Anthropic API key

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
```

The `dist/` folder is your deployable app.

---

## Deployment

### Netlify (recommended — free)

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Go to **Site configuration → Environment variables** → Add:
   - Key: `VITE_ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
6. Click **Deploy** — live in ~1 minute ✅

### Vercel

```bash
npm i -g vercel
vercel
```

Then add `VITE_ANTHROPIC_API_KEY` in your Vercel project dashboard under **Settings → Environment Variables**.

### GitHub Pages

Update `vite.config.js` — set `base` to your repo name:

```js
base: '/myday-ai/',
```

Then:
```bash
npm run build
# Deploy the dist/ folder to gh-pages branch
```

Or use the [gh-pages](https://www.npmjs.com/package/gh-pages) package:
```bash
npm install -D gh-pages
# Add to package.json scripts: "deploy": "gh-pages -d dist"
npm run build && npm run deploy
```

> ⚠️ GitHub Pages doesn't support environment variables at build time. You'll need to hardcode the API key or use a backend proxy — Netlify/Vercel are easier options.

---

## Project Structure

```
myday/
├── index.html
├── package.json
├── vite.config.js
├── .env.example          ← copy to .env and add your key
├── .gitignore
└── src/
    ├── main.jsx           ← React entry point
    ├── App.jsx            ← Root component, routing, state
    ├── index.css          ← Global styles
    ├── helpers.js         ← Utility functions
    ├── api.js             ← Claude API wrapper
    └── components/
        ├── Onboarding.jsx ← First-time setup screen
        ├── TodayPage.jsx  ← Main daily view
        ├── HistoryPage.jsx
        ├── StatsPage.jsx
        ├── AICoachPage.jsx← All AI features
        ├── AIBox.jsx      ← Reusable AI response display
        ├── Modal.jsx      ← Base modal wrapper
        └── Modals.jsx     ← Log session + complete target modals
```

## Data & Privacy

All your productivity data (sessions, targets, journal entries) is stored entirely in your browser's `localStorage`. Nothing is sent to any server except the AI prompts to Anthropic's API when you use the AI features.

## Tech Stack

- **React 18** + **Vite**
- **Claude (claude-sonnet-4)** via Anthropic API
- No other dependencies — pure React with inline styles
