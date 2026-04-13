import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

import { supabase } from '@/lib/supabase';

import { GamificationService, XP_REWARDS } from '@/lib/gamificationService';

import { useUser } from '@clerk/clerk-react';



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

    const hasAwardedXP = useRef<string | null>(null);

    const { user: clerkUser } = useUser();

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

    // Reload likes + purchases whenever the signed-in user changes
    useEffect(() => { if (clerkUser) fetchLikes(); }, [clerkUser?.id]);



    // Initialize Audio Object

    useEffect(() => {

        audioRef.current = new Audio();

        audioRef.current.volume = volume;



        const audio = audioRef.current;



        const handleTimeUpdate = () => {

            setProgress(audio.currentTime);

            // Preview cutoff: paid songs stop at 25 seconds if not purchased
            const song = currentSongRef.current;
            if (song && song.price && song.price > 0 && !purchasedSongsRef.current.includes(song.id)) {
                if (audio.currentTime >= 25) {
                    audio.pause();
                    setIsPlaying(false);
                    setIsPreviewing(true);
                    return;
                }
            } else {
                if (isPreviewing) setIsPreviewing(false);
            }

            // Award XP after 30 seconds of playback
            if (audio.currentTime >= 30 && song && hasAwardedXP.current !== song.id) {

                const awardXP = async () => {

                    if (clerkUser) {

                        await GamificationService.addXP(clerkUser.id, XP_REWARDS.SONG_LISTEN, `Listened to ${song.title}`);

                        hasAwardedXP.current = song.id;

                    }

                };

                awardXP();

            }

        };

        const handleDurationChange = () => setDuration(audio.duration || 0);

        const handleEnded = () => {
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
                const idx = queueIndexRef.current;
                if (q.length === 0) { setIsPlaying(false); return; }

                let nextIdx;
                if (isShuffleRef.current) {
                    nextIdx = Math.floor(Math.random() * q.length);
                } else {
                    nextIdx = idx + 1;
                }

                if (nextIdx < q.length) {
                    setQueueIndex(nextIdx);
                    play(q[nextIdx]);
                } else if (repeatModeRef.current === 'all') {
                    setQueueIndex(0);
                    play(q[0]);
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

        // Check if this is a paid preview
        const isPaid = song.price && song.price > 0 && !purchasedSongsRef.current.includes(song.id);
        setIsPreviewing(!!isPaid);

        audioRef.current.src = song.file_url;

        audioRef.current.load();

        setIsPlaying(true);



        // Update queue index

        const index = queue.findIndex(s => s.id === song.id);

        if (index !== -1) setQueueIndex(index);



        // Track play count & history (fire-and-forget)

        trackPlay(song.id);

    };



    // Record play count and play history

    const trackPlay = async (songId: string) => {

        try {

            // Increment the play count via RPC

            await supabase.rpc('increment_play_count', { p_song_id: songId });



            // Record in play history for "Recently Played"

            if (clerkUser) {

                await supabase.from('play_history').insert({

                    user_id: clerkUser.id,

                    song_id: songId,

                });

            }

        } catch (error) {

            // Non-blocking: don't interrupt playback if tracking fails

            console.warn('Play tracking failed:', error);

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

        if (queue.length === 0) return;



        let nextIndex;

        if (isShuffle) {

            nextIndex = Math.floor(Math.random() * queue.length);

        } else {

            nextIndex = queueIndex + 1;

        }



        if (nextIndex < queue.length) {

            setQueueIndex(nextIndex);

            play(queue[nextIndex]);

        } else if (repeatMode === 'all') {

            setQueueIndex(0);

            play(queue[0]);

        } else {

            setIsPlaying(false);

            if (audioRef.current) audioRef.current.currentTime = 0;

        }

    };



    const prev = () => {

        if (queue.length === 0) return;



        if (audioRef.current && audioRef.current.currentTime > 3) {

            audioRef.current.currentTime = 0;

            return;

        }



        const prevIndex = queueIndex - 1;

        if (prevIndex >= 0) {

            setQueueIndex(prevIndex);

            play(queue[prevIndex]);

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

        setQueue(prev => [...prev, song]);

    };



    const playAlbum = (songs: Song[], startIndex = 0) => {

        setQueue(songs);

        setQueueIndex(startIndex);

        play(songs[startIndex]);

    };



    const toggleShuffle = () => setIsShuffle(!isShuffle);



    const toggleLike = async (songId: string) => {

        if (!clerkUser) return;



        const isLiked = likedSongs.includes(songId);



        if (isLiked) {

            const { error } = await supabase

                .from('user_song_likes')

                .delete()

                .eq('user_id', clerkUser.id)

                .eq('song_id', songId);



            if (!error) {

                setLikedSongs(prev => prev.filter(id => id !== songId));

            }

        } else {

            const { error } = await supabase

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

