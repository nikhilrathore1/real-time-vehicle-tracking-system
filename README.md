# 🚌 Real-Time Vehicle Tracking System

A Progressive Web App for tracking city buses in real time — live map positions, ETA predictions, route planning, service alerts, and an admin dashboard. Built with Next.js 14, TypeScript, and Leaflet, and installable on mobile with full offline support.

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white" alt="Leaflet">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white" alt="PWA">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="License">
</p>

> **🔗 Live Demo:** **[v0-citybuslivemain1.vercel.app](https://v0-citybuslivemain1.vercel.app)**

---

## ✨ Features

- **Live bus tracking** — real-time vehicle positions on an interactive Leaflet map with marker clustering.
- **ETA predictions** — estimated arrival times for each stop, updated continuously.
- **Route planning & search** — browse routes, view stops, schedules, fares, and plan trips.
- **Service alerts & notifications** — push notifications and an in-app alert history for delays and disruptions.
- **Admin dashboard** — manage buses and routes, view analytics, and post system alerts.
- **Installable PWA** — add to home screen, works offline via a service worker, with an offline indicator.
- **Responsive & themed** — mobile-first UI built with Tailwind CSS and Radix UI, light/dark support.

## 🖼️ Screenshots

> Add a few screenshots so visitors can see the app at a glance. Drop images into a `docs/` folder and reference them here.

| Home / Map | Route Details | Admin Dashboard |
|------------|---------------|-----------------|
| _add screenshot_ | _add screenshot_ | _add screenshot_ |

## 🛠️ Tech Stack

| Area | Technologies |
|------|--------------|
| Framework | Next.js 14 (App Router), React 18 |
| Language | TypeScript |
| Maps | Leaflet, Leaflet.markercluster |
| UI | Tailwind CSS, Radix UI, lucide-react |
| Charts | Recharts |
| Forms & Validation | react-hook-form, Zod |
| PWA | Service Worker, Web Push, Web App Manifest |
| Analytics | Vercel Analytics |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [pnpm](https://pnpm.io/) (recommended) — or npm / yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nikhilrathore1/real-time-vehicle-tracking-system.git
cd real-time-vehicle-tracking-system

# 2. Install dependencies
pnpm install        # or: npm install

# 3. Set up environment variables
cp .env.example .env.local
#   then open .env.local and fill in the values

# 4. Run the development server
pnpm dev            # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | Public VAPID key used for Web Push notifications. Leave blank to disable push. |

## ☁️ Deployment

The easiest way to deploy this Next.js app — and get your public demo link — is **Vercel** (free):

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New → Project**, then import `real-time-vehicle-tracking-system`.
4. Vercel auto-detects Next.js — just click **Deploy**.
5. After ~1 minute you'll get a live URL like `https://real-time-vehicle-tracking-system.vercel.app`.
6. Copy that URL into the **Live Demo** line near the top of this README.

## 📁 Project Structure

```
.
├── app/              # Next.js App Router pages (home, live-tracking, routes, admin, notifications, offline)
├── components/       # React components (maps, panels, dashboards, UI)
├── hooks/            # Custom React hooks (geolocation, websocket, ETA, auth, PWA)
├── lib/              # Core logic (real-time API, route data, map & PWA utilities, push)
├── public/           # Static assets, icons, manifest, service worker
└── styles/           # Global styles
```

## 🤝 Contributing

Contributions are welcome. Open an issue to discuss a change, or fork the repo and submit a pull request.

## 📄 License

Released under the [MIT License](LICENSE).

---

Built by [Nikhil Rathore](https://github.com/nikhilrathore1).
