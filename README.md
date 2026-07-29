# Newton — Next.js

Migrated from Vite + React Router to Next.js 15 (App Router).

## Running it

```bash
npm install
cp .env.local.example .env.local   # then edit if needed
npm run dev
```

`NEXT_PUBLIC_API_BASE_URL` controls the backend; if unset it falls back to
the same production API the original app used.

## What changed

- **Routing**: `react-router-dom` (`BrowserRouter`/`Routes`) → the App
  Router's file-based routing. Each old route is now `src/app/<route>/page.tsx`.
- **Navigation**: `useNavigate`/`useLocation`/`useSearchParams` →
  `next/navigation`'s `useRouter`/`useSearchParams`. Internal `<a href="...">`
  links → `next/link`'s `<Link>` for client-side transitions.
- **Env vars**: `import.meta.env.VITE_API_BASE_URL` →
  `process.env.NEXT_PUBLIC_API_BASE_URL`.
- **Logo image**: moved to `public/logo.png`, rendered via `next/image`.
- **Everything else** (contexts, hooks, components, API client, CSS) is
  unchanged — this app was already fully client-rendered (localStorage-based
  auth, client-side `fetch` calls), so it ports over as `"use client"`
  components with no server-fetching rework needed.
- `vercel.json`'s SPA rewrite is gone — Next.js handles routing natively.

## Note on secrets

Your uploaded `.env.local` contained a live Vercel OIDC token. It was
**not** copied into this project. Only the `.env.local.example` template
is included — add your own `.env.local` locally (it's gitignored).
