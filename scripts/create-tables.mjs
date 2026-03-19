// Create podcast + movie tables via Supabase Management API
// Then seed data via supabase-js client

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2OTg3NiwiZXhwIjoyMDgxNzQ1ODc2fQ.auSKxhHw6fmKXWBHFckIphEsIIc808TE833QgInyhlM';
const PROJECT_REF = 'sqxybqvrctegnejbkpwg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Step 1: Try to create an exec_raw_sql function via the Management API
async function createHelperFunction() {
  const sql = "CREATE OR REPLACE FUNCTION public.exec_raw_sql(query text) RETURNS void AS $$ BEGIN EXECUTE query; END; $$ LANGUAGE plpgsql SECURITY DEFINER;";
  
  // Try Management API
  const mgmtUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  const res = await fetch(mgmtUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });

  if (res.ok) {
    console.log('✅ Helper function created via Management API');
    return true;
  }
  
  console.log(`Management API response: ${res.status} ${res.statusText}`);
  return false;
}

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_raw_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ query: sql })
  });

  if (res.ok) return { ok: true };
  const text = await res.text();
  return { ok: false, error: text };
}

async function main() {
  console.log('=== Create Tables & Seed Podcasts/Movies ===\n');

  // First check if tables already exist
  const { error: podCheck } = await supabase.from('podcasts').select('id').limit(1);
  if (!podCheck) {
    console.log('✅ Podcasts table already exists!');
  } else {
    console.log(`Podcasts table check: ${podCheck.message}`);
  }

  const { error: movCheck } = await supabase.from('movies').select('id').limit(1);
  if (!movCheck) {
    console.log('✅ Movies table already exists!');
  } else {
    console.log(`Movies table check: ${movCheck.message}`);
  }

  // If tables don't exist, try to create them
  if (podCheck || movCheck) {
    console.log('\nAttempting to create tables...');
    
    // Try creating helper function first
    const helperCreated = await createHelperFunction();
    
    if (!helperCreated) {
      // Try direct RPC call to see if function already exists
      const testResult = await runSQL('SELECT 1');
      if (!testResult.ok) {
        console.log('\n⚠️ Cannot execute DDL via API. Creating helper function via alternative method...');
        
        // Try via Supabase dashboard SQL - output the combined SQL
        console.log('\n📋 Please run this SQL in Supabase SQL Editor (https://supabase.com/dashboard/project/sqxybqvrctegnejbkpwg/sql):');
        console.log('---');
        console.log(getDDL());
        console.log('---');
        console.log('\nAfter running, re-execute this script to seed data.');
        return;
      }
    }

    // Create tables via helper function
    if (podCheck) {
      const statements = getPodcastDDLStatements();
      for (const stmt of statements) {
        const result = await runSQL(stmt);
        if (!result.ok) {
          console.log(`  ❌ ${stmt.substring(0, 60)}... : ${result.error?.substring(0, 100)}`);
        }
      }
      console.log('  ✅ Podcast tables created');
    }

    if (movCheck) {
      const statements = getMovieDDLStatements();
      for (const stmt of statements) {
        const result = await runSQL(stmt);
        if (!result.ok) {
          console.log(`  ❌ ${stmt.substring(0, 60)}... : ${result.error?.substring(0, 100)}`);
        }
      }
      console.log('  ✅ Movie tables created');
    }
  }

  // Now seed podcast data
  console.log('\n=== Seeding Podcasts ===');
  const podcasts = [
    { id: 'pd100000-0000-0000-0000-000000000001', title: 'The African Dream', host: 'Amara Kone', description: 'Stories of founders building across the continent.', category: 'Entrepreneurship', cover_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 12400 },
    { id: 'pd100000-0000-0000-0000-000000000002', title: 'Naija Tech Talk', host: 'Tunde Obi', description: "Africa's tech ecosystem — startups, funding & innovation.", category: 'Technology', cover_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 8900 },
    { id: 'pd100000-0000-0000-0000-000000000003', title: 'Ubuntu Conversations', host: 'Thabo Mokoena', description: 'Pan-African dialogues on identity, culture & unity.', category: 'Culture', cover_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 6700 },
    { id: 'pd100000-0000-0000-0000-000000000004', title: 'Accra After Dark', host: 'Ama Serwaa', description: 'Mysteries and untold stories from West Africa.', category: 'True Crime', cover_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=300&fit=crop', is_featured: false, subscriber_count: 15200 },
    { id: 'pd100000-0000-0000-0000-000000000005', title: 'Laugh Out Loud Africa', host: 'Basket Mouth & Friends', description: 'The funniest comedians on the continent.', category: 'Comedy', cover_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=300&h=300&fit=crop', is_featured: false, subscriber_count: 21000 },
    { id: 'pd100000-0000-0000-0000-000000000006', title: 'The Pitch Room', host: 'Keza Ngowi', description: "Investment, wealth & personal finance for Africans.", category: 'Finance', cover_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 9800 },
  ];

  const { error: podErr } = await supabase.from('podcasts').upsert(podcasts, { onConflict: 'id' });
  console.log(podErr ? `  ⚠️ Podcasts: ${podErr.message}` : '  ✅ 6 podcasts inserted');

  // Episodes
  const episodes = [];
  const podcastEpisodeData = {
    'pd100000-0000-0000-0000-000000000001': [
      { num: 1, title: "From Zero to Unicorn: Flutterwave's Journey", desc: "How Flutterwave became Africa's most valuable startup.", dur: 2400, plays: 4500 },
      { num: 2, title: 'The Kigali Tech Hub Revolution', desc: "Rwanda is becoming Africa's Silicon Valley.", dur: 1800, plays: 3200 },
      { num: 3, title: "Women Leading Africa's Fintech Boom", desc: 'Meet the women building the future of finance.', dur: 2100, plays: 2800 },
      { num: 4, title: 'Agriculture 2.0: Tech Meets Farming', desc: 'How AI and drones are transforming African agriculture.', dur: 1950, plays: 1900 },
      { num: 5, title: 'Building in Africa vs Silicon Valley', desc: 'Why a founder left Google to build in Lagos.', dur: 2250, plays: 2100 },
    ],
    'pd100000-0000-0000-0000-000000000002': [
      { num: 1, title: "Nigeria's $4B Startup Ecosystem", desc: "Breaking down Nigeria's tech boom.", dur: 1800, plays: 3800 },
      { num: 2, title: 'Paystack to Stripe: The Acquisition Story', desc: "Africa's biggest tech acquisition.", dur: 2100, plays: 5200 },
      { num: 3, title: 'AI in Africa: Opportunities & Challenges', desc: 'Can Africa leapfrog into AI?', dur: 1950, plays: 2900 },
      { num: 4, title: "Mobile Money: Africa's Fintech Superpower", desc: 'M-Pesa and beyond.', dur: 2400, plays: 3100 },
      { num: 5, title: 'Cybersecurity in Africa', desc: 'The growing threat landscape.', dur: 1650, plays: 1800 },
    ],
    'pd100000-0000-0000-0000-000000000003': [
      { num: 1, title: 'What Does Pan-Africanism Mean in 2026?', desc: 'A roundtable on African unity.', dur: 2700, plays: 2400 },
      { num: 2, title: 'African Languages in the Digital Age', desc: 'Are African languages thriving online?', dur: 1800, plays: 1900 },
      { num: 3, title: "Afrofuturism: Imagining Africa's Tomorrow", desc: 'Reimagining the continent.', dur: 2100, plays: 2200 },
      { num: 4, title: 'Diaspora Connections: Home Away from Home', desc: 'Africans building community abroad.', dur: 1950, plays: 1600 },
      { num: 5, title: 'African Fashion Goes Global', desc: "Ankara to the runway.", dur: 2250, plays: 2700 },
    ],
    'pd100000-0000-0000-0000-000000000004': [
      { num: 1, title: 'The Disappearance of the Golden Stool', desc: "Ghana's most sacred artifact.", dur: 2700, plays: 6200 },
      { num: 2, title: 'Lagos Underground: The Untold Stories', desc: "Beneath Africa's largest city.", dur: 2400, plays: 5800 },
      { num: 3, title: 'The Nairobi Cold Case Files', desc: "Unsolved cases from Kenya's capital.", dur: 2100, plays: 4900 },
      { num: 4, title: 'Fraud Capital: The Sakawa Boys', desc: "Ghana's cybercrime underworld.", dur: 2550, plays: 7100 },
      { num: 5, title: 'The Diamond Heist of Sierra Leone', desc: 'Greed, betrayal, and precious stones.', dur: 2850, plays: 5500 },
    ],
    'pd100000-0000-0000-0000-000000000005': [
      { num: 1, title: 'Best of Basket Mouth: Live in Lagos', desc: 'Sold-out Lagos show highlights.', dur: 3600, plays: 8900 },
      { num: 2, title: 'Trevor Noah: African Comedy Masterclass', desc: "SA's comedy king exclusive.", dur: 2400, plays: 12000 },
      { num: 3, title: 'Funny African Parents Stories', desc: 'Hilarious family moments.', dur: 1800, plays: 7500 },
      { num: 4, title: 'Stand-Up Spotlight: Eric Omondi', desc: "Kenya's funniest man.", dur: 2100, plays: 6200 },
      { num: 5, title: 'African WhatsApp Group Chat Comedy', desc: 'Family WhatsApp groups.', dur: 1500, plays: 9400 },
    ],
    'pd100000-0000-0000-0000-000000000006': [
      { num: 1, title: 'How to Build Wealth in Africa', desc: 'Building generational wealth.', dur: 2100, plays: 4200 },
      { num: 2, title: 'Investing in African Real Estate', desc: "Property investment guide.", dur: 1950, plays: 3600 },
      { num: 3, title: 'Crypto in Africa: Hype or Hope?', desc: 'Future of African finance.', dur: 2400, plays: 5100 },
      { num: 4, title: 'Side Hustles That Actually Work', desc: 'Business ideas for 2026.', dur: 1800, plays: 6800 },
      { num: 5, title: 'Tax Planning for African Entrepreneurs', desc: 'Legal tax optimization.', dur: 2250, plays: 2900 },
    ],
  };

  let epIdx = 1;
  for (const [podId, eps] of Object.entries(podcastEpisodeData)) {
    for (const ep of eps) {
      const shNum = ((epIdx - 1) % 16) + 1;
      episodes.push({
        id: `pe100000-0000-0000-0000-${String(epIdx).padStart(12, '0')}`,
        podcast_id: podId,
        title: ep.title,
        description: ep.desc,
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${shNum}.mp3`,
        duration: ep.dur,
        episode_number: ep.num,
        season_number: 1,
        published_at: new Date(2026, 0, 3 + (epIdx * 7)).toISOString(),
        play_count: ep.plays,
      });
      epIdx++;
    }
  }

  const { error: epErr } = await supabase.from('podcast_episodes').upsert(episodes, { onConflict: 'id' });
  console.log(epErr ? `  ⚠️ Episodes: ${epErr.message}` : `  ✅ ${episodes.length} episodes inserted`);

  // Movie categories
  console.log('\n=== Seeding Movies ===');
  const cats = [
    { id: 'mc100000-0000-0000-0000-000000000001', name: 'Nollywood', slug: 'nollywood', description: "Nigeria's vibrant film industry", image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000002', name: 'Documentaries', slug: 'documentaries', description: 'Real stories from across Africa', image_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000003', name: 'Short Films', slug: 'short-films', description: 'Powerful stories told in minutes', image_url: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000004', name: 'Drama', slug: 'drama', description: 'Emotional cinema', image_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000005', name: 'Comedy', slug: 'comedy', description: 'African humor', image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000006', name: 'Action', slug: 'action', description: 'High-energy films', image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop' },
  ];

  const { error: catErr } = await supabase.from('movie_categories').upsert(cats, { onConflict: 'id' });
  console.log(catErr ? `  ⚠️ Categories: ${catErr.message}` : '  ✅ 6 categories inserted');

  const movies = [
    { id: 'mv100000-0000-0000-0000-000000000001', title: 'The Woman King', description: 'The Agojie warriors protect the Kingdom of Dahomey.', genre: 'Action', year: 2022, duration_minutes: 135, rating: 4.5, poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop', director: 'Gina Prince-Bythewood', cast_members: ['Viola Davis','Thuso Mbedu','Lashana Lynch'], country: 'USA/Benin', language: 'en', is_featured: true, is_free: true, view_count: 245000 },
    { id: 'mv100000-0000-0000-0000-000000000002', title: 'Lionheart', description: 'Adaeze takes over the family business in a male-dominated industry.', genre: 'Comedy', year: 2018, duration_minutes: 95, rating: 4.2, poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop', director: 'Genevieve Nnaji', cast_members: ['Genevieve Nnaji','Nkem Owoh','Pete Edochie'], country: 'Nigeria', language: 'en', is_featured: true, is_free: true, view_count: 189000 },
    { id: 'mv100000-0000-0000-0000-000000000003', title: 'Rafiki', description: 'Two young women in Nairobi find love against society.', genre: 'Drama', year: 2018, duration_minutes: 83, rating: 4.3, poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', director: 'Wanuri Kahiu', cast_members: ['Samantha Mugatsia','Sheila Munyiva'], country: 'Kenya', language: 'sw', is_featured: false, is_free: true, view_count: 67000 },
    { id: 'mv100000-0000-0000-0000-000000000004', title: 'The Boy Who Harnessed the Wind', description: 'A 13-year-old Malawian invents a way to save his village.', genre: 'Drama', year: 2019, duration_minutes: 113, rating: 4.6, poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop', director: 'Chiwetel Ejiofor', cast_members: ['Maxwell Simba','Chiwetel Ejiofor','Aissa Maiga'], country: 'Malawi/UK', language: 'en', is_featured: true, is_free: true, view_count: 312000 },
    { id: 'mv100000-0000-0000-0000-000000000005', title: 'Queen of Katwe', description: 'A Ugandan girl discovers extraordinary chess talent.', genre: 'Drama', year: 2016, duration_minutes: 124, rating: 4.4, poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&h=600&fit=crop', director: 'Mira Nair', cast_members: ['Madina Nalwanga','David Oyelowo',"Lupita Nyong'o"], country: 'Uganda/USA', language: 'en', is_featured: true, is_free: true, view_count: 178000 },
    { id: 'mv100000-0000-0000-0000-000000000006', title: 'Tsotsi', description: 'A young thug steals a car and finds a baby inside.', genre: 'Drama', year: 2005, duration_minutes: 94, rating: 4.5, poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=600&fit=crop', director: 'Gavin Hood', cast_members: ['Presley Chweneyagae','Terry Pheto'], country: 'South Africa', language: 'zu', is_featured: false, is_free: true, view_count: 156000 },
    { id: 'mv100000-0000-0000-0000-000000000007', title: 'Vaya', description: 'Three strangers seek a better life in Johannesburg.', genre: 'Drama', year: 2016, duration_minutes: 108, rating: 4.1, poster_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=600&fit=crop', director: 'Akin Omotoso', cast_members: ['Zimkhitha Nyoka','Sihle Xaba'], country: 'South Africa', language: 'zu', is_featured: false, is_free: true, view_count: 42000 },
    { id: 'mv100000-0000-0000-0000-000000000008', title: 'Atlantics', description: 'Construction workers take to the ocean in Dakar.', genre: 'Drama', year: 2019, duration_minutes: 106, rating: 4.3, poster_url: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=1200&h=600&fit=crop', director: 'Mati Diop', cast_members: ['Mama Sane','Amadou Mbow'], country: 'Senegal/France', language: 'fr', is_featured: false, is_free: true, view_count: 89000 },
    { id: 'mv100000-0000-0000-0000-000000000009', title: 'Timbuktu', description: 'A cattle herder in fundamentalist-ruled Timbuktu.', genre: 'Drama', year: 2014, duration_minutes: 97, rating: 4.7, poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop', director: 'Abderrahmane Sissako', cast_members: ['Ibrahim Ahmed','Toulou Kiki'], country: 'Mali/Mauritania', language: 'fr', is_featured: false, is_free: true, view_count: 134000 },
    { id: 'mv100000-0000-0000-0000-000000000010', title: 'The Burial of Kojo', description: 'A Ghanaian fantasy journey to save a father.', genre: 'Drama', year: 2018, duration_minutes: 80, rating: 4.4, poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', director: 'Blitz Bazawule', cast_members: ['Ama K. Abebrese','Cynthia Dankwa'], country: 'Ghana', language: 'en', is_featured: true, is_free: true, view_count: 98000 },
  ];

  const { error: mvErr } = await supabase.from('movies').upsert(movies, { onConflict: 'id' });
  console.log(mvErr ? `  ⚠️ Movies: ${mvErr.message}` : '  ✅ 10 movies inserted');

  // Final summary
  console.log('\n=== FINAL COUNTS ===');
  for (const table of ['artists', 'albums', 'songs', 'playlists', 'playlist_songs', 'podcasts', 'podcast_episodes', 'movies', 'movie_categories']) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`  ${table}: ${error ? 'NOT FOUND' : count}`);
  }

  console.log('\n✅ Done!');
}

function getPodcastDDLStatements() {
  return [
    "CREATE TABLE IF NOT EXISTS public.podcasts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, host TEXT NOT NULL, description TEXT, category TEXT, cover_url TEXT, language TEXT DEFAULT 'en', is_featured BOOLEAN DEFAULT false, subscriber_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now())",
    "CREATE TABLE IF NOT EXISTS public.podcast_episodes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, audio_url TEXT NOT NULL, duration INTEGER DEFAULT 0, episode_number INTEGER, season_number INTEGER DEFAULT 1, published_at TIMESTAMPTZ DEFAULT now(), play_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now())",
    "CREATE TABLE IF NOT EXISTS public.podcast_subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE, subscribed_at TIMESTAMPTZ DEFAULT now(), UNIQUE(user_id, podcast_id))",
    "CREATE TABLE IF NOT EXISTS public.podcast_listen_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, episode_id UUID REFERENCES public.podcast_episodes(id) ON DELETE CASCADE, progress_seconds INTEGER DEFAULT 0, completed BOOLEAN DEFAULT false, listened_at TIMESTAMPTZ DEFAULT now())",
    "ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE public.podcast_subscriptions ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE public.podcast_listen_history ENABLE ROW LEVEL SECURITY",
    "GRANT SELECT ON public.podcasts TO anon, authenticated",
    "GRANT SELECT ON public.podcast_episodes TO anon, authenticated",
    "GRANT ALL ON public.podcast_subscriptions TO authenticated",
    "GRANT ALL ON public.podcast_listen_history TO authenticated",
    "GRANT ALL ON public.podcasts TO authenticated",
    "GRANT ALL ON public.podcast_episodes TO authenticated",
  ];
}

function getMovieDDLStatements() {
  return [
    "CREATE TABLE IF NOT EXISTS public.movies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT, genre TEXT, year INTEGER, duration_minutes INTEGER, rating DECIMAL(2,1) DEFAULT 0, poster_url TEXT, backdrop_url TEXT, trailer_url TEXT, video_url TEXT, director TEXT, cast_members TEXT[], country TEXT, language TEXT DEFAULT 'en', is_featured BOOLEAN DEFAULT false, is_free BOOLEAN DEFAULT true, view_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now())",
    "CREATE TABLE IF NOT EXISTS public.movie_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT, image_url TEXT)",
    "CREATE TABLE IF NOT EXISTS public.movie_watchlist (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE, added_at TIMESTAMPTZ DEFAULT now(), UNIQUE(user_id, movie_id))",
    "ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE public.movie_categories ENABLE ROW LEVEL SECURITY",
    "ALTER TABLE public.movie_watchlist ENABLE ROW LEVEL SECURITY",
    "GRANT SELECT ON public.movies TO anon, authenticated",
    "GRANT SELECT ON public.movie_categories TO anon, authenticated",
    "GRANT ALL ON public.movie_watchlist TO authenticated",
    "GRANT ALL ON public.movies TO authenticated",
    "GRANT ALL ON public.movie_categories TO authenticated",
  ];
}

function getDDL() {
  return [...getPodcastDDLStatements(), ...getMovieDDLStatements()].join(';\n') + ';';
}

main().catch(console.error);
