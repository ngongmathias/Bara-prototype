import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { Play, Pause, Shuffle, Clock, Heart, ArrowLeft, Music2, Disc3, Check, Plus } from 'lucide-react';

interface AlbumInfo {
  id: string;
  title: string;
  cover_url: string | null;
  release_date: string | null;
  type: string | null;
  artist_id: string | null;
  artists?: { id: string; name: string } | null;
}

const fmt = (s?: number) => {
  if (!s || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playAlbum, togglePlay, currentSong, isPlaying, toggleLike, likedSongs } = useAudioPlayer();
  const { user } = useUser();
  const { toast } = useToast();

  const [album, setAlbum] = useState<AlbumInfo | null>(null);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savePending, setSavePending] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const { data: albumData } = await supabase
          .from('albums')
          .select('*, artists(id, name)')
          .eq('id', id)
          .maybeSingle();

        const { data: songData } = await supabase
          .from('songs')
          .select('*, artists(name)')
          .eq('album_id', id)
          .order('track_number', { ascending: true });

        if (!active) return;
        setAlbum(albumData as AlbumInfo);
        setTracks(
          (songData || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artists?.name || albumData?.artists?.name || 'Unknown Artist',
            file_url: s.file_url,
            cover_url: s.cover_url || albumData?.cover_url || '/placeholder-music.png',
            duration: s.duration,
            artist_id: s.artist_id,
            album_id: s.album_id,
            album_title: albumData?.title,
            price: s.price ?? null,
          }))
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  // Is this album already saved to the user's library?
  useEffect(() => {
    if (!id || !user?.id) { setSaved(false); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('user_album_saves')
        .select('album_id')
        .eq('user_id', user.id)
        .eq('album_id', id)
        .maybeSingle();
      if (active) setSaved(!!data);
    })();
    return () => { active = false; };
  }, [id, user?.id]);

  const toggleSave = async () => {
    if (!id) return;
    if (!user?.id) {
      toast({ title: 'Sign in to save albums', description: 'Saved albums live in Your Library.' });
      return;
    }
    if (savePending) return;
    setSavePending(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      if (next) {
        const { error } = await supabase
          .from('user_album_saves')
          .insert({ user_id: user.id, album_id: id });
        if (error) throw error;
        toast({ title: 'Saved to Your Library' });
      } else {
        const { error } = await supabase
          .from('user_album_saves')
          .delete()
          .eq('user_id', user.id)
          .eq('album_id', id);
        if (error) throw error;
        toast({ title: 'Removed from Your Library' });
      }
    } catch {
      setSaved(!next); // revert on failure
      toast({ title: 'Something went wrong', description: 'Please try again.' });
    } finally {
      setSavePending(false);
    }
  };

  const totalSeconds = tracks.reduce((a, t) => a + (t.duration || 0), 0);
  const totalLabel = totalSeconds >= 3600
    ? `${Math.floor(totalSeconds / 3600)} hr ${Math.round((totalSeconds % 3600) / 60)} min`
    : `${Math.max(1, Math.round(totalSeconds / 60))} min`;
  const year = album?.release_date ? new Date(album.release_date).getFullYear() : null;
  const albumIsActive = tracks.some((t) => t.id === currentSong?.id);

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    if (albumIsActive) { togglePlay(); return; }
    playAlbum(tracks, 0);
  };

  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const start = Math.floor(Math.random() * tracks.length);
    playAlbum(tracks, start);
  };

  const handleTrack = (track: Song, index: number) => {
    if (currentSong?.id === track.id) { togglePlay(); return; }
    playAlbum(tracks, index);
  };

  return (
    <StreamsLayout>
      <SEO title={album ? `${album.title} — BARA Streams` : 'Album — BARA Streams'} description={album ? `Listen to ${album.title}${album.artists?.name ? ' by ' + album.artists.name : ''} on BARA Streams.` : 'Album on BARA Streams.'} />
      <div className="min-h-screen pb-32">
        {/* Immersive header (monochrome) */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-700 text-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-6">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm font-semibold mb-6 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {loading ? (
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-lg bg-white/10 animate-pulse flex-shrink-0" />
            ) : (
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-lg overflow-hidden shadow-2xl flex-shrink-0 bg-gray-800">
                {album?.cover_url ? (
                  <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Disc3 size={56} className="text-gray-600" /></div>
                )}
              </div>
            )}
            <div className="text-center sm:text-left min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-300 font-bold mb-2">{album?.type === 'single' ? 'Single' : 'Album'}</p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight break-words" style={{ fontFamily: 'Comfortaa, sans-serif' }}>
                {loading ? 'Loading…' : album?.title || 'Album not found'}
              </h1>
              {album?.artists?.name && (
                <div className="mt-3 text-sm text-gray-200 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                  <Link to={`/streams/artist/${album.artists.id}`} className="font-bold hover:underline">{album.artists.name}</Link>
                  {year && <><span className="text-gray-400">•</span><span className="text-gray-300">{year}</span></>}
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300">{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}{tracks.length > 0 ? `, ${totalLabel}` : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 flex items-center gap-4">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-7 py-3 rounded-full hover:bg-black transition disabled:opacity-40 active:scale-[0.98] shadow-lg"
          >
            {albumIsActive && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
            {albumIsActive && isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleShuffle}
            disabled={tracks.length === 0}
            className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 font-bold px-5 py-2.5 rounded-full hover:border-gray-900 hover:text-gray-900 transition disabled:opacity-40"
          >
            <Shuffle size={18} /> Shuffle
          </button>
          <button
            onClick={toggleSave}
            disabled={loading || !album}
            aria-pressed={saved}
            aria-label={saved ? 'Remove album from your library' : 'Save album to your library'}
            className={`inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-full border-2 transition disabled:opacity-40 active:scale-[0.98] ${
              saved
                ? 'bg-gray-900 text-white border-gray-900 hover:bg-black'
                : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
            }`}
          >
            {saved ? <><Check size={18} /> Saved</> : <><Plus size={18} /> Save</>}
          </button>
        </div>

        {/* Track list */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
              <Music2 size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No tracks in this album yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* header row */}
              <div className="hidden sm:grid grid-cols-[40px_1fr_auto] gap-4 px-4 pb-2 mb-2 border-b border-gray-100 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                <span className="text-center">#</span>
                <span>Title</span>
                <span><Clock size={14} /></span>
              </div>
              {tracks.map((track, i) => {
                const active = currentSong?.id === track.id;
                const liked = likedSongs.includes(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrack(track, i)}
                    className={`group grid grid-cols-[40px_1fr_auto] items-center gap-4 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-center text-sm text-gray-400 w-10">
                      <span className={`group-hover:hidden ${active ? 'hidden' : 'block'}`}>{i + 1}</span>
                      {active && isPlaying ? (
                        <Pause size={16} className="text-gray-900 hidden group-hover:block" />
                      ) : (
                        <Play size={16} className="text-gray-900 hidden group-hover:block ml-0.5" />
                      )}
                      {active && (
                        <span className="group-hover:hidden inline-flex items-end gap-0.5 h-4" aria-label="Now playing">
                          <span className={`w-0.5 bg-gray-900 ${isPlaying ? 'animate-pulse' : ''}`} style={{ height: '60%' }} />
                          <span className={`w-0.5 bg-gray-900 ${isPlaying ? 'animate-pulse' : ''}`} style={{ height: '100%' }} />
                          <span className={`w-0.5 bg-gray-900 ${isPlaying ? 'animate-pulse' : ''}`} style={{ height: '40%' }} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex items-center gap-3">
                      <img src={track.cover_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0 sm:hidden"
                        onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${active ? 'text-gray-900' : 'text-gray-900'}`}>{track.title}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {track.artist}
                          {track.price && track.price > 0 ? <span className="ml-2 text-[10px] font-bold text-gray-700 border border-gray-300 rounded px-1">${track.price.toFixed(2)}</span> : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                        className={`transition-colors ${liked ? 'text-gray-900' : 'text-gray-300 hover:text-gray-700 opacity-0 group-hover:opacity-100'}`}
                        aria-label={liked ? 'Unlike' : 'Like'}
                      >
                        <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                      </button>
                      <span className="text-xs text-gray-400 tabular-nums w-10 text-right">{fmt(track.duration)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StreamsLayout>
  );
}
