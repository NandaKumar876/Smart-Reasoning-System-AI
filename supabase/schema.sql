-- Smart Reasoning System — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)

create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE: sessions
-- One row per reasoning request, including the full structured
-- output (steps as JSONB) so the admin dashboard can render
-- past sessions without re-calling the model.
-- ============================================================
create table if not exists sessions (
  id              uuid primary key default gen_random_uuid(),
  problem         text not null,
  steps           jsonb not null default '[]'::jsonb,
  final_answer    text,
  model           text not null default 'gemini-2.5-flash',
  input_tokens    integer not null default 0,
  output_tokens   integer not null default 0,
  latency_ms      integer not null default 0,
  status          text not null default 'success' check (status in ('success', 'error')),
  error_message   text,
  client_ip_hash  text,
  created_at      timestamptz not null default now()
);

create index if not exists sessions_created_at_idx on sessions (created_at desc);
create index if not exists sessions_status_idx on sessions (status);

-- ============================================================
-- TABLE: app_config
-- Single-row-per-key config table, editable from the admin page
-- (model name, max steps, feature toggles, etc).
-- ============================================================
create table if not exists app_config (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

insert into app_config (key, value) values
  ('model', '"gemini-2.5-flash"'),
  ('max_steps', '6'),
  ('show_why_explanations', 'true'),
  ('save_sessions', 'true'),
  ('show_token_usage', 'false'),
  ('gemini_api_key', '""')
on conflict (key) do nothing;

-- ============================================================
-- TABLE: system_logs
-- Lightweight event log for the admin "Logs" page.
-- ============================================================
create table if not exists system_logs (
  id          bigint generated always as identity primary key,
  level       text not null default 'info' check (level in ('info', 'success', 'error', 'api')),
  message     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists system_logs_created_at_idx on system_logs (created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Public (anon) clients can INSERT/SELECT sessions (the app needs
-- this to run reasoning + show history) but cannot touch config
-- or logs — those are service-role only, accessed via the admin
-- API routes which use SUPABASE_SERVICE_ROLE_KEY.
-- ============================================================
alter table sessions enable row level security;
alter table app_config enable row level security;
alter table system_logs enable row level security;

create policy "Anyone can insert sessions"
  on sessions for insert
  to anon
  with check (true);

create policy "Anyone can read sessions"
  on sessions for select
  to anon
  using (true);

-- No anon policies on app_config / system_logs — service role only,
-- which bypasses RLS by default.
