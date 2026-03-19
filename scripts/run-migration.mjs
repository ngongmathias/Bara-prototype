// Run Sprint 7 migration against Supabase
// Usage: node scripts/run-migration.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://sqxybqvrctegnejbkpwg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeHlicXZyY3RlZ25lamJrcHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE2OTg3NiwiZXhwIjoyMDgxNzQ1ODc2fQ.auSKxhHw6fmKXWBHFckIphEsIIc808TE833QgInyhlM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runSQL(label, sql) {
  console.log(`\n>>> Running: ${label}...`);
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    // Try via REST if RPC not available
    console.log(`  RPC failed (${error.message}), trying direct fetch...`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql_query: sql })
    });
    if (!res.ok) {
      const text = await res.text();
      console.log(`  Direct fetch also failed: ${text}`);
      return false;
    }
  }
  console.log(`  ✅ ${label} completed`);
  return true;
}

// Since Supabase JS client doesn't have a raw SQL method,
// we'll use the Supabase Management API or the pg REST endpoint
// Actually let's use the supabase-js .from() for reads and direct HTTP for DDL

async function runSQLviaHTTP(label, sql) {
  console.log(`\n>>> Running: ${label}...`);
  try {
    const res = await fetch(`${SUPABASE_URL}/pg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });
    if (res.ok) {
      console.log(`  ✅ ${label} completed`);
      return true;
    }
    const text = await res.text();
    console.log(`  ❌ Failed: ${text.substring(0, 200)}`);
    return false;
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Sprint 7 Migration Runner ===\n');

  // Test connection first
  const { data, error } = await supabase.from('artists').select('id').limit(1);
  if (error) {
    console.error('Cannot connect to Supabase:', error.message);
    process.exit(1);
  }
  console.log('✅ Connected to Supabase. Found artists table.');

  // PART 1: Fix existing song URLs via individual updates
  console.log('\n=== PART 1: Fix existing song audio URLs ===');
  for (let i = 1; i <= 22; i++) {
    const songId = `c1000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
    const soundHelixNum = ((i - 1) % 16) + 1;
    const fileUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${soundHelixNum}.mp3`;
    
    const { error } = await supabase
      .from('songs')
      .update({ file_url: fileUrl })
      .eq('id', songId);
    
    if (error) {
      console.log(`  ⚠️ Song ${i}: ${error.message}`);
    } else {
      console.log(`  ✅ Song ${i} → SoundHelix-Song-${soundHelixNum}.mp3`);
    }
  }

  // Catch-all: update any remaining placeholder URLs
  const { error: catchAllErr } = await supabase
    .from('songs')
    .update({ file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' })
    .or('file_url.is.null,file_url.eq.,file_url.eq./audio/placeholder.mp3');
  
  if (catchAllErr) {
    console.log(`  ⚠️ Catch-all update: ${catchAllErr.message}`);
  } else {
    console.log('  ✅ Catch-all: remaining placeholder URLs fixed');
  }

  // PART 2: New Artists
  console.log('\n=== PART 2: New Artists ===');
  const newArtists = [
    { id: 'a1000000-0000-0000-0000-000000000009', name: 'Fireboy DML', image_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', bio: 'Nigerian Afropop singer-songwriter. Known for Peru, Bandana, and Playboy. YBNL Music signee.', genre: 'Afropop', country: 'Nigeria', is_verified: true, monthly_listeners: 20000000, banner_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=400&fit=crop' },
    { id: 'a1000000-0000-0000-0000-000000000010', name: 'Kabza De Small', image_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', bio: 'South African DJ and record producer. Known as the King of Amapiano. Pioneer of the Amapiano genre.', genre: 'Amapiano', country: 'South Africa', is_verified: true, monthly_listeners: 16000000, banner_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=400&fit=crop' },
    { id: 'a1000000-0000-0000-0000-000000000011', name: 'Asa', image_url: 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', bio: 'Nigerian-French singer-songwriter. Known for her soulful voice blending folk, jazz, and West African Highlife.', genre: 'Highlife', country: 'Nigeria', is_verified: true, monthly_listeners: 7000000, banner_url: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=1200&h=400&fit=crop' },
    { id: 'a1000000-0000-0000-0000-000000000012', name: "Innoss'B", image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', bio: 'Congolese singer, dancer and songwriter. Known for blending Ndombolo with modern Afrobeats.', genre: 'Ndombolo', country: 'DR Congo', is_verified: true, monthly_listeners: 4500000, banner_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=400&fit=crop' },
  ];
  
  const { error: artistErr } = await supabase.from('artists').upsert(newArtists, { onConflict: 'id' });
  console.log(artistErr ? `  ⚠️ ${artistErr.message}` : '  ✅ 4 new artists inserted');

  // PART 3: New Albums
  console.log('\n=== PART 3: New Albums ===');
  const newAlbums = [
    { id: 'b1000000-0000-0000-0000-000000000009', title: 'Playboy', artist_id: 'a1000000-0000-0000-0000-000000000009', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', release_date: '2025-08-05', genre: 'Afropop' },
    { id: 'b1000000-0000-0000-0000-000000000010', title: 'KOA II', artist_id: 'a1000000-0000-0000-0000-000000000010', cover_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', release_date: '2025-12-01', genre: 'Amapiano' },
    { id: 'b1000000-0000-0000-0000-000000000011', title: 'V', artist_id: 'a1000000-0000-0000-0000-000000000011', cover_url: 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', release_date: '2025-02-11', genre: 'Highlife' },
    { id: 'b1000000-0000-0000-0000-000000000012', title: 'Yope', artist_id: 'a1000000-0000-0000-0000-000000000012', cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', release_date: '2025-05-20', genre: 'Ndombolo' },
  ];

  const { error: albumErr } = await supabase.from('albums').upsert(newAlbums, { onConflict: 'id' });
  console.log(albumErr ? `  ⚠️ ${albumErr.message}` : '  ✅ 4 new albums inserted');

  // PART 4: New Songs
  console.log('\n=== PART 4: New Songs ===');
  const newSongs = [
    { id: 'c1000000-0000-0000-0000-000000000023', title: 'Peru', artist_id: 'a1000000-0000-0000-0000-000000000009', album_id: 'b1000000-0000-0000-0000-000000000009', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', duration: 198, plays: 8500000, genre: 'Afropop', track_number: 1, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000024', title: 'Bandana', artist_id: 'a1000000-0000-0000-0000-000000000009', album_id: 'b1000000-0000-0000-0000-000000000009', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', duration: 215, plays: 6200000, genre: 'Afropop', track_number: 2, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000025', title: 'Playboy', artist_id: 'a1000000-0000-0000-0000-000000000009', album_id: 'b1000000-0000-0000-0000-000000000009', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', duration: 230, plays: 4100000, genre: 'Afropop', track_number: 3, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000026', title: 'Sofri', artist_id: 'a1000000-0000-0000-0000-000000000009', album_id: 'b1000000-0000-0000-0000-000000000009', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', duration: 185, plays: 3000000, genre: 'Afropop', track_number: 4, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000027', title: 'Sponono', artist_id: 'a1000000-0000-0000-0000-000000000010', album_id: 'b1000000-0000-0000-0000-000000000010', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', duration: 245, plays: 7200000, genre: 'Amapiano', track_number: 1, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000028', title: 'Asibe Happy', artist_id: 'a1000000-0000-0000-0000-000000000010', album_id: 'b1000000-0000-0000-0000-000000000010', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', duration: 260, plays: 5800000, genre: 'Amapiano', track_number: 2, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000029', title: 'Imithandazo', artist_id: 'a1000000-0000-0000-0000-000000000010', album_id: 'b1000000-0000-0000-0000-000000000010', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', cover_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', duration: 275, plays: 4500000, genre: 'Amapiano', track_number: 3, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000030', title: 'Jailer', artist_id: 'a1000000-0000-0000-0000-000000000011', album_id: 'b1000000-0000-0000-0000-000000000011', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', cover_url: 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', duration: 220, plays: 9500000, genre: 'Highlife', track_number: 1, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000031', title: 'Be My Man', artist_id: 'a1000000-0000-0000-0000-000000000011', album_id: 'b1000000-0000-0000-0000-000000000011', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', cover_url: 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', duration: 195, plays: 3200000, genre: 'Highlife', track_number: 2, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000032', title: 'IDG', artist_id: 'a1000000-0000-0000-0000-000000000011', album_id: 'b1000000-0000-0000-0000-000000000011', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', cover_url: 'https://images.unsplash.com/photo-1534385842125-8c9ad0bd123c?w=300&h=300&fit=crop', duration: 210, plays: 2800000, genre: 'Highlife', track_number: 3, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000033', title: 'Yope', artist_id: 'a1000000-0000-0000-0000-000000000012', album_id: 'b1000000-0000-0000-0000-000000000012', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', duration: 205, plays: 6800000, genre: 'Ndombolo', track_number: 1, uploaded_by: 'admin', upload_type: 'platform' },
    { id: 'c1000000-0000-0000-0000-000000000034', title: 'Mabele', artist_id: 'a1000000-0000-0000-0000-000000000012', album_id: 'b1000000-0000-0000-0000-000000000012', file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', duration: 195, plays: 3900000, genre: 'Ndombolo', track_number: 2, uploaded_by: 'admin', upload_type: 'platform' },
  ];

  const { error: songErr } = await supabase.from('songs').upsert(newSongs, { onConflict: 'id' });
  console.log(songErr ? `  ⚠️ ${songErr.message}` : '  ✅ 12 new songs inserted');

  // PART 5: Platform Playlists
  console.log('\n=== PART 5: Platform Playlists ===');
  const playlists = [
    { id: 'p1000000-0000-0000-0000-000000000001', title: 'Afrobeats Essentials', description: 'The biggest Afrobeats hits all in one place. Updated weekly.', cover_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { id: 'p1000000-0000-0000-0000-000000000002', title: 'Amapiano Heat', description: 'The hottest Amapiano tracks from South Africa and beyond.', cover_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { id: 'p1000000-0000-0000-0000-000000000003', title: 'Chill African Vibes', description: 'Relax and unwind with soulful African melodies.', cover_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { id: 'p1000000-0000-0000-0000-000000000004', title: 'Workout Africa', description: 'High-energy African beats to fuel your workout.', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d56?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
    { id: 'p1000000-0000-0000-0000-000000000005', title: 'New Releases Radar', description: "Fresh tracks from Africa's top artists. Updated daily.", cover_url: 'https://images.unsplash.com/photo-1514525253361-bee8a19740c1?w=300&h=300&fit=crop', is_public: true, created_by: 'platform' },
  ];

  const { error: plErr } = await supabase.from('playlists').upsert(playlists, { onConflict: 'id' });
  console.log(plErr ? `  ⚠️ ${plErr.message}` : '  ✅ 5 platform playlists inserted');

  // Playlist songs
  const playlistSongs = [
    // Afrobeats Essentials
    ...['c1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000024','c1000000-0000-0000-0000-000000000033','c1000000-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000005'].map((sid, i) => ({ playlist_id: 'p1000000-0000-0000-0000-000000000001', song_id: sid, position: i + 1 })),
    // Amapiano Heat
    ...['c1000000-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000028','c1000000-0000-0000-0000-000000000029','c1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000014'].map((sid, i) => ({ playlist_id: 'p1000000-0000-0000-0000-000000000002', song_id: sid, position: i + 1 })),
    // Chill African Vibes
    ...['c1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000030','c1000000-0000-0000-0000-000000000031','c1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000017'].map((sid, i) => ({ playlist_id: 'p1000000-0000-0000-0000-000000000003', song_id: sid, position: i + 1 })),
    // Workout Africa
    ...['c1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000033','c1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000025','c1000000-0000-0000-0000-000000000034'].map((sid, i) => ({ playlist_id: 'p1000000-0000-0000-0000-000000000004', song_id: sid, position: i + 1 })),
    // New Releases Radar
    ...['c1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000024','c1000000-0000-0000-0000-000000000025','c1000000-0000-0000-0000-000000000027','c1000000-0000-0000-0000-000000000028','c1000000-0000-0000-0000-000000000030','c1000000-0000-0000-0000-000000000033','c1000000-0000-0000-0000-000000000034','c1000000-0000-0000-0000-000000000031','c1000000-0000-0000-0000-000000000032'].map((sid, i) => ({ playlist_id: 'p1000000-0000-0000-0000-000000000005', song_id: sid, position: i + 1 })),
  ];

  const { error: psErr } = await supabase.from('playlist_songs').upsert(playlistSongs, { onConflict: 'playlist_id,song_id', ignoreDuplicates: true });
  console.log(psErr ? `  ⚠️ Playlist songs: ${psErr.message}` : `  ✅ ${playlistSongs.length} playlist-song links inserted`);

  // PART 6: Podcasts — tables need to be created via SQL editor since supabase-js can't do DDL
  console.log('\n=== PART 6: Podcasts ===');
  console.log('  ℹ️  Tables must be created via Supabase SQL Editor.');
  console.log('  Attempting to insert seed data (tables may already exist)...');
  
  const podcasts = [
    { id: 'pd100000-0000-0000-0000-000000000001', title: 'The African Dream', host: 'Amara Kone', description: "Stories of founders building across the continent. From Lagos to Nairobi, hear how African entrepreneurs are reshaping industries.", category: 'Entrepreneurship', cover_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 12400 },
    { id: 'pd100000-0000-0000-0000-000000000002', title: 'Naija Tech Talk', host: 'Tunde Obi', description: "Africa's tech ecosystem — startups, funding & innovation. Weekly deep dives into the companies changing the continent.", category: 'Technology', cover_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 8900 },
    { id: 'pd100000-0000-0000-0000-000000000003', title: 'Ubuntu Conversations', host: 'Thabo Mokoena', description: 'Pan-African dialogues on identity, culture & unity. Exploring what it means to be African in the modern world.', category: 'Culture', cover_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 6700 },
    { id: 'pd100000-0000-0000-0000-000000000004', title: 'Accra After Dark', host: 'Ama Serwaa', description: "Mysteries and untold stories from West Africa. True crime meets investigative journalism.", category: 'True Crime', cover_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=300&fit=crop', is_featured: false, subscriber_count: 15200 },
    { id: 'pd100000-0000-0000-0000-000000000005', title: 'Laugh Out Loud Africa', host: 'Basket Mouth & Friends', description: "The funniest comedians on the continent. Stand-up clips, interviews, and hilarious conversations.", category: 'Comedy', cover_url: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=300&h=300&fit=crop', is_featured: false, subscriber_count: 21000 },
    { id: 'pd100000-0000-0000-0000-000000000006', title: 'The Pitch Room', host: 'Keza Ngowi', description: "Investment, wealth & personal finance for Africans. Learn how to build generational wealth from Africa's top financial minds.", category: 'Finance', cover_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=300&fit=crop', is_featured: true, subscriber_count: 9800 },
  ];

  const { error: podErr } = await supabase.from('podcasts').upsert(podcasts, { onConflict: 'id' });
  if (podErr) {
    console.log(`  ⚠️ Podcasts table may not exist yet: ${podErr.message}`);
    console.log('  → Run the DDL SQL in Supabase SQL Editor first (see migration file Part 6)');
  } else {
    console.log('  ✅ 6 podcasts inserted');
  }

  // Podcast episodes
  const episodes = [
    { id: 'pe100000-0000-0000-0000-000000000001', podcast_id: 'pd100000-0000-0000-0000-000000000001', title: "From Zero to Unicorn: Flutterwave's Journey", description: "How Flutterwave became Africa's most valuable startup.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 2400, episode_number: 1, season_number: 1, published_at: '2026-01-05', play_count: 4500 },
    { id: 'pe100000-0000-0000-0000-000000000002', podcast_id: 'pd100000-0000-0000-0000-000000000001', title: 'The Kigali Tech Hub Revolution', description: "Rwanda is becoming Africa's Silicon Valley. Here's why.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 1800, episode_number: 2, season_number: 1, published_at: '2026-01-12', play_count: 3200 },
    { id: 'pe100000-0000-0000-0000-000000000003', podcast_id: 'pd100000-0000-0000-0000-000000000001', title: "Women Leading Africa's Fintech Boom", description: 'Meet the women building the future of finance in Africa.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 2100, episode_number: 3, season_number: 1, published_at: '2026-01-19', play_count: 2800 },
    { id: 'pe100000-0000-0000-0000-000000000004', podcast_id: 'pd100000-0000-0000-0000-000000000001', title: 'Agriculture 2.0: Tech Meets Farming', description: 'How AI and drones are transforming African agriculture.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 1950, episode_number: 4, season_number: 1, published_at: '2026-01-26', play_count: 1900 },
    { id: 'pe100000-0000-0000-0000-000000000005', podcast_id: 'pd100000-0000-0000-0000-000000000001', title: 'Building in Africa vs Silicon Valley', description: 'A founder shares why they left Google to build in Lagos.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 2250, episode_number: 5, season_number: 1, published_at: '2026-02-02', play_count: 2100 },
    // Naija Tech Talk
    { id: 'pe100000-0000-0000-0000-000000000006', podcast_id: 'pd100000-0000-0000-0000-000000000002', title: "Nigeria's $4B Startup Ecosystem", description: "Breaking down the numbers behind Nigeria's tech boom.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 1800, episode_number: 1, season_number: 1, published_at: '2026-01-07', play_count: 3800 },
    { id: 'pe100000-0000-0000-0000-000000000007', podcast_id: 'pd100000-0000-0000-0000-000000000002', title: 'Paystack to Stripe: The Acquisition Story', description: "The inside story of Africa's biggest tech acquisition.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration: 2100, episode_number: 2, season_number: 1, published_at: '2026-01-14', play_count: 5200 },
    { id: 'pe100000-0000-0000-0000-000000000008', podcast_id: 'pd100000-0000-0000-0000-000000000002', title: 'AI in Africa: Opportunities & Challenges', description: 'Can Africa leapfrog into the AI revolution?', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration: 1950, episode_number: 3, season_number: 1, published_at: '2026-01-21', play_count: 2900 },
    { id: 'pe100000-0000-0000-0000-000000000009', podcast_id: 'pd100000-0000-0000-0000-000000000002', title: "Mobile Money: Africa's Fintech Superpower", description: 'M-Pesa and beyond — how mobile money is changing lives.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', duration: 2400, episode_number: 4, season_number: 1, published_at: '2026-01-28', play_count: 3100 },
    { id: 'pe100000-0000-0000-0000-000000000010', podcast_id: 'pd100000-0000-0000-0000-000000000002', title: 'Cybersecurity in Africa', description: 'The growing threat landscape and how Africa is responding.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', duration: 1650, episode_number: 5, season_number: 1, published_at: '2026-02-04', play_count: 1800 },
    // Ubuntu Conversations
    { id: 'pe100000-0000-0000-0000-000000000011', podcast_id: 'pd100000-0000-0000-0000-000000000003', title: 'What Does Pan-Africanism Mean in 2026?', description: 'A roundtable on the future of African unity.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', duration: 2700, episode_number: 1, season_number: 1, published_at: '2026-01-03', play_count: 2400 },
    { id: 'pe100000-0000-0000-0000-000000000012', podcast_id: 'pd100000-0000-0000-0000-000000000003', title: 'African Languages in the Digital Age', description: 'Are African languages thriving or dying online?', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', duration: 1800, episode_number: 2, season_number: 1, published_at: '2026-01-10', play_count: 1900 },
    { id: 'pe100000-0000-0000-0000-000000000013', podcast_id: 'pd100000-0000-0000-0000-000000000003', title: "Afrofuturism: Imagining Africa's Tomorrow", description: 'How artists and writers are reimagining the continent.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', duration: 2100, episode_number: 3, season_number: 1, published_at: '2026-01-17', play_count: 2200 },
    { id: 'pe100000-0000-0000-0000-000000000014', podcast_id: 'pd100000-0000-0000-0000-000000000003', title: 'Diaspora Connections: Home Away from Home', description: 'Stories of Africans building community abroad.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', duration: 1950, episode_number: 4, season_number: 1, published_at: '2026-01-24', play_count: 1600 },
    { id: 'pe100000-0000-0000-0000-000000000015', podcast_id: 'pd100000-0000-0000-0000-000000000003', title: 'African Fashion Goes Global', description: "From Ankara to the runway — Africa's fashion revolution.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', duration: 2250, episode_number: 5, season_number: 1, published_at: '2026-01-31', play_count: 2700 },
    // Accra After Dark
    { id: 'pe100000-0000-0000-0000-000000000016', podcast_id: 'pd100000-0000-0000-0000-000000000004', title: "The Disappearance of the Golden Stool", description: "The mysterious theft of Ghana's most sacred artifact.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', duration: 2700, episode_number: 1, season_number: 1, published_at: '2026-01-06', play_count: 6200 },
    { id: 'pe100000-0000-0000-0000-000000000017', podcast_id: 'pd100000-0000-0000-0000-000000000004', title: 'Lagos Underground: The Untold Stories', description: "What happens beneath the streets of Africa's largest city.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 2400, episode_number: 2, season_number: 1, published_at: '2026-01-13', play_count: 5800 },
    { id: 'pe100000-0000-0000-0000-000000000018', podcast_id: 'pd100000-0000-0000-0000-000000000004', title: 'The Nairobi Cold Case Files', description: "Reopening unsolved cases from Kenya's capital.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 2100, episode_number: 3, season_number: 1, published_at: '2026-01-20', play_count: 4900 },
    { id: 'pe100000-0000-0000-0000-000000000019', podcast_id: 'pd100000-0000-0000-0000-000000000004', title: 'Fraud Capital: The Sakawa Boys', description: "Inside Ghana's cybercrime underworld.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 2550, episode_number: 4, season_number: 1, published_at: '2026-01-27', play_count: 7100 },
    { id: 'pe100000-0000-0000-0000-000000000020', podcast_id: 'pd100000-0000-0000-0000-000000000004', title: 'The Diamond Heist of Sierra Leone', description: 'A true story of greed, betrayal, and precious stones.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 2850, episode_number: 5, season_number: 1, published_at: '2026-02-03', play_count: 5500 },
    // Laugh Out Loud Africa
    { id: 'pe100000-0000-0000-0000-000000000021', podcast_id: 'pd100000-0000-0000-0000-000000000005', title: "Best of Basket Mouth: Live in Lagos", description: "Highlights from Basket Mouth's sold-out Lagos show.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration: 3600, episode_number: 1, season_number: 1, published_at: '2026-01-04', play_count: 8900 },
    { id: 'pe100000-0000-0000-0000-000000000022', podcast_id: 'pd100000-0000-0000-0000-000000000005', title: 'Trevor Noah: African Comedy Masterclass', description: "An exclusive interview with South Africa's comedy king.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration: 2400, episode_number: 2, season_number: 1, published_at: '2026-01-11', play_count: 12000 },
    { id: 'pe100000-0000-0000-0000-000000000023', podcast_id: 'pd100000-0000-0000-0000-000000000005', title: 'Funny African Parents Stories', description: 'Comedians share their most hilarious family moments.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration: 1800, episode_number: 3, season_number: 1, published_at: '2026-01-18', play_count: 7500 },
    { id: 'pe100000-0000-0000-0000-000000000024', podcast_id: 'pd100000-0000-0000-0000-000000000005', title: 'Stand-Up Spotlight: Eric Omondi', description: "Kenya's funniest man at his absolute best.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration: 2100, episode_number: 4, season_number: 1, published_at: '2026-01-25', play_count: 6200 },
    { id: 'pe100000-0000-0000-0000-000000000025', podcast_id: 'pd100000-0000-0000-0000-000000000005', title: 'African WhatsApp Group Chat Comedy', description: 'What really happens in those family WhatsApp groups.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', duration: 1500, episode_number: 5, season_number: 1, published_at: '2026-02-01', play_count: 9400 },
    // The Pitch Room
    { id: 'pe100000-0000-0000-0000-000000000026', podcast_id: 'pd100000-0000-0000-0000-000000000006', title: 'How to Build Wealth in Africa', description: 'Practical steps for building generational wealth.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', duration: 2100, episode_number: 1, season_number: 1, published_at: '2026-01-08', play_count: 4200 },
    { id: 'pe100000-0000-0000-0000-000000000027', podcast_id: 'pd100000-0000-0000-0000-000000000006', title: 'Investing in African Real Estate', description: "The beginner's guide to property investment in Africa.", audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', duration: 1950, episode_number: 2, season_number: 1, published_at: '2026-01-15', play_count: 3600 },
    { id: 'pe100000-0000-0000-0000-000000000028', podcast_id: 'pd100000-0000-0000-0000-000000000006', title: 'Crypto in Africa: Hype or Hope?', description: 'Is cryptocurrency the future of African finance?', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', duration: 2400, episode_number: 3, season_number: 1, published_at: '2026-01-22', play_count: 5100 },
    { id: 'pe100000-0000-0000-0000-000000000029', podcast_id: 'pd100000-0000-0000-0000-000000000006', title: 'Side Hustles That Actually Work', description: 'Proven side business ideas for Africans in 2026.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', duration: 1800, episode_number: 4, season_number: 1, published_at: '2026-01-29', play_count: 6800 },
    { id: 'pe100000-0000-0000-0000-000000000030', podcast_id: 'pd100000-0000-0000-0000-000000000006', title: 'Tax Planning for African Entrepreneurs', description: 'How to legally minimize your tax burden across Africa.', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', duration: 2250, episode_number: 5, season_number: 1, published_at: '2026-02-05', play_count: 2900 },
  ];

  const { error: epErr } = await supabase.from('podcast_episodes').upsert(episodes, { onConflict: 'id' });
  if (epErr) {
    console.log(`  ⚠️ Episodes: ${epErr.message}`);
  } else {
    console.log(`  ✅ ${episodes.length} podcast episodes inserted`);
  }

  // PART 7: Movies
  console.log('\n=== PART 7: Movies ===');

  const movieCategories = [
    { id: 'mc100000-0000-0000-0000-000000000001', name: 'Nollywood', slug: 'nollywood', description: "Nigeria's vibrant film industry", image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000002', name: 'Documentaries', slug: 'documentaries', description: 'Real stories from across Africa', image_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000003', name: 'Short Films', slug: 'short-films', description: 'Powerful stories told in minutes', image_url: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000004', name: 'Drama', slug: 'drama', description: 'Emotional and thought-provoking cinema', image_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000005', name: 'Comedy', slug: 'comedy', description: 'Laugh-out-loud African humor', image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=250&fit=crop' },
    { id: 'mc100000-0000-0000-0000-000000000006', name: 'Action', slug: 'action', description: 'High-energy African action films', image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=250&fit=crop' },
  ];

  const { error: mcErr } = await supabase.from('movie_categories').upsert(movieCategories, { onConflict: 'id' });
  if (mcErr) {
    console.log(`  ⚠️ Movie categories: ${mcErr.message}`);
    console.log('  → Run the DDL SQL in Supabase SQL Editor first (see migration file Part 7)');
  } else {
    console.log('  ✅ 6 movie categories inserted');
  }

  const movies = [
    { id: 'mv100000-0000-0000-0000-000000000001', title: 'The Woman King', description: 'The story of the Agojie, the all-female unit of warriors who protected the African Kingdom of Dahomey in the 1800s.', genre: 'Action', year: 2022, duration_minutes: 135, rating: 4.5, poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop', director: 'Gina Prince-Bythewood', cast_members: ['Viola Davis', 'Thuso Mbedu', 'Lashana Lynch'], country: 'USA/Benin', language: 'en', is_featured: true, is_free: true, view_count: 245000 },
    { id: 'mv100000-0000-0000-0000-000000000002', title: 'Lionheart', description: 'When her father falls ill, Adaeze steps up to manage the family business in a male-dominated industry.', genre: 'Comedy', year: 2018, duration_minutes: 95, rating: 4.2, poster_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop', director: 'Genevieve Nnaji', cast_members: ['Genevieve Nnaji', 'Nkem Owoh', 'Pete Edochie'], country: 'Nigeria', language: 'en', is_featured: true, is_free: true, view_count: 189000 },
    { id: 'mv100000-0000-0000-0000-000000000003', title: 'Rafiki', description: 'Two young women in Nairobi find love in a society that does not accept them.', genre: 'Drama', year: 2018, duration_minutes: 83, rating: 4.3, poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', director: 'Wanuri Kahiu', cast_members: ['Samantha Mugatsia', 'Sheila Munyiva'], country: 'Kenya', language: 'sw', is_featured: false, is_free: true, view_count: 67000 },
    { id: 'mv100000-0000-0000-0000-000000000004', title: 'The Boy Who Harnessed the Wind', description: 'A 13-year-old boy in Malawi invents an unconventional way to save his family and village from famine.', genre: 'Drama', year: 2019, duration_minutes: 113, rating: 4.6, poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop', director: 'Chiwetel Ejiofor', cast_members: ['Maxwell Simba', 'Chiwetel Ejiofor', 'Aissa Maiga'], country: 'Malawi/UK', language: 'en', is_featured: true, is_free: true, view_count: 312000 },
    { id: 'mv100000-0000-0000-0000-000000000005', title: 'Queen of Katwe', description: 'A Ugandan girl from the slums discovers she has an extraordinary talent for chess.', genre: 'Drama', year: 2016, duration_minutes: 124, rating: 4.4, poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&h=600&fit=crop', director: 'Mira Nair', cast_members: ['Madina Nalwanga', 'David Oyelowo', "Lupita Nyong'o"], country: 'Uganda/USA', language: 'en', is_featured: true, is_free: true, view_count: 178000 },
    { id: 'mv100000-0000-0000-0000-000000000006', title: 'Tsotsi', description: 'A young South African thug steals a car only to discover a baby in the back seat.', genre: 'Drama', year: 2005, duration_minutes: 94, rating: 4.5, poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1200&h=600&fit=crop', director: 'Gavin Hood', cast_members: ['Presley Chweneyagae', 'Terry Pheto', 'Kenneth Nkosi'], country: 'South Africa', language: 'zu', is_featured: false, is_free: true, view_count: 156000 },
    { id: 'mv100000-0000-0000-0000-000000000007', title: 'Vaya', description: 'Three strangers arrive in Johannesburg from rural areas, each seeking a better life.', genre: 'Drama', year: 2016, duration_minutes: 108, rating: 4.1, poster_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=600&fit=crop', director: 'Akin Omotoso', cast_members: ['Zimkhitha Nyoka', 'Sihle Xaba', 'Phumzile Sitole'], country: 'South Africa', language: 'zu', is_featured: false, is_free: true, view_count: 42000 },
    { id: 'mv100000-0000-0000-0000-000000000008', title: 'Atlantics', description: 'In a Dakar suburb, construction workers take to the ocean, and the women left behind are haunted by a mysterious fever.', genre: 'Drama', year: 2019, duration_minutes: 106, rating: 4.3, poster_url: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1518676590747-1e3dcf5a0e32?w=1200&h=600&fit=crop', director: 'Mati Diop', cast_members: ['Mama Sane', 'Amadou Mbow', 'Ibrahima Traore'], country: 'Senegal/France', language: 'fr', is_featured: false, is_free: true, view_count: 89000 },
    { id: 'mv100000-0000-0000-0000-000000000009', title: 'Timbuktu', description: 'In the ancient city ruled by religious fundamentalists, a cattle herder\'s life changes forever.', genre: 'Drama', year: 2014, duration_minutes: 97, rating: 4.7, poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop', director: 'Abderrahmane Sissako', cast_members: ['Ibrahim Ahmed', 'Toulou Kiki', 'Abel Jafri'], country: 'Mali/Mauritania', language: 'fr', is_featured: false, is_free: true, view_count: 134000 },
    { id: 'mv100000-0000-0000-0000-000000000010', title: 'The Burial of Kojo', description: 'A Ghanaian fantasy film weaving between past and present as a young girl embarks on a magical journey.', genre: 'Drama', year: 2018, duration_minutes: 80, rating: 4.4, poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop', backdrop_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', director: 'Blitz Bazawule', cast_members: ['Ama K. Abebrese', 'Cynthia Dankwa', 'Kobina Amissah-Sam'], country: 'Ghana', language: 'en', is_featured: true, is_free: true, view_count: 98000 },
  ];

  const { error: mvErr } = await supabase.from('movies').upsert(movies, { onConflict: 'id' });
  if (mvErr) {
    console.log(`  ⚠️ Movies: ${mvErr.message}`);
  } else {
    console.log('  ✅ 10 movies inserted');
  }

  // SUMMARY
  console.log('\n\n=== MIGRATION SUMMARY ===');
  const { count: artistCount } = await supabase.from('artists').select('*', { count: 'exact', head: true });
  const { count: albumCount } = await supabase.from('albums').select('*', { count: 'exact', head: true });
  const { count: songCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });
  const { count: playlistCount } = await supabase.from('playlists').select('*', { count: 'exact', head: true });
  console.log(`  Artists: ${artistCount}`);
  console.log(`  Albums: ${albumCount}`);
  console.log(`  Songs: ${songCount}`);
  console.log(`  Playlists: ${playlistCount}`);

  // Check if podcasts/movies tables exist
  const { count: podCount } = await supabase.from('podcasts').select('*', { count: 'exact', head: true });
  const { count: mvCount } = await supabase.from('movies').select('*', { count: 'exact', head: true });
  console.log(`  Podcasts: ${podCount ?? 'TABLE NOT CREATED YET'}`);
  console.log(`  Movies: ${mvCount ?? 'TABLE NOT CREATED YET'}`);

  // Verify audio URLs
  const { data: sampleSongs } = await supabase.from('songs').select('id, title, file_url').limit(5);
  console.log('\n  Sample song URLs:');
  sampleSongs?.forEach(s => console.log(`    ${s.title}: ${s.file_url?.substring(0, 60)}...`));

  console.log('\n✅ Migration script complete!');
}

main().catch(console.error);
