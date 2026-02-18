import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { Play, Pause } from 'lucide-react';

export function GlobalPlayer() {
    const { currentSong, isPlaying, togglePlay, next, prev, volume, setVolume, progress, duration, seek } = useAudioPlayer();

    if (!currentSong) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3 z-50 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
                {/* Now Playing */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                        src={currentSong.cover_url}
                        alt={currentSong.title}
                        className="w-14 h-14 rounded object-cover shadow-sm bg-gray-800"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-music.png'; }}
                    />
                    <div className="min-w-0">
                        <div className="font-semibold truncate text-white">{currentSong.title}</div>
                        <div className="text-sm text-gray-400 truncate">{currentSong.artist}</div>
                    </div>
                </div>

                {/* Player Controls */}
                <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="flex items-center gap-4">
                        <button onClick={prev} className="text-gray-400 hover:text-white transition p-1">⏮</button>
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-sm"
                        >
                            {isPlaying ? <Pause fill="black" className="w-4 h-4" /> : <Play fill="black" className="w-4 h-4 ml-0.5" />}
                        </button>
                        <button onClick={next} className="text-gray-400 hover:text-white transition p-1">⏭</button>
                    </div>
                    <div className="flex items-center gap-2 w-full max-w-md">
                        <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={progress}
                            onChange={(e) => seek(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:hover:scale-125 hover:h-1.5 transition-all"
                        />
                        <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <button className="text-gray-400 hover:text-white">🔊</button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                </div>
            </div>
        </div>
    );
}
