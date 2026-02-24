import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GamificationService, XP_REWARDS, COIN_REWARDS } from '@/lib/gamificationService';
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
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: clerkUser } = useUser();
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
    const hasAwardedXP = useRef<string | null>(null);

    // Initialize Audio Object
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = volume;

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);

            // Award XP after 30 seconds of playback
            if (audio.currentTime >= 30 && currentSong && hasAwardedXP.current !== currentSong.id) {
                const awardXP = async () => {
                    if (clerkUser) {
                        await GamificationService.addXP(clerkUser.id, XP_REWARDS.SONG_LISTEN, `Listened to ${currentSong.title}`);
                        await GamificationService.addCoins(clerkUser.id, COIN_REWARDS.SONG_LISTEN, `Listened to ${currentSong.title}`);
                        hasAwardedXP.current = currentSong.id;
                    }
                };
                awardXP();
            }
        };
        const handleDurationChange = () => setDuration(audio.duration || 0);
        const handleEnded = () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                next();
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);

        // Fetch liked songs for current user
        fetchLikes();

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, [repeatMode]); // Re-bind ended listener if repeatMode changes

    const fetchLikes = async () => {
        if (!clerkUser) return;

        const { data } = await supabase
            .from('user_song_likes')
            .select('song_id')
            .eq('user_id', clerkUser.id);

        if (data) {
            setLikedSongs(data.map(l => l.song_id));
        }
    };

    // Handle Play/Pause side effects
    useEffect(() => {
        if (!audioRef.current || !currentSong) return;

        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Playback failed:", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentSong]);

    // Handle Song Change
    const play = (song: Song) => {
        if (!audioRef.current) return;

        if (currentSong?.id === song.id) {
            togglePlay();
            return;
        }

        // New song
        setCurrentSong(song);
        setIsPlaying(true);
        audioRef.current.src = song.file_url;
        audioRef.current.play().catch(e => console.error("Playback failed:", e));

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

    const pause = () => setIsPlaying(false);
    const togglePlay = () => setIsPlaying(!isPlaying);

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
                toggleLike
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
