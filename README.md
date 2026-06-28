# ReasonAI — Smart Reasoning System

An AI tool that breaks complex problems into clean, transparent reasoning steps —
decompose → analyze → reason → conclude — and explains **why** each step holds up,
not just what the answer is.

## Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Reasoning engine:** Google Gemini (`gemini-2.5-flash`) via the @google/generative-ai SDK, driven by a
  structured system prompt + Zod schema validation (prompt engineering, not fine-tuning)
- **Backend / persistence:** Supabase (Postgres + RLS) for sessions, config, and logs
- **Admin:** `/dashboard`, `/dashboard/config`, `/dashboard/logs`

## Project structure

```
app/
  api/
    reason/route.ts        POST — runs reasoning, persists session
    sessions/route.ts       GET — list sessions (history + dashboard)
    sessions/[id]/route.ts  GET — single session detail
    stats/route.ts          GET — aggregated metrics for dashboard
    config/route.ts         GET/PUT — admin-editable settings
    logs/route.ts           GET — system event log
    health/route.ts         GET — env/config sanity check
  reason/page.tsx           Main user-facing reasoning workspace
  history/page.tsx          Past sessions, click to view full steps
  dashboard/page.tsx        Admin stats + recent sessions table
  dashboard/config/page.tsx Model + feature toggles
  dashboard/logs/page.tsx   Raw system logs
lib/
  reasoning-agent.ts         Prompt engineering + Google Gemini call + validation
  supabase-admin.ts          Service-role client (server only)
  supabase-browser.ts         Anon client (browser-safe)
types/reasoning.ts           Shared TS types
supabase/schema.sql           Full DB schema + RLS policies
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Open the SQL editor → paste the contents of `supabase/schema.sql` → run it.
   This creates the `sessions`, `app_config`, and `system_logs` tables with RLS enabled.
3. Grab your **Project URL**, **anon key**, and **service_role key** from
   Project Settings → API.

### 3. Get a Google Gemini API key

Create one at [aistudio.google.com](https://aistudio.google.com/apikey).

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` to the client —
they're only read inside `app/api/*/route.ts` files (server-side).

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` → redirects to `/reason`.

## How the reasoning engine works

`lib/reasoning-agent.ts` is the core of the "agent": it sends a system prompt that
forces Gemini into a 4-stage structure (decompose, analyze, reason, conclude) and
requires a `why` justification per step. The response is parsed as JSON and validated
against a Zod schema before it ever reaches the database or the UI — so malformed
model output fails loudly instead of silently breaking the page.

This is prompt-engineering-based reasoning (not a separate fine-tuned model), which
is the right tradeoff for this use case: it's fast to iterate on, fully observable
(you can read the prompt and know exactly what it does), and good enough at
`gemini-2.5-flash` quality for general problem decomposition.

### Extending to multi-agent

If you want to go further (e.g. a separate "critic" agent that checks the reasoning
before showing it to the user), the natural extension point is `runReasoning()` in
`lib/reasoning-agent.ts` — wrap its output in a second Gemini call that scores/revises
the steps before returning.

## Deployment

Works out of the box on **Vercel**:

```bash
vercel
```

Add the same environment variables in Vercel → Project Settings → Environment Variables.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — it's used only in
  `lib/supabase-admin.ts`, imported only by API routes, never by client components.
- The `/dashboard/*` admin pages are not yet gated behind auth in this scaffold.
  Before deploying publicly, add middleware (e.g. `middleware.ts` checking a cookie
  set after a password check against `ADMIN_PASSWORD`) to protect `/dashboard`.
- A simple in-memory rate limiter is applied to `/api/reason` (10 req/min per IP).
  For production with multiple server instances, replace with a Redis/Upstash-backed
  limiter so the limit is shared across instances.
