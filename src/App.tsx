/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Sparkles } from 'lucide-react';

export default function App() {
    return (
        <div className="min-h-screen flex flex-col justify-between py-6 px-4 pb-36 md:pb-32 font-sans antialiased selection:bg-cyan-500/30">
            {/* Header */}
            <header className="w-full max-w-4xl mx-auto flex flex-col items-center mb-6 mt-2 md:mt-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-cyan-400 animate-pulse hidden sm:block" size={28} />
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-widest neon-text-cyan text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 text-center">
                        NEON SERPENT
                    </h1>
                    <Sparkles className="text-cyan-400 animate-pulse hidden sm:block" size={28} />
                </div>
                <p className="mt-2 text-pink-400 font-mono text-xs sm:text-sm tracking-widest uppercase text-center neon-text-pink opacity-80">
                    Synthwave Edition • AI Soundtrack
                </p>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-start">
                <div className="w-full mb-12">
                    <SnakeGame />
                </div>
            </main>

            {/* Fixed Music Player at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-50">
                <div className="pointer-events-auto max-w-4xl mx-auto">
                    <MusicPlayer />
                </div>
            </div>
        </div>
    );
}
