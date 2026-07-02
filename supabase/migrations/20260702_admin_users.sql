-- Create admin_users table for admin access control
create table if not exists admin_users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique not null,
  role        text default 'admin',
  created_at  timestamptz default now()
);

alter table admin_users enable row level security;

create policy "Admin users can read their own row"
  on admin_users for select
  to authenticated
  using (auth.uid() = id);
