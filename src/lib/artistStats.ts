import { supabase } from './supabase';

/**
 * Real "monthly listeners" for a set of songs: the number of DISTINCT users who
 * played any of them in the last 30 days, from play_history. Returns 0 when
 * there is no data (so callers can show "New Artist" rather than a fake number).
 */
export async function getMonthlyListeners(songIds: string[]): Promise<number> {
  if (!songIds || songIds.length === 0) return 0;
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data, error } = await supabase
      .from('play_history')
      .select('user_id')
      .in('song_id', songIds)
      .gte('played_at', since.toISOString());
    if (error || !data) return 0;
    return new Set(data.map((r: any) => r.user_id).filter(Boolean)).size;
  } catch {
    return 0;
  }
}

/** All song ids belonging to an artist (for listener/stat calculations). */
export async function getArtistSongIds(artistId: string): Promise<string[]> {
  if (!artistId) return [];
  try {
    const { data } = await supabase.from('songs').select('id').eq('artist_id', artistId);
    return (data || []).map((r: any) => r.id);
  } catch {
    return [];
  }
}
