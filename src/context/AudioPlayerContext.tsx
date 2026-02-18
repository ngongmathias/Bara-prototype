import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

// Types
export interface Song {
    id: string;
    title: string;
    artist: string; // Display name
    file_url: string;
    cover_url: string; // Album art
    duration: number; // Seconds
    album_id?: string;
    artist_id?: string;
}

interface AudioPlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    volume: number;
    progress: number;
    duration: number;
    queue: Song[];
    play: (song: Song) => void;
    pause: () => void;
    togglePlay: () => void;
    next: () => void;
    prev: () => void;
    seek: (time: number) => void;
    setVolume: (vol: number) => void;
    addToQueue: (song: Song) => void;
    playAlbum: (songs: Song[], startIndex?: number) => void;
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

    // Initialize Audio Object
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = volume;

        const audio = audioRef.current;

        const handleTimeUpdate = () => setProgress(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration || 0);
        const handleEnded = () => next(); // Auto-play next

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, []);

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

        // Update queue index if playing from queue
        const index = queue.findIndex(s => s.id === song.id);
        if (index !== -1) setQueueIndex(index);
        else {
            // If not in queue, replace queue or just play standalone? 
            // Spotify logic: playing a song usually starts a context. 
            // For simplicity: clear queue and add this one if it's a single play
            if (queue.length === 0) {
                setQueue([song]);
                setQueueIndex(0);
            }
        }
    };

    const pause = () => setIsPlaying(false);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const next = () => {
        if (queue.length === 0) return;

        const nextIndex = queueIndex + 1;
        if (nextIndex < queue.length) {
            setQueueIndex(nextIndex);
            play(queue[nextIndex]);
        } else {
            // Loop or stop? Stop for now.
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.currentTime = 0;
        }
    };

    const prev = () => {
        if (queue.length === 0) return;

        // If more than 3 seconds in, restart song
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        const prevIndex = queueIndex - 1;
        if (prevIndex >= 0) {
            setQueueIndex(prevIndex);
            play(queue[prevIndex]);
        } else {
            // Start of queue
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
        if (audioRef.current) {
            audioRef.current.volume = newVol;
        }
    };

    const addToQueue = (song: Song) => {
        setQueue(prev => [...prev, song]);
    };

    const playAlbum = (songs: Song[], startIndex = 0) => {
        setQueue(songs);
        setQueueIndex(startIndex);
        play(songs[startIndex]);
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
                play,
                pause,
                togglePlay,
                next,
                prev,
                seek,
                setVolume,
                addToQueue,
                playAlbum,
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
