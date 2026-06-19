import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { SEO } from '@/components/SEO';
import { Play, Pause, ArrowLeft, Music2 } from 'lucide-react';

interface Genre { name: string; slug: string; blurb: string; }

// Curated browse genres (Phase 17.2.2). Detail matches songs.genre case-insensitively.
export const GENRES: Genre[] = [
  { name: 'Afrobeats', slug: 'afrobeats', blurb: 'The sound of the continent' },
  { name: 'Amapiano', slug: 'amapiano', blurb: 'Log drums & soul' },
  { name: 'Gospel', slug: 'gospel', blurb: 'Worship & praise' },
  { name: 'Highlife', slug: 'highlife', blurb: 'Classic West African' },
  { name: 'Bongo Flava', slug: 'bongo-flava', blurb: 'East African pop' },
  { name: 'Gqom', slug: 'gqom', blurb: 'Raw Durban house' },
  { name: 'Hip Hop', slug: 'hip-hop', blurb: 'Bars & beats' },
  { name: 'R&B', slug: 'rnb', blurb: 'Smooth & soulful' },
  { name: 'Reggae & Dancehall', slug: 'reggae', blurb: 'Riddim & vibes' },
  { name: 'Pop', slug: 'pop', blurb: 'Chart-ready hooks' },
  { name: 'Jazz', slug: 'jazz', blurb: 'Improvised & timeless' },
  { name: 'Traditional', slug: 'traditional', blurb: 'Roots & heritage' },
];

// Monochrome gray gradients cycled across the genre tiles (design system: no color).
const SHADES = [
  'from-gray-900 to-gray-700',
  'from-gray-700 to-gray-500',
  'from-gray-800 to-gray-600',
  'from-gray-600 to-gray-400',
];

const mapSong = (s: any): Song => ({
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

export default function GenrePage() {
  const { slug } = useParams<{ slug: string }>();
  const genre = GENRES.find((g) => g.slug === slug);

  if (!slug) return <GenreBrowse />;
  return <GenreDetail genre={genre} slug={slug} />;
}

function GenreBrowse() {
  return (
    <StreamsLayout>
      <SEO title="Browse Genres — BARA Streams" description="Explore African music by genre — Afrobeats, Amapiano, Gospel, Highlife, Bongo Flava and more on BARA Streams." />
      <div className="min-h-screen pb-32">
        <main className="p-4 sm:p-8 max-w-[1400px] mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2" style={{ fontFamily: 'Comfortaa, sans-serif' }}>Browse by genre</h1>
          <p className="text-gray-500 mb-8">Pick a sound and dive in.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GENRES.map((g, i) => (
              <Link
                key={g.slug}
                to={`/streams/genre/${g.slug}`}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br ${SHADES[i % SHADES.length]} p-5 flex flex-col justify-between group shadow-sm hover:shadow-xl transition-shadow`}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">{g.blurb}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight group-hover:translate-x-0.5 transition-transform" style={{ fontFamily: 'Comfortaa, sans-serif' }}>{g.name}</h2>
                <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={18} fill="white" className="text-white ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </StreamsLayout>
  );
}

function GenreDetail({ genre, slug }: { genre?: Genre; slug: string }) {
  const { playAlbum, togglePlay, currentSong, isPlaying } = useAudioPlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const name = genre?.name || slug.replace(/-/g, ' ');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [{ data: songData }, { data: artistData }] = await Promise.all([
          supabase.from('songs').select('*, artists(name)').ilike('genre', `%${name}%`).order('plays', { ascending: false }).limit(40),
          supabase.from('artists').select('id, name, image_url').ilike('genre', `%${name}%`).limit(12),
        ]);
        if (!active) return;
        setSongs((songData || []).map(mapSong));
        setArtists(artistData || []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [name]);

  const genreActive = songs.some((s) => s.id === currentSong?.id);

  return (
    <StreamsLayout>
      <SEO title={`${name} — BARA Streams`} description={`Listen to the best ${name} on BARA Streams.`} />
      <div className="min-h-screen pb-32">
        <div className="bg-gradient-to-b from-gray-900 to-gray-700 text-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
            <Link to="/streams/genres" className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm font-semibold mb-6 transition-colors">
              <ArrowLeft size={16} /> All genres
            </Link>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-300 font-bold mb-2">Genre</p>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight capitalize" style={{ fontFamily: 'Comfortaa, sans-serif' }}>{name}</h1>
            <button
              onClick={() => { if (songs.length === 0) return; if (genreActive) { togglePlay(); } else { playAlbum(songs, 0); } }}
              disabled={songs.length === 0}
              className="mt-6 inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3 rounded-full hover:bg-gray-200 transition disabled:opacity-40 active:scale-[0.98]"
            >
              {genreActive && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              {genreActive && isPlaying ? 'Pause' : 'Play all'}
            </button>
          </div>
        </div>

        <main className="p-4 sm:p-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />)}
            </div>
          ) : songs.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
              <Music2 size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No {name} tracks yet.</p>
              <Link to="/streams/genres" className="text-sm font-bold text-gray-900 hover:underline mt-2 inline-block">Browse other genres</Link>
            </div>
          ) : (
            <>
              {/* Artists in this genre */}
              {artists.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Artists</h2>
                  <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-2 -mx-2 px-2">
                    {artists.map((a) => (
                      <Link key={a.id} to={`/streams/artist/${a.id}`} className="group flex flex-col items-center min-w-[120px] snap-start">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 shadow-sm">
                          <img src={a.image_url} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        <span className="mt-2 text-sm font-bold text-gray-900 text-center truncate w-full">{a.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Songs grid */}
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Top {name} songs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {songs.map((song, i) => {
                  const active = currentSong?.id === song.id;
                  return (
                    <div key={song.id} className="group flex flex-col">
                      <div className="relative mb-3 aspect-square">
                        <img src={song.cover_url} alt={song.title} loading="lazy" className="w-full h-full object-cover rounded-md shadow-md"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'; }} />
                        <button
                          onClick={() => { if (active) { togglePlay(); } else { playAlbum(songs, i); } }}
                          className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105 active:scale-95"
                          aria-label={active && isPlaying ? 'Pause' : 'Play'}
                        >
                          {active && isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-0.5" />}
                        </button>
                      </div>
                      <h3 className="font-bold truncate text-gray-900 text-sm tracking-tight">{song.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </StreamsLayout>
  );
}
