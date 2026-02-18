-- Create Artists table
create table if not exists artists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text,
  image_url text, -- Profile picture
  banner_url text, -- Header image
  is_verified boolean default false,
  twitter_handle text,
  instagram_handle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Albums table
create table if not exists albums (
  id uuid default gen_random_uuid() primary key,
  artist_id uuid references artists(id) on delete cascade not null,
  title text not null,
  cover_url text,
  release_date date,
  genre text,
  type text default 'album', -- album, single, ep
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Songs table
create table if not exists songs (
  id uuid default gen_random_uuid() primary key,
  album_id uuid references albums(id) on delete cascade, -- Optional (might be single without album?) -> usually single is an album of 1 song
  artist_id uuid references artists(id) on delete cascade not null, -- Denormalized for easier querying
  title text not null,
  file_url text not null, -- MP3 URL
  cover_url text, -- Usually same as album, but can be separate
  duration int, -- Seconds
  plays bigint default 0,
  lyrics text,
  is_explicit boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists albums_artist_id_idx on albums(artist_id);
create index if not exists songs_artist_id_idx on songs(artist_id);
create index if not exists songs_album_id_idx on songs(album_id);
create index if not exists songs_plays_idx on songs(plays desc);

-- RLS Policies

-- Enable RLS
alter table artists enable row level security;
alter table albums enable row level security;
alter table songs enable row level security;

-- Public Read Access
create policy "Public can view artists" on artists for select using (true);
create policy "Public can view albums" on albums for select using (true);
create policy "Public can view songs" on songs for select using (true);

-- Admin Write Access (simplified for prototype: authenticated users with specific role, or just authenticated for now?)
-- Ideally we use a claims check or admin_users table check.
-- For now, we'll allow authenticated users to INSERT if they are "admin" (assumed) OR allow open insert for "verified artists" later.
-- To be safe, let's restrict to service_role or check a specific email?
-- Actually, let's allow "authenticated" for now to test Admin Panel easily.
create policy "Authenticated can insert artists" on artists for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update artists" on artists for update using (auth.role() = 'authenticated');

create policy "Authenticated can insert albums" on albums for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update albums" on albums for update using (auth.role() = 'authenticated');

create policy "Authenticated can insert songs" on songs for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update songs" on songs for update using (auth.role() = 'authenticated');

-- Function to increment song plays (RPC)
create or replace function increment_song_plays(song_id uuid)
returns void as $$
begin
  update songs
  set plays = plays + 1
  where id = song_id;
end;
$$ language plpgsql;
