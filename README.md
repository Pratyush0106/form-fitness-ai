# FORM Fitness

> **AI authorship disclosure:** This entire project was designed, written, assembled, and iteratively tested with AI under the project owner's direction. Exercise and food datasets come from the credited third-party sources below.

FORM Fitness is a responsive full-stack fitness and nutrition web application. It combines exercise guidance, calorie targets, meal planning, recipe discovery, food and workout logging, progress tracking, account synchronization, and optional AI recipe generation in one installable web app.

## Main features

- 156 exercises across 13 body-part groups, with filters, instructions, equipment, difficulty, muscles, form tips, thumbnails, and two-position GIF demonstrations.
- Mifflin–St Jeor BMR and TDEE calculator with bulk, cut, and maintenance targets.
- Food diary, macro tracking, workout calorie adjustments, weekly charts, and data export.
- 60 local recipes with ingredient-derived nutrition, scalable servings, reviews, favorites, meal-plan integration, and shopping lists.
- Live recipe and video links from TheMealDB, with typo-tolerant ingredient search.
- Optional Gemini fallback that creates a structured recipe idea when TheMealDB has no result. AI recipes are clearly labelled and do not invent nutrition totals.
- Seven-day meal plans, recipe swapping, serving adjustment, printing/PDF support, and saved plans.
- Workout builder, prebuilt workouts, workout history, personal records, weight tracking, and progress photos.
- Supplement reference library, stacks, calculator, intake/stock tracking, and safety notes.
- Email/password accounts, optional Firebase OAuth, SMTP password-reset codes, and per-user saved state.
- Responsive animated mobile navigation, dark/light themes, PWA installation, offline shell, and optional APK download endpoint.

## Technology

- React 19, Chart.js, Tailwind CSS, and esbuild
- Node.js 24 and Express 5
- SQLite for local development; PostgreSQL for production
- JWT session cookies with scrypt password hashing
- Optional Firebase Authentication, Gmail/SMTP, Gemini API, TheMealDB, and Open Food Facts
- Docker, Docker Compose, and Vercel configuration

## Requirements

- Node.js 24 or newer
- npm
- Optional: PostgreSQL 17 or Docker Desktop for production-style persistence
- Optional credentials for Firebase, SMTP, and Gemini

## Local setup

```bash
git clone https://github.com/Pratyush0106/form-fitness-ai.git
cd form-fitness
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, use `cp .env.example .env`. Open `http://localhost:3000` after the server starts. The development server rebuilds the frontend and watches the Express server.

Without `DATABASE_URL`, development uses `private-data/form.sqlite`. That directory is ignored by Git and must never be committed.

## Environment configuration

Copy `.env.example` to `.env` and enter only the services you want to enable.

| Variable | Purpose |
| --- | --- |
| `PORT` | Local HTTP port; defaults to `3000` |
| `NODE_ENV` | Use `production` only in a deployed environment |
| `JWT_SECRET` | Random value of at least 32 characters |
| `DATABASE_URL` | PostgreSQL connection string; required in production |
| `DATABASE_SSL` | Set `true` when the database requires verified TLS |
| `PUBLIC_ORIGIN` | Exact deployed HTTPS origin used for request-origin checks |
| `TRUST_PROXY` | Set `1` behind a trusted reverse proxy |
| `FIREBASE_*` | Optional Firebase web and Admin credentials for OAuth |
| `SMTP_*` | Optional SMTP settings for password-reset codes |
| `GEMINI_API_KEY` | Optional Google AI Studio key for missing-recipe fallback |
| `GEMINI_MODEL` | Gemini model ID; defaults to `gemini-3.5-flash-lite` |

Never place real credentials in frontend source, screenshots, issues, commits, or `.env.example`. Configure deployment secrets in the host's environment-variable settings.

Generate a JWT secret with Node:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Optional services

### Firebase authentication

Create a Firebase web app, enable the desired sign-in providers, and add both `localhost` and the deployed domain to Firebase Authentication's authorized domains. Put the public web configuration and Firebase Admin service-account values in `.env`. The private key must retain literal `\n` line breaks.

### SMTP password reset

For Gmail, enable two-step verification and create an app password. Use that app password as `SMTP_PASS`; do not use the normal Gmail password.

### Gemini recipe fallback

Create an API key in Google AI Studio and set `GEMINI_API_KEY`. FORM calls Gemini only after TheMealDB returns no recipe. Free-tier availability and quotas depend on the selected model, account, and region.

### External food and recipe data

TheMealDB provides live community recipes, photos, source links, and available YouTube links. Open Food Facts supplies community-maintained barcode data. Users should verify package labels because external records can be incomplete or outdated.

## Commands

```bash
npm run dev                 # Build once and run the watched local server
npm run build               # Create production frontend assets
npm start                   # Start the Express server
npm test                    # Run domain tests
npm run db:inspect          # Inspect the local development database
npm run db:migrate-local    # Run the local data migration helper
npm run firebase:check      # Validate Firebase configuration
```

## Docker deployment

Create a production `.env` containing `POSTGRES_PASSWORD`, `JWT_SECRET`, and `PUBLIC_ORIGIN`, plus any optional integrations, then run:

```bash
docker compose up --build
```

The web service binds to `127.0.0.1:3000`. Put an HTTPS reverse proxy in front of it for public deployment. PostgreSQL data is stored in the named `postgres_data` volume.

## Vercel deployment

Import the repository into Vercel, configure all required environment variables, attach a supported PostgreSQL database, and deploy. The build prepares static assets without copying `.env`, account databases, or other private runtime data.

## PWA and Android

Production PWA installation requires HTTPS. Android Chrome users can choose **Add to Home screen → Install**. iPhone and iPad users can choose **Share → Add to Home Screen** in Safari. See [ANDROID-INSTALL.md](ANDROID-INSTALL.md) for APK publishing details. An APK is not included in this repository.

## Data and security

- `.env`, SQLite databases, session secrets, logs, generated builds, uploaded photos, and APK binaries are ignored.
- Passwords are hashed with scrypt. Authentication uses HTTP-only, same-site cookies.
- State and progress photos are isolated by user ID.
- Mutation requests enforce an origin check, and API routes use rate limiting and security headers.
- This is a fitness-planning tool, not medical advice. Calorie calculations are estimates, and supplement information is educational.

See [SECURITY.md](SECURITY.md) for credential handling and vulnerability reporting.

## Data sources and attribution

- Exercise instructions and photographs: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), Unlicense/public domain. GIFs alternate between paired exercise positions and are not full-motion coaching videos.
- Food composition: [USDA FoodData Central](https://fdc.nal.usda.gov/), including SR Legacy and FNDDS records.
- Live community recipes: [TheMealDB](https://www.themealdb.com/).
- Barcode data: [Open Food Facts](https://world.openfoodfacts.org/), subject to its database and content licences.
- Supplement context: NIH Office of Dietary Supplements resources linked inside the application.
- Recipe image attribution is recorded in `data/image-credits.json` and on the relevant screens.

## Project status

The application is functional and suitable for continued development. Production operators are responsible for credentials, backups, database operations, email deliverability, Firebase configuration, monitoring, legal review, and medical-content review.
