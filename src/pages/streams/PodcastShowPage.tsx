import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { StreamsLayout } from '@/components/streams/StreamsLayout';
import { Mic2, Play, Pause, Clock, Headphones, Users, Share2, Bell, BellOff, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import { useShare } from '@/context/ShareContext';
import { useSignInNudge } from '@/context/SignInNudgeContext';
import { useAudioPlayer, type Song } from '@/context/AudioPlayerContext';

interface Podcast {
    id: string;
    title: string;
    host: string;
    description: string;
    category: string;
    cover_url: string;
    subscriber_count: number;
    is_seed?: boolean;
}

interface Episode {
    id: string;
    podcast_id: string;
    title: string;
    description: string;
    audio_url: string;
    duration: number;
    episode_number: number;
    season_number: number;
    published_at: string;
    play_count: number;
}

export default function PodcastShowPage() {
    const { id, episodeId } = useParams<{ id: string; episodeId?: string }>();
    const { user: clerkUser } = useUser();
    const { openShare } = useShare();
    const { requireSignIn } = useSignInNudge();
    const { currentSong, isPlaying, playAlbum } = useAudioPlayer();

    const [podcast, setPodcast] = useState<Podcast | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const highlightRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        (async () => {
            const [{ data: pod }, { data: eps }] = await Promise.all([
                supabase.from('podcasts').select('*').eq('id', id).maybeSingle(),
                supabase.from('podcast_episodes').select('*').eq('podcast_id', id).order('episode_number', { ascending: false }),
            ]);
            setPodcast(pod || null);
            setSubscriberCount(pod?.subscriber_count || 0);
            setEpisodes(eps || []);
            setLoading(false);
        })();
    }, [id]);

    useEffect(() => {
        if (!id || !clerkUser?.id) { setIsSubscribed(false); return; }
        supabase
            .from('podcast_subscriptions')
            .select('id')
            .eq('user_id', clerkUser.id)
            .eq('podcast_id', id)
            .maybeSingle()
            .then(({ data }) => setIsSubscribed(!!data));
    }, [id, clerkUser?.id]);

    useEffect(() => {
        if (episodeId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [episodeId, episodes]);

    const toggleSubscribe = async () => {
        if (!id) return;
        if (!clerkUser?.id) { requireSignIn("Sign in to subscribe to podcasts."); return; }
        if (isSubscribed) {
            setIsSubscribed(false);
            setSubscriberCount(c => Math.max(0, c - 1));
            await supabase.from('podcast_subscriptions').delete().eq('user_id', clerkUser.id).eq('podcast_id', id);
        } else {
            setIsSubscribed(true);
            setSubscriberCount(c => c + 1);
            await supabase.from('podcast_subscriptions').insert({ user_id: clerkUser.id, podcast_id: id });
        }
    };

    const mapEpisodeToSong = (episode: Episode, pod: Podcast): Song => ({
        id: episode.id,
        title: episode.title,
        artist: pod.host,
        file_url: episode.audio_url,
        cover_url: pod.cover_url,
        duration: episode.duration,
        kind: 'episode',
        podcast_id: episode.podcast_id,
    });

    const handlePlayEpisode = (episode: Episode) => {
        if (!podcast) return;
        const startIndex = episodes.findIndex(e => e.id === episode.id);
        playAlbum(episodes.map(e => mapEpisodeToSong(e, podcast)), startIndex === -1 ? 0 : startIndex);
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
    };

    const handleShare = () => {
        if (!podcast) return;
        openShare({
            url: `${window.location.origin}/streams/podcast/${podcast.id}`,
            title: podcast.title,
            description: podcast.description,
            imageUrl: podcast.cover_url,
        });
    };

    if (loading) {
        return (
            <StreamsLayout>
                <div className="flex justify-center py-24">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                </div>
            </StreamsLayout>
        );
    }

    if (!podcast) {
        return (
            <StreamsLayout>
                <div className="text-center py-24">
                    <Mic2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Podcast not found</p>
                    <Link to="/streams/podcasts" className="text-sm text-gray-900 font-bold underline mt-2 inline-block">Back to Podcasts</Link>
                </div>
            </StreamsLayout>
        );
    }

    return (
        <StreamsLayout>
            <SEO
                title={`${podcast.title} — BARA Podcasts`}
                description={podcast.description || `Listen to ${podcast.title} on Bara Streams`}
                keywords={[podcast.title, podcast.host, podcast.category, 'BARA Podcasts']}
                image={podcast.cover_url}
            />
            <div className="min-h-screen bg-gray-50 pb-24">
                <div className="max-w-4xl mx-auto px-6 pt-8">
                    <Link to="/streams/podcasts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ArrowLeft size={14} /> All Podcasts
                    </Link>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center">
                            {podcast.cover_url ? (
                                <img loading="lazy" src={podcast.cover_url} alt={podcast.title} className="w-full h-full object-cover" />
                            ) : (
                                <Mic2 size={40} className="text-white/40" />
                            )}
                        </div>
                        <div className="flex-1">
                            {podcast.is_seed && (
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full mb-2">Demo Content</span>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{podcast.title}</h1>
                            <p className="text-gray-500 mt-1">Hosted by {podcast.host}</p>
                            <p className="text-gray-600 text-sm mt-3 max-w-xl">{podcast.description}</p>
                            <div className="flex items-center gap-3 mt-4 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-gray-500"><Users size={14} />{subscriberCount.toLocaleString()} subscribers</span>
                                <button
                                    onClick={toggleSubscribe}
                                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition ${isSubscribed ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
                                >
                                    {isSubscribed ? <BellOff size={12} /> : <Bell size={12} />}
                                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                </button>
                                <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 transition">
                                    <Share2 size={12} /> Share
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{episodes.length} Episode{episodes.length !== 1 ? 's' : ''}</h2>
                        {episodes.length === 0 ? (
                            <p className="text-gray-500 text-sm">No episodes yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {episodes.map((ep) => {
                                    const isHighlighted = ep.id === episodeId;
                                    const isCurrent = currentSong?.id === ep.id;
                                    return (
                                        <div
                                            key={ep.id}
                                            ref={isHighlighted ? highlightRef : undefined}
                                            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white transition bg-white border ${isHighlighted ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100'}`}
                                        >
                                            <button
                                                onClick={() => handlePlayEpisode(ep)}
                                                className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-800 transition"
                                            >
                                                {isCurrent && isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{ep.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{ep.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                                                <span className="flex items-center gap-1"><Clock size={12} />{formatDuration(ep.duration)}</span>
                                                <span className="flex items-center gap-1"><Headphones size={12} />{ep.play_count?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StreamsLayout>
    );
}
