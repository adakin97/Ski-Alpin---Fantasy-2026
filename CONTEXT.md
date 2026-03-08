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
- **Security rules:** `firestore.rules` deployed — public read on `users`, authenticated write own doc only; same for `teams`

## Active Pages (8 HTML files)
| File | Purpose |
|---|---|
| `index.html` | Home — hero, race calendar (courses.json), news articles (articles.json) |
| `Mon_equipe.html` | Team builder — pick 5 skiers, save to Firestore |
| `classement_joueur.html` | Player leaderboard — reads from `teams` Firestore collection |
| `classement_skieurs.html` | Skier rankings by discipline — reads from JSON data files |
| `Mon Compte.html` | Account page — shows username, points, rank; update buttons (stubs) |
| `Paramètres.html` | Settings page — notifications, theme, language (localStorage) |
| `rules.html` | Static rules page |
| `about.html` | Static about page |

## Design System (as of Mar 2026)
All 8 pages now share a consistent flat design:
- **Hero section** — dark background image overlay (`Image/background_title.jpeg`), left red border (`border-left: 5px solid var(--main-red)`), white left-aligned h1 + subtitle
- **Flat cards** — `border: 1px solid #e2e2e2; border-top: 3px solid var(--main-red);` no border-radius, no box-shadow
- **Tables** — dark `#1a1a1a` header, flat borders, `#fff5f5` row hover
- **Buttons** — flat, uppercase, `letter-spacing: 0.06em`, no border-radius
- **Form inputs** — `border: 1.5px solid #e0e0e0`, no border-radius, red focus ring
- **Auth buttons** — CONNEXION (outlined), INSCRIPTION (red filled), both uppercase in topbar

## Shared JS Modules
- **`auth.js`** — loaded by all 8 pages via `<script type="module" src="auth.js"></script>`. Injects login/signup modal HTML (skips if already present), handles Firebase auth state, shows "Connexion" + "Inscription" buttons when logged out, username dropdown when logged in.
- **`firebase.js`** — exports `auth` and `db`; imported by auth.js and any page that needs Firestore.
- **`script.js`** — loaded by `index.html` only; fetches `courses.json` for calendar table and `articles.json` for news section.

## Nav Structure
All pages share identical topbar CSS and nav links. Active page gets `class="active"` on its nav link. Nav auth area is always `<nav id="nav-auth">` — auth.js replaces its content on auth state change. Auth buttons must use `id="openLogin"` and `id="openSignup"` in the initial HTML.

## Shared CSS
- **`common.css`** — all nav/topbar/footer/modal/auth button styles shared across all 8 pages.

## Skier Data
- **`output.json`** — 308 skiers with name, nationality, discipline, photo, FIS points, etc.
- **`courses.json`** — full 2025/26 race calendar (21 events, Sölden → Hafjell); script.js filters to upcoming races only
- **`flags/`** — country flag PNG images

## Articles (Dynamic News)
- **`articles.json`** — 6 most recent French ski news articles (title, link, image)
- **`fetch_articles.py`** — Python script: fetches Bing News RSS (fr-CH), filters video/audio, extracts images via: (1) RSS media tags, (2) RSS description `<img>`, (3) article page `og:image` / `twitter:image`. Uses cookie jar to handle cookie-based redirects (fixes 24heures.ch).
- **`.github/workflows/update-articles.yml`** — runs daily at 7 AM UTC, commits changes. Trigger manually: Actions → "Update Articles" → "Run workflow"

## Known Issues / Caveats
- Some article sources (blick.ch 403, rtn.ch SSL) hard-block scrapers → those articles get `"image": ""` and show `Image/background.jpeg` as fallback in script.js
- `Mon Compte.html` update buttons (username, email, password) are UI-only stubs — Firebase write logic not wired yet
- `Paramètres.html` settings save to localStorage only — not persisted to Firestore

## Key Patterns
- All pages: `<script type="module" src="auth.js"></script>` as last script before `</body>`
- Pages needing Firestore import `{ db } from "./firebase.js"` in their own module script
- Inline onclick handlers inside `<script type="module">` must be exposed via `window.fn = fn`
- Nav active link set by `class="active"` in static HTML
- `common.css` linked before page-specific `<style>` blocks

## Pending Improvements
- Wire up `Mon Compte.html` account management buttons to Firebase
- Add loading states / spinners during async fetches
- Add password reset ("Forgot password?") flow to auth modals
- Add meta description + Open Graph tags + favicon to all pages
- Add `localStorage` caching for `output.json` (~3.8MB)
- Better mobile responsiveness (collapsible nav)
