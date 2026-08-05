import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Play, Pause, Mic2, Film, BookOpen, Music2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer } from '@/context/AudioPlayerContext';

// §5 cross-vertical ⭐ "Jump back in" — one row showing wherever you left
// off across all four verticals. Music comes live from AudioPlayerContext
// (works even signed out, and stays in sync with play/pause elsewhere on
// the page); the other three are fetched once per session from the resume
// tables built in Phases 7/8/9 (podcast_listen_history via currentSong
// itself, movie_watch_progress, ebook_reading_progress).

interface FetchedResumeItem {
    id: string;
    kind: 'movie' | 'ebook';
    title: string;
    subtitle: string;
    coverUrl: string | null;
    progressPercent: number;
    href: string;
}

const KIND_ICON: Record<'song' | 'episode' | 'movie' | 'ebook', typeof Music2> = {
    song: Music2, episode: Mic2, movie: Film, ebook: BookOpen,
};

function ResumeCard({ kind, title, subtitle, coverUrl, progressPercent, isPlaying }: {
    kind: keyof typeof KIND_ICON; title: string; subtitle: string; coverUrl: string | null; progressPercent: number; isPlaying?: boolean;
}) {
    const Icon = KIND_ICON[kind];
    return (
        <div className="bg-white border border-gray-100 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 group flex items-center gap-3 min-w-[260px] sm:min-w-[300px] snap-start shadow-sm">
            <div className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                {coverUrl ? (
                    <img loading="lazy" src={coverUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><Icon className="w-6 h-6 text-gray-300" /></div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    {isPlaying ? <Pause size={16} className="text-white opacity-0 group-hover:opacity-100" fill="white" /> : <Play size={16} className="text-white opacity-0 group-hover:opacity-100 ml-0.5" fill="white" />}
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm truncate">{title}</p>
                <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gray-900" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>
        </div>
    );
}

export function JumpBackInRail() {
    const { user: clerkUser } = useUser();
    const { currentSong, isPlaying, togglePlay, progress, duration } = useAudioPlayer();
    const [fetched, setFetched] = useState<FetchedResumeItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!clerkUser?.id) { setFetched([]); setLoaded(true); return; }
        let cancelled = false;
        (async () => {
            const [movieRes, ebookRes] = await Promise.all([
                supabase
                    .from('movie_watch_progress')
                    .select('progress_seconds, duration_seconds, movies(id, title, poster_url)')
                    .eq('user_id', clerkUser.id)
                    .eq('completed', false)
                    .gt('progress_seconds', 5)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from('ebook_reading_progress')
                    .select('progress_percent, ebooks(id, title, author, cover_url)')
                    .eq('user_id', clerkUser.id)
                    .eq('completed', false)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
            ]);

            const results: FetchedResumeItem[] = [];
            const movie = (movieRes.data as any)?.movies;
            if (movie) {
                results.push({
                    id: `movie-${movie.id}`,
                    kind: 'movie',
                    title: movie.title,
                    subtitle: 'Continue watching',
                    coverUrl: movie.poster_url,
                    progressPercent: movieRes.data!.duration_seconds > 0
                        ? Math.min(100, (movieRes.data!.progress_seconds / movieRes.data!.duration_seconds) * 100) : 0,
                    href: `/streams/movie/${movie.id}/watch`,
                });
            }

            const ebook = (ebookRes.data as any)?.ebooks;
            if (ebook) {
                results.push({
                    id: `ebook-${ebook.id}`,
                    kind: 'ebook',
                    title: ebook.title,
                    subtitle: ebook.author || 'Continue reading',
                    coverUrl: ebook.cover_url,
                    progressPercent: ebookRes.data?.progress_percent ?? 0,
                    href: `/streams/ebook/${ebook.id}/read`,
                });
            }

            if (!cancelled) { setFetched(results); setLoaded(true); }
        })();
        return () => { cancelled = true; };
    }, [clerkUser?.id]);

    const hasSongResume = !!currentSong;
    if (!loaded || (!hasSongResume && fetched.length === 0)) return null;

    return (
        <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Jump back in</h2>
            <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x -mx-2 px-2">
                {currentSong && (
                    <button onClick={() => togglePlay()} className="text-left">
                        <ResumeCard
                            kind={currentSong.kind === 'episode' ? 'episode' : 'song'}
                            title={currentSong.title}
                            subtitle={currentSong.artist}
                            coverUrl={currentSong.cover_url}
                            progressPercent={duration > 0 ? Math.min(100, (progress / duration) * 100) : 0}
                            isPlaying={isPlaying}
                        />
                    </button>
                )}
                {fetched.map((item) => (
                    <Link key={item.id} to={item.href}>
                        <ResumeCard kind={item.kind} title={item.title} subtitle={item.subtitle} coverUrl={item.coverUrl} progressPercent={item.progressPercent} />
                    </Link>
                ))}
            </div>
        </section>
    );
}
