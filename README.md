# PahaadPulse

AI review intelligence + **HotelOS** operations suite for Himalayan eco-resorts.
Frontend-only demo — all data is mocked, the login is for show.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Deploy to Netlify

This is a static frontend (no backend), so hosting is free. Build settings are
already committed in `netlify.toml` and the SPA redirect in `public/_redirects`.

**From the Netlify website (no CLI needed):**

1. Push this repo to GitHub (already done).
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Choose **GitHub** and pick the `PahaadPulse` repo (authorise Netlify if asked).
4. Netlify reads `netlify.toml`, so the fields are pre-filled:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy**. In ~1 minute you get a live URL like `https://your-site.netlify.app`.

Every push to the repo redeploys automatically.

**Or via the Netlify CLI:**

```bash
npm install -g netlify-cli
netlify deploy --build --prod
```

## What's inside

| Screen | What it shows |
| --- | --- |
| **Login** (`/`) | Landing page: glass panel over the leaf photo, demo sign-in (any credentials work, or use the quick-fill button) |
| **Overview** (home) | Glass dashboard: occupancy ring, monthly revenue, reputation, **revenue at risk by cause**, department filter, rate plans, check-in calendar, WhatsApp-complaint and staff-performance cards |
| **Reviews** | Reviews from Booking.com / Google / TripAdvisor / Goibibo, auto-categorised by sentiment, with AI-drafted replies |
| **Scraper** | Channel connections and a simulated sync console |
| **Insights** | Issue clusters + "analyse a new review" |
| **Reputation** | Sentiment mix, channel mix, momentum chart |
| **Hotel OS** | Occupancy board · WhatsApp complaints (Positive / Neutral / High attention) · Staff performance · Billing (generate a small bill) |

`/app/hotelos?tab=billing|complaints|staff|occupancy` deep-links to a Hotel OS tab.

## Design

- Typography: **Lexend** (light, wide — headings & numbers) + **Outfit** (body), self-hosted via Fontsource.
- Glass surfaces and the leaf backdrop live in `src/index.css` (`.glass-shell`, `.glass-dark`, `.glass-tile`, `.leaf-bg`).
- To use a different backdrop, replace `public/bg-leaves.png`.
