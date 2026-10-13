# PahaadPulse

AI review intelligence + **HotelOS** operations suite for Himalayan eco-resorts.
Frontend-only demo — all data is mocked, the login is for show.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
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
- To use a different backdrop, replace `public/bg-calathea.jpg`.

## Credits

Background photo: *Calathea orbifolia* by [Forest & Kim Starr](https://commons.wikimedia.org/wiki/File:Starr-110215-1133_Calathea_orbifolia-leaves-KiHana_Nursery_Kihei-Maui_(25075687535).jpg),
licensed [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/) (via Wikimedia Commons).
