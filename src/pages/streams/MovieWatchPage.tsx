import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { ArrowLeft, Maximize, Gauge, Loader2, Film } from 'lucide-react';

interface Movie {
    id: string;
    title: string;
    stream_url: string | null;
    trailer_url: string | null;
    poster_url: string;
    is_free: boolean;
    duration_minutes: number;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function toYoutubeEmbed(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0` : null;
}

export default function MovieWatchPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: clerkUser } = useUser();
    const { isPlaying: musicPlaying, pause: pauseMusic } = useAudioPlayer();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRateMenu, setShowRateMenu] = useState(false);
    const [rate, setRate] = useState(1);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const lastSaveRef = useRef(0);
    const resumedRef = useRef(false);

    // A movie and a song playing at once makes no sense — stop music the
    // moment someone opens a watch page.
    useEffect(() => {
        if (musicPlaying) pauseMusic();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        supabase.from('movies').select('id, title, stream_url, trailer_url, poster_url, is_free, duration_minutes').eq('id', id).maybeSingle()
            .then(({ data }) => { setMovie(data); setLoading(false); });
    }, [id]);

    useEffect(() => {
        if (!movie || !movie.stream_url || !clerkUser?.id || resumedRef.current) return;
        supabase
            .from('movie_watch_progress')
            .select('progress_seconds, completed')
            .eq('user_id', clerkUser.id)
            .eq('movie_id', movie.id)
            .maybeSingle()
            .then(({ data }) => {
                if (data && !data.completed && data.progress_seconds > 5 && videoRef.current) {
                    const video = videoRef.current;
                    const seekOnceReady = () => {
                        video.currentTime = data.progress_seconds;
                        video.removeEventListener('loadedmetadata', seekOnceReady);
                    };
                    video.addEventListener('loadedmetadata', seekOnceReady);
                }
                resumedRef.current = true;
            });
    }, [movie, clerkUser?.id]);

    const saveProgress = async (progressSeconds: number, durationSeconds: number, completed = false) => {
        if (!clerkUser?.id || !movie) return;
        try {
            await supabase.from('movie_watch_progress').upsert({
                user_id: clerkUser.id,
                movie_id: movie.id,
                progress_seconds: Math.floor(progressSeconds),
                duration_seconds: Math.floor(durationSeconds) || 0,
                completed,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,movie_id' });
        } catch { /* non-blocking */ }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.currentTime - lastSaveRef.current > 5) {
            lastSaveRef.current = video.currentTime;
            saveProgress(video.currentTime, video.duration);
        }
    };

    const handleEnded = () => {
        const video = videoRef.current;
        if (video) saveProgress(video.duration, video.duration, true);
    };

    const handlePause = () => {
        const video = videoRef.current;
        if (video) saveProgress(video.currentTime, video.duration);
    };

    const setPlaybackRate = (r: number) => {
        setRate(r);
        setShowRateMenu(false);
        if (videoRef.current) videoRef.current.playbackRate = r;
    };

    const requestFullscreen = () => {
        videoRef.current?.requestFullscreen?.().catch(() => {});
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <Loader2 className="w-10 h-10 animate-spin text-white/60" />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50 text-white">
                <p>Movie not found.</p>
                <button onClick={() => navigate('/streams/movies')} className="underline text-sm text-white/70">Back to Movies</button>
            </div>
        );
    }

    if (!movie.is_free) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-50 text-white text-center px-6">
                <Film className="w-12 h-12 text-white/40" />
                <h1 className="text-xl font-bold">Premium movies are coming soon</h1>
                <p className="text-white/60 max-w-sm">Payments for premium titles aren't live yet — check back soon.</p>
                <button onClick={() => navigate(`/streams/movie/${movie.id}`)} className="mt-2 bg-white text-black font-bold px-5 py-2.5 rounded-lg text-sm">Back to {movie.title}</button>
            </div>
        );
    }

    const embedTrailer = !movie.stream_url && movie.trailer_url ? toYoutubeEmbed(movie.trailer_url) : null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 text-white z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0">
                <button onClick={() => navigate(`/streams/movie/${movie.id}`)} className="flex items-center gap-2 text-white/90 hover:text-white text-sm">
                    <ArrowLeft className="w-5 h-5" /> {movie.title}
                </button>
                {movie.stream_url && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button onClick={() => setShowRateMenu(v => !v)} className="flex items-center gap-1 text-white/80 hover:text-white text-xs bg-white/10 px-2.5 py-1.5 rounded-full">
                                <Gauge className="w-3.5 h-3.5" /> {rate}x
                            </button>
                            {showRateMenu && (
                                <div className="absolute right-0 mt-1 bg-black/90 rounded-lg overflow-hidden border border-white/10 min-w-[70px]">
                                    {PLAYBACK_RATES.map(r => (
                                        <button key={r} onClick={() => setPlaybackRate(r)} className={`block w-full text-left px-3 py-1.5 text-xs ${r === rate ? 'text-white font-bold' : 'text-white/60'} hover:bg-white/10`}>
                                            {r}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={requestFullscreen} className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full">
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center">
                {movie.stream_url ? (
                    <video
                        ref={videoRef}
                        src={movie.stream_url}
                        poster={movie.poster_url}
                        controls
                        autoPlay
                        className="w-full h-full"
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onPause={handlePause}
                    />
                ) : embedTrailer ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <div className="w-full max-w-4xl aspect-video">
                            <iframe
                                src={embedTrailer}
                                title={`${movie.title} trailer`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                        <p className="text-white/50 text-sm">Full movie coming soon — enjoy the trailer for now.</p>
                    </div>
                ) : (
                    <div className="text-white/60 flex flex-col items-center gap-3 text-center px-6">
                        <Film className="w-12 h-12 text-white/30" />
                        <p>No video available for this title yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
