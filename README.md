# Ski Alpin Fantasy 2026

A French-language fantasy ski-racing web app for the 2025/26 World Cup season. Pick a team of 5 skiers, earn points based on real FIS race results, and compete against other players on the leaderboard.

## Live Site

Hosted on GitHub Pages (static frontend, Firebase backend).

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (ES modules)
- **Auth & Database:** Firebase Auth (email/password) + Firestore
- **News Feed:** Bing News RSS via Python script, refreshed daily by GitHub Actions
- **Hosting:** GitHub Pages

## Project Structure

```
├── index.html                  # Home — hero, race calendar, news articles, auth
├── Mon_equipe.html             # Team builder — pick 5 skiers, save to Firestore
├── classement_joueur.html      # Player leaderboard (Firestore)
├── classement_skieurs.html     # FIS skier rankings by discipline (JSON)
├── Mon Compte.html             # Account page — stats, profile settings
├── Paramètres.html             # App settings (notifications, theme, language)
├── rules.html                  # Game rules
├── about.html                  # About page
│
├── common.css                  # Shared styles (nav, topbar, footer, responsive)
├── auth.js                     # Auth module — login/signup modals, Firebase auth state
├── firebase.js                 # Firebase config (single source of truth, SDK v9.22.2)
├── script.js                   # Home page scripts (calendar + articles)
│
├── output.json                 # Skier data (308 skiers)
├── courses.json                # 2025/26 race calendar
├── articles.json               # Latest ski news (auto-updated daily)
├── classement_*.json           # FIS rankings (general, SL, GS, SG, DH)
│
├── fetch_articles.py           # Python script — fetches Bing News RSS, extracts articles
├── .github/workflows/
│   └── update-articles.yml     # GitHub Actions — daily article refresh at 07:00 UTC
│
├── Image/                      # Background images
├── flags/                      # Country flag PNGs
└── person.png                  # Default skier avatar
```

## How It Works

1. **Sign up / Log in** via Firebase Auth (email + password)
2. **Build your team** — select 5 skiers from the full FIS roster on the "Mon Equipe" page
3. **Earn points** — skiers score fantasy points based on their real race results
4. **Compete** — check the player leaderboard to see how you rank

## Articles Pipeline

News articles are refreshed daily via a GitHub Actions workflow:

1. `fetch_articles.py` queries Bing News RSS for French ski racing articles
2. Filters out video clips and audio content
3. Extracts real article URLs and og:image from each page
4. Writes results to `articles.json`
5. The workflow commits changes automatically if new articles are found

To trigger manually: GitHub repo > Actions > "Update Articles" > Run workflow.

## Local Development

Open any HTML file directly in a browser, or serve with:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Firebase Setup

Firebase config lives in `firebase.js`. The app uses:
- **Firebase Auth** for user registration and login
- **Firestore** collections: `users` (profile data, points) and `teams` (saved team rosters)

## License

All rights reserved.
