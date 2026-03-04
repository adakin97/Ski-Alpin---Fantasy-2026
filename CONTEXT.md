# Ski Alpin Fantasy 2026 — Project Context

## Overview
A French-language fantasy ski-racing web app for the 2026 season. Players pick a team of skiers, earn points based on real race results, and compete on a leaderboard. Fully static frontend (no backend server) hosted on GitHub Pages, with Firebase for auth and data storage.

## Repository
- **GitHub:** https://github.com/adakin97/Ski-Alpin---Fantasy-2026
- **Local:** `C:\Users\alexd\Claude_Projects\Ski-Alpin---Fantasy-2026-main\`
- **Branch:** `main`

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML/CSS/JS (ES modules) |
| Auth | Firebase Auth (email/password) |
| Database | Firebase Firestore |
| Hosting | GitHub Pages |
| News refresh | GitHub Actions (daily cron) |

## Firebase
- **Config file:** `firebase.js` — single source of truth for app config (v9.22.2 SDK)
- **Collections:** `users` (username, email, points), `teams` (userId, username, totalPoints, skiers)
- Auth and Firestore imports always come from `firebase.js`; never inline

## Active Pages (8 HTML files)
| File | Purpose |
|---|---|
| `index.html` | Home — hero, race calendar (courses.json), news articles (articles.json), auth modals |
| `Mon_equipe.html` | Team builder — pick 5 skiers, save to Firestore |
| `classement_joueur.html` | Player leaderboard — reads from `teams` Firestore collection |
| `classement_skieurs.html` | Skier rankings by discipline — reads from JSON data files |
| `Mon Compte.html` | Account page — shows username, points, rank; update username/email/password |
| `Paramètres.html` | Settings page — notifications, theme, language (localStorage) |
| `rules.html` | Static rules page |
| `about.html` | Static about page |

## Shared JS Modules
- **`auth.js`** — loaded by all 8 pages via `<script type="module" src="auth.js"></script>`. Injects CSS + login/signup modal HTML (skips if already present), handles Firebase auth state, shows "Connexion" + "Inscription" buttons when logged out, username dropdown when logged in.
- **`firebase.js`** — exports `auth` and `db`; imported by auth.js and any page that needs Firestore.
- **`script.js`** — loaded by `index.html` only; fetches `courses.json` for calendar table and `articles.json` for news section.

## Nav Structure
All pages share identical topbar CSS and nav links. Active page gets `class="active"` on its nav link. Nav auth area is always `<nav id="nav-auth">` — auth.js targets this element by ID.

## Shared CSS
- **`common.css`** — all nav/topbar/footer/responsive styles shared across all 8 pages. Each page links it and only keeps page-specific styles inline.

## Skier Data
- **`output.json`** — 308 skiers with name, nationality, discipline, photo, FIS points, etc. (renamed from skiers.json)
- **`courses.json`** — 2025/26 race calendar
- **`flags/`** — country flag PNG images

## Articles (Dynamic News)
- **`articles.json`** — 6 most recent French ski news articles (title, link, image)
- **`fetch_articles.py`** — Python script that fetches Bing News RSS (`ski alpin rts`, fr-CH), filters out race-clip videos and audio podcasts, extracts real article URLs from Bing redirect links, fetches og:image from each article page, writes to articles.json
- **`.github/workflows/update-articles.yml`** — GitHub Actions workflow; runs `fetch_articles.py` daily at 7 AM UTC and commits any changes. Can be triggered manually from GitHub UI: Actions → "Update Articles" → "Run workflow"

## Known Issues / Caveats
- Some article sources (24heures.ch, Blick.fr) block bot fetches → those articles get `"image": ""` and show `Image/background.jpeg` as fallback
- `Mon Compte.html` update buttons (username, email, password, avatar) are UI-only stubs — the Firebase write logic hasn't been wired up yet
- `Paramètres.html` settings (theme, notifications) save to localStorage only — not persisted to Firestore
- `index.html` has its own inline Firebase auth logic AND loads `auth.js` — two `onAuthStateChanged` listeners can conflict (known issue, deferred)

## Key Patterns
- All pages use `<script type="module" src="auth.js"></script>` as the last script before `</body>` for auth
- Pages that also need Firestore import `{ db } from "./firebase.js"` in their own module script
- Inline onclick handlers in `Mon_equipe.html` that live inside a `<script type="module">` must be exposed via `window.functionName = function() {...}` to be callable from HTML
- Nav active link is set by `class="active"` in the static HTML (not via JS)
- `common.css` must be linked before any page-specific `<style>` block so page styles can override it

## Pending Improvements (identified, not yet done)
- Wire up `Mon Compte.html` account management buttons to Firebase
- Implement Firestore security rules
- Add loading states / spinners during async fetches
- Add password reset ("Forgot password?") flow to auth modals
- Fix auth modal duplication on `index.html` (modals exist in both HTML and injected by auth.js)
- Replace `innerHTML` with `createElement` / `textContent` to eliminate XSS risk
- Add meta description + Open Graph tags + favicon to all pages
- Add `localStorage` caching for large JSON files (`output.json` is ~3.8MB)
- Better mobile responsiveness (collapsible nav, header stacking)
