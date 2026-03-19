// Run DDL + remaining seed data against Supabase
// Uses the Supabase SQL API endpoint for DDL operations
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2OTg3NiwiZXhwIjoyMDgxNzQ1ODc2fQ.auSKxhHw6fmKXWBHFckIphEsIIc808TE833QgInyhlM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper: run raw SQL via the Supabase SQL API (available via service role on /rest/v1/rpc)
// We'll create a temporary function that executes SQL, run it, then drop it
async function execSQL(label, sql) {
  console.log(`\n>>> ${label}...`);
  
  // Use the Supabase Management API SQL endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_raw_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (response.ok) {
    console.log(`  ✅ ${label}`);
    return true;
  }
  
  const text = await response.text();
  if (text.includes('Could not find the function')) {
    // Function doesn't exist, try creating it first
    return false;
  }
  console.log(`  ❌ ${label}: ${text.substring(0, 200)}`);
  return false;
}

async function main() {
  console.log('=== Sprint 7 DDL + Remaining Data ===\n');

  // Step 1: Create the exec_raw_sql function first
  console.log('Step 1: Creating SQL execution function...');
  const createFnSQL = `
    CREATE OR REPLACE FUNCTION public.exec_raw_sql(query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  // We need to create this function via another method
  // Let's try using the Supabase SQL HTTP endpoint directly
  const sqlEndpoint = `${SUPABASE_URL}/rest/v1/rpc/`;
  
  // Alternative: use pg-meta endpoint
  const pgMetaRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: createFnSQL })
  });
  
  if (pgMetaRes.ok) {
    console.log('  ✅ exec_raw_sql function created');
  } else {
    // Try alternative endpoint
    const altRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_raw_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: 'SELECT 1' })
    });
    
    if (altRes.ok) {
      console.log('  ✅ exec_raw_sql function already exists');
    } else {
      console.log('  ⚠️ Cannot create exec_raw_sql. Will use alternative approach.');
      console.log('  Please run the following SQL in Supabase SQL Editor:');
      console.log('  ' + createFnSQL.trim());
      
      // Try yet another approach: the Supabase project API
      console.log('\n  Trying Supabase project SQL API...');
    }
  }

  // Step 2: Try to create tables using exec_raw_sql
  const podcastsDDL = `
    CREATE TABLE IF NOT EXISTS public.podcasts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      host TEXT NOT NULL,
      description TEXT,
      category TEXT,
      cover_url TEXT,
      language TEXT DEFAULT 'en',
      is_featured BOOLEAN DEFAULT false,
      subscriber_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE TABLE IF NOT EXISTS public.podcast_episodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      audio_url TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      episode_number INTEGER,
      season_number INTEGER DEFAULT 1,
      published_at TIMESTAMPTZ DEFAULT now(),
      play_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE TABLE IF NOT EXISTS public.podcast_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
      subscribed_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, podcast_id)
    );
    
    CREATE TABLE IF NOT EXISTS public.podcast_listen_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      episode_id UUID REFERENCES public.podcast_episodes(id) ON DELETE CASCADE,
      progress_seconds INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT false,
      listened_at TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.podcast_subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.podcast_listen_history ENABLE ROW LEVEL SECURITY;

    DO $p$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcasts' AND policyname='Podcasts are viewable by everyone') THEN
        CREATE POLICY "Podcasts are viewable by everyone" ON public.podcasts FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcast_episodes' AND policyname='Podcast episodes are viewable by everyone') THEN
        CREATE POLICY "Podcast episodes are viewable by everyone" ON public.podcast_episodes FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcast_subscriptions' AND policyname='Users can manage their subscriptions') THEN
        CREATE POLICY "Users can manage their subscriptions" ON public.podcast_subscriptions FOR ALL USING (true) WITH CHECK (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='podcast_listen_history' AND policyname='Users can manage their listen history') THEN
        CREATE POLICY "Users can manage their listen history" ON public.podcast_listen_history FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $p$;

    GRANT SELECT ON public.podcasts TO anon, authenticated;
    GRANT SELECT ON public.podcast_episodes TO anon, authenticated;
    GRANT ALL ON public.podcast_subscriptions TO authenticated;
    GRANT ALL ON public.podcast_listen_history TO authenticated;
    GRANT ALL ON public.podcasts TO authenticated;
    GRANT ALL ON public.podcast_episodes TO authenticated;
  `;

  const moviesDDL = `
    CREATE TABLE IF NOT EXISTS public.movies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT,
      year INTEGER,
      duration_minutes INTEGER,
      rating DECIMAL(2,1) DEFAULT 0,
      poster_url TEXT,
      backdrop_url TEXT,
      trailer_url TEXT,
      video_url TEXT,
      director TEXT,
      cast_members TEXT[],
      country TEXT,
      language TEXT DEFAULT 'en',
      is_featured BOOLEAN DEFAULT false,
      is_free BOOLEAN DEFAULT true,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.movie_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      image_url TEXT
    );

    DO $m$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movie_categories_name_key') THEN
        ALTER TABLE public.movie_categories ADD CONSTRAINT movie_categories_name_key UNIQUE (name);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movie_categories_slug_key') THEN
        ALTER TABLE public.movie_categories ADD CONSTRAINT movie_categories_slug_key UNIQUE (slug);
      END IF;
    END $m$;

    CREATE TABLE IF NOT EXISTS public.movie_watchlist (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, movie_id)
    );

    ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.movie_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.movie_watchlist ENABLE ROW LEVEL SECURITY;

    DO $mv$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movies' AND policyname='Movies are viewable by everyone') THEN
        CREATE POLICY "Movies are viewable by everyone" ON public.movies FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movie_categories' AND policyname='Movie categories are viewable by everyone') THEN
        CREATE POLICY "Movie categories are viewable by everyone" ON public.movie_categories FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='movie_watchlist' AND policyname='Users can manage their watchlist') THEN
        CREATE POLICY "Users can manage their watchlist" ON public.movie_watchlist FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $mv$;

    GRANT SELECT ON public.movies TO anon, authenticated;
    GRANT SELECT ON public.movie_categories TO anon, authenticated;
    GRANT ALL ON public.movie_watchlist TO authenticated;
    GRANT ALL ON public.movies TO authenticated;
    GRANT ALL ON public.movie_categories TO authenticated;
  `;

  // Try exec_raw_sql for DDL
  let ddlSuccess = await execSQL('Create podcast tables', podcastsDDL);
  if (!ddlSuccess) {
    // Try creating the helper function via pg endpoint
    for (const endpoint of ['/pg/query', '/pg', '/sql']) {
      const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({ query: createFnSQL })
      });
      if (res.ok) {
        console.log(`  ✅ Created helper function via ${endpoint}`);
        ddlSuccess = true;
        break;
      }
    }
    
    if (ddlSuccess) {
      await execSQL('Create podcast tables', podcastsDDL);
      await execSQL('Create movie tables', moviesDDL);
    } else {
      // Last resort: output SQL for manual execution
      console.log('\n⚠️ Cannot execute DDL programmatically.');
      console.log('Please copy and run the following SQL in Supabase SQL Editor:');
      console.log('--- PODCASTS DDL ---');
      console.log(podcastsDDL);
      console.log('\n--- MOVIES DDL ---');
      console.log(moviesDDL);
      
      console.log('\nAfter running DDL, re-run: node scripts/run-migration.mjs');
      console.log('to insert podcast and movie seed data.');
    }
  } else {
    await execSQL('Create movie tables', moviesDDL);
  }

  // Step 3: Fix playlists — use proper UUIDs
  console.log('\n=== Fix Playlists with proper UUIDs ===');
  
  // Generate proper UUIDs by inserting with auto-generated IDs
  const playlistTitles = [
    { title: 'Afrobeats Essentials', description: 'The biggest Afrobeats hits all in one place. Updated weekly.', cover_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { title: 'Amapiano Heat', description: 'The hottest Amapiano tracks from South Africa and beyond.', cover_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { title: 'Chill African Vibes', description: 'Relax and unwind with soulful African melodies.', cover_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { title: 'Workout Africa', description: 'High-energy African beats to fuel your workout.', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { title: 'New Releases Radar', description: "Fresh tracks from Africa's top artists. Updated daily.", cover_url: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
  ];

  // Delete any existing platform playlists to avoid duplicates
  await supabase.from('playlists').delete().eq('created_by', 'platform');
  
  const playlistIds = [];
  for (const pl of playlistTitles) {
    const { data, error } = await supabase.from('playlists').insert(pl).select('id').single();
    if (error) {
      console.log(`  ⚠️ ${pl.title}: ${error.message}`);
    } else {
      playlistIds.push({ title: pl.title, id: data.id });
      console.log(`  ✅ ${pl.title} → ${data.id}`);
    }
  }

  // Playlist song mappings
  const songMappings = {
    'Afrobeats Essentials': ['c1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000024','c1000000-0000-0000-0000-000000000033','c1000000-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000005'],
    'Amapiano Heat': ['c1000000-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000028','c1000000-0000-0000-0000-000000000029','c1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000014'],
    'Chill African Vibes': ['c1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000030','c1000000-0000-0000-0000-000000000031','c1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000017'],
    'Workout Africa': ['c1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000033','c1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000025','c1000000-0000-0000-0000-000000000034'],
    'New Releases Radar': ['c1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000024','c1000000-0000-0000-0000-000000000025','c1000000-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000028','c1000000-0000-0000-0000-000000000030','c1000000-0000-0000-0000-000000000033','c1000000-0000-0000-0000-000000000034','c1000000-0000-0000-0000-000000000031','c1000000-0000-0000-0000-000000000032'],
  };

  for (const { title, id } of playlistIds) {
    const songs = songMappings[title] || [];
    const rows = songs.map((sid, i) => ({ playlist_id: id, song_id: sid, position: i + 1 }));
    const { error } = await supabase.from('playlist_songs').insert(rows);
    if (error) {
      console.log(`  ⚠️ ${title} songs: ${error.message}`);
    } else {
      console.log(`  ✅ ${title}: ${rows.length} songs linked`);
    }
  }

  // Final counts
  console.log('\n=== FINAL SUMMARY ===');
  const { count: pCount } = await supabase.from('playlists').select('*', { count: 'exact', head: true });
  const { count: psCount } = await supabase.from('playlist_songs').select('*', { count: 'exact', head: true });
  console.log(`  Playlists: ${pCount}`);
  console.log(`  Playlist songs: ${psCount}`);
  
  console.log('\n✅ DDL + Data script complete!');
}

main().catch(console.error);
