import { useEffect, useMemo, useState } from 'react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { SEO } from '@/components/SEO';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer, Song } from '@/context/AudioPlayerContext';
import { useSongContextMenu } from '@/components/streams/SongContextMenu';
import { Play, Pause, Trophy, Globe2 } from 'lucide-react';
import { SkeletonCard } from '@/components/animations/SkeletonCard';

// §5 cross-vertical ⭐ "Country charts — real, not mock." The old
// "Featured Charts" section on StreamsHome was hardcoded fixture data
// (removed in Phase 1); this is a real replacement, ranked by songs.plays
// (the same already-aggregated, already-real counter every other Trending
// view in the app uses) rather than re-aggregating raw play_history rows,
// which would miss all of the seed catalog's plays (those only ever
// incremented songs.plays directly, never play_history).

interface ChartSong extends Song {
    plays: number;
    country: string | null;
}

const ALL_AFRICA = 'All Africa';

export default function ChartsPage() {
    const { playAlbum, currentSong, isPlaying } = useAudioPlayer();
    const { handlers: contextMenuHandlers } = useSongContextMenu();
    const [songs, setSongs] = useState<ChartSong[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(ALL_AFRICA);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { data } = await supabase
                .from('songs')
                .select('id, title, file_url, cover_url, duration, artist_id, album_id, price, plays, artists(name, country)')
                .order('plays', { ascending: false })
                .limit(300);

            setSongs((data || []).map((s: any) => ({
                id: s.id,
                title: s.title,
                artist: s.artists?.name || 'Unknown Artist',
                file_url: s.file_url,
                cover_url: s.cover_url || '/placeholder-music.png',
                duration: s.duration,
                artist_id: s.artist_id,
                album_id: s.album_id,
                price: s.price ?? null,
                plays: s.plays || 0,
                country: s.artists?.country || null,
            })));
            setLoading(false);
        })();
    }, []);

    const countries = useMemo(() => {
        const set = new Set<string>();
        songs.forEach(s => { if (s.country) set.add(s.country); });
        return [ALL_AFRICA, ...Array.from(set).sort()];
    }, [songs]);

    const chart = useMemo(() => {
        const filtered = selectedCountry === ALL_AFRICA ? songs : songs.filter(s => s.country === selectedCountry);
        return filtered.slice(0, 50);
    }, [songs, selectedCountry]);

    const handlePlay = (index: number) => playAlbum(chart, index);

    return (
        <StreamsLayout>
            <SEO
                title={selectedCountry === ALL_AFRICA ? 'Top 50 Africa — BARA Charts' : `Top Songs ${selectedCountry} — BARA Charts`}
                description="Real, live charts computed from actual plays across Bara Streams — not a hardcoded list."
                keywords={['African Music Charts', 'Top Songs Africa', 'BARA Charts']}
            />
            <div className="min-h-screen pb-24 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-6 h-6 text-gray-900" />
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Charts</h1>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">Ranked by real plays on Bara Streams — updates as the catalog grows.</p>

                    {/* Country selector */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
                        {countries.map((c) => (
                            <button
                                key={c}
                                onClick={() => setSelectedCountry(c)}
                                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition ${selectedCountry === c ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                                {c === ALL_AFRICA && <Globe2 size={12} />}
                                {c}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {selectedCountry === ALL_AFRICA ? 'Top 50 Africa' : `Top Songs — ${selectedCountry}`}
                    </h2>

                    {loading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} type="simple" />)}
                        </div>
                    ) : chart.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                            <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No plays recorded yet for {selectedCountry}.</p>
                            <p className="text-gray-400 text-sm mt-1">Charts fill in as songs get played.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                            {chart.map((song, i) => {
                                const active = currentSong?.id === song.id;
                                return (
                                    <div
                                        key={song.id}
                                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition cursor-pointer group"
                                        onClick={() => handlePlay(i)}
                                        {...contextMenuHandlers(song)}
                                    >
                                        <span className={`w-6 text-center font-black text-sm ${i < 3 ? 'text-gray-900' : 'text-gray-400'}`}>{i + 1}</span>
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <img loading="lazy" src={song.cover_url} alt={song.title} className="w-full h-full object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }} />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                                {active && isPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`font-bold text-sm truncate ${active ? 'text-gray-900 underline' : 'text-gray-900'}`}>{song.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{song.artist}{song.country ? ` · ${song.country}` : ''}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 tabular-nums flex-shrink-0">{song.plays.toLocaleString()} plays</span>
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
