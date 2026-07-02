# ReasonAI — Smart Reasoning System

An AI tool that breaks complex problems into clean, transparent reasoning steps —
decompose → analyze → reason → conclude — and explains **why** each step holds up,
not just what the answer is.

## Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Reasoning engine:** Google Gemini (`gemini-2.5-flash`) via the @google/generative-ai SDK, driven by a
  structured system prompt + Zod schema validation (prompt engineering, not fine-tuning)
- **Backend / persistence:** Supabase (Postgres + RLS) for sessions, config, and logs
- **Auth & Admin:** Supabase Auth (`@supabase/ssr`) with Google & GitHub OAuth, Dedicated Email/Password Admin, and `admin_users` RLS access control.

## Project structure

```
app/
  admin/
    login/page.tsx          Multi-provider dark teal login portal
    dashboard/page.tsx      Admin dashboard (users table, stats, search, pagination)
  api/
    admin/login/route.ts    POST — rate-limited email/password authentication (5 attempts / 15 min)
    reason/route.ts        POST — runs reasoning, persists session
    reason-gemini/route.ts POST — multi-model routing (gemini-sdk | gemini-rest)
    sessions/route.ts       GET — list sessions (history + dashboard)
    sessions/[id]/route.ts  GET — single session detail
    stats/route.ts          GET — aggregated metrics for dashboard
    config/route.ts         GET/PUT — admin-editable settings
    logs/route.ts           GET — system event log
    health/route.ts         GET — env/config sanity check
  auth/
    callback/route.ts       GET — OAuth PKCE callback handler & admin_users verification
  reason/page.tsx           Main user-facing reasoning workspace
  history/page.tsx          Past sessions, click to view full steps
lib/
  gemini.ts                  Raw fetch-based REST helper for Gemini API
  reasoning-agent.ts         Prompt engineering + Google Gemini call + validation
  supabase-admin.ts          Service-role client (server only)
utils/
  supabase/
    client.ts                Browser client (@supabase/ssr)
    server.ts                Server client with cookies (@supabase/ssr)
    middleware.ts            Session refresher helper (@supabase/ssr)
middleware.ts                Edge middleware checking session + admin_users table
scripts/
  create-admin.ts            One-time admin user seed script using service role
supabase/
  schema.sql                 Full DB schema + RLS policies
  migrations/                SQL migrations for database tracking
```

## Admin Authentication & Management Guide

### 1. OAuth Redirect URLs Configuration

When setting up Google and GitHub OAuth providers in the **Supabase Dashboard** (Authentication → Providers), add the following Redirect URLs:

#### Local Development:
```
http://localhost:3000/auth/callback
```

#### Production (Vercel / Custom Domain):
```
https://your-domain.com/auth/callback
https://your-app.vercel.app/auth/callback
```

#### Provider Developer Portal Settings:
- **Google Cloud Console:** Set **Authorized redirect URIs** to your Supabase Auth Callback URL:
  `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
- **GitHub OAuth App:** Set **Authorization callback URL** to your Supabase Auth Callback URL:
  `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`

---

### 2. Creating an Admin User

#### Option A: Using the Seed Script (Recommended)
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your `.env.local` file and run:

```bash
npm run create-admin
```

This automatically creates the account in Supabase Auth and inserts a verified row into `admin_users`.

#### Option B: Manually via SQL
1. Create a user via Supabase Dashboard → Authentication → Users (or sign up via OAuth/Email).
2. Grab the User's UUID (`id`).
3. Run the following SQL query in the **Supabase SQL Editor**:

```sql
insert into admin_users (id, email, role)
values ('USER_UUID_HERE', 'admin@example.com', 'admin')
on conflict (id) do nothing;
```

---

### 3. Rotating an Admin Password

#### Via Supabase Dashboard:
1. Go to **Supabase Dashboard** → **Authentication** → **Users**.
2. Locate the admin email.
3. Click the `...` menu → **Send Password Reset** or **Edit User** → update password.

#### Via Node / Service Role Script:
Execute a one-liner using your `SUPABASE_SERVICE_ROLE_KEY`:

```ts
await supabase.auth.admin.updateUserById('ADMIN_USER_UUID', {
  password: 'NewStrongPassword123!',
});
```

---

## Setup & Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your actual API keys in `.env.local`.

### 3. Run development server

```bash
npm run dev
```

Visit `http://localhost:3000` to start using ReasonAI.
Visit `http://localhost:3000/admin/login` to access the admin portal.

---

## Security Notes

- **Service Role Key Protection:** `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side routes and scripts. It is never sent to the browser.
- **Access Control:** All `/admin/*` routes require a valid Supabase session **AND** matching record in `admin_users` enforced at the edge via Next.js middleware.
- **Rate Limiting:** Email/password login is rate-limited to **5 attempts per 15 minutes per IP**.
