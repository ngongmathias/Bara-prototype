-- Create Leagues table
create table if not exists leagues (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  country text,
  logo_url text,
  type text, -- 'league' or 'cup'
  season text, -- e.g. '2023-2024'
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Teams table
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  short_name text,
  logo_url text,
  league_id uuid references leagues(id),
  stadium text,
  manager text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Matches table
create table if not exists matches (
  id uuid default gen_random_uuid() primary key,
  league_id uuid references leagues(id),
  home_team_id uuid references teams(id) not null,
  away_team_id uuid references teams(id) not null,
  match_date timestamp with time zone not null,
  status text default 'scheduled', -- scheduled, live, finished, postponed
  home_score int default 0,
  away_score int default 0,
  minute text, -- '45', '90+3', 'HT', 'FT'
  venue text,
  referee text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table leagues enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;

-- Public Read
create policy "Public can view leagues" on leagues for select using (true);
create policy "Public can view teams" on teams for select using (true);
create policy "Public can view matches" on matches for select using (true);

-- Authenticated Write (Admin/Editor role ideally, but Authenticated for prototype)
create policy "Authenticated can insert leagues" on leagues for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update leagues" on leagues for update using (auth.role() = 'authenticated');
create policy "Authenticated can insert teams" on teams for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update teams" on teams for update using (auth.role() = 'authenticated');
create policy "Authenticated can insert matches" on matches for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update matches" on matches for update using (auth.role() = 'authenticated');
