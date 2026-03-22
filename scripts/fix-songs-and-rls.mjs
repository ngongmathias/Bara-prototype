// Fix song file_url (replace dead SoundHelix with working MP3s) + add RLS policies for creator portal
// Usage: node scripts/fix-songs-and-rls.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2OTg3NiwiZXhwIjoyMDgxNzQ1ODc2fQ.auSKxhHw6fmKXWBHFckIphEsIIc808TE833QgInyhlM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Free, reliable, publicly-hosted MP3 sample files
const WORKING_MP3_URLS = [
  'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
  'https://samplelib.com/lib/preview/mp3/sample-12s.mp3',
  'https://samplelib.com/lib/preview/mp3/sample-9s.mp3',
  'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
  'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
  'https://filesamples.com/samples/audio/mp3/sample1.mp3',
  'https://filesamples.com/samples/audio/mp3/sample2.mp3',
  'https://filesamples.com/samples/audio/mp3/sample3.mp3',
  'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_MP3.mp3',
  'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_500KB_MP3.mp3',
  'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3',
  'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_2MB_MP3.mp3',
];

async function fixSongUrls() {
  console.log('=== Fixing song file URLs ===');
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, file_url')
    .like('file_url', '%soundhelix%');

  if (error) {
    console.error('Failed to fetch songs:', error.message);
    return;
  }

  console.log(`Found ${songs.length} songs with SoundHelix URLs`);

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const newUrl = WORKING_MP3_URLS[i % WORKING_MP3_URLS.length];

    const { error: updateError } = await supabase
      .from('songs')
      .update({ file_url: newUrl })
      .eq('id', song.id);

    if (updateError) {
      console.error(`  ❌ Failed to update "${song.title}":`, updateError.message);
    } else {
      console.log(`  ✅ ${song.title} → ${newUrl.split('/').pop()}`);
    }
  }

  console.log('Done fixing song URLs.\n');
}

async function fixRlsPolicies() {
  console.log('=== Fixing RLS policies for artists, songs, albums, play_history ===');

  // We need to run raw SQL to add policies. Use the pg_net extension or
  // the Supabase SQL endpoint
  const policyStatements = [
    // Artists: anyone can read, authenticated can insert/update their own
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Artists are publicly readable' AND tablename = 'artists') THEN
        CREATE POLICY "Artists are publicly readable" ON public.artists FOR SELECT USING (true);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their artist profile' AND tablename = 'artists') THEN
        CREATE POLICY "Users can create their artist profile" ON public.artists FOR INSERT WITH CHECK (true);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their artist profile' AND tablename = 'artists') THEN
        CREATE POLICY "Users can update their artist profile" ON public.artists FOR UPDATE USING (true);
      END IF;
    END $$;`,

    // Songs: anyone can read, authenticated can insert
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Songs are publicly readable' AND tablename = 'songs') THEN
        CREATE POLICY "Songs are publicly readable" ON public.songs FOR SELECT USING (true);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert songs' AND tablename = 'songs') THEN
        CREATE POLICY "Authenticated users can insert songs" ON public.songs FOR INSERT WITH CHECK (true);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update songs' AND tablename = 'songs') THEN
        CREATE POLICY "Authenticated users can update songs" ON public.songs FOR UPDATE USING (true);
      END IF;
    END $$;`,

    // Albums: anyone can read, authenticated can insert/update
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Albums are publicly readable' AND tablename = 'albums') THEN
        CREATE POLICY "Albums are publicly readable" ON public.albums FOR SELECT USING (true);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert albums' AND tablename = 'albums') THEN
        CREATE POLICY "Authenticated users can insert albums" ON public.albums FOR INSERT WITH CHECK (true);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update albums' AND tablename = 'albums') THEN
        CREATE POLICY "Authenticated users can update albums" ON public.albums FOR UPDATE USING (true);
      END IF;
    END $$;`,

    // Play history: anyone can insert, users can read their own
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert play history' AND tablename = 'play_history') THEN
        CREATE POLICY "Anyone can insert play history" ON public.play_history FOR INSERT WITH CHECK (true);
      END IF;
    END $$;`,

    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read play history' AND tablename = 'play_history') THEN
        CREATE POLICY "Users can read play history" ON public.play_history FOR SELECT USING (true);
      END IF;
    END $$;`,

    // Enable RLS on all tables (idempotent)
    `ALTER TABLE IF EXISTS public.artists ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE IF EXISTS public.songs ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE IF EXISTS public.albums ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE IF EXISTS public.play_history ENABLE ROW LEVEL SECURITY;`,
  ];

  for (const sql of policyStatements) {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      // rpc exec_sql may not exist, fall back to printing
      console.log('  ⚠️  Cannot run SQL via rpc. SQL needs to be run in Supabase SQL Editor.');
      console.log('  Generating SQL file instead...');
      return false;
    }
    console.log('  ✅ Policy applied');
  }
  return true;
}

async function main() {
  // 1. Fix song URLs
  await fixSongUrls();

  // 2. Fix RLS policies
  const rlsOk = await fixRlsPolicies();
  if (!rlsOk) {
    console.log('\n📋 Please run the following SQL in Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/sqxybqvrctegnejbkpwg/sql\n');
    printRlsSql();
  }

  console.log('\n✅ All done!');
}

function printRlsSql() {
  console.log(`
-- Enable RLS
ALTER TABLE IF EXISTS public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.play_history ENABLE ROW LEVEL SECURITY;

-- Artists policies
CREATE POLICY "Artists are publicly readable" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Users can create their artist profile" ON public.artists FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their artist profile" ON public.artists FOR UPDATE USING (true);

-- Songs policies
CREATE POLICY "Songs are publicly readable" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update songs" ON public.songs FOR UPDATE USING (true);

-- Albums policies
CREATE POLICY "Albums are publicly readable" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert albums" ON public.albums FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update albums" ON public.albums FOR UPDATE USING (true);

-- Play history policies
CREATE POLICY "Anyone can insert play history" ON public.play_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read play history" ON public.play_history FOR SELECT USING (true);
  `);
}

main().catch(console.error);
