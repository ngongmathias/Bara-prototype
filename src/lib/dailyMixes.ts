import { supabase } from './supabase';
import type { Song } from '@/context/AudioPlayerContext';

export interface DailyMix {
  id: string;
  title: string;     // e.g. "Daily Mix 1"
  subtitle: string;  // e.g. "Afrobeats" or "More from Burna Boy"
  cover_url: string;
  songs: Song[];
}

const toSong = (s: any): Song => ({
  id: s.id,
  title: s.title,
  artist: s.artists?.name || 'Unknown Artist',
  file_url: s.file_url,
  cover_url: s.cover_url || '/placeholder-music.png',
  duration: s.duration,
  artist_id: s.artist_id,
  album_id: s.album_id,
  price: s.price ?? null,
});

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Build 3–5 named "Daily Mix" playlists personalised from the user's listening
 * history — clustered by top genres, plus one mix for their most-played artist.
 * Returns [] when there's no usable history (caller falls back to editor mixes).
 */
export async function buildDailyMixes(userId: string): Promise<DailyMix[]> {
  const { data: history } = await supabase
    .from('play_history')
    .select('song_id, played_at, songs(*, artists(name))')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(100);

  if (!history || history.length === 0) return [];

  const genreCount: Record<string, number> = {};
  const genreSongs: Record<string, any[]> = {};
  const artistCount: Record<string, { count: number; name: string }> = {};

  for (const h of history) {
    const s: any = (h as any).songs;
    if (!s) continue;
    if (s.genre) {
      genreCount[s.genre] = (genreCount[s.genre] || 0) + 1;
      (genreSongs[s.genre] = genreSongs[s.genre] || []).push(s);
    }
    if (s.artist_id) {
      const a = artistCount[s.artist_id] || { count: 0, name: s.artists?.name || 'Artist' };
      a.count += 1;
      artistCount[s.artist_id] = a;
    }
  }

  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);
  const mixes: DailyMix[] = [];
  let n = 1;

  for (const g of topGenres) {
    const { data } = await supabase
      .from('songs')
      .select('*, artists(name)')
      .ilike('genre', `%${g}%`)
      .order('plays', { ascending: false })
      .limit(40);

    const seen = new Set<string>();
    const songs: Song[] = [];
    for (const s of [...(genreSongs[g] || []), ...(data || [])]) {
      if (s.file_url && !seen.has(s.id)) { seen.add(s.id); songs.push(toSong(s)); }
    }
    const picked = shuffle(songs).slice(0, 20);
    if (picked.length >= 4) {
      mixes.push({ id: `mix-genre-${g}`, title: `Daily Mix ${n}`, subtitle: g, cover_url: picked[0].cover_url, songs: picked });
      n += 1;
    }
  }

  // Top-artist mix (if there's room)
  const topArtist = Object.entries(artistCount).sort((a, b) => b[1].count - a[1].count)[0];
  if (topArtist && mixes.length < 5) {
    const [artistId, info] = topArtist;
    const { data } = await supabase
      .from('songs')
      .select('*, artists(name)')
      .eq('artist_id', artistId)
      .order('plays', { ascending: false })
      .limit(20);
    const songs = (data || []).filter((s: any) => s.file_url).map(toSong);
    if (songs.length >= 4) {
      mixes.push({ id: `mix-artist-${artistId}`, title: `${info.name} Mix`, subtitle: `More from ${info.name}`, cover_url: songs[0].cover_url, songs });
    }
  }

  return mixes;
}
