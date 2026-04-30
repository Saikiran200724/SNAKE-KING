import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music2, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'SYNTH_ALPHA.wav', type: 'AI Generated', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'NEURAL_BEAT_02.mp3', type: 'AI Generated', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'DEEP_LEARNING_GROOVE', type: 'AI Generated', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    const currentTrack = TRACKS[currentTrackIdx];

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Playback failed:", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const playNext = () => {
        setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
    };

    const playPrev = () => {
        setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    };

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => {
                console.error("Playback failed:", e);
                setIsPlaying(false);
            });
        }
    }, [currentTrackIdx, isPlaying]);

    const onTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const onEnded = () => {
        playNext();
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 md:p-6 neon-border-pink shadow-2xl transition-all">
            <audio
                ref={audioRef}
                src={currentTrack.url}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                preload="metadata"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Track Info */}
                <div className="flex-1 flex items-center gap-4 w-full">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center border border-pink-500/30 neon-box-pink shrink-0">
                        <Music2 size={24} className={isPlaying ? "text-pink-500 animate-pulse" : "text-zinc-500"} />
                    </div>
                    <div className="flex w-full flex-col overflow-hidden">
                        <span className="text-pink-400 text-[10px] sm:text-xs font-mono uppercase tracking-wider mb-1">{currentTrack.type}</span>
                        <span className="font-bold text-white text-sm sm:text-base truncate">{currentTrack.title}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-4">
                        <button onClick={playPrev} className="text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label="Previous Track">
                            <SkipBack size={24} />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform neon-box-pink cursor-pointer"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
                        </button>
                        <button onClick={playNext} className="text-zinc-400 hover:text-white transition-colors cursor-pointer" aria-label="Next Track">
                            <SkipForward size={24} />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 w-full sm:w-64">
                        <span className="text-[10px] text-zinc-500 font-mono w-8 text-right">{formatTime(progress)}</span>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                            <div
                                className="absolute top-0 bottom-0 left-0 bg-pink-500 neon-bg-pink transition-all duration-100 ease-linear"
                                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono w-8">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume */}
                <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800 justify-end w-32 shrink-0">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-400 hover:text-white cursor-pointer" aria-label="Toggle Mute">
                        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value));
                            setIsMuted(false);
                        }}
                        className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        aria-label="Volume Control"
                    />
                </div>
            </div>
        </div>
    );
}
