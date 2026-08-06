import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase';

import { GamificationService } from '@/lib/gamificationService';
import { trackRecent } from '@/lib/recentActivity';
import { PAID_MUSIC_ENABLED } from '@/lib/features';

import { useUser, useAuth } from '@clerk/clerk-react';
import { useSignInNudge } from '@/context/SignInNudgeContext';

const DEVICE_ID_KEY = 'bara.streams.deviceId';
// Anonymous plays still count (D3), just deduped server-side by this
// per-browser id instead of a verified user id.
function getDeviceId(): string {
    try {
        let id = localStorage.getItem(DEVICE_ID_KEY);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(DEVICE_ID_KEY, id);
        }
        return id;
    } catch {
        return 'unknown-device';
    }
}

const PLAYER_STORAGE_KEY = 'bara.streams.playerState';

// Types

export interface Song {

    id: string;

    title: string;

    artist: string; // Display name

    file_url: string; // Track URL

    cover_url: string; // Album art

    duration: number; // Seconds

    album_id?: string;

    artist_id?: string;

    album_title?: string; // Optional album name for lists

    price?: number | null; // null or 0 = free, >0 = paid (requires purchase)

    kind?: 'song' | 'episode'; // Discriminator — absent/'song' = music (default), 'episode' = podcast episode

    podcast_id?: string; // Set when kind === 'episode' — the parent show, for resume/progress lookups and links

}



interface AudioPlayerContextType {

    currentSong: Song | null;

    isPlaying: boolean;

    volume: number;

    progress: number;

    duration: number;

    queue: Song[];

    isShuffle: boolean;

    repeatMode: 'none' | 'one' | 'all';

    isPreviewing: boolean; // true when playing a preview of a paid song

    purchasedSongs: string[]; // IDs of songs the user has purchased

    purchaseSong: (songId: string) => Promise<{ success: boolean; message?: string }>; // Record a song purchase

    isSongPurchased: (songId: string) => boolean; // Check if user owns a song

    likedSongs: string[];

    play: (song: Song) => void;

    pause: () => void;

    togglePlay: () => void;

    next: () => void;

    prev: () => void;

    seek: (time: number) => void;

    setVolume: (vol: number) => void;

    addToQueue: (song: Song) => void;

    playNext: (song: Song) => void;

    removeFromQueue: (index: number) => void;

    reorderQueue: (from: number, to: number) => void;

    clearQueue: () => void;

    isRadio: boolean;

    startRadio: (song: Song) => Promise<void>;

    playAlbum: (songs: Song[], startIndex?: number) => void;

    toggleShuffle: () => void;

    setRepeatMode: (mode: 'none' | 'one' | 'all') => void;

    toggleLike: (songId: string) => Promise<void>;

    playbackRate: number;

    setPlaybackRate: (rate: number) => void;

    sleepTimerMinutes: number | null; // null when disabled; 'end-of-track' represented separately

    sleepTimerEndOfTrack: boolean;

    sleepTimerRemainingMs: number | null;

    setSleepTimer: (option: number | 'end-of-track' | null) => void;

}



const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);



export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);

    const [volume, setVolumeState] = useState(1); // 0.0 to 1.0

    const [progress, setProgress] = useState(0);

    const [duration, setDuration] = useState(0);

    const [queue, setQueue] = useState<Song[]>([]);

    const [queueIndex, setQueueIndex] = useState(-1);

    const [isShuffle, setIsShuffle] = useState(false);

    const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

    const [likedSongs, setLikedSongs] = useState<string[]>([]);

    const [purchasedSongs, setPurchasedSongs] = useState<string[]>([]);

    const [isPreviewing, setIsPreviewing] = useState(false);

    const [playbackRate, setPlaybackRateState] = useState(1);

    const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
    const [sleepTimerEndOfTrack, setSleepTimerEndOfTrack] = useState(false);
    const [sleepTimerRemainingMs, setSleepTimerRemainingMs] = useState<number | null>(null);
    const sleepTimerDeadlineRef = useRef<number | null>(null);
    const sleepTimerEndOfTrackRef = useRef(false);
    useEffect(() => { sleepTimerEndOfTrackRef.current = sleepTimerEndOfTrack; }, [sleepTimerEndOfTrack]);

    // Radio / infinite autoplay
    const [radioSeed, setRadioSeed] = useState<{ songId: string; artistId?: string; genre?: string } | null>(null);
    const radioSeedRef = useRef(radioSeed);
    useEffect(() => { radioSeedRef.current = radioSeed; }, [radioSeed]);
    const extendRadioRef = useRef<() => void>(() => {});

    const hasAwardedXP = useRef<string | null>(null);

    const { user: clerkUser } = useUser();
    const { getToken } = useAuth();
    const { requireSignIn } = useSignInNudge();

    // Refs for stable access in audio event handlers (avoids stale closures)
    const queueRef = useRef(queue);
    const queueIndexRef = useRef(queueIndex);
    const isShuffleRef = useRef(isShuffle);
    const repeatModeRef = useRef(repeatMode);
    const currentSongRef = useRef(currentSong);

    useEffect(() => { queueRef.current = queue; }, [queue]);
    useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
    useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
    useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
    useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
    const purchasedSongsRef = useRef(purchasedSongs);
    useEffect(() => { purchasedSongsRef.current = purchasedSongs; }, [purchasedSongs]);
    const volumeRef = useRef(volume);
    useEffect(() => { volumeRef.current = volume; }, [volume]);
    const playbackRateRef = useRef(playbackRate);
    useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);

    // ===== Shuffle order — a real permutation + a pointer into it, so next()
    // never repeats a song until the whole queue has played once, and prev()
    // retraces the exact same path instead of picking a new random song.
    const shuffleOrderRef = useRef<number[]>([]);
    const shufflePosRef = useRef(0);

    const buildFreshShuffleOrder = (length: number): number[] => {
        const arr = Array.from({ length }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // Lazily (re)builds the shuffle order whenever it's out of sync with the
    // current queue (fresh queue, resized queue, or shuffle just turned on),
    // pinning the currently-playing song to the current position so toggling
    // shuffle mid-song doesn't jump to something else.
    const ensureShuffleOrder = (): { order: number[]; pos: number } => {
        const q = queueRef.current;
        if (shuffleOrderRef.current.length === q.length && shuffleOrderRef.current.length > 0) {
            return { order: shuffleOrderRef.current, pos: shufflePosRef.current };
        }
        const cur = queueIndexRef.current;
        const order = buildFreshShuffleOrder(q.length);
        if (cur >= 0 && cur < q.length) {
            const curPos = order.indexOf(cur);
            if (curPos > 0) { [order[0], order[curPos]] = [order[curPos], order[0]]; }
        }
        shuffleOrderRef.current = order;
        shufflePosRef.current = 0;
        return { order, pos: 0 };
    };

    // Any time the queue's contents change shape (new album, reorder, remove,
    // radio extend, ...) the previous shuffle order's indices no longer mean
    // anything — force a lazy rebuild on the next next()/prev() call.
    const resetShuffleOrder = () => {
        shuffleOrderRef.current = [];
        shufflePosRef.current = 0;
    };

    // ===== Persistence — survive a refresh with the queue, current song,
    // position, volume, shuffle/repeat and rate restored (paused; never
    // autoplays on load).
    const lastPersistTimeRef = useRef(0);
    const lastEpisodeProgressSaveRef = useRef(0);
    const savePlayerState = () => {
        try {
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({
                currentSong: currentSongRef.current,
                queue: queueRef.current,
                queueIndex: queueIndexRef.current,
                progress: audioRef.current?.currentTime ?? 0,
                volume: volumeRef.current,
                isShuffle: isShuffleRef.current,
                repeatMode: repeatModeRef.current,
                playbackRate: playbackRateRef.current,
            }));
        } catch { /* storage unavailable or full — not fatal */ }
    };
    const savePlayerStateRef = useRef(savePlayerState);
    useEffect(() => { savePlayerStateRef.current = savePlayerState; });

    // Flush on tab close/hide — beforeunload doesn't fire reliably on mobile,
    // visibilitychange does.
    useEffect(() => {
        const flush = () => savePlayerStateRef.current();
        const onVisibilityChange = () => { if (document.visibilityState === 'hidden') flush(); };
        window.addEventListener('beforeunload', flush);
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            window.removeEventListener('beforeunload', flush);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    // Reload likes + purchases whenever the signed-in user changes
    useEffect(() => { if (clerkUser) fetchLikes(); }, [clerkUser?.id]);



    // Initialize Audio Object

    useEffect(() => {

        audioRef.current = new Audio();

        audioRef.current.volume = volume;



        const audio = audioRef.current;



        const handleTimeUpdate = () => {

            setProgress(audio.currentTime);

            // Persist playback position periodically (not on every tick — that's
            // ~4x/sec) so a refresh can resume roughly where you left off.
            if (audio.currentTime - lastPersistTimeRef.current > 5) {
                lastPersistTimeRef.current = audio.currentTime;
                savePlayerStateRef.current();
            }

            // Preview cutoff: paid songs stop at 25 seconds if not purchased.
            // Disabled while paid music is deferred (all songs play in full).
            const song = currentSongRef.current;
            if (PAID_MUSIC_ENABLED && song && song.price && song.price > 0 && !purchasedSongsRef.current.includes(song.id)) {
                if (audio.currentTime >= 25) {
                    audio.pause();
                    setIsPlaying(false);
                    setIsPreviewing(true);
                    return;
                }
            } else {
                if (isPreviewing) setIsPreviewing(false);
            }

            // A "stream" is 30s+ of listening (D3) — this is the single
            // trigger for play count, XP, and mission progress, so all
            // three "meaningful play" definitions agree. Guard fires once
            // per song regardless of sign-in state, so anon listeners
            // don't re-trigger it every tick for the rest of the track.
            if (audio.currentTime >= 30 && song && hasAwardedXP.current !== song.id) {
                hasAwardedXP.current = song.id;

                if (song.kind === 'episode') {
                    trackEpisodePlay(song.id);
                } else {
                    trackPlay(song.id);

                    if (clerkUser) {
                        // Capped daily listen-XP + first-listen achievement
                        GamificationService.awardSongListenXP(clerkUser.id, song.title).catch(() => {});
                    }
                }
            }

            // Podcast resume — save progress periodically (same 5s cadence as
            // the localStorage persist above) so "continue listening" works
            // even if the tab is killed instead of closed cleanly.
            if (song?.kind === 'episode' && clerkUser && audio.currentTime - lastEpisodeProgressSaveRef.current > 5) {
                lastEpisodeProgressSaveRef.current = audio.currentTime;
                saveEpisodeProgress(song.id, audio.currentTime, audio.duration);
            }

        };

        const handleDurationChange = () => setDuration(audio.duration || 0);

        const handleEnded = () => {
            const endedSong = currentSongRef.current;
            if (endedSong?.kind === 'episode') {
                saveEpisodeProgress(endedSong.id, audio.duration || endedSong.duration, audio.duration || endedSong.duration);
            }
            if (sleepTimerEndOfTrackRef.current) {
                sleepTimerEndOfTrackRef.current = false;
                setSleepTimerEndOfTrack(false);
                setIsPlaying(false);
                return;
            }
            if (repeatModeRef.current === 'one') {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            } else {
                // Inline next logic using refs to avoid stale closures
                const q = queueRef.current;
                if (q.length === 0) { setIsPlaying(false); return; }

                let nextIdx: number | null = null;
                if (isShuffleRef.current) {
                    const { order, pos } = ensureShuffleOrder();
                    if (pos + 1 < order.length) {
                        shufflePosRef.current = pos + 1;
                        nextIdx = order[pos + 1];
                    }
                } else {
                    const idx = queueIndexRef.current + 1;
                    if (idx < q.length) nextIdx = idx;
                }

                if (nextIdx !== null) {
                    setQueueIndex(nextIdx);
                    play(q[nextIdx]);
                } else if (repeatModeRef.current === 'all') {
                    if (isShuffleRef.current) {
                        const order = buildFreshShuffleOrder(q.length);
                        shuffleOrderRef.current = order;
                        shufflePosRef.current = 0;
                        setQueueIndex(order[0]);
                        play(q[order[0]]);
                    } else {
                        setQueueIndex(0);
                        play(q[0]);
                    }
                } else if (radioSeedRef.current) {
                    extendRadioRef.current();
                } else {
                    setIsPlaying(false);
                    audio.currentTime = 0;
                }
            }
        };



        const handleError = (e: Event) => {
            const audio = e.target as HTMLAudioElement;
            const error = audio.error;
            if (error) {
                console.warn('Audio error:', error.code, error.message);
                setIsPlaying(false);
                // Auto-skip to next song after a short delay
                const q = queueRef.current;
                const qi = queueIndexRef.current;
                if (q.length > 0) {
                    setTimeout(() => {
                        const nextIdx = qi + 1;
                        if (nextIdx < q.length) {
                            setQueueIndex(nextIdx);
                            setCurrentSong(q[nextIdx]);
                            if (audioRef.current && q[nextIdx].file_url) {
                                audioRef.current.src = q[nextIdx].file_url;
                                audioRef.current.load();
                                setIsPlaying(true);
                            }
                        }
                    }, 500);
                }
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);

        audio.addEventListener('durationchange', handleDurationChange);

        audio.addEventListener('ended', handleEnded);

        audio.addEventListener('error', handleError);



        // Fetch liked songs for current user

        fetchLikes();



        return () => {

            audio.removeEventListener('timeupdate', handleTimeUpdate);

            audio.removeEventListener('durationchange', handleDurationChange);

            audio.removeEventListener('ended', handleEnded);

            audio.removeEventListener('error', handleError);

            audio.pause();

        };

    }, []); // Runs once — event handlers use refs for current state

    // Restore persisted player state on mount. Always restores paused —
    // browsers block autoplay without a user gesture anyway, and jumping
    // straight into audio on load would be a bad surprise.
    useEffect(() => {
        try {
            const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);

            if (typeof saved.volume === 'number') {
                setVolumeState(saved.volume);
                if (audioRef.current) audioRef.current.volume = saved.volume;
            }
            if (typeof saved.playbackRate === 'number') setPlaybackRateState(saved.playbackRate);
            if (typeof saved.isShuffle === 'boolean') setIsShuffle(saved.isShuffle);
            if (saved.repeatMode === 'none' || saved.repeatMode === 'one' || saved.repeatMode === 'all') {
                setRepeatMode(saved.repeatMode);
            }
            if (Array.isArray(saved.queue) && saved.queue.length > 0) {
                setQueue(saved.queue);
                queueRef.current = saved.queue;
                setQueueIndex(saved.queueIndex ?? 0);
                queueIndexRef.current = saved.queueIndex ?? 0;
            }
            if (saved.currentSong?.id && audioRef.current) {
                setCurrentSong(saved.currentSong);
                currentSongRef.current = saved.currentSong;
                if (saved.currentSong.file_url) {
                    const audio = audioRef.current;
                    audio.src = saved.currentSong.file_url;
                    audio.load();
                    const restorePosition = () => {
                        if (typeof saved.progress === 'number' && saved.progress > 0) {
                            audio.currentTime = saved.progress;
                            setProgress(saved.progress);
                        }
                        audio.removeEventListener('loadedmetadata', restorePosition);
                    };
                    audio.addEventListener('loadedmetadata', restorePosition);
                }
            }
        } catch { /* corrupt or unavailable storage — start fresh */ }
    }, []);

    // Save immediately on discrete state changes (song, queue shape, toggles).
    // Progress itself is saved on a throttle inside handleTimeUpdate instead.
    useEffect(() => {
        savePlayerState();
    }, [currentSong?.id, queue, isShuffle, repeatMode, volume, playbackRate]);

    const fetchLikes = async () => {

        if (!clerkUser) return;



        const { data } = await supabase

            .from('user_song_likes')

            .select('song_id')

            .eq('user_id', clerkUser.id);



        if (data) {

            setLikedSongs(data.map(l => l.song_id));

        }

        // Load purchased songs
        const { data: purchasedData } = await supabase
            .from('purchased_songs')
            .select('song_id')
            .eq('user_id', clerkUser.id);

        if (purchasedData) {
            setPurchasedSongs(purchasedData.map(p => p.song_id));
        }

    };



    // Handle Play/Pause side effects
    useEffect(() => {
        if (!audioRef.current || !currentSong) return;

        const audio = audioRef.current;

        if (isPlaying) {
            const tryPlay = () => {
                const playPromise = audio.play();
                if (playPromise) {
                    playPromise.catch(e => {
                        if (e.name === 'AbortError') return; // Normal when switching songs
                        console.error("Playback failed:", e);
                        // If NotAllowedError, user hasn't interacted yet
                        if (e.name === 'NotAllowedError') {
                            setIsPlaying(false);
                        }
                    });
                }
            };

            if (audio.readyState >= 2) {
                tryPlay();
            } else {
                // Wait for enough data to start playback
                let settled = false;
                const cleanup = () => {
                    settled = true;
                    audio.removeEventListener('canplay', onCanPlay);
                    audio.removeEventListener('error', onError);
                    clearTimeout(timeoutId);
                };
                const onCanPlay = () => {
                    if (settled) return;
                    cleanup();
                    tryPlay();
                };
                const onError = () => {
                    if (settled) return;
                    cleanup();
                    console.error("Audio load error for:", audio.src);
                    setIsPlaying(false);
                };
                // Timeout: if canplay doesn't fire within 15s, give up
                const timeoutId = setTimeout(() => {
                    if (settled) return;
                    cleanup();
                    console.warn("Audio load timed out for:", audio.src);
                    setIsPlaying(false);
                }, 15000);
                audio.addEventListener('canplay', onCanPlay);
                audio.addEventListener('error', onError, { once: true });
                return () => { cleanup(); };
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, currentSong]);



    // Handle Song Change

    const play = (song: Song) => {

        if (!audioRef.current) return;



        if (currentSong?.id === song.id) {

            togglePlay();

            return;

        }



        // New song — validate URL before attempting playback
        if (!song.file_url) {
            console.warn('Song has no file_url, skipping:', song.title);
            // Try next song in queue
            const index = queue.findIndex(s => s.id === song.id);
            if (index !== -1 && index + 1 < queue.length) {
                play(queue[index + 1]);
            }
            return;
        }

        setCurrentSong(song);
        lastEpisodeProgressSaveRef.current = 0;

        // Track for "Continue where you left off"
        try {
          trackRecent({
            id: song.id,
            kind: song.kind === 'episode' ? 'episode' : 'song',
            title: song.title,
            subtitle: song.artist,
            imageUrl: song.cover_url,
            href: song.kind === 'episode' ? `/streams/podcast/${song.podcast_id}/episode/${song.id}` : `/streams/song/${song.id}`,
          });
        } catch { /* ignore */ }

        // Check if this is a paid preview (disabled while paid music is deferred)
        const isPaid = PAID_MUSIC_ENABLED && song.price && song.price > 0 && !purchasedSongsRef.current.includes(song.id);
        setIsPreviewing(!!isPaid);

        audioRef.current.src = song.file_url;

        audioRef.current.load();

        setIsPlaying(true);



        // Update queue index

        const index = queue.findIndex(s => s.id === song.id);

        if (index !== -1) setQueueIndex(index);

        // Play counting happens at the 30s mark (see handleTimeUpdate),
        // not here — a "stream" is 30s+ of listening, not a tap on Play.

        // Resume a podcast episode where the signed-in user left off.
        if (song.kind === 'episode' && clerkUser && audioRef.current) {
            const audio = audioRef.current;
            supabase
                .from('podcast_listen_history')
                .select('progress_seconds, completed')
                .eq('user_id', clerkUser.id)
                .eq('episode_id', song.id)
                .maybeSingle()
                .then(({ data }) => {
                    if (data && !data.completed && data.progress_seconds > 5 && audioRef.current === audio) {
                        const resumeTo = data.progress_seconds;
                        const seekOnceReady = () => {
                            audio.currentTime = resumeTo;
                            setProgress(resumeTo);
                            audio.removeEventListener('loadedmetadata', seekOnceReady);
                        };
                        audio.addEventListener('loadedmetadata', seekOnceReady);
                    }
                })
                .catch(() => {});
        }

    };



    // Record play count and play history

    // Records a meaningful play (D3: 30s+ of listening — see the
    // handleTimeUpdate call site). Counting and "Recently Played" history
    // both go through the record_play RPC, which determines the caller's
    // identity itself from the verified JWT rather than trusting a
    // client-supplied user id, and dedupes rapid replays server-side.
    const trackPlay = async (songId: string) => {
        try {
            if (clerkUser) {
                const token = await getToken({ template: 'supabase' });
                const client = token ? await createAuthenticatedSupabaseClient(token) : supabase;
                await client.rpc('record_play', { p_song_id: songId, p_device_id: getDeviceId() });
            } else {
                await supabase.rpc('record_play', { p_song_id: songId, p_device_id: getDeviceId() });
            }
        } catch (error) {
            // Non-blocking: don't interrupt playback if tracking fails
            console.warn('Play tracking failed:', error);
        }
    };

    // Podcast equivalent of trackPlay — increments the episode's play_count
    // via an atomic RPC (see 20260805_podcasts_creator_and_storage.sql).
    const trackEpisodePlay = async (episodeId: string) => {
        try {
            await supabase.rpc('record_episode_play', { p_episode_id: episodeId });
        } catch (error) {
            console.warn('Episode play tracking failed:', error);
        }
    };

    // Upserts listening progress so playback can resume next time (§G3).
    // Only called for signed-in users — anon listeners don't get resume.
    const saveEpisodeProgress = async (episodeId: string, progressSeconds: number, durationSeconds: number) => {
        if (!clerkUser) return;
        try {
            const completed = durationSeconds > 0 && progressSeconds >= durationSeconds - 15;
            await supabase.from('podcast_listen_history').upsert({
                user_id: clerkUser.id,
                episode_id: episodeId,
                progress_seconds: Math.floor(progressSeconds),
                completed,
                listened_at: new Date().toISOString(),
            }, { onConflict: 'user_id,episode_id' });
        } catch (error) {
            console.warn('Episode progress save failed:', error);
        }
    };



    const pause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error("Resume failed:", e));
            setIsPlaying(true);
        }
    };



    const next = () => {
        const q = queueRef.current;
        if (q.length === 0) return;

        let nextIndex: number | null = null;
        if (isShuffleRef.current) {
            const { order, pos } = ensureShuffleOrder();
            if (pos + 1 < order.length) {
                shufflePosRef.current = pos + 1;
                nextIndex = order[pos + 1];
            }
        } else {
            const idx = queueIndexRef.current + 1;
            if (idx < q.length) nextIndex = idx;
        }

        if (nextIndex !== null) {
            setQueueIndex(nextIndex);
            play(q[nextIndex]);
        } else if (repeatMode === 'all') {
            if (isShuffleRef.current) {
                const order = buildFreshShuffleOrder(q.length);
                shuffleOrderRef.current = order;
                shufflePosRef.current = 0;
                setQueueIndex(order[0]);
                play(q[order[0]]);
            } else {
                setQueueIndex(0);
                play(q[0]);
            }
        } else if (radioSeedRef.current) {
            extendRadioRef.current();
        } else {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.currentTime = 0;
        }
    };

    const prev = () => {
        const q = queueRef.current;
        if (q.length === 0) return;

        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        let prevIndex: number | null = null;
        if (isShuffleRef.current) {
            const { order, pos } = ensureShuffleOrder();
            if (pos > 0) {
                shufflePosRef.current = pos - 1;
                prevIndex = order[pos - 1];
            }
        } else {
            const idx = queueIndexRef.current - 1;
            if (idx >= 0) prevIndex = idx;
        }

        if (prevIndex !== null) {
            setQueueIndex(prevIndex);
            play(q[prevIndex]);
        } else {
            if (audioRef.current) audioRef.current.currentTime = 0;
        }
    };



    const seek = (time: number) => {

        if (audioRef.current) {

            audioRef.current.currentTime = time;

            setProgress(time);

        }

    };



    // ===== Media Session API — OS lock-screen / notification / hardware keys =====
    // Keep the latest control fns in a ref so the once-bound action handlers
    // never invoke a stale closure.
    const mediaControlsRef = useRef({ togglePlay, pause, next, prev, seek });
    useEffect(() => { mediaControlsRef.current = { togglePlay, pause, next, prev, seek }; });
    const isPlayingRef = useRef(isPlaying);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

    // Bind action handlers once
    useEffect(() => {
        if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
        const ms = navigator.mediaSession;
        const actions: [MediaSessionAction, (d: MediaSessionActionDetails) => void][] = [
            ['play', () => { if (!isPlayingRef.current) mediaControlsRef.current.togglePlay(); }],
            ['pause', () => { if (isPlayingRef.current) mediaControlsRef.current.pause(); }],
            ['previoustrack', () => mediaControlsRef.current.prev()],
            ['nexttrack', () => mediaControlsRef.current.next()],
            ['seekbackward', (d) => {
                const offset = d.seekOffset || 10;
                mediaControlsRef.current.seek(Math.max((audioRef.current?.currentTime || 0) - offset, 0));
            }],
            ['seekforward', (d) => {
                const offset = d.seekOffset || 10;
                const dur = audioRef.current?.duration || 0;
                mediaControlsRef.current.seek(Math.min((audioRef.current?.currentTime || 0) + offset, dur));
            }],
            ['seekto', (d) => { if (d.seekTime != null) mediaControlsRef.current.seek(d.seekTime); }],
            ['stop', () => mediaControlsRef.current.pause()],
        ];
        actions.forEach(([action, handler]) => {
            try { ms.setActionHandler(action, handler); } catch { /* unsupported on this browser */ }
        });
        return () => {
            actions.forEach(([action]) => {
                try { ms.setActionHandler(action, null); } catch { /* noop */ }
            });
        };
    }, []);

    // Metadata (title / artist / album / artwork) on song change
    useEffect(() => {
        if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
        if (!currentSong) { navigator.mediaSession.metadata = null; return; }
        const art = currentSong.cover_url || '/placeholder-music.png';
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSong.title,
                artist: currentSong.artist,
                album: currentSong.album_title || 'BARA Streams',
                artwork: [96, 128, 192, 256, 384, 512].map((s) => ({ src: art, sizes: `${s}x${s}`, type: 'image/jpeg' })),
            });
        } catch { /* noop */ }
    }, [currentSong?.id]);

    // Playback state
    useEffect(() => {
        if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = currentSong ? (isPlaying ? 'playing' : 'paused') : 'none';
    }, [isPlaying, currentSong?.id]);

    // Position state — drives the lock-screen scrubber
    useEffect(() => {
        if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
        if (!duration || !isFinite(duration)) return;
        try {
            navigator.mediaSession.setPositionState({
                duration,
                position: Math.min(progress, duration),
                playbackRate: audioRef.current?.playbackRate || 1,
            });
        } catch { /* invalid state during track transitions */ }
    }, [progress, duration]);

    const setVolume = (vol: number) => {

        const newVol = Math.max(0, Math.min(1, vol));

        setVolumeState(newVol);

        if (audioRef.current) audioRef.current.volume = newVol;

    };

    const setPlaybackRate = (rate: number) => {
        const clamped = Math.max(0.25, Math.min(4, rate));
        setPlaybackRateState(clamped);
        if (audioRef.current) audioRef.current.playbackRate = clamped;
    };

    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = playbackRate;
    }, [currentSong?.id]);

    const setSleepTimer = (option: number | 'end-of-track' | null) => {
        if (option === null) {
            setSleepTimerMinutes(null);
            setSleepTimerEndOfTrack(false);
            setSleepTimerRemainingMs(null);
            sleepTimerDeadlineRef.current = null;
            return;
        }
        if (option === 'end-of-track') {
            setSleepTimerMinutes(null);
            setSleepTimerEndOfTrack(true);
            setSleepTimerRemainingMs(null);
            sleepTimerDeadlineRef.current = null;
            return;
        }
        const minutes = option;
        setSleepTimerEndOfTrack(false);
        setSleepTimerMinutes(minutes);
        const deadline = Date.now() + minutes * 60 * 1000;
        sleepTimerDeadlineRef.current = deadline;
        setSleepTimerRemainingMs(deadline - Date.now());
    };

    useEffect(() => {
        if (sleepTimerMinutes === null) return;
        const tick = () => {
            const deadline = sleepTimerDeadlineRef.current;
            if (deadline === null) return;
            const remaining = deadline - Date.now();
            if (remaining <= 0) {
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                setIsPlaying(false);
                setSleepTimerMinutes(null);
                setSleepTimerRemainingMs(null);
                sleepTimerDeadlineRef.current = null;
            } else {
                setSleepTimerRemainingMs(remaining);
            }
        };
        const interval = window.setInterval(tick, 1000);
        return () => window.clearInterval(interval);
    }, [sleepTimerMinutes]);



    const addToQueue = (song: Song) => {
        resetShuffleOrder();
        setQueue(prev => [...prev, song]);

    };

    const playNext = (song: Song) => {
        resetShuffleOrder();
        setQueue(prev => {
            const idx = queueIndexRef.current;
            const filtered = prev.filter(s => s.id !== song.id);
            const insertAt = idx >= 0 ? Math.min(idx + 1, filtered.length) : filtered.length;
            const next = [...filtered.slice(0, insertAt), song, ...filtered.slice(insertAt)];
            return next;
        });
    };



    const removeFromQueue = (index: number) => {
        const qi = queueIndexRef.current;
        const prev = queueRef.current;
        if (index < 0 || index >= prev.length || index === qi) return; // never drop the now-playing track
        resetShuffleOrder();
        setQueue(prev.filter((_, i) => i !== index));
        if (index < qi) setQueueIndex(qi - 1); // keep the index pointing at the current song
    };

    const reorderQueue = (from: number, to: number) => {
        const prev = queueRef.current;
        if (from < 0 || from >= prev.length || to < 0 || to >= prev.length || from === to) return;
        resetShuffleOrder();
        const currentId = currentSongRef.current?.id;
        const arr = [...prev];
        const [moved] = arr.splice(from, 1);
        arr.splice(to, 0, moved);
        setQueue(arr);
        if (currentId) {
            const newIdx = arr.findIndex(s => s.id === currentId);
            if (newIdx !== -1) setQueueIndex(newIdx);
        }
    };

    const clearQueue = () => {
        resetShuffleOrder();
        const current = currentSongRef.current;
        if (current) {
            setQueue([current]);
            setQueueIndex(0);
        } else {
            setQueue([]);
            setQueueIndex(-1);
        }
    };

    // ===== Radio / infinite autoplay =====
    const radioMap = (s: any): Song => ({
        id: s.id, title: s.title,
        artist: s.artists?.name || 'Unknown Artist',
        file_url: s.file_url, cover_url: s.cover_url || '/placeholder-music.png',
        duration: s.duration, artist_id: s.artist_id, album_id: s.album_id, price: s.price ?? null,
    });

    const fetchRadioSongs = async (
        seed: { artistId?: string; genre?: string },
        excludeIds: string[],
        limit = 20,
    ): Promise<Song[]> => {
        const ors: string[] = [];
        if (seed.genre) ors.push(`genre.ilike.%${seed.genre}%`);
        if (seed.artistId) ors.push(`artist_id.eq.${seed.artistId}`);
        let pool: any[] = [];
        if (ors.length > 0) {
            const { data } = await supabase
                .from('songs').select('*, artists(name)')
                .or(ors.join(','))
                .order('plays', { ascending: false })
                .limit(80);
            pool = data || [];
        }
        // Top up with popular songs if the seed pool is thin
        if (pool.length < limit) {
            const { data } = await supabase
                .from('songs').select('*, artists(name)')
                .order('plays', { ascending: false })
                .limit(80);
            pool = [...pool, ...(data || [])];
        }
        const seen = new Set(excludeIds);
        const unique = pool.filter(s => s.file_url && !seen.has(s.id) && (seen.add(s.id), true));
        // Shuffle for variety
        for (let i = unique.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unique[i], unique[j]] = [unique[j], unique[i]];
        }
        return unique.slice(0, limit).map(radioMap);
    };

    const startRadio = async (song: Song) => {
        let genre: string | undefined;
        let artistId = song.artist_id;
        try {
            const { data } = await supabase.from('songs').select('genre, artist_id').eq('id', song.id).maybeSingle();
            genre = data?.genre || undefined;
            artistId = artistId || data?.artist_id || undefined;
        } catch { /* ignore */ }
        const seed = { songId: song.id, artistId, genre };
        setRadioSeed(seed);
        radioSeedRef.current = seed;
        const more = await fetchRadioSongs(seed, [song.id], 20);
        resetShuffleOrder();
        setQueue([song, ...more]);
        setQueueIndex(0);
        play(song);
    };

    // Called when the queue runs out while radio is active — appends more and continues.
    const extendRadio = async () => {
        const seed = radioSeedRef.current;
        if (!seed) { setIsPlaying(false); return; }
        const q = queueRef.current;
        const more = await fetchRadioSongs(seed, q.map(s => s.id), 20);
        if (more.length === 0) { setIsPlaying(false); return; }
        const startAt = q.length;
        resetShuffleOrder();
        setQueue([...q, ...more]);
        setQueueIndex(startAt);
        play(more[0]);
    };
    useEffect(() => { extendRadioRef.current = extendRadio; });

    const playAlbum = (songs: Song[], startIndex = 0) => {

        setRadioSeed(null); // explicit album/playlist play ends radio mode

        resetShuffleOrder();

        setQueue(songs);

        setQueueIndex(startIndex);

        play(songs[startIndex]);

    };



    const toggleShuffle = () => {
        if (!isShuffle) resetShuffleOrder();
        setIsShuffle(!isShuffle);
    };



    const toggleLike = async (songId: string) => {

        if (!clerkUser) { requireSignIn("Sign in to like songs and build your library."); return; }

        // §K1/§K5 — user_song_likes RLS now checks the caller's own Clerk id
        // via the JWT, not a client-supplied one, so this needs the
        // authenticated client (plain anon-key client has no JWT to check).
        const token = await getToken({ template: 'supabase' });
        const client = token ? await createAuthenticatedSupabaseClient(token) : supabase;

        const isLiked = likedSongs.includes(songId);



        if (isLiked) {

            const { error } = await client

                .from('user_song_likes')

                .delete()

                .eq('user_id', clerkUser.id)

                .eq('song_id', songId);



            if (!error) {

                setLikedSongs(prev => prev.filter(id => id !== songId));

            }

        } else {

            const { error } = await client

                .from('user_song_likes')

                .insert({ user_id: clerkUser.id, song_id: songId });



            if (!error) {

                setLikedSongs(prev => [...prev, songId]);

            }

        }

    };



    const purchaseSong = async (songId: string): Promise<{ success: boolean; message?: string }> => {
        if (!clerkUser) return { success: false, message: 'You must be signed in to purchase.' };

        const song = queue.find(s => s.id === songId) || currentSong;
        const priceCoins = Math.round(song?.price || 0);

        // Deduct coins first — if insufficient, abort
        if (priceCoins > 0) {
            const spent = await GamificationService.spendCoins(
                clerkUser.id,
                priceCoins,
                `Song purchase: ${song?.title || songId}`
            );
            if (!spent) {
                return { success: false, message: "You don't have enough Bara Coins for this song." };
            }
        }

        const { error } = await supabase
            .from('purchased_songs')
            .insert({ user_id: clerkUser.id, song_id: songId, price_paid: priceCoins });

        if (error) {
            // Refund coins if the DB insert failed
            if (priceCoins > 0) {
                await GamificationService.addCoins(clerkUser.id, priceCoins, 'Refund: purchase failed');
            }
            return { success: false, message: 'Purchase failed. Please try again.' };
        }

        setPurchasedSongs(prev => [...prev, songId]);
        setIsPreviewing(false);
        if (audioRef.current && currentSong?.id === songId) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
        return { success: true };
    };

    const isSongPurchased = (songId: string) => purchasedSongs.includes(songId);

    return (

        <AudioPlayerContext.Provider

            value={{

                currentSong,

                isPlaying,

                volume,

                progress,

                duration,

                queue,

                isShuffle,

                repeatMode,

                likedSongs,

                isPreviewing,

                purchasedSongs,

                purchaseSong,

                isSongPurchased,

                play,

                pause,

                togglePlay,

                next,

                prev,

                seek,

                setVolume,

                addToQueue,

                playNext,

                removeFromQueue,

                reorderQueue,

                clearQueue,

                isRadio: !!radioSeed,

                startRadio,

                playAlbum,

                toggleShuffle,

                setRepeatMode,

                toggleLike,

                playbackRate,

                setPlaybackRate,

                sleepTimerMinutes,

                sleepTimerEndOfTrack,

                sleepTimerRemainingMs,

                setSleepTimer

            }}

        >

            {children}

        </AudioPlayerContext.Provider>

    );

};



export const useAudioPlayer = () => {

    const context = useContext(AudioPlayerContext);

    if (context === undefined) {

        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');

    }

    return context;

};

