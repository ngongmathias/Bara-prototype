import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { VerifiedBadge } from '@/components/streams/VerifiedBadge';
import { SEO } from '@/components/SEO';
import { Search, Play, Pause, X, Clock, Disc3, Music2 } from 'lucide-react';

const RECENT_KEY = 'bara_music_recent';
const loadRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};

const fmt = (s?: number) => {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

const mapSong = (s: any): Song => ({
  id: s.id,
  title: s.title,
  artist: s.artist_name || s.artists?.name || 'Unknown Artist',
  file_url: s.file_url,
  cover_url: s.cover_url || '/placeholder-music.png',
  duration: s.duration,
  artist_id: s.artist_id,
  album_id: s.album_id,
  price: s.price ?? null,
});

interface Results {
  songs: Song[];
  artists: any[];
  albums: any[];
  playlists: any[];
}
const EMPTY: Results = { songs: [], artists: [], albums: [], playlists: [] };

// Songs search: try the trigram RPC (typo-tolerant) first, fall back to ILIKE.
async function searchSongs(q: string): Promise<Song[]> {
  try {
    const { data, error } = await supabase.rpc('search_songs', { p_q: q, p_limit: 24 });
    if (!error && Array.isArray(data)) return data.map(mapSong);
  } catch { /* RPC not deployed yet — fall back */ }
  const { data } = await supabase
    .from('songs')
    .select('id, title, cover_url, file_url, duration, artist_id, album_id, price, artists(name)')
    .ilike('title', `%${q}%`)
    .order('plays', { ascending: false })
    .limit(24);
  return (data || []).map(mapSong);
}

export default function MusicSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { playAlbum, togglePlay, currentSong, isPlaying } = useAudioPlayer();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...loadRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    setRecent(next);
  }, []);

  // Debounced instant search
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults(EMPTY); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const [songs, artistsRes, albumsRes, playlistsRes] = await Promise.all([
        searchSongs(q),
        supabase.from('artists').select('id, name, image_url, is_verified').ilike('name', `%${q}%`).limit(8),
        supabase.from('albums').select('id, title, cover_url, artists(name)').ilike('title', `%${q}%`).limit(10),
        supabase.from('playlists').select('id, title, cover_url').eq('is_public', true).ilike('title', `%${q}%`).limit(10),
      ]);
      setResults({
        songs,
        artists: artistsRes.data || [],
        albums: albumsRes.data || [],
        playlists: playlistsRes.data || [],
      });
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const onChange = (v: string) => {
    setQuery(v);
    setSearchParams(v.trim() ? { q: v } : {}, { replace: true });
  };

  const hasQuery = query.trim().length > 0;
  const total = results.songs.length + results.artists.length + results.albums.length + results.playlists.length;
  const playSongs = (i: number) => {
    const s = results.songs[i];
    if (currentSong?.id === s.id) { togglePlay(); return; }
    playAlbum(results.songs, i);
    saveRecent(query);
  };

  return (
    <StreamsLayout>
      <SEO title="Search — BARA Streams" description="Search songs, artists, albums and playlists on BARA Streams." />
      <div className="min-h-screen pb-32">
        <main className="p-4 sm:p-8 max-w-[1100px] mx-auto">
          {/* Search bar */}
          <div className="relative max-w-2xl mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveRecent(query); }}
              placeholder="Songs, artists, albums, playlists…"
              className="w-full pl-12 pr-12 py-3.5 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-900 rounded-full text-gray-900 placeholder-gray-500 outline-none transition-all text-sm font-medium"
            />
            {hasQuery && (
              <button onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900" aria-label="Clear">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Recent searches (empty query) */}
          {!hasQuery && (
            recent.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Recent searches</h2>
                  <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }} className="text-xs font-bold text-gray-500 hover:text-gray-900">Clear all</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button key={r} onClick={() => onChange(r)} className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm px-4 py-2 rounded-full transition-colors">
                      <Clock size={14} className="text-gray-400" /> {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">Search for your favourite songs, artists and albums.</p>
              </div>
            )
          )}

          {/* Results */}
          {hasQuery && (
            loading && total === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}
              </div>
            ) : total === 0 ? (
              <div className="text-center py-20">
                <Music2 size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-900 font-bold">No results for "{query.trim()}"</p>
                <p className="text-gray-500 text-sm mt-1">Check your spelling or try a different term.</p>
                <Link to="/streams/genres" className="inline-block mt-4 text-sm font-bold text-gray-900 hover:underline">Browse by genre</Link>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Songs */}
                {results.songs.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Songs</h2>
                    <div className="space-y-0.5">
                      {results.songs.map((song, i) => {
                        const active = currentSong?.id === song.id;
                        return (
                          <div key={song.id} onClick={() => playSongs(i)} className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                            <div className="relative w-11 h-11 flex-shrink-0">
                              <img src={song.cover_url} alt="" className="w-full h-full rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }} />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                {active && isPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`font-bold text-sm truncate ${active ? 'text-gray-900' : 'text-gray-900'}`}>{song.title}</div>
                              <div className="text-xs text-gray-500 truncate">{song.artist}</div>
                            </div>
                            <span className="text-xs text-gray-400 tabular-nums">{fmt(song.duration)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Artists */}
                {results.artists.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Artists</h2>
                    <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-2 -mx-2 px-2">
                      {results.artists.map((a) => (
                        <Link key={a.id} to={`/streams/artist/${a.id}`} onClick={() => saveRecent(query)} className="group flex flex-col items-center min-w-[120px] snap-start">
                          <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 shadow-sm">
                            <img src={a.image_url} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                          <span className="mt-2 text-sm font-bold text-gray-900 text-center truncate w-full inline-flex items-center justify-center gap-1">
                            {a.name}{a.is_verified && <VerifiedBadge size={13} />}
                          </span>
                          <span className="text-xs text-gray-500">Artist</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Albums */}
                {results.albums.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Albums</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {results.albums.map((al) => (
                        <Link key={al.id} to={`/streams/album/${al.id}`} onClick={() => saveRecent(query)} className="group flex flex-col">
                          <div className="aspect-square mb-3 rounded-md overflow-hidden bg-gray-100 shadow-md">
                            {al.cover_url ? (
                              <img src={al.cover_url} alt={al.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Disc3 size={32} className="text-gray-300" /></div>
                            )}
                          </div>
                          <h3 className="font-bold truncate text-gray-900 text-sm">{al.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{al.artists?.name || 'Album'}</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Playlists */}
                {results.playlists.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Playlists</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {results.playlists.map((pl) => (
                        <Link key={pl.id} to={`/streams/playlist/${pl.id}`} onClick={() => saveRecent(query)} className="group flex flex-col">
                          <div className="aspect-square mb-3 rounded-md overflow-hidden bg-gray-100 shadow-md">
                            {pl.cover_url ? (
                              <img src={pl.cover_url} alt={pl.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Music2 size={32} className="text-gray-300" /></div>
                            )}
                          </div>
                          <h3 className="font-bold truncate text-gray-900 text-sm">{pl.title}</h3>
                          <p className="text-xs text-gray-500 truncate">Playlist</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )
          )}
        </main>
      </div>
    </StreamsLayout>
  );
}
