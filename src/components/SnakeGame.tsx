import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120; // ms

export default function SnakeGame() {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [dir, setDir] = useState(INITIAL_DIRECTION);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [topScore, setTopScore] = useState(() => {
        try {
            const saved = localStorage.getItem('neon_snake_top_score');
            return saved ? parseInt(saved, 10) : 0;
        } catch {
            return 0;
        }
    });

    const snakeRef = useRef(snake);
    const dirRef = useRef(dir);
    const foodRef = useRef(food);
    const lastMoveDirRef = useRef(dir);

    useEffect(() => { snakeRef.current = snake; }, [snake]);
    useEffect(() => { dirRef.current = dir; }, [dir]);
    useEffect(() => { foodRef.current = food; }, [food]);

    useEffect(() => {
        try {
            localStorage.setItem('neon_snake_top_score', topScore.toString());
        } catch {
            // Context may block localStorage in some strict iframe, safely ignore
        }
    }, [topScore]);

    const spawnFood = useCallback((currentSnake: {x: number, y: number}[]) => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
                break;
            }
        }
        return newFood;
    }, []);

    const startGame = useCallback(() => {
        setSnake(INITIAL_SNAKE);
        setDir(INITIAL_DIRECTION);
        lastMoveDirRef.current = INITIAL_DIRECTION;
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        setFood(spawnFood(INITIAL_SNAKE));
    }, [spawnFood]);

    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const moveSnake = () => {
            const currentSnake = snakeRef.current;
            const currentDir = dirRef.current;
            
            // Record last handled direction to prevent double-move suicide
            lastMoveDirRef.current = currentDir;
            
            const head = currentSnake[0];
            const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

            // Wall collision
            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                handleGameOver();
                return;
            }
            // Self collision
            if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                handleGameOver();
                return;
            }

            const newSnake = [newHead, ...currentSnake];
            if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
                setScore(s => {
                    const newScore = s + 10;
                    if (newScore > topScore) setTopScore(newScore);
                    return newScore;
                });
                setFood(spawnFood(newSnake));
            } else {
                newSnake.pop();
            }
            setSnake(newSnake);
        };

        const intervalId = setInterval(moveSnake, GAME_SPEED);
        return () => clearInterval(intervalId);
    }, [isPlaying, gameOver, topScore, spawnFood]);

    const handleGameOver = () => {
        setGameOver(true);
        setIsPlaying(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
                e.preventDefault();
            }
            
            if (!isPlaying || gameOver) {
                if (e.key === " " || e.key === "Enter") {
                    startGame();
                }
                return;
            }

            const lastDir = lastMoveDirRef.current;
            switch (e.key) {
                case 'ArrowUp': case 'w': 
                    if (lastDir.y !== 1) setDir({ x: 0, y: -1 }); 
                    break;
                case 'ArrowDown': case 's': 
                    if (lastDir.y !== -1) setDir({ x: 0, y: 1 }); 
                    break;
                case 'ArrowLeft': case 'a': 
                    if (lastDir.x !== 1) setDir({ x: -1, y: 0 }); 
                    break;
                case 'ArrowRight': case 'd': 
                    if (lastDir.x !== -1) setDir({ x: 1, y: 0 }); 
                    break;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, gameOver, startGame]);

    return (
        <div className="flex flex-col items-center">
            {/* Score Header */}
            <div className="w-full flex justify-between items-center mb-4 px-4 max-w-[500px]">
                <div className="flex flex-col">
                    <span className="text-zinc-500 text-xs sm:text-sm font-mono uppercase tracking-widest">Score</span>
                    <span className="text-2xl sm:text-3xl font-bold neon-text-cyan">{score}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-zinc-500 text-xs sm:text-sm font-mono uppercase tracking-widest flex items-center gap-1">
                        <Trophy size={14} className="text-pink-500" /> High
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold neon-text-pink">{topScore}</span>
                </div>
            </div>

            {/* Game Board */}
            <div className="relative w-full max-w-[500px] aspect-square bg-zinc-900/50 backdrop-blur-sm border-2 rounded-xl neon-border-cyan overflow-hidden touch-none group">
                {/* Render Grid cells */}
                <div
                    className="absolute inset-0 grid"
                    style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                    }}
                >
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isSnake = snake.some(s => s.x === x && s.y === y);
                        const isHead = snake[0].x === x && snake[0].y === y;
                        const isFood = food.x === x && food.y === y;

                        return (
                            <div key={i} className="w-full h-full p-[1px]">
                                {isSnake && (
                                    <div className={`w-full h-full rounded-sm ${isHead ? 'neon-bg-pink bg-pink-500' : 'neon-bg-cyan bg-cyan-400'}`} />
                                )}
                                {isFood && (
                                    <div className="w-full h-full rounded-full neon-bg-green bg-green-400 animate-pulse" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Overlays */}
                {!isPlaying && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <button
                            onClick={startGame}
                            className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform"
                        >
                            <div className="flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black transition-all neon-box-cyan cursor-pointer">
                                <Play size={24} className="fill-current" />
                                <span className="font-bold tracking-widest uppercase">Start Game</span>
                            </div>
                            <span className="text-xs text-zinc-500 font-mono tracking-widest">(or press space)</span>
                        </button>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                        <h2 className="text-4xl font-bold neon-text-pink mb-2">GAME OVER</h2>
                        <p className="text-zinc-400 mb-6 font-mono">Final Score: {score}</p>
                        <button
                            onClick={startGame}
                            className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform"
                        >
                            <div className="flex items-center gap-2 px-6 py-3 bg-pink-500/10 border border-pink-500 text-pink-500 rounded-full hover:bg-pink-500 hover:text-black transition-all neon-box-pink cursor-pointer">
                                <RotateCcw size={20} />
                                <span className="font-bold tracking-widest uppercase">Play Again</span>
                            </div>
                            <span className="text-xs text-zinc-500 font-mono tracking-widest">(or press space)</span>
                        </button>
                    </div>
                )}
            </div>
            
            {/* Instructions */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 text-zinc-500 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-center max-w-[500px]">
                <span>Use WASD or Arrows</span>
                <span className="hidden sm:inline">•</span>
                <span>Avoid walls & tail</span>
            </div>
        </div>
    );
}
