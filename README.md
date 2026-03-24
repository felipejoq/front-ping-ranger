# PingRanger — Frontend

> The face of PingRanger. A Next.js 16 App Router application that shows your monitors live, lets you drill into incidents, and generates shareable public status pages — all server-rendered for SEO and speed.

---

## What it does

- **Landing page** — marketing page with hero, features, how-it-works, FAQ, and footer
- **Dashboard** — live monitor grid, server-side rendered on first load, then kept fresh by SWR + SSE
- **Monitor detail** — status, latency, incident history, publish/unpublish public page
- **Public status pages** — unauthenticated pages at `/p/<slug>` with OG/Twitter metadata
- **Telegram bot setup** — settings page to connect alert channels
- **Auth** — Clerk sign-in/sign-up with SSR-compatible middleware

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Auth | Clerk (`@clerk/nextjs`) |
| Data fetching | SWR + native `fetch` (SSR hydration) |
| Real-time | `EventSource` / Server-Sent Events |
| Styling | Tailwind CSS |
| UI primitives | Custom components (no heavy UI library) |
| Icons | Lucide React |
| HTTP client | `@/lib/api` (typed fetch wrapper) |

---

## App structure

```
app/
├── layout.tsx                      # Root layout — ClerkProvider, ToastProvider, fonts
│
├── (public)/
│   └── page.tsx                    # Landing page (hero, features, FAQ, etc.)
│
├── (auth)/
│   ├── sign-in/[[...sign-in]]/     # Clerk hosted sign-in
│   └── sign-up/[[...sign-up]]/     # Clerk hosted sign-up
│
├── (dashboard)/                    # Protected area — requires Clerk session
│   ├── layout.tsx                  # Sidebar, nav, user button
│   ├── dashboard/
│   │   └── page.tsx                # SSR: fetches monitors server-side, renders MonitorList
│   ├── monitors/
│   │   ├── new/page.tsx            # Create monitor form
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Monitor detail + publish/unpublish
│   │   │   └── edit/page.tsx       # Edit monitor form
│   └── settings/
│       └── page.tsx                # Telegram bot setup
│
└── p/
    └── [slug]/
        └── page.tsx                # Public status page (ISR, revalidate 60s)

components/
├── landing/
│   ├── navbar.tsx                  # Scroll-aware nav, auth state skeleton
│   ├── hero.tsx
│   ├── features.tsx
│   ├── how-it-works.tsx
│   ├── faq.tsx                     # Accordion FAQ
│   └── footer.tsx
│
├── monitors/
│   ├── monitor-list.tsx            # Client component — SWR + SSE, summary bar, sorted grid
│   ├── monitor-card.tsx            # Clickable card with status, latency, uptime %, actions dropdown
│   ├── monitor-form.tsx            # Create/Edit form with alert channel config and public toggle
│   ├── status-badge.tsx            # Colored dot + label for up/down/pending/paused
│   └── latency-badge.tsx          # Color-coded latency in ms
│
├── incidents/
│   └── incidents-table.tsx         # Paginated incident history table
│
└── ui/
    ├── button.tsx                  # Button with size/variant/loading props
    ├── card.tsx                    # Basic card wrapper
    ├── input.tsx                   # Styled form input
    ├── confirm-modal.tsx           # Accessible confirmation dialog
    ├── empty-state.tsx             # Empty list placeholder
    └── toast.tsx                   # Lightweight toast notification system

hooks/
└── use-monitor-events.ts           # SSE hook — returns connected boolean, calls onEvent callback

lib/
├── api.ts                          # Typed API client (createApiClient) + standalone helpers
└── utils.ts                        # formatRelativeTime, formatDate, formatDuration, calculateUptime
```

---

## How SSR + real-time works together

The dashboard uses a **two-layer data strategy**:

1. **Server-side render** — `dashboard/page.tsx` is an `async` Server Component. It calls `auth()` from `@clerk/nextjs/server` to get the session token, fetches the monitor list directly from the backend, and passes it as `initialMonitors` to `<MonitorList>`.

2. **SWR hydration** — `MonitorList` is a Client Component that receives `initialMonitors` as `fallbackData`. SWR serves the initial data immediately (no loading flash), then revalidates in the background every 30 s.

3. **Server-Sent Events** — `useMonitorEvents` opens an `EventSource` connection to `/events?token=<jwt>`. When the backend emits a `check_completed`, `monitor_created`, or `monitor_deleted` event, SWR's `mutate()` is called and the UI updates instantly.

The result: **instant first paint** (SSR) + **live updates** (SSE) + **resilient fallback** (SWR polling).

---

## Public status pages

Any monitor can be published with a single click. When published:

- A random 8-character slug is generated and stored in the DB
- The page is available at `https://yourdomain.com/p/<slug>` — no login required
- The page uses **ISR** (`revalidate = 60`) so it's fast and SEO-friendly
- `generateMetadata` produces correct `<title>`, OpenGraph, and Twitter Card tags based on current monitor status
- The page shows: name, URL, current status, uptime %, 30-day incident count, active incident details, and resolved incident history

---

## Uptime calculation

`calculateUptime(incidents, monitorCreatedAt)` in `lib/utils.ts`:

- Window: last 30 days, or since the monitor was created (whichever is shorter)
- Sums the duration of all resolved incidents that overlap with the window
- Active incidents count from their start until now
- Returns a percentage clamped between 0 and 100

---

## Route protection

This project uses `proxy.ts` (Next.js 16's rename of `middleware.ts`). It marks the following as public:

- `/` — landing page
- `/sign-in`, `/sign-up` — auth pages
- `/p/(.*)` — public status pages

Everything else is protected and redirects to `/sign-in`.

> **Note:** If you see the warning `The 'middleware' file convention is deprecated`, make sure you have `proxy.ts`, not `middleware.ts`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (`pk_live_...`) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (`sk_live_...`) — server-side only |
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL (e.g., `https://api.pingranger.com`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Defaults to `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Defaults to `/sign-up` |

```bash
cp .env.example .env.local
# Fill in all three required variables
```

---

## Local development

### Prerequisites

- Node.js 20+
- Backend running (see `../backend/README.md`)

### Install and run

```bash
npm install --legacy-peer-deps
npm run dev
```

App runs at `http://localhost:3001` (or `3000` if backend is on a different port).

Make sure `NEXT_PUBLIC_API_URL` points to your local backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Key design decisions

### No heavy UI library
All UI components are hand-rolled with Tailwind. This keeps the bundle small and gives full control over styling without fighting an opinionated design system.

### SWR over TanStack Query
SWR's `fallbackData` prop is a clean fit for the SSR hydration pattern. One import, one hook, done.

### SSE over WebSockets
The dashboard only needs server → client updates. SSE is simpler to implement, works natively in browsers with no extra library, and reconnects automatically.

### Soft delete awareness
Monitor cards and lists never show deleted monitors — the backend filters `deletedAt: null` at the DB level, and the frontend gets clean data with no client-side filtering needed.

### Tailwind design tokens
Colors are semantic (`text-text-primary`, `bg-bg-main`, `text-status-up`, `text-status-down`) defined in `tailwind.config.ts`. Swapping the theme is a one-file change.

---

## Deployment

This is a standard Next.js 16 application. It can be deployed to:

- **Vercel** — zero-config, recommended
- **Dokploy / Docker** — use the default Next.js Dockerfile or a custom one
- **Any Node.js host** — `npm run build && npm start`

Make sure all environment variables are set in the deployment environment before the first build.
